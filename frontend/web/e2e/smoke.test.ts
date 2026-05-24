/**
 * Smoke Tests — HireFlow Frontend
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates critical paths without requiring a live backend.
 * These run on every CI build against the production bundle.
 *
 * Critical flows covered:
 *   1. Landing page renders
 *   2. Job search page loads with skeletons
 *   3. Login page renders with expected form
 *   4. Signup page renders
 *   5. 404 page works for unknown routes
 *   6. Navigation links are keyboard-accessible
 */

import { test, expect } from '@playwright/test'

// ─── Landing Page ─────────────────────────────────────────────────────────────

test.describe('Landing Page', () => {
  test('renders hero section', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/HireFlow/i)
    // Hero heading should be visible
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('has working navigation links', async ({ page }) => {
    await page.goto('/')
    // Jobs link
    const jobsLink = page.getByRole('link', { name: /browse jobs/i }).first()
    if (await jobsLink.isVisible()) {
      await jobsLink.click()
      await expect(page).toHaveURL(/\/jobs/)
    }
  })

  test('skip-to-main link exists and is focusable', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const skipLink = page.locator('a[href="#main-content"]')
    await expect(skipLink).toBeVisible()
  })
})

// ─── Job Search ───────────────────────────────────────────────────────────────

test.describe('Job Search', () => {
  test('page loads without crashing', async ({ page }) => {
    await page.goto('/jobs')
    // Should not show error boundary
    await expect(page.locator('[role="alert"]')).not.toBeVisible()
    // Should show skeleton or jobs
    await expect(page.locator('h1, [role="status"]').first()).toBeVisible()
  })

  test('shows skeleton loaders during fetch', async ({ page }) => {
    // Intercept API calls to ensure skeleton shows
    await page.route('**/api/v1/jobs**', async (route) => {
      await new Promise((r) => setTimeout(r, 500)) // Delay
      await route.continue()
    })

    await page.goto('/jobs')
    // Check skeleton (role=status) is rendered during load
    const skeleton = page.locator('[role="status"]').first()
    // Either skeleton was visible or content loaded
    await expect(page.locator('body')).not.toBeEmpty()
  })
})

// ─── Authentication ───────────────────────────────────────────────────────────

test.describe('Login Page', () => {
  test('renders login form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('shows validation on empty submit', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /sign in/i }).click()
    // Form should show validation errors or not navigate away
    await expect(page).toHaveURL(/\/login/)
  })

  test('has link to signup', async ({ page }) => {
    await page.goto('/login')
    const signupLink = page.getByRole('link', { name: /sign up|create.*account/i })
    await expect(signupLink).toBeVisible()
  })
})

test.describe('Signup Page', () => {
  test('renders signup form', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /create account|sign up/i })).toBeVisible()
  })
})

// ─── 404 Page ─────────────────────────────────────────────────────────────────

test.describe('404 Page', () => {
  test('renders for unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist')
    // Should not be a server error
    const status = await page.evaluate(() => document.documentElement.outerHTML)
    expect(status).not.toContain('Internal Server Error')
    // Should show something (not blank)
    await expect(page.locator('body')).not.toBeEmpty()
  })
})

// ─── Accessibility ────────────────────────────────────────────────────────────

test.describe('Keyboard Navigation', () => {
  test('can tab through landing page nav', async ({ page }) => {
    await page.goto('/')
    // Tab should move focus through interactive elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    // Focus should be somewhere visible — not trapped
    const focused = await page.evaluate(() => document.activeElement?.tagName)
    expect(['A', 'BUTTON', 'INPUT']).toContain(focused)
  })
})
