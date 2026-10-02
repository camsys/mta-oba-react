import { test as base, expect } from '@playwright/test';
import {
  type RecordedResponse,
  type Recording,
  isApiRequest,
  loadRecording,
  parseBody,
  requestKey,
  saveRecording,
  serializeBody,
} from './recording';
import { useScreenshotStyles } from './screenshotStyles';

// `npm run test:e2e:record` sets this; everything else (including CI) replays.
export const isRecording = process.env.SIRI_MODE === 'record';

// SIRI_REQUEST_FREQ for production builds, which is what the tests run against.
export const POLL_INTERVAL_MS = 30_000;

// Page errors caused by blocking the Google Maps script (see `advance`).
const GOOGLE_MAPS_GAVE_UP = 'window.google not found after 10 seconds';
export const GOOGLE_MAPS_BLOCKED_ERRORS = [GOOGLE_MAPS_GAVE_UP, 'The Google Maps JavaScript API could not load'];

type Options = {
  // Recording this test replays from (or writes, in record mode): e2e/recordings/<name>.json.
  // Without one, any /api/ request fails the test.
  recording: string | undefined;
};

type Fixtures = {
  // Compares the page against its committed snapshots: an ARIA snapshot of the sidebar
  // (text, structure and order) and a screenshot of the whole page. Regenerate with
  // `npm run test:e2e -- --update-snapshots`.
  checkpoint: (name: string) => Promise<void>;
  // Moves time forward. Replay fast-forwards the fake clock, firing the SIRI poll
  // as if that time had passed; record mode really waits, so the poll hits the backend.
  advance: (ms: number) => Promise<void>;
};

export const test = base.extend<Options & Fixtures>({
  recording: [undefined, { option: true }],

  page: async ({ page, recording, baseURL }, use, testInfo) => {
    const appOrigin = new URL(baseURL!).origin;
    const replay = !isRecording && recording ? loadRecording(recording) : undefined;
    const recorded: Recording | undefined =
      isRecording && recording ? { recordedAt: new Date().toISOString(), source: '', responses: {} } : undefined;
    const served = new Map<string, number>();
    const misses: string[] = [];

    if (replay) {
      // Time keeps flowing from here, so the app's own timers still run.
      await page.clock.install({ time: new Date(replay.recordedAt) });
    }

    await page.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === appOrigin) return route.continue();
      // Map tiles, Google tag, analytics: never part of a test.
      if (!isApiRequest(url)) return route.abort('blockedbyclient');

      const key = requestKey(request.method(), url);

      if (recorded) {
        // Reserve the slot when the request starts, so concurrent polls keep request order.
        const slots = (recorded.responses[key] ??= []);
        const slot = slots.push(undefined as unknown as RecordedResponse) - 1;
        recorded.source = url.host;
        const response = await route.fetch();
        const contentType = response.headers()['content-type'] ?? '';
        slots[slot] = { status: response.status(), contentType, body: parseBody(contentType, await response.text()) };
        // The backend may not list localhost:8082 as an allowed origin; the browser would then drop the response.
        return route.fulfill({ response, headers: { ...response.headers(), 'access-control-allow-origin': '*' } });
      }

      const responses = replay?.responses[key];
      if (!responses?.length) {
        misses.push(key);
        return route.abort('failed');
      }
      // The nth request for a key gets the nth response; once they run out, the last one repeats.
      const n = served.get(key) ?? 0;
      served.set(key, n + 1);
      const { status, contentType, body } = responses[Math.min(n, responses.length - 1)];
      return route.fulfill({
        status,
        contentType,
        body: serializeBody(body),
        headers: { 'access-control-allow-origin': '*' },
      });
    });

    await use(page);

    if (recorded && testInfo.status === testInfo.expectedStatus) {
      // Requests still in flight when the test ended never got a response.
      for (const [key, slots] of Object.entries(recorded.responses)) {
        const done = slots.filter(Boolean);
        if (done.length) recorded.responses[key] = done;
        else delete recorded.responses[key];
      }
      saveRecording(recording!, recorded);
    }
    expect(misses, 'API requests missing from the recording; re-record with `npm run test:e2e:record`').toEqual([]);
  },

  checkpoint: async ({ page }, use) => {
    await use(async (name) => {
      // Waits (and retries) until the sidebar matches, so the screenshot below sees a settled page.
      await expect(page.locator('#sidebar')).toMatchAriaSnapshot({ name: `${name}.aria.yml` });
      await useScreenshotStyles(page);
      await expect(page).toHaveScreenshot(`${name}.png`, {
        // Shows the browser's own clock, which keeps running during replay.
        mask: [page.locator('.updated-at')],
      });
    });
  },

  advance: async ({ page }, use) => {
    await use(async (ms) => {
      if (isRecording) return page.waitForTimeout(ms);
      try {
        await page.clock.runFor(ms);
      } catch (error) {
        // runFor rethrows errors thrown inside the timers it fires. GoogleMutant (the
        // map's base layer) throws from its timer once it gives up waiting for the Google
        // Maps script, which tests always block. Anything else is a real failure.
        if (!String(error).includes(GOOGLE_MAPS_GAVE_UP)) throw error;
      }
    });
  },
});

export { expect };
