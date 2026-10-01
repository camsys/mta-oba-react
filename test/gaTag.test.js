const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// Loads the webpack config fresh with the given GA_MEASUREMENT_ID.
function loadConfigWithGaId(id) {
  process.env.GA_MEASUREMENT_ID = id;
  delete require.cache[require.resolve('../webpack.config.js')];
  return require('../webpack.config.js');
}

function gaTagFor(config) {
  const htmlPlugin = config.plugins.find(p => p.userOptions?.template);
  const copyPlugin = config.plugins.find(p => p.patterns);
  const transform = copyPlugin.patterns.find(p => p.from === 'public').transform;
  return {
    indexTag: htmlPlugin.userOptions.templateParameters.gaTag,
    staticPage: transform(Buffer.from('<head>\n    <!-- GA_TAG_INJECTION_MARKER: replaced at build time by webpack.config.js -->\n</head>'), '/x/index.html'),
  };
}

test('empty GA_MEASUREMENT_ID env adds no tag', () => {
  const { indexTag, staticPage } = gaTagFor(loadConfigWithGaId(''));
  assert.strictEqual(indexTag, '');
  assert.strictEqual(staticPage, '<head>\n    \n</head>');
});

test('GA_MEASUREMENT_ID env puts the tag in every page', () => {
  const { indexTag, staticPage } = gaTagFor(loadConfigWithGaId('G-TEST1234'));
  for (const html of [indexTag, staticPage]) {
    assert.match(html, /googletagmanager\.com\/gtag\/js\?id=G-TEST1234/);
    assert.match(html, /gtag\('config', 'G-TEST1234', \{ site_version: 'new' \}\)/);
    assert.doesNotMatch(html, /GA_TAG_INJECTION_MARKER/);
  }
});

test('malformed GA_MEASUREMENT_ID env fails the build', () => {
  assert.throws(() => loadConfigWithGaId("G-1');alert(1)//"), /Invalid GA_MEASUREMENT_ID/);
});

test('every static page has the GA marker right after <head>', () => {
  const pages = fs.readdirSync(path.join(__dirname, '../public'), { recursive: true })
    .filter(f => f.endsWith('.html'));
  assert.ok(pages.length > 0);
  for (const page of pages) {
    const html = fs.readFileSync(path.join(__dirname, '../public', page), 'utf8');
    assert.match(html, /<head>\s*<!-- GA_TAG_INJECTION_MARKER: replaced at build time by webpack.config.js -->/, page);
  }
});
