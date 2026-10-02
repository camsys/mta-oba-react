import { defineConfig, devices } from '@playwright/test';

// Tests build into their own folder and serve it on their own port, never `npm run serve`'s
// 8082/dist: reusing a server that's already running would test whatever it was built from
// (old code, or a build pointed at another backend) instead of the current source.
//
// E2E_PORT gives a run its own lane (port, build, results, report), so several runs can go
// at once in one checkout, e.g. one agent per spec. Unset, everything uses the defaults.
// `||`, not `??`: an empty E2E_PORT means "no lane" (`??` would serve on port 0 and hang).
const LANE = process.env.E2E_PORT || undefined;
if (LANE && !/^\d+$/.test(LANE)) throw new Error(`E2E_PORT must be a port number, got "${LANE}"`);
const PORT = Number(LANE ?? 8083);
const OUT_DIR = LANE ? `dist-e2e-${LANE}` : 'dist-e2e';
const isCI = !!process.env.CI;
const isRecording = process.env.SIRI_MODE === 'record';

export default defineConfig({
  testDir: './e2e',
  outputDir: LANE ? `test-results-${LANE}` : 'test-results',
  // Raw `codegen -o` output; turned into real specs by hand.
  testIgnore: '**/drafts/**',
  fullyParallel: true,
  // Recording waits out real SIRI poll intervals (30s each) instead of fast-forwarding.
  // Writing snapshots (--update-snapshots) also runs well past the 30s default.
  timeout: isRecording ? 5 * 60_000 : 60_000,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  // No {platform} in the path: one set of snapshots serves macOS and CI (see e2e/support/screenshotStyles.ts).
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{testName}/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      // Room for anti-aliasing differences between macOS and Linux (fonts are already pinned,
      // see e2e/support/screenshotStyles.ts); tune once CI has run. Keep it well below what a
      // real change costs: swapping two favorites changes 5,891 pixels (0.64%) of the 1280x720
      // page, which the previous 1% let through. 0.001 is about 920 pixels.
      maxDiffPixelRatio: 0.001,
    },
  },
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: LANE ? 'never' : 'on-failure', outputFolder: LANE ? `playwright-report-${LANE}` : 'playwright-report' }]],
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
  // Test the production bundle, not the dev server, rebuilt from the current source every run.
  // In record mode, ENV_ADDRESS (set by `npm run test:e2e:record`) points the build at the backend being recorded.
  webServer: {
    command: `npm run build -- --output-path ${OUT_DIR} && npx serve -l ${PORT} ${OUT_DIR}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
