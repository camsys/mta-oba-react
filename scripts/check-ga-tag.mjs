// Checks that every built HTML page has the Google tag right after <head>.
// Run after a build with GA_MEASUREMENT_ID set: `npm run check-ga-tag`.
import fs from 'node:fs';
import path from 'node:path';

const id = process.env.GA_MEASUREMENT_ID;
if (!id) {
  console.error('GA_MEASUREMENT_ID must be set to the ID the build used');
  process.exit(1);
}

const dist = path.resolve(import.meta.dirname, '../dist');
const pages = fs.readdirSync(dist, { recursive: true }).filter(f => f.endsWith('.html'));
const tagAfterHead = new RegExp(
  `<head>\\s*(<!-- Google tag \\(gtag\\.js\\) -->\\s*)?` +
  `<script async src="https://www\\.googletagmanager\\.com/gtag/js\\?id=${id}"></script>`, 'i');

const missing = pages.filter(page => {
  const html = fs.readFileSync(path.join(dist, page), 'utf8');
  return !tagAfterHead.test(html) || !html.includes(`gtag('config', '${id}', { site_version: 'new' })`);
});

if (pages.length === 0 || missing.length > 0) {
  console.error(pages.length === 0
    ? 'No HTML pages found in dist/; run the build first'
    : `Google tag missing or not right after <head> in:\n  ${missing.join('\n  ')}`);
  process.exit(1);
}
console.log(`Google tag found right after <head> in all ${pages.length} pages`);
