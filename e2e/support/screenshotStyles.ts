import fs from 'node:fs';
import path from 'node:path';
import type { Page } from '@playwright/test';

// The app asks for Helvetica/Arial, which macOS has and CI's Linux doesn't; the fallback
// there has different glyph widths, so text wraps differently and the whole layout shifts.
// Arimo has Arial's metrics, so drawing everything in it makes a screenshot taken on a Mac
// line up with one taken in CI.
const FONT_DIR = path.dirname(require.resolve('@fontsource/arimo/files/arimo-latin-400-normal.woff2'));
const FACES = [
  { weight: 400, style: 'normal' },
  { weight: 700, style: 'normal' },
  { weight: 400, style: 'italic' },
  { weight: 700, style: 'italic' },
];

let css: string | undefined;
const screenshotCss = () =>
  (css ??= [
    ...FACES.map(({ weight, style }) => {
      const font = fs.readFileSync(path.join(FONT_DIR, `arimo-latin-${weight}-${style}.woff2`)).toString('base64');
      return `@font-face { font-family: e2e-arimo; font-weight: ${weight}; font-style: ${style}; src: url(data:font/woff2;base64,${font}) format('woff2'); }`;
    }),
    '*, *::before, *::after { font-family: e2e-arimo !important; }',
    // Tests block map tiles; hide the pane so a partly loaded one can't show up either.
    '.leaflet-tile-pane { visibility: hidden !important; }',
  ].join('\n'));

const STYLE_ID = 'e2e-screenshot-styles';

// Idempotent: a full page load drops the tag, so checkpoints re-add it when it's missing.
export async function useScreenshotStyles(page: Page) {
  await page.evaluate(
    async ({ id, content }) => {
      if (!document.getElementById(id)) {
        const style = document.createElement('style');
        style.id = id;
        style.textContent = content;
        document.head.appendChild(style);
      }
      await document.fonts.ready;
    },
    { id: STYLE_ID, content: screenshotCss() },
  );
}
