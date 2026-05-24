import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * Smoke tests for the HireFlow frontend — validates critical user paths:
 *   - Landing page renders
 *   - Job search loads
 *   - Login / redirect flow
 *   - 404 page works
 *
 * Run: npx playwright test
 * Run headed: npx playwright test --headed
 * View report: npx playwright show-report
 */

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,  // Fail CI if .only is left in
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Start the dev server for local test runs
  webServer: process.env.CI
    ? undefined  // CI: expects app to already be built + served
    : {
        command: 'pnpm --filter @hireflow/web dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000,
      },
})
