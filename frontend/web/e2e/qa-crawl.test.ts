import { test, expect } from '@playwright/test'

test.describe('Automated QA Crawl & Interaction Test', () => {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []

  test.beforeEach(({ page }) => {
    consoleErrors.length = 0
    pageErrors.length = 0

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(`[Console Error] ${msg.text()}`)
      }
    })
    page.on('pageerror', err => {
      pageErrors.push(`[Page Error] ${err.name}: ${err.message}\nStack: ${err.stack}`)
    })
  })

  test('crawl and interact with key pages', async ({ page }) => {
    // 1. Visit Landing Page
    console.log('Navigating to Landing Page...')
    await page.goto('/')
    await expect(page).toHaveTitle(/HireFlow/i)
    
    // Perform scrolling interaction to simulate user behavior
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(300)

    // 2. Navigate to Jobs Page
    console.log('Navigating to Jobs Page...')
    await page.goto('/jobs')
    await expect(page.locator('body')).not.toBeEmpty()

    // Try interacting with the search input filter
    const searchInput = page.locator('input[placeholder*="Search" i], input[placeholder*="title" i]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('Engineer')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
    }

    // Try selecting job types / filters
    const filterCheckbox = page.locator('button[role="checkbox"], input[type="checkbox"]').first()
    if (await filterCheckbox.isVisible()) {
      await filterCheckbox.click()
      await page.waitForTimeout(500)
    }

    // 3. Navigate to Companies Page
    console.log('Navigating to Companies Page...')
    await page.goto('/companies')
    await expect(page.locator('body')).not.toBeEmpty()

    const companyLink = page.locator('a[href^="/companies/"]').first()
    if (await companyLink.isVisible()) {
      await companyLink.click()
      await page.waitForTimeout(500)
      await page.goto('/companies') // return to list
    }

    // 4. Navigate to Login Page
    console.log('Navigating to Login Page...')
    await page.goto('/login')
    await page.fill('input[type="email"]', 'qa-tester-user@example.com')
    await page.fill('input[type="password"]', 'TesterPassword123!')
    
    const signInButton = page.locator('button:has-text("Sign In"), button[type="submit"]').first()
    if (await signInButton.isVisible()) {
      await signInButton.click()
      await page.waitForTimeout(500)
    }

    // 5. Navigate to Signup Page
    console.log('Navigating to Signup Page...')
    await page.goto('/signup')
    await page.fill('input[type="email"]', 'new-qa-user@example.com')
    
    const createAccountButton = page.locator('button:has-text("Create Account"), button:has-text("Sign Up")').first()
    if (await createAccountButton.isVisible()) {
      await createAccountButton.click()
      await page.waitForTimeout(500)
    }

    // Verify if any console or runtime errors were captured
    if (pageErrors.length > 0) {
      console.error('Page Errors Captured:', pageErrors)
    }
    if (consoleErrors.length > 0) {
      console.warn('Console Errors Captured:', consoleErrors)
    }

    expect(pageErrors).toEqual([])
  })
})
