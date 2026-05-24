import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

// Structure for tracking crawled results
interface AuditIssue {
  id: string
  title: string
  description: string
  affectedPage: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  screenshotPath: string
  reproductionSteps: string[]
  expectedBehavior: string
  actualBehavior: string
  suggestedFix: string
}

interface PageMetrics {
  url: string
  loadTimeMs: number
  headingHierarchyOk: boolean
  headingsFound: string[]
  imagesCheckedCount: number
  missingAltCount: number
  inputsCheckedCount: number
  missingLabelsCount: number
}

const crawledMetrics: PageMetrics[] = []
const capturedIssues: AuditIssue[] = []
const consoleLogs: string[] = []
const networkFailures: string[] = []

const SCREENSHOT_DIR = path.resolve('./test-results/screenshots')
const REPORT_DIR = path.resolve('./test-results')

// Ensure directory structures exist
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

// ─── Shared Mocking Helper for Supabase Authentication ─────────────────────────
async function mockSupabaseAuth(page: any, role: 'candidate' | 'recruiter') {
  const token = `mock-${role}`
  const email = `mock.${role}@hireflow.dev`
  const fullName = role === 'candidate' ? 'Mock Candidate' : 'Mock Recruiter'

  // Mock User retrieval
  await page.route('**/auth/v1/user**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: '92ae3049-e1dd-438e-9fb8-db51cf764340',
        email,
        role: 'authenticated',
        user_metadata: {
          full_name: fullName,
          default_role: role
        }
      })
    })
  })

  // Mock Session retrieval
  await page.route('**/auth/v1/token**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: token,
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: '92ae3049-e1dd-438e-9fb8-db51cf764340',
          email,
          role: 'authenticated',
          user_metadata: {
            full_name: fullName,
            default_role: role
          }
        }
      })
    })
  })

  // Pre-seed local storage so the client uses the mocked token immediately
  await page.addInitScript(({ token, role }) => {
    window.localStorage.setItem('hf_token', token)
    window.localStorage.setItem('hf_role', role)
  }, { token, role })
}

