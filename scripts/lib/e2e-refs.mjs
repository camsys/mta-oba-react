// Shared by the e2e review scripts (e2e-refs-report, e2e-contact-sheet, e2e-mutate): where a
// spec's checkpoints and references are, and how they differ from HEAD.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const require = createRequire(import.meta.url);

// Playwright's own PNG decoder and comparator, so pixel counts match what toHaveScreenshot
// reports (pixelmatch at the default threshold). Both are exported subpaths of playwright-core.
const { PNG } = require('playwright-core/lib/utilsBundle');
const comparePng = require('playwright-core/lib/coreBundle').utils.getComparator('image/png');

// Playwright's sanitizeForFilePath, which turns a test title into its snapshot folder name.
const sanitize = (s) => s.replace(/[\x00-\x2C\x2E-\x2F\x3A-\x40\x5B-\x60\x7B-\x7F]+/g, '-');

// Accepts `location`, `location.spec.ts` or `e2e/location.spec.ts`.
export function specFile(arg) {
  const base = path.basename(arg).replace(/\.spec\.ts$/, '');
  const file = path.join(ROOT, 'e2e', `${base}.spec.ts`);
  if (!fs.existsSync(file)) throw new Error(`no spec at e2e/${base}.spec.ts`);
  return { base, file, rel: `e2e/${base}.spec.ts` };
}

// Each test in the spec, with its checkpoints in source order and its snapshot folder.
// Checkpoint names that aren't string literals can't be read; they're listed as `dynamic`.
export function specInfo(arg) {
  const spec = specFile(arg);
  // Comments blanked out (same length, so line numbers hold): they mention checkpoint() too.
  const source = fs
    .readFileSync(spec.file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, (c) => c.replace(/[^\n]/g, ' '));
  const tests = [];
  const re = /\btest\(\s*(['"`])((?:\\.|(?!\1).)*)\1|\bcheckpoint\(\s*(?:(['"])((?:\\.|(?!\3).)*)\3|([^)]*))\)/g;
  for (const m of source.matchAll(re)) {
    const line = source.slice(0, m.index).split('\n').length;
    if (m[2] !== undefined) {
      const dir = path.join(ROOT, 'e2e', '__snapshots__', `${spec.base}.spec.ts`, sanitize(m[2]));
      tests.push({ title: m[2], dir, rel: path.relative(ROOT, dir), checkpoints: [], dynamic: [] });
    } else if (tests.length) {
      if (m[4] !== undefined) tests.at(-1).checkpoints.push({ name: m[4], line });
      else tests.at(-1).dynamic.push({ expr: m[5].trim(), line });
    }
  }
  return { ...spec, tests };
}

// Reference names (without extension) in a snapshot folder, by kind.
export function references(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  const names = (ext) => files.filter((f) => f.endsWith(ext)).map((f) => f.slice(0, -ext.length));
  return { png: names('.png'), aria: names('.aria.yml') };
}

// A file's committed content at `rev`, or undefined if it isn't there.
export function gitShow(rev, relPath) {
  try {
    return execFileSync('git', ['show', `${rev}:${relPath}`], { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20 });
  } catch {
    return undefined;
  }
}

export const readPng = (buffer) => PNG.sync.read(buffer);

// Changed pixels between two PNGs as toHaveScreenshot counts them, plus the boxes around the
// changed areas (for outlining). Different sizes count as all pixels changed.
export function diffPng(expected, actual, { cell = 24 } = {}) {
  const result = comparePng(actual, expected, { maxDiffPixels: 0 });
  if (!result) return { count: 0, boxes: [] };
  const count = Number(/(\d+) pixels/.exec(result.errorMessage)?.[1] ?? NaN);
  if (!result.diff) return { count, boxes: [], error: result.errorMessage };
  const diff = PNG.sync.read(result.diff);
  // pixelmatch paints changed pixels pure red; group them into cells, then cells into boxes.
  const cols = Math.ceil(diff.width / cell);
  const rows = Math.ceil(diff.height / cell);
  const marked = new Uint8Array(cols * rows);
  for (let y = 0; y < diff.height; y++)
    for (let x = 0; x < diff.width; x++) {
      const i = (y * diff.width + x) * 4;
      if (diff.data[i] === 255 && diff.data[i + 1] === 0 && diff.data[i + 2] === 0) marked[Math.floor(y / cell) * cols + Math.floor(x / cell)] = 1;
    }
  const boxes = [];
  const seen = new Uint8Array(cols * rows);
  for (let start = 0; start < marked.length; start++) {
    if (!marked[start] || seen[start]) continue;
    let [x0, y0, x1, y1] = [Infinity, Infinity, -1, -1];
    const stack = [start];
    seen[start] = 1;
    while (stack.length) {
      const c = stack.pop();
      const cx = c % cols;
      const cy = Math.floor(c / cols);
      [x0, y0, x1, y1] = [Math.min(x0, cx), Math.min(y0, cy), Math.max(x1, cx), Math.max(y1, cy)];
      // Neighbours one cell apart join, so a changed line of text is one box, not ten.
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx;
          const ny = cy + dy;
          const n = ny * cols + nx;
          if (nx >= 0 && ny >= 0 && nx < cols && ny < rows && marked[n] && !seen[n]) {
            seen[n] = 1;
            stack.push(n);
          }
        }
    }
    boxes.push({ x: x0 * cell, y: y0 * cell, width: (x1 - x0 + 1) * cell, height: (y1 - y0 + 1) * cell });
  }
  return { count, boxes };
}

// An ARIA snapshot line without its indent and YAML list dash.
const tidy = (line) => line.trim().replace(/^- /, '');

// Lines removed and added between two texts (LCS), as '- line' / '+ line', in order.
export function lineDiff(a, b) {
  const x = a.split('\n');
  const y = b.split('\n');
  const n = x.length;
  const m = y.length;
  const lcs = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--) lcs[i][j] = x[i] === y[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
  const out = [];
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && x[i] === y[j]) {
      i++;
      j++;
    } else if (i < n && (j === m || lcs[i + 1][j] >= lcs[i][j + 1])) out.push(`- ${tidy(x[i++])}`);
    else out.push(`+ ${tidy(y[j++])}`);
  }
  return out;
}
