#!/usr/bin/env node
// One compact report on a spec's references, so a reviewer doesn't read every .aria.yml and
// PNG. See "Converting a draft (agents)" in e2e/README.md.
//
//   node scripts/e2e-refs-report.mjs <spec> [--since <rev>] [--verbose] [--delete-orphans]
//
// - orphaned references (no checkpoint names them) and checkpoints with no reference;
// - per checkpoint, the ARIA lines that changed from the checkpoint before it: what each step did;
// - per checkpoint, ARIA and PNG changes against <rev> (default HEAD).
// --delete-orphans prints the `git rm` for orphaned references; it never runs it.
import fs from 'node:fs';
import path from 'node:path';
import { diffPng, gitShow, lineDiff, references, specInfo } from './lib/e2e-refs.mjs';

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const since = args.includes('--since') ? args[args.indexOf('--since') + 1] : 'HEAD';
const verbose = has('--verbose');
const specArg = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--since');
if (!specArg) {
  console.error('usage: node scripts/e2e-refs-report.mjs <spec> [--since <rev>] [--verbose] [--delete-orphans]');
  process.exit(2);
}

// State changes ([expanded], [pressed], ...) are what a step is about; list them first and in
// full, and cap the rest unless --verbose.
const STATE = /\[(expanded|pressed|checked|selected|disabled)/;
const OTHER_LINES = 3;
const MAX_LINES = 8;
const STATES = /\s*\[(expanded|pressed|checked|selected|disabled)[^\]]*\]/g;
function compact(input) {
  // A line that only gained or lost a state becomes one line: `~ button "x" +[expanded]`.
  const diff = [];
  const used = new Set();
  input.forEach((l, i) => {
    if (used.has(i)) return;
    const bare = l.slice(2).replace(STATES, '');
    const j = input.findIndex((o, k) => k > i && !used.has(k) && o[0] !== l[0] && o.slice(2).replace(STATES, '') === bare);
    if (j < 0 || !STATE.test(l + input[j])) return diff.push(l);
    used.add(j);
    const [before, after] = l[0] === '-' ? [l, input[j]] : [input[j], l];
    const states = (s) => s.match(STATES)?.map((x) => x.trim()) ?? [];
    const gained = states(after).filter((x) => !states(before).includes(x)).map((x) => `+${x}`);
    const lost = states(before).filter((x) => !states(after).includes(x)).map((x) => `-${x}`);
    diff.push(`~ ${bare.replace(/:$/, '')} ${[...gained, ...lost].join(' ')}`);
  });
  if (verbose) return diff;
  const state = diff.filter((l) => STATE.test(l));
  const other = diff.filter((l) => !STATE.test(l));
  const shown = [...state.slice(0, MAX_LINES), ...other.slice(0, Math.max(OTHER_LINES, MAX_LINES - state.length))].slice(0, MAX_LINES);
  const rest = diff.filter((l) => !shown.includes(l));
  if (rest.length) {
    const added = rest.filter((l) => l.startsWith('+')).length;
    const changed = rest.filter((l) => l.startsWith('~')).length;
    shown.push(`(${rest.length} more: +${added} -${rest.length - added - changed}${changed ? ` ~${changed}` : ''}; --verbose)`);
  }
  return shown;
}
function briefly(d) {
  const c = compact(d);
  const flips = c.filter((l) => l.startsWith('~')).slice(0, 3);
  const added = d.filter((l) => l.startsWith('+')).length;
  return [`${d.length} lines: +${added} -${d.length - added}`, ...flips];
}
const cut = (s, n = 110) => (s.length > n ? `${s.slice(0, n - 3)}...` : s);

