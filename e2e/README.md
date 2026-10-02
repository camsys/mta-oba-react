# End-to-end tests (Playwright)

Browser tests against the production build. API responses are recorded once from a live
backend and replayed, so tests are fast, repeatable and never call a backend in normal runs.

## Commands

| Command | What it does |
|---|---|
| `npm run test:e2e` | Builds `src/` into `dist-e2e/`, serves it on 8083 and runs every spec with recorded responses. |
| `npm run test:e2e -- e2e/<spec>.spec.ts` | One spec. Any Playwright flag works after `--`. |
| `npm run test:e2e:docker` | Same, inside Playwright's Linux Docker image, as CI runs it. The only way to compare or write screenshots (see [Snapshots](#snapshots)). Takes the same arguments. |
| `npm run test:e2e:docker -- --update-snapshots` | Rewrites the reference snapshots. |
| `npm run test:e2e:record -- e2e/<spec>.spec.ts` | Runs the spec against the live QA backend and saves its responses to `e2e/recordings/`. |
| `npx playwright show-report` | Opens the report of the last run (diff images for failed screenshots). |

Every run rebuilds from the current source (about 5s), so what's tested is always what's in
`src/`. A server you have running on 8082 (`npm run serve`) is never used.

## Layout

```
e2e/
  <name>.spec.ts            one spec per scenario
  recordings/<name>.json    recorded API responses (committed)
  __snapshots__/<spec>/     reference ARIA snapshots and screenshots (committed)
  drafts/                   raw codegen output; ignored by git and by the test run
  support/fixtures.ts       record/replay, checkpoint(), advance()
  support/recording.ts      request matching, recording file format
  support/screenshotStyles.ts  font swap and tile hiding for screenshots
```

## Writing a new test

### 1. Record a draft of the clicks

Serve a build that talks to QA on its own port. This doesn't touch the test build, so it can
stay up while tests run:

```sh
ENV_ADDRESS=app.qa.obanyc.com npm run build -- --output-path dist-qa && npx serve -l 8084 dist-qa
```

Then click through the scenario with codegen. The code is written to the file as you go:

```sh
npx playwright codegen -o e2e/drafts/<name>.spec.ts "http://localhost:8084/?search=<term>"
```

The app reads `?search=` (route, stop code, intersection, `lat,lon`, or `View Favorites`);
`?LineRef=` is no longer handled. Keep a scenario to one page or one feature and the one or two
things people do there; a short spec fails clearly and is cheap to re-record.

### 2. Turn the draft into a spec

Write `e2e/<name>.spec.ts` (see `favorites.spec.ts` and `route-b63.spec.ts`):

```ts
import { test } from './support/fixtures';

test.use({ recording: '<name>' });

test('what the user does', async ({ page, checkpoint }) => {
  await page.goto('/?search=B63');
  await checkpoint('loaded');
  await page.getByRole('button', { name: 'Toggle Service Alert Open/' }).click();
  await checkpoint('alert-open');
});
```

- Import `test` from `./support/fixtures`, not `@playwright/test`.
- Use relative URLs and drop codegen's `uuid=` parameter.
- Keep the recorded steps and their order. Only remove clicks that just focus an element.
- Put a `checkpoint('<name>')` after the page loads and after each step that changes the
  screen. Checkpoints replace hand-written assertions; names must be unique in the spec.
- `advance(ms)` moves time forward (`POLL_INTERVAL_MS` is one SIRI poll) if a scenario needs
  to show data updating.
- Favorites live in cookies, and every test starts with a fresh browser, so tests don't
  affect each other.

### 3. Record the API responses

```sh
npm run test:e2e:record -- e2e/<name>.spec.ts
```

This builds against `app.qa.obanyc.com`, runs the spec against it, and writes
`e2e/recordings/<name>.json` when the test passes. Checkpoints are skipped while recording.
Look at the file's keys to check the calls you expect are there. Re-record whenever a spec's
steps change or the API's responses change shape.

### 4. Generate and check snapshots

