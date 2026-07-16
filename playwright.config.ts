import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], launchOptions: { executablePath: '/opt/pw-browsers/chromium' } },
    },
    {
      // PROJ-1 targets Microsoft Edge (Chromium-based) only — mobile Chrome
      // emulation stands in for a small viewport since no WebKit browser is
      // available in this environment (see .claude/rules general note in QA).
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 7'], launchOptions: { executablePath: '/opt/pw-browsers/chromium' } },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
