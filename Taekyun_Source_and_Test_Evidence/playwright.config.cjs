const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  fullyParallel: false,
  workers: 1,
  retries: 0, // Never silently turn a real failure into a pass.
  timeout: 90000,
  expect: { timeout: 15000 },
  outputDir: './evidence/test-artifacts',
  reporter: [
    ['list'],
    ['html', { outputFolder: './evidence/html-report', open: 'never' }],
    ['json', { outputFile: './evidence/results.json' }],
  ],
  use: {
    // Testing-only exception for the approved OpenCart demo; do not use for personal accounts.
    ignoreHTTPSErrors: true,
    baseURL: process.env.OPENCART_BASE_URL || 'https://opencart.abstracta.us',
    actionTimeout: 15000,
    navigationTimeout: 45000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    locale: 'en-US',
    viewport: { width: 1365, height: 850 },
  },
  projects: [
    { name: 'chrome-visible', use: { ...devices['Desktop Chrome'], channel: 'chrome', headless: false } },
    { name: 'chrome-headless', use: { ...devices['Desktop Chrome'], channel: 'chrome', headless: true } },
  ],
});
