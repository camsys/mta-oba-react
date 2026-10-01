const test = require('node:test');
const assert = require('node:assert');

process.env.BETA_BANNER_TEXT = '';
process.env.BETA_BANNER_LINK = '';
const { definitions } = require('../webpack.config.js').plugins.find(p => p.definitions);

for (const key of ['BETA_BANNER_TEXT', 'BETA_BANNER_LINK']) {
  test(`empty ${key} env overrides the default`, () => {
    assert.strictEqual(definitions[`process.env.${key}`], '""');
  });
}
