#!/usr/bin/env node
// Turns a Playwright JSON report into a few lines: pass counts, which checkpoints failed in how
// many repeats, and the first error (with the focus diagnostic from e2e/support/steps.ts when
// there is one). Used by scripts/e2e-cycle.sh and scripts/e2e-mutate.sh.
//
//   node scripts/lib/e2e-report-summary.mjs <report.json> [--mutation]
//
// Exit code: 0 if every test passed, 1 otherwise. With --mutation, prints the first failing
// checkpoint and its pixel count instead, and exits 0 only if something failed.
import fs from 'node:fs';

const FOCUS_CHECK_FAILED = 'Focus check failed'; // e2e/support/steps.ts
const ERROR_LINES = 12;

// eslint-disable-next-line no-control-regex
const plain = (s) => String(s ?? '').replace(/\x1b\[[0-9;]*m/g, '');

export function summarize(report) {
  const results = [];
  const walk = (suite, titles) => {
    for (const spec of suite.specs ?? [])
      for (const test of spec.tests ?? [])
        for (const r of test.results ?? [])
          results.push({ title: [...titles, spec.title].filter(Boolean).join(' › '), file: spec.file, status: r.status, errors: r.errors ?? [], stack: r.error?.stack, expected: test.expectedStatus ?? 'passed' });
    for (const s of suite.suites ?? []) walk(s, [...titles, s.file ? '' : s.title]);
  };
  for (const s of report.suites ?? []) walk(s, []);
  const failed = results.filter((r) => r.status !== r.expected && r.status !== 'skipped');
  // Which snapshot each failure stopped at, so "m15-open.png failed 2/5" shows a flaky checkpoint.
  const byCheckpoint = new Map();
  for (const r of failed) {
    const msg = plain(r.errors[0]?.message);
    const where = snapshotName(msg) ?? (msg.includes(FOCUS_CHECK_FAILED) ? 'focus check' : msg.split('\n')[0].slice(0, 60));
    byCheckpoint.set(where, (byCheckpoint.get(where) ?? 0) + 1);
  }
  return { results, failed, byCheckpoint, errors: report.errors ?? [] };
}

// The checkpoint a failed toHaveScreenshot / toMatchAriaSnapshot was comparing.
function snapshotName(msg) {
  return (
    /Snapshot:\s*(\S+\.(?:png|aria\.yml))/.exec(msg)?.[1] ??
    /toHaveScreenshot\(['"]?([^'")]+\.png)/.exec(msg)?.[1] ??
    /([\w-]+\.(?:png|aria\.yml))/.exec(msg)?.[1]
  );
}

const pixels = (msg) => /(\d+) pixels \(ratio/.exec(msg)?.[1];

// The first error, short: its message up to ERROR_LINES lines (a focus diagnostic whole), and
// where in the spec it was thrown.
export function firstError(failed, globalErrors = []) {
  const r = failed[0];
  const e = r?.errors[0] ?? globalErrors[0];
  if (!e) return [];
  const msg = plain(e.message ?? e.value ?? e);
  const lines = msg.split('\n');
  const focus = msg.includes(FOCUS_CHECK_FAILED);
  const end = focus ? lines.findIndex((l, i) => i > 0 && !l.startsWith('  ')) : ERROR_LINES;
  const shown = lines.slice(0, end < 0 ? lines.length : end).filter((l, i, a) => l.trim() || (a[i + 1] ?? '').trim());
  // The spec line, not a helper's: the first spec frame in the stack, else Playwright's location.
  const specFrame = /(e2e\/[\w.-]+\.spec\.ts:\d+)/.exec(plain(r?.stack ?? e.stack))?.[1];
  const loc = specFrame ?? (e.location ? `${e.location.file.replace(/^.*\/e2e\//, 'e2e/')}:${e.location.line}` : undefined);
  return [...(r ? [`first failure: ${r.title}${loc ? ` (${loc})` : ''}`] : []), ...shown.slice(0, focus ? 20 : ERROR_LINES).map((l) => `  ${l}`)];
}

function main() {
  const [file, ...rest] = process.argv.slice(2);
  const mutation = rest.includes('--mutation');
  if (!file || !fs.existsSync(file)) {
    console.log(`no report at ${file}; the run failed before any test (see the log)`);
    process.exit(mutation ? 1 : 1);
  }
  const { results, failed, byCheckpoint, errors } = summarize(JSON.parse(fs.readFileSync(file, 'utf8')));
  if (mutation) {
    if (!failed.length) {
      console.log(`NOT caught: ${results.length} run(s) passed with the mutation`);
      process.exit(1);
    }
    const msg = plain(failed[0].errors[0]?.message);
    const name = snapshotName(msg) ?? msg.split('\n')[0];
    const px = pixels(msg);
    console.log(`caught: first failing checkpoint ${name}${px ? ` (${px} px)` : ''}`);
    process.exit(0);
  }
  if (!failed.length && !errors.length) {
    console.log(`${results.length}/${results.length} passed`);
    process.exit(0);
  }
  const counts = [...byCheckpoint].map(([k, n]) => `${k} ${n}/${results.length}`).join(', ');
  console.log(`${failed.length}/${results.length} failed${counts ? `: ${counts}` : ''}`);
  for (const l of firstError(failed, errors)) console.log(l);
  process.exit(1);
}

if (process.argv[1]?.endsWith('e2e-report-summary.mjs')) main();
