import { defineConfig } from '@playwright/test';

// Web smoke tests: start the Expo dev server, open screens at phone size, save screenshots.
// Uses your installed Google Chrome (channel: 'chrome'), so no extra browser download.
// This checks layout in a browser. It is not Safari, not iOS and not Android.
// Own port (8099, not 8081) and never reuse a running server: a dev server from another app
// on 8081 can then never be tested by mistake. If 8099 is busy, the test stops with an error.
const PORT = 8099;

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/.results',
  timeout: 60_000,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: 'chrome',
    // iPhone 17 logical size (402 x 874 points).
    viewport: { width: 402, height: 874 },
    deviceScaleFactor: 2,
    hasTouch: true,
    locale: 'en-US',
  },
  webServer: {
    command: `npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: { CI: '1' },
  },
});
