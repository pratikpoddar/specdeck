import test from 'node:test';
import assert from 'node:assert';
import { isLicensed } from './license.js';
test('license states', () => {
  delete process.env.LICENSE_OVERRIDE;
  assert.equal(isLicensed({}), true);
  assert.equal(isLicensed({ license: { active: false } }), false);
  assert.equal(isLicensed({ license: { active: true } }), true);
  process.env.LICENSE_OVERRIDE = 'inactive';
  assert.equal(isLicensed({ license: { active: true } }), false);
  delete process.env.LICENSE_OVERRIDE;
});
