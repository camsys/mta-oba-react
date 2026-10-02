import { defineConfig, devices } from '@playwright/test';

const PORT = 8082; // matches `npm run serve`
const isCI = !!process.env.CI;
// Record mode needs a fresh build pointed at the backend being recorded (ENV_ADDRESS),
// so it never reuses a server that may have been built for somewhere else.
const isRecording = process.env.SIRI_MODE === 'record';

export default defineConfig({
  testDir: './e2e',
  // Raw `codegen -o` output; turned into real specs by hand.
  testIgnore: '**/drafts/**',
  fullyParallel: true,
  // Recording waits out real SIRI poll intervals (30s each) instead of fast-forwarding.
  timeout: isRecording ? 5 * 60_000 : 30_000,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  // No {platform} in the path: one set of snapshots serves macOS and CI (see e2e/support/screenshotStyles.ts).
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{testName}/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      // Room for anti-aliasing differences between macOS and Linux; tune once CI has run.
      maxDiffPixelRatio: 0.01,
    },
  },
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'on-failure' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    // Departure times render with toLocaleTimeString; pin both so output matches on any machine (CI is UTC).
    timezoneId: 'America/New_York',
    locale: 'en-US',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Test the production bundle, not the dev server. CI builds in an earlier step,
  // so only serve there; locally, build first unless a server is already running.
  webServer: {
    command: isCI ? 'npm run serve' : 'npm run build && npm run serve',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI && !isRecording,
    timeout: 180_000,
  },
});
