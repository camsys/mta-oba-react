#!/usr/bin/env node
// Renders every reference PNG of a spec, in checkpoint order, into one or two labelled grid
// images, so a reviewer looks at two images instead of twenty. See "Converting a draft
// (agents)" in e2e/README.md.
//
//   node scripts/e2e-contact-sheet.mjs <spec> [--since <rev>] [--full] [--out <dir>]
//
// --since <rev>  outline what changed against <rev> (e.g. HEAD), with the pixel count per tile
// --full         the whole page; by default only the sidebar, where checkpoints happen
// --out <dir>    where to write the sheets (default: a folder under the system temp dir)
// Prints the path of each sheet. Changes outside the cropped area are counted in the label.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { diffPng, gitShow, references, specInfo } from './lib/e2e-refs.mjs';

const args = process.argv.slice(2);
const opt = (f) => (args.includes(f) ? args[args.indexOf(f) + 1] : undefined);
const since = opt('--since');
const full = args.includes('--full');
const specArg = args.find((a, i) => !a.startsWith('--') && !['--since', '--out'].includes(args[i - 1]));
if (!specArg) {
  console.error('usage: node scripts/e2e-contact-sheet.mjs <spec> [--since <rev>] [--full] [--out <dir>]');
  process.exit(2);
}
const info = specInfo(specArg);
const outDir = opt('--out') ?? path.join(os.tmpdir(), 'e2e-contact-sheet');
fs.mkdirSync(outDir, { recursive: true });

// The sidebar is the left 416px of the 1280x720 page. At half size its 16px text is 8px, which
// still shows toggles, focus rings and section order; 7x2 tiles keep a sheet near 1500x800,
// which an image viewer shows without shrinking it further. Whole pages need bigger tiles.
const CROP = full ? { width: 1280, height: 720 } : { width: 416, height: 720 };
const SCALE = full ? 0.36 : 0.5;
const MAX_COLS = full ? 4 : 7;
const ROWS = full ? 4 : 2;

const tiles = [];
for (const t of info.tests) {
  const refs = references(t.dir);
  t.checkpoints.forEach(({ name }, i) => {
    const file = path.join(t.dir, `${name}.png`);
    if (!refs.png.includes(name)) return tiles.push({ name, index: i + 1, missing: true });
    const buffer = fs.readFileSync(file);
    const tile = { name, index: i + 1, src: `data:image/png;base64,${buffer.toString('base64')}` };
    if (since) {
      const old = gitShow(since, path.join(t.rel, `${name}.png`));
      if (!old) tile.status = 'new';
      else {
        const { count, boxes, error } = diffPng(old, buffer);
        tile.count = count;
        tile.error = error;
        tile.boxes = boxes;
        tile.outside = boxes.filter((b) => b.x >= CROP.width).length;
        tile.status = count ? `${count} px` : '=';
      }
    }
    tiles.push(tile);
  });
}
if (!tiles.length) {
  console.error(`no checkpoints found in ${info.rel}`);
  process.exit(1);
}

// Spread tiles evenly over the fewest sheets: 22 checkpoints make two sheets of 11, not 14 + 8.
const sheets = Math.ceil(tiles.length / (MAX_COLS * ROWS));
const perSheet = Math.ceil(tiles.length / sheets);
const COLS = Math.min(MAX_COLS, Math.ceil(perSheet / ROWS));

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const w = Math.round(CROP.width * SCALE);
const h = Math.round(CROP.height * SCALE);
function sheetHtml(pageTiles, n, of) {
  const cells = pageTiles
    .map((t) => {
      const label = `${t.index} ${esc(t.name)}`;
      const status = t.missing
        ? '<b class="bad">missing</b>'
        : t.status === undefined
          ? ''
          : t.status === '='
            ? '<span class="same">=</span>'
            : `<b class="${t.status === 'new' ? 'new' : 'bad'}">${esc(t.status)}${t.outside ? ', some on map' : ''}</b>`;
      const boxes = (t.boxes ?? [])
        .filter((b) => b.x < CROP.width)
        .map(
          (b) =>
            `<div class="box" style="left:${b.x * SCALE - 2}px;top:${b.y * SCALE - 2}px;width:${Math.min(b.width, CROP.width - b.x) * SCALE}px;height:${b.height * SCALE}px"></div>`,
        )
        .join('');
      const img = t.missing ? '' : `<img src="${t.src}" style="width:${1280 * SCALE}px">`;
      return `<figure><div class="shot" style="width:${w}px;height:${h}px">${img}${boxes}</div><figcaption><span>${label}</span>${status}</figcaption></figure>`;
    })
    .join('');
  return `<!doctype html><meta charset="utf-8"><style>
    body { margin: 0; padding: 8px; background: #fff; font: 13px/1.2 Arial, sans-serif; color: #000; }
    h1 { font-size: 15px; margin: 0 0 6px; }
    .grid { display: grid; grid-template-columns: repeat(${COLS}, ${w}px); gap: 10px 8px; }
    figure { margin: 0; }
    .shot { position: relative; overflow: hidden; outline: 1px solid #999; background: #eee; }
    .shot img { position: absolute; left: 0; top: 0; }
    .box { position: absolute; border: 2px solid #e00; box-shadow: 0 0 0 1px #fff; }
    figcaption { margin-top: 3px; font-weight: bold; }
    figcaption span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .bad { color: #c00; white-space: nowrap; } .new { color: #06c; white-space: nowrap; } .same { color: #888; }
  </style><h1>${esc(info.rel)}${since ? ` vs ${esc(since)}` : ''}${of > 1 ? ` (${n}/${of})` : ''}</h1><div class="grid">${cells}</div>`;
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ deviceScaleFactor: 1, viewport: { width: 16 + COLS * w + (COLS - 1) * 8, height: 600 } });
  for (let s = 0; s < sheets; s++) {
    await page.setContent(sheetHtml(tiles.slice(s * perSheet, (s + 1) * perSheet), s + 1, sheets));
    const file = path.join(outDir, `${info.base}${since ? '-since' : ''}${sheets > 1 ? `-${s + 1}` : ''}.png`);
    await page.locator('body').screenshot({ path: file });
    console.log(file);
  }
} finally {
  await browser.close();
}
if (since) {
  const changed = tiles.filter((t) => t.count);
  console.log(`${changed.length} changed, ${tiles.filter((t) => t.status === 'new').length} new, ${tiles.filter((t) => t.status === '=').length} unchanged, ${tiles.filter((t) => t.missing).length} missing`);
}
