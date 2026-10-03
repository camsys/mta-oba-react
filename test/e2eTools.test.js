const test = require('node:test');
const assert = require('node:assert');

// The e2e tooling scripts (scripts/e2e-*.mjs) are ES modules.
const convert = () => import('../scripts/e2e-convert-draft.mjs');
const refs = () => import('../scripts/lib/e2e-refs.mjs');
const summary = () => import('../scripts/lib/e2e-report-summary.mjs');

const DRAFT = `import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:8084/?search=40.738933,-73.979874&uuid=abc');
  await page.getByRole('heading', { name: 'Nearby:' }).click();
  await page.locator('div').filter({ hasText: 'FavoritesNearby' }).nth(2).press('Tab');
  await page.getByRole('button', { name: 'Show nearby stops (currently' }).press('Enter');
  await page.getByRole('button', { name: 'Show nearby stops (currently' }).press('Tab');
  await page.getByRole('button', { name: 'Toggle M15 to PIKE ST -via 2' }).press('Tab');
  await page.getByRole('link', { name: '5887' }).press('Tab');
  await page.getByRole('link', { name: '5329' }).press('Shift+Tab');
  await page.getByRole('link', { name: '5887' }).press('Shift+Tab');
  await page.locator('#map').click({
    button: 'right'
  });
});
`;

test('convertDraft writes the spec skeleton and focus-checked key presses', async () => {
  const { convertDraft } = await convert();
  const { spec } = convertDraft(DRAFT, { name: 'demo', recording: 'location' });
  assert.match(spec, /import \{ expect, test \} from '\.\/support\/fixtures';/);
  assert.match(spec, /import \{ bus, key \} from '\.\/support\/steps';/);
  assert.match(spec, /test\.use\(\{ recording: 'location' \}\);/);
  assert.match(spec, /test\.slow\(\);/);
  // Relative URL, uuid dropped, then the first checkpoint.
  assert.match(spec, /await page\.goto\('\/\?search=40\.738933,-73\.979874'\);\n {2}await checkpoint\('loaded'\);/);
  // A press on a container has no focus to check; a press on a button does.
  assert.match(spec, /await page\.keyboard\.press\('Tab'\);/);
  assert.match(spec, /await key\(showNearbyStops, 'Enter'\);\n {2}\/\/ TODO checkpoint\('show-nearby-stops-enter'\)/);
  // Record mode needs a wait before tabbing; it goes before the click that sets where Tab starts.
  assert.match(spec, /await expect\(showNearbyStops\)\.toBeVisible\(\);\n {2}await page\.getByRole\('heading', \{ name: 'Nearby:' \}\)\.click\(\);/);
  // Clicks stay as they were.
  assert.match(spec, /await page\.locator\('#map'\)\.click\(\{ button: 'right' \}\);/);
});

test('convertDraft names vehicles by position, not ID, and lists them for review', async () => {
  const { convertDraft } = await convert();
  const { spec, notes } = convertDraft(DRAFT, { name: 'demo' });
  assert.doesNotMatch(spec, /5887|5329/);
  assert.match(spec, /await key\(bus\(m15ToPike, 0\), 'Tab'\);/);
  assert.match(spec, /await key\(bus\(m15ToPike, 1\), 'Shift\+Tab'\);/);
  const text = notes.map((n) => n.text).join('\n');
  assert.match(text, /vehicle 5887 -> bus\(m15ToPike, 0\)/);
  assert.match(text, /map click at the map centre/);
  assert.match(text, /container div/);
  // Every note points at a line of the spec.
  const lines = spec.split('\n');
  for (const n of notes) assert.ok(lines[n.line - 1] !== undefined, `line ${n.line}`);
});