test.describe('Autonomous QA Audit Agent', () => {
  
  test.beforeEach(async ({ page }) => {
    // Collect console logs and errors
    page.on('console', msg => {
      const text = msg.text()
      const type = msg.type()
      if (type === 'error' || type === 'warning') {
        consoleLogs.push(`[Console ${type.toUpperCase()}] ${text}`)
      }
    })

    // Collect network status failures (status >= 400)
    page.on('response', response => {
      const status = response.status()
      const url = response.url()
      if (status >= 400 && !url.includes('auth/v1/token') && !url.includes('auth/v1/user')) {
        networkFailures.push(`[Network Error] API returned ${status} for ${url}`)
      }
    })
  })

  test.afterAll(async () => {
    // Audit for headings hierarchy and alt tags violations to populate issues list
    for (const metric of crawledMetrics) {
      if (!metric.headingHierarchyOk) {
        capturedIssues.push({
          id: `acc-heading-${metric.url.replace(/[^a-z0-9]/gi, '-')}`,
          title: 'Incorrect Heading Hierarchy',
          description: `Page does not contain an h1 heading but contains h2 or subheadings: [${metric.headingsFound.join(', ')}]`,
          affectedPage: metric.url,
          severity: 'Medium',
          screenshotPath: `screenshots/${metric.url.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'homepage'}.png`,
          reproductionSteps: [
            `Navigate to page: ${metric.url}`,
            'Inspect HTML heading element tags'
          ],
          expectedBehavior: 'Page should start with a single h1 heading tag for search engine optimization and screen reader readability.',
          actualBehavior: `Page starts with heading level tags: [${metric.headingsFound.join(', ')}] without h1 root.`,
          suggestedFix: 'Wrap page title in an <h1> element or adjust subheading tags accordingly.'
        })
      }

      if (metric.missingAltCount > 0) {
        capturedIssues.push({
          id: `acc-alt-${metric.url.replace(/[^a-z0-9]/gi, '-')}`,
          title: 'Missing Image Alt Attribute',
          description: `Page contains ${metric.missingAltCount} image elements with no alternative alt text description.`,
          affectedPage: metric.url,
          severity: 'Low',
          screenshotPath: `screenshots/${metric.url.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'homepage'}.png`,
          reproductionSteps: [
            `Navigate to page: ${metric.url}`,
            'Locate all img tags in DOM and check alt properties'
          ],
          expectedBehavior: 'All images must have a descriptive alt tag for WCAG accessibility compliance.',
          actualBehavior: `${metric.missingAltCount} images are missing alternative description attributes.`,
          suggestedFix: 'Append alt="description" to all image elements.'
        })
      }
    }

    // Generate final JSON & HTML report files when everything is complete
    const finalReport = {
      timestamp: new Date().toISOString(),
      score: Math.max(100 - (capturedIssues.length * 10), 10),
      pagesCrawledCount: crawledMetrics.length,
      metrics: crawledMetrics,
      issues: capturedIssues,
      consoleLogs: [...new Set(consoleLogs)], // Deduplicate
      networkFailures: [...new Set(networkFailures)]
    }

    // Write JSON file
    fs.writeFileSync(
      path.join(REPORT_DIR, 'qa_report.json'),
      JSON.stringify(finalReport, null, 2)
    )

    // Write styled HTML report
    const htmlReport = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HireFlow QA Audit Report</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --border: #1f2937;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --primary: #6366f1;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
    }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 2rem;
    }
    .container {
      max-w: 1200px;
      margin: 0 auto;
    }
    header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }
    h1, h2, h3 {
      margin: 0 0 0.5rem;
      font-weight: 800;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .metric-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 1.5rem;
      text-align: center;
    }
    .metric-val {
      font-size: 2.5rem;
      font-weight: 900;
      color: var(--primary);
    }
    .metric-val.green { color: var(--success); }
    .metric-val.red { color: var(--danger); }
    .issue-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .issue-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.75rem;
    }
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: bold;
    }
    .badge.critical { background: var(--danger); color: white; }
    .badge.high { background: #f97316; color: white; }
    .badge.medium { background: var(--warning); color: black; }
    .badge.low { background: var(--primary); color: white; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .table-container {
      overflow-x: auto;
      margin-top: 1rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    th, td {
      padding: 0.75rem;
      border-bottom: 1px solid var(--border);
    }
    th { color: var(--text-muted); font-size: 0.85rem; }
    pre {
      background: #030712;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      font-size: 0.8rem;
      border: 1px solid var(--border);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>QA Audit Report</h1>
      <p style="color: var(--text-muted); margin: 0;">Automated Crawler Execution Run Details</p>
      <p style="color: var(--text-muted); margin: 0.25rem 0 0;">Timestamp: ${finalReport.timestamp}</p>
    </header>

    <div class="meta-grid">
      <div class="metric-card">
        <h3>Quality Score</h3>
        <div class="metric-val ${finalReport.score > 80 ? 'green' : finalReport.score < 50 ? 'red' : ''}">${finalReport.score}/100</div>
      </div>
      <div class="metric-card">
        <h3>Pages Traversed</h3>
        <div class="metric-val">${finalReport.pagesCrawledCount}</div>
      </div>
      <div class="metric-card">
        <h3>Defects Detected</h3>
        <div class="metric-val ${finalReport.issues.length > 0 ? 'red' : 'green'}">${finalReport.issues.length}</div>
      </div>
    </div>

    <h2>Pages Crawled</h2>
    <div class="issue-card table-container">
      <table>
        <thead>
          <tr>
            <th>URL</th>
            <th>Load Time</th>
            <th>Heading Hierarchy</th>
            <th>Checked Images</th>
            <th>Missing Alt Tags</th>
            <th>Checked Inputs</th>
            <th>Missing Labels</th>
          </tr>
        </thead>
        <tbody>
          ${finalReport.metrics.map(m => `
            <tr>
              <td><code>${m.url}</code></td>
              <td>${m.loadTimeMs}ms</td>
              <td style="color: ${m.headingHierarchyOk ? 'var(--success)' : 'var(--danger)'}">${m.headingHierarchyOk ? 'OK' : 'VIOLATION'}</td>
              <td>${m.imagesCheckedCount}</td>
              <td style="color: ${m.missingAltCount > 0 ? 'var(--warning)' : 'var(--text)'}">${m.missingAltCount}</td>
              <td>${m.inputsCheckedCount}</td>
              <td style="color: ${m.missingLabelsCount > 0 ? 'var(--warning)' : 'var(--text)'}">${m.missingLabelsCount}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <h2>Issues Found</h2>
    ${finalReport.issues.length === 0 ? `
      <div class="issue-card" style="text-align: center; color: var(--success); padding: 3rem 1rem;">
        <h3 style="margin: 0;">🎉 No Functional Bugs or Design Failures Detected!</h3>
      </div>
    ` : finalReport.issues.map(issue => `
      <div class="issue-card">
        <div class="issue-header">
          <h3>${issue.title}</h3>
          <span class="badge ${issue.severity.toLowerCase()}">${issue.severity}</span>
        </div>
        <p><strong>Page:</strong> <code>${issue.affectedPage}</code></p>
        <p><strong>Description:</strong> ${issue.description}</p>
        <div class="grid">
          <div>
            <p><strong>Reproduction Steps:</strong></p>
            <ol>
              ${issue.reproductionSteps.map(step => `<li>${step}</li>`).join('')}
            </ol>
          </div>
          <div>
            <p><strong>Expected:</strong> ${issue.expectedBehavior}</p>
            <p><strong>Actual:</strong> ${issue.actualBehavior}</p>
            <p><strong>Suggested Fix:</strong> ${issue.suggestedFix}</p>
          </div>
        </div>
      </div>
    `).join('')}

    <h2>System Errors & Warnings</h2>
    <div class="grid">
      <div>
        <h3>Console Warnings & Errors (${finalReport.consoleLogs.length})</h3>
        <pre>${finalReport.consoleLogs.length === 0 ? 'No console warnings or errors captured.' : finalReport.consoleLogs.join('\n')}</pre>
      </div>
      <div>
        <h3>Network & API Failures (${finalReport.networkFailures.length})</h3>
        <pre>${finalReport.networkFailures.length === 0 ? 'No network request failures.' : finalReport.networkFailures.join('\n')}</pre>
      </div>
    </div>
  </div>
</body>
</html>`

    fs.writeFileSync(
      path.join(REPORT_DIR, 'qa_report.html'),
      htmlReport
    )
  })

  // ─── Audit Helper function ───────────────────────────────────────────────────
  async function performPageAudit(page: any, pageUrl: string) {
    const startTime = Date.now()
    await page.goto(pageUrl)
    await page.waitForLoadState('domcontentloaded')
    const loadTimeMs = Date.now() - startTime

    // Scroll top-to-bottom to trigger lazy components
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(400)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(200)

    // Save page screenshot
    const pageName = pageUrl.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'homepage'
    const screenshotPath = path.join(SCREENSHOT_DIR, `${pageName}.png`)
    await page.screenshot({ path: screenshotPath })

    // Analyze headings hierarchy
    const headings = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      return elements.map(el => el.tagName.toLowerCase())
    })
    
    let headingHierarchyOk = true
    if (headings.length > 0) {
      // Must contain h1 if we have h2/h3
      if (headings.some(h => h !== 'h1') && !headings.includes('h1')) {
        headingHierarchyOk = false
      }
    }

    // Analyze image alt tags (accessibility check)
    const imagesAudit = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'))
      const missingAlt = imgs.filter(img => !img.getAttribute('alt'))
      return { total: imgs.length, missing: missingAlt.length }
    })

    // Analyze form input labels
    const inputsAudit = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select, textarea'))
      const missingLabels = inputs.filter(input => {
        const id = input.getAttribute('id')
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`)
          if (label) return false
        }
        // Check nesting
        if (input.closest('label')) return false
        // Check ARIA properties
        if (input.getAttribute('aria-label') || input.getAttribute('aria-labelledby')) return false
        return true
      })
      return { total: inputs.length, missing: missingLabels.length }
    })

    crawledMetrics.push({
      url: pageUrl,
      loadTimeMs,
      headingHierarchyOk,
      headingsFound: headings,
      imagesCheckedCount: imagesAudit.total,
      missingAltCount: imagesAudit.missing,
      inputsCheckedCount: inputsAudit.total,
      missingLabelsCount: inputsAudit.missing
    })
  }

  // ─── Integrated Traversal Test Case ──────────────────────────────────────────
  
  test('Perform Comprehensive QA Audit Crawler', async ({ page }) => {
    // 1. Audit Public Pages
    console.log('Auditing public landing...')
    await performPageAudit(page, '/')
    console.log('Auditing public jobs list...')
    await performPageAudit(page, '/jobs')
    console.log('Auditing public companies list...')
    await performPageAudit(page, '/companies')
    console.log('Auditing public company detail...')
    await performPageAudit(page, '/companies/stripe')
    console.log('Auditing public login form...')
    await performPageAudit(page, '/login')
    console.log('Auditing public signup form...')
    await performPageAudit(page, '/signup')

    // 2. Audit Candidate Dashboard (Mocked)
    console.log('Seeding mock-candidate auth and auditing protected routes...')
    await mockSupabaseAuth(page, 'candidate')
    await performPageAudit(page, '/app/dashboard')
    await performPageAudit(page, '/app/saved')
    await performPageAudit(page, '/app/applications')
    await performPageAudit(page, '/app/ai-matches')
    await performPageAudit(page, '/app/settings')

    // 3. Audit Recruiter Dashboard (Mocked)
    console.log('Seeding mock-recruiter auth and auditing recruiter routes...')
    await mockSupabaseAuth(page, 'recruiter')
    await performPageAudit(page, '/app/recruiter')
    await performPageAudit(page, '/app/recruiter/post')
    await performPageAudit(page, '/app/recruiter/applicants')
    await performPageAudit(page, '/app/recruiter/settings')
  })
})
