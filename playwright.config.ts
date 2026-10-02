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
  // CI retries twice, so a bug that fails half the time would otherwise pass as "flaky".
  failOnFlakyTests: isCI,
  workers: isCI ? 1 : undefined,
  // No {platform} in the path: there is one set of references, made in CI's Linux Docker image
  // (`npm run test:e2e:docker`). Native macOS runs check only the ARIA snapshots.
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{testName}/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      // References and runs share one Linux image, so only real noise needs absorbing: at most
      // 8 pixels (map text antialiasing in favorites) over 5 repeats of every spec, with the
      // clear (×) button masked (see `checkpoint()`). The old 0.1% (~920 px) missed a focused
      // stop link losing its underline (226 px) and the active Routes toggle losing its bold
      // (218 px); 15 catches both.
      // Leave the per-pixel `threshold` at its default: it absorbs the tiny shading differences
      // between arm64 Docker (a Mac) and x64 CI, at most 4/255 per channel.
      maxDiffPixels: 15,
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
