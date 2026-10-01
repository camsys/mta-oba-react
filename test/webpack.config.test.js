const test = require('node:test');
const assert = require('node:assert');

process.env.BETA_BANNER_TEXT = '';
process.env.BETA_BANNER_LINK = '';
process.env.BETA_BANNER_CHIP = '';
const { definitions } = require('../webpack.config.js').plugins.find(p => p.definitions);

for (const key of ['BETA_BANNER_TEXT', 'BETA_BANNER_LINK', 'BETA_BANNER_CHIP']) {
  test(`empty ${key} env overrides the default`, () => {
    assert.strictEqual(definitions[`process.env.${key}`], '""');
  });
}