const info = specInfo(specArg);
const orphans = [];
let failed = false;
for (const t of info.tests) {
  const refs = references(t.dir);
  const names = t.checkpoints.map((c) => c.name);
  const width = Math.min(28, Math.max(...names.map((n) => n.length), 8));
  const pad = (n) => n.padEnd(width);
  console.log(`${info.rel} › ${t.title}: ${names.length} checkpoints, ${refs.aria.length} aria + ${refs.png.length} png references`);
  for (const d of t.dynamic) console.log(`  ! L${d.line}: checkpoint(${d.expr}) has no literal name; not checked`);

  const dupes = names.filter((n, i) => names.indexOf(n) !== i);
  if (dupes.length) {
    failed = true;
    console.log(`  duplicate checkpoint names: ${[...new Set(dupes)].join(', ')}`);
  }
  const orphaned = [...new Set([...refs.aria, ...refs.png])].filter((r) => !names.includes(r) && !t.dynamic.length);
  const missingAria = names.filter((n) => !refs.aria.includes(n));
  const missingPng = names.filter((n) => !refs.png.includes(n));
  console.log(`  orphaned: ${orphaned.length ? orphaned.join(', ') : 'none'}`);
  console.log(`  missing:  ${missingAria.length || missingPng.length ? [...missingAria.map((n) => `${n}.aria.yml`), ...missingPng.map((n) => `${n}.png`)].join(', ') : 'none'}`);
  if (missingAria.length || missingPng.length) failed = true;
  for (const o of orphaned) {
    for (const ext of ['.aria.yml', '.png']) if (fs.existsSync(path.join(t.dir, o + ext))) orphans.push(path.join(t.rel, o + ext));
  }

  // What each step changed.
  console.log('  steps (ARIA vs the checkpoint before):');
  let prev;
  for (const { name } of t.checkpoints) {
    const file = path.join(t.dir, `${name}.aria.yml`);
    if (!fs.existsSync(file)) {
      console.log(`    ${pad(name)} (no reference)`);
      continue;
    }
    const text = fs.readFileSync(file, 'utf8');
    if (prev === undefined) console.log(`    ${pad(name)} (first, ${text.split('\n').length} lines)`);
    else {
      const d = lineDiff(prev, text);
      if (!d.length) console.log(`    ${pad(name)} = no ARIA change (screenshot only)`);
      else compact(d).forEach((l, i) => console.log(`    ${i ? ' '.repeat(width) : pad(name)} ${cut(l)}`));
    }
    prev = text;
  }

  // Against the committed references.
  const ariaChanged = [];
  const ariaNew = [];
  const pngChanged = [];
  const pngNew = [];
  let ariaSame = 0;
  let pngSame = 0;
  for (const { name } of t.checkpoints) {
    const aria = path.join(t.dir, `${name}.aria.yml`);
    if (fs.existsSync(aria)) {
      const old = gitShow(since, path.join(t.rel, `${name}.aria.yml`));
      if (!old) ariaNew.push(name);
      else {
        const d = lineDiff(old.toString(), fs.readFileSync(aria, 'utf8'));
        if (d.length) ariaChanged.push({ name, d });
        else ariaSame++;
      }
    }
    const png = path.join(t.dir, `${name}.png`);
    if (fs.existsSync(png)) {
      const old = gitShow(since, path.join(t.rel, `${name}.png`));
      if (!old) pngNew.push(name);
      else {
        const { count, error } = diffPng(old, fs.readFileSync(png));
        if (count || error) pngChanged.push(`${name} ${error ? cut(error, 60) : `${count} px`}`);
        else pngSame++;
      }
    }
  }
  console.log(`  since ${since}:`);
  console.log(`    aria: ${ariaSame} unchanged, ${ariaChanged.length} changed, ${ariaNew.length} new${ariaNew.length && verbose ? ` (${ariaNew.join(', ')})` : ''}`);
  // A new recording changes every checkpoint the same way; show each distinct change once.
  const shown = new Map();
  for (const { name, d } of ariaChanged) {
    const sig = d.join('\n');
    if (shown.has(sig)) shown.get(sig).push(name);
    else shown.set(sig, [name]);
  }
  for (const [sig, names] of shown) {
    const d = sig.split('\n');
    // Without --verbose, only a size and the state flips: against HEAD, a new recording changes
    // hundreds of lines of data, and "steps whose effect changed" below is the line to read.
    const lines = verbose ? compact(d) : briefly(d);
    lines.forEach((l, i) => console.log(`      ${i ? ' '.repeat(width) : pad(names[0])} ${cut(l)}`));
    if (names.length > 1) console.log(`      ${' '.repeat(width)} (same change in ${names.length - 1} more: ${cut(names.slice(1).join(', '), 90)})`);
  }
  // Did each step still do the same thing? Compares this checkpoint's change from the one
  // before it, now and at <rev>. Data can change while every step's effect stays the same.
  const differentSteps = [];
  t.checkpoints.forEach(({ name }, i) => {
    if (!i) return;
    const prevName = t.checkpoints[i - 1].name;
    const now = [prevName, name].map((n) => path.join(t.dir, `${n}.aria.yml`));
    const then = [prevName, name].map((n) => gitShow(since, path.join(t.rel, `${n}.aria.yml`)));
    if (!now.every((f) => fs.existsSync(f)) || !then.every(Boolean)) return;
    const stepNow = lineDiff(...now.map((f) => fs.readFileSync(f, 'utf8'))).join('\n');
    const stepThen = lineDiff(...then.map((b) => b.toString())).join('\n');
    if (stepNow !== stepThen) differentSteps.push(name);
  });
  const comparable = t.checkpoints.length - 1 - ariaNew.length;
  if (ariaChanged.length && comparable > 0)
    console.log(`    steps whose effect changed: ${differentSteps.length ? cut(differentSteps.join(', '), 100) : `none of ${comparable} with both refs at ${since}`}`);
  console.log(`    png:  ${pngSame} unchanged, ${pngChanged.length} changed, ${pngNew.length} new${pngNew.length && verbose ? ` (${pngNew.join(', ')})` : ''}`);
  // Wrapped, a few per line.
  for (let i = 0; i < pngChanged.length; i += 4) console.log(`      ${pngChanged.slice(i, i + 4).join(', ')}`);
}

if (has('--delete-orphans')) {
  if (!orphans.length) console.log('no orphaned references');
  else {
    // Untracked files need plain rm; git rm refuses them.
    const tracked = orphans.filter((f) => gitShow('HEAD', f));
    const untracked = orphans.filter((f) => !tracked.includes(f));
    const q = (f) => `'${f.replace(/'/g, `'\\''`)}'`;
    if (tracked.length) console.log(`git rm ${tracked.map(q).join(' ')}`);
    if (untracked.length) console.log(`rm ${untracked.map(q).join(' ')}`);
  }
}
process.exitCode = failed ? 1 : 0;
