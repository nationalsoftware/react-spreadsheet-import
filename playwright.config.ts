/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  outputDir: './e2e/test-results',
  reporter: [['html', { outputFolder: './e2e/playwright-report', open: 'always' }]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'on',
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 5,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:6006',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
