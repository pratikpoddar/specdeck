import test from 'node:test';
import assert from 'node:assert';
import { toRawUrl, parseSpec, listEndpoints } from './spec.js';

test('github blob to raw', () => {
  assert.equal(toRawUrl('https://github.com/OAI/learn.openapis.org/blob/main/examples/v3.0/petstore.yaml'),
    'https://raw.githubusercontent.com/OAI/learn.openapis.org/main/examples/v3.0/petstore.yaml');
});
test('parse yaml + list endpoints', () => {
  const doc = parseSpec('openapi: 3.0.0\ninfo: {title: T, version: "1"}\npaths:\n  /pets:\n    get: {summary: List pets}\n    post: {operationId: createPet}\n');
  assert.deepEqual(listEndpoints(doc).map(e => e.method + ' ' + e.path), ['GET /pets', 'POST /pets']);
});
test('rejects non-openapi', () => { assert.throws(() => parseSpec('{"a":1}')); });
