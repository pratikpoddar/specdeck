import test from 'node:test';
import assert from 'node:assert';
import { findLegacyMacros, buildOurMacro, replaceAt } from './importer.js';

const doc = { type: 'doc', version: 1, content: [
  { type: 'paragraph', content: [{ type: 'text', text: 'hi' }] },
  { type: 'extension', attrs: { extensionType: 'com.atlassian.confluence.macro.core', extensionKey: 'open-api-swagger-macro',
    parameters: { macroParams: { url: { value: 'https://github.com/o/r/blob/main/api.yaml' } } } } },
] };

test('finds legacy macro and extracts url', () => {
  const hits = findLegacyMacros(doc);
  assert.equal(hits.length, 1);
  assert.deepEqual(hits[0].path, [1]);
  assert.equal(hits[0].spec.url, 'https://github.com/o/r/blob/main/api.yaml');
});
test('replaces with SpecPort node', () => {
  const [h] = findLegacyMacros(doc);
  const out = replaceAt(doc, [{ path: h.path, node: buildOurMacro(h.spec, { appId: 'A', environmentId: 'E' }) }]);
  assert.equal(out.content[1].attrs.extensionKey, 'A/E/static/specdeck-openapi');
  assert.equal(findLegacyMacros(out).length, 0);
});