Follow [Setting up snapshots for a spec](#setting-up-snapshots-for-a-spec) below, then commit
the spec, its recording and its snapshots together.

## How replay works

- **Which requests:** everything under `/api/` on any host. Other outside requests (Google
  Maps, map tiles, the Google tag, analytics) are always blocked.
- **Matching:** method, path and query string. `sessionId` and `key` are ignored, as is the
  host, so a QA recording replays against the dev-pointed test build.
- **Order:** the nth request for a URL gets the nth recorded response; after the last one,
  the last one repeats. That's how polling replays.
- **Strict:** a request with no recorded match fails the test and names the request. Fix it
  by re-recording; never by loosening the match.
- **Time:** the browser clock starts at the recording's `recordedAt` and runs in real time, so
  the app's own short timers (collapsible toggles, retries, debounces) work without help;
  `advance(ms)` jumps it forward. A run's speed must not decide what a checkpoint sees, so
  `checkpoint` first waits for collapsible toggles to finish (see
  [references made in a slow run](#known-issue-references-made-in-a-slow-run)). Arrival times
  ("X minutes") are computed from the server's timestamp, so they match the recording.
  Timezone and locale are pinned to `America/New_York` / `en-US`.
- **Expected noise:** blocking Google Maps produces two page errors ("Google Maps JavaScript
  API could not load", "window.google not found after 10 seconds"). `advance` ignores the
  second one; anything else it throws fails the test.

## Running several at once

`E2E_PORT=<port>` gives a run its own lane: port, build (`dist-e2e-<port>/`), results
(`test-results-<port>/`) and report (`playwright-report-<port>/`, not opened automatically).
Use a different port per terminal or agent, for every command, including record runs:

```sh
E2E_PORT=8091 npm run test:e2e -- e2e/<spec>.spec.ts
```

Without it, everything uses the defaults above. Open a lane's report with
`npx playwright show-report playwright-report-<port>`.

- The port must be digits only (an empty `E2E_PORT` means no lane). Avoid 8082
  (`npm run serve`), 8083 (the default lane) and 8084 (the QA codegen server); a port that's
  already in use fails the run straight away.
- One run per lane at a time: two runs on the same port collide.
- Lanes share `e2e/recordings/`. A record run rewrites its spec's recording, which changes what
  every other lane replays for that spec. Don't replay a spec while it's being recorded, and
  regenerate its snapshots after recording. If a spec that passed suddenly fails its ARIA
  checkpoints with a large sidebar diff, check `git diff --stat -- e2e/recordings/`: a
  recording probably changed. `git checkout -- e2e/recordings/<name>.json` restores the
  committed one, which also throws away a re-record you meant to keep.
- `DEBUG=pw:webserver` prints the build folder and port a run actually used.

## Snapshots

`checkpoint(name)` compares the page against two committed snapshots in `__snapshots__/`:
an ARIA snapshot of the sidebar (text, structure, order) and a screenshot of the whole page.
Regenerate them with `npm run test:e2e:docker -- --update-snapshots`, never natively.

Reference screenshots are made on Linux, in `mcr.microsoft.com/playwright:v<version>-noble`
(the tag follows the installed `@playwright/test`). CI runs the same image. Text renders
differently on macOS (glyphs about 1px wider, other line breaks), changing 0.4–1.3% of every
screenshot, more than a real regression such as two swapped favorites (0.64%). So native macOS
runs skip screenshots and print a notice once; they still check ARIA snapshots, page errors and
the flows, which keeps a fast loop on the Mac. A native `--update-snapshots` only rewrites ARIA
snapshots.

`npm run test:e2e:docker` keeps Linux `node_modules` in a Docker volume per checkout, so it
doesn't touch the host's. Its first run installs them (`npm ci` runs every time, but is quick
once the volume exists). It passes `E2E_PORT` and `CI` through, so lanes work the same.

### Setting up snapshots for a spec

Do these in order whenever a spec gains checkpoints, or after an intended UI change.

Snapshots are only as correct as the source they're generated from: check
`git diff -- src/` is empty (or contains only the change you mean to accept) first.

1. **Generate the reference snapshots** from code you know is correct:

   ```sh
   npm run test:e2e:docker -- e2e/<spec>.spec.ts --update-snapshots
   ```

   This writes `<checkpoint>.png` and `<checkpoint>.aria.yml` to
   `e2e/__snapshots__/<spec>.spec.ts/<test name>/`. Open the PNGs and read the YAML before
   committing; from then on they define what "correct" looks like.

2. **Check they're stable.** Replay several times; every run should pass with no differences:

   ```sh
   npm run test:e2e:docker -- e2e/<spec>.spec.ts --repeat-each=5
   ```

   A checkpoint that fails intermittently means something on the page is still changing
   (a marker settling, a loading state, a clock). Fix it in the snapshot setup (a mask in
   `checkpoint`, or waiting for the page to settle), not in the app.

3. **Prove they catch changes.** Make a deliberate, visible change in the app (for example,
   reverse the order the favorites list renders in), then run the spec:

   ```sh
   npm run test:e2e:docker -- e2e/<spec>.spec.ts
   npx playwright show-report
   ```

   The affected checkpoints should fail. The report shows the expected image, the actual
   one, and a diff with changed pixels highlighted; ARIA snapshot failures show a text diff.
   Revert the change afterwards.

Snapshots are compared with a 0.1% pixel tolerance (`maxDiffPixelRatio` in
`playwright.config.ts`, about 920 pixels of the 1280x720 page). 1% was too loose: swapping two
favorites changes only 0.64% of the page. The clock in the Refresh button is masked, since the browser
clock keeps running during replay.

Don't lower Playwright's per-pixel `threshold` (and never to 0): references made in Docker on a
Mac (arm64) differ from CI's x64 runs by up to 4/255 per channel in many pixels, and the
default threshold is what ignores that.

### Known issue: references made in a slow run

`--update-snapshots` runs are much slower than replays (about 5s a checkpoint against 0.1s),
so anything on the page that depends on real time can differ between a reference and a replay.
Two such things were found; a third could appear:

- **Stale toggle timers (fixed in the app, NYCUI-601).** Opening or closing a collapsible
  twice within 500ms used to let the first toggle's timer re-expand a closed section. A fast
  replay of `stop-403424` did that to the second BXM1 alert, which a slow reference run never
  did. `public/js/bustime.js` now cancels a section's pending timers on every toggle.
- **Mid-animation captures (handled by `checkpoint`).** A toggle finishes on timers: the
  `open` class changes 10ms after the click, and an opening section's `max-height` stays pinned
  in px until it becomes `none` 500ms later. A checkpoint taken in between shows a section half
  open (or content 1px short, as in `route-b63`'s old `alert-open` reference). `checkpoint`
  waits for every `.collapse-content` to settle before comparing, so a spec doesn't need its own
  wait for this.
- **Latent: SIRI polls.** The app polls every 30s of page time, which a slow run can reach and
  a fast one doesn't. Today every recording holds one vehicle-monitoring response per route, so
  the extra poll repeats the same data and changes nothing on screen. A recording with several
  would hand out its later responses early in a slow run.

If a checkpoint fails the same way on every replay but passes in the run that wrote it, look
for another timer like these.

### Fonts are currently ignored

Screenshots do **not** test the app's real fonts. Before each screenshot, every element is
switched to Arimo (`e2e/support/screenshotStyles.ts`), a font with Arial's metrics.

Why: the app asks for Helvetica/Arial, which Playwright's Linux image doesn't have. Without the
swap, screenshots would show whatever fallback font the image picks, which can change when the
image is bumped, and every reference would need regenerating. Arimo is bundled with the tests
(`@fontsource/arimo`), so it's the same in every image version.

What this means: a change to the app's fonts (family, a missing web font, fallback order)
won't fail any test. Size, weight, color, wrapping and layout are still compared.
