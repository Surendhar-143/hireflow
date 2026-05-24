import { test, expect } from '@playwright/test'

test.describe('DOM Structural & Navigation Verification', () => {
  test('verify header, navigation, and landing page DOM structure', async ({ page }) => {
    // 1. Load the Landing Page
    console.log('--- Loading page http://localhost:3000/ ---')
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // 2. Inspect the Main Header/Navigation Container
    console.log('\n--- 1. HEADER & NAVIGATION CONTAINER ---')
    const header = page.locator('header, nav').first()
    await expect(header).toBeVisible()

    // Get all navigation links
    const navLinks = await page.locator('header a, nav a').all()
    console.log(`Found ${navLinks.length} navigation links:`)
    for (const link of navLinks) {
      const text = (await link.textContent())?.trim() || '[Empty Text]'
      const href = await link.getAttribute('href')
      console.log(`  - Text: "${text}" | Destination: "${href}"`)
    }

    // 3. Inspect Landing Page Hero Section DOM Structure
    console.log('\n--- 2. HERO CONTENT DOM STRUCTURE ---')
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
    const heroTitleText = (await h1.textContent())?.trim()
    console.log(`Hero Title (h1): "${heroTitleText}"`)

    const heroButtons = await page.locator('main a, main button').all()
    console.log(`Hero Action Elements (${heroButtons.length}):`)
    for (const button of heroButtons) {
      const text = (await button.textContent())?.trim() || '[Empty Text]'
      const tag = await button.evaluate(el => el.tagName.toLowerCase())
      const classes = await button.getAttribute('class')
      console.log(`  - Tag: <${tag}> | Text: "${text}"`)
      console.log(`    Classes: ${classes}`)
    }

    // 4. Verify Route `/jobs`
    console.log('\n--- 3. ROUTE: /jobs FEED STRUCTURE ---')
    await page.goto('/jobs')
    await page.waitForLoadState('networkidle')
    const jobsHeader = page.locator('h1').first()
    const jobsHeaderText = (await jobsHeader.textContent())?.trim()
    console.log(`Jobs Feed Title: "${jobsHeaderText}"`)

    // Check presence of sidebar filters
    const searchFilter = page.locator('form input').first()
    await searchFilter.waitFor({ state: 'visible', timeout: 5000 })
    console.log(`Search input filter visible? ${await searchFilter.isVisible()}`)

    // 5. Verify Route `/login`
    console.log('\n--- 4. ROUTE: /login FORM STRUCTURE ---')
    await page.goto('/login')
    
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign In")').first()

    // Wait for elements to be mounted & visible
    await emailInput.waitFor({ state: 'visible', timeout: 5000 })
    await passwordInput.waitFor({ state: 'visible', timeout: 5000 })
    await submitBtn.waitFor({ state: 'visible', timeout: 5000 })

    console.log(`Email Input field present? ${await emailInput.isVisible()}`)
    console.log(`Password Input field present? ${await passwordInput.isVisible()}`)
    console.log(`Submit Sign In Button visible? ${await submitBtn.isVisible()}`)
  })
})