test('convertDraft picks the positional helper by the kind of toggle', async () => {
  const { convertDraft } = await convert();
  const draft = (search, toggle) => `test('test', async ({ page }) => {
  await page.goto('http://localhost:8084/?search=${search}');
  await page.getByRole('button', { name: '${toggle}' }).press('Tab');
  await page.getByRole('link', { name: '433' }).press('Tab');
});`;
  assert.match(convertDraft(draft('B63', 'Toggle MTA NYCT_B63 to BAY'), {}).spec, /routeBus\(b63ToBay, 0\)/);
  assert.match(convertDraft(draft('400723', 'Toggle M55 to 44 ST 6 AV'), {}).spec, /vehicle\(m55To44, 0\)/);
});

test('splitChain keeps unbalanced brackets inside names', async () => {
  const { splitChain } = await convert();
  const parts = splitChain("page.getByRole('button', { name: 'Show nearby (currently' }).first().press('Tab')");
  assert.deepStrictEqual(parts.map((p) => p.name), ['page', 'getByRole', 'first', 'press']);
});

test('lineDiff lists removed then added lines without YAML dashes', async () => {
  const { lineDiff } = await refs();
  assert.deepStrictEqual(lineDiff('a\n  - b\nc', 'a\n  - b [expanded]\nc'), ['- b', '+ b [expanded]']);
  assert.deepStrictEqual(lineDiff('same', 'same'), []);
});

test('diffPng counts changed pixels as toHaveScreenshot does', async () => {
  const { diffPng } = await refs();
  const { PNG } = require('playwright-core/lib/utilsBundle');
  const image = (paint) => {
    const png = new PNG({ width: 50, height: 50 });
    png.data.fill(255);
    paint(png);
    return PNG.sync.write(png);
  };
  const white = image(() => {});
  assert.strictEqual(diffPng(white, white).count, 0);
  const dot = image((png) => {
    for (let y = 10; y < 14; y++)
      for (let x = 10; x < 15; x++) png.data.fill(0, (y * 50 + x) * 4, (y * 50 + x) * 4 + 3);
  });
  const { count, boxes } = diffPng(white, dot);
  assert.strictEqual(count, 20);
  assert.strictEqual(boxes.length, 1);
});

test('specInfo reads checkpoints in order and ignores ones in comments', async () => {
  const { specInfo } = await refs();
  const { tests } = specInfo('stop-400723');
  assert.strictEqual(tests.length, 1);
  assert.strictEqual(tests[0].checkpoints[0].name, 'loaded');
  assert.strictEqual(tests[0].checkpoints.at(-1).name, 'sim1c-double-clicked');
  assert.deepStrictEqual(tests[0].dynamic, []);
});

test('report summary names the failing checkpoint and keeps the focus diagnostic whole', async () => {
  const { summarize, firstError } = await summary();
  const result = (status, message) => ({ status, errors: message ? [{ message, location: { file: '/work/e2e/x.spec.ts', line: 7 } }] : [] });
  const report = {
    suites: [
      {
        file: 'x.spec.ts',
        specs: [
          {
            title: 'does things',
            file: 'x.spec.ts',
            tests: [
              { expectedStatus: 'passed', results: [result('passed')] },
              { expectedStatus: 'passed', results: [result('failed', 'Error: Focus check failed: expected getByRole(\'button\')\n  focused:  button "A" (div)\n  before:   (nothing)\n  after:    button "B" (div)\n\nCall log: ...')] },
              { expectedStatus: 'passed', results: [result('failed', 'expect(page).toHaveScreenshot(expected) failed\n\n  226 pixels (ratio 0.01 of all image pixels) are different.\n\n  Snapshot: m15-open.png')] },
            ],
          },
        ],
      },
    ],
  };
  const { results, failed, byCheckpoint } = summarize(report);
  assert.strictEqual(results.length, 3);
  assert.strictEqual(failed.length, 2);
  assert.deepStrictEqual([...byCheckpoint], [['focus check', 1], ['m15-open.png', 1]]);
  const lines = firstError(failed);
  assert.match(lines[0], /first failure: does things \(e2e\/x\.spec\.ts:7\)/);
  assert.ok(lines.some((l) => l.includes('after:    button "B"')));
  assert.ok(!lines.some((l) => l.includes('Call log')));
});
