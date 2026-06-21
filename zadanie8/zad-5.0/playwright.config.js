// @ts-check
const { defineConfig } = require('@playwright/test');

// E2E config
module.exports = defineConfig({
  testDir: '.',
  testMatch: 'e2e.spec.js',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    baseURL: process.env.APP_URL || 'http://localhost:8000',
    headless: true,
    actionTimeout: 10_000,
  },
});
