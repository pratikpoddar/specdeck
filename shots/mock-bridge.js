const mode = new URLSearchParams(location.search).get('m') || '';
const petstore = {
  openapi: '3.0.3',
  info: { title: 'Acme Payments API', version: '2.4.0', description: 'Create charges, manage customers and issue refunds. Rendered live from `openapi.yaml` in the payments repo.' },
  servers: [{ url: 'https://api.acme.dev/v2' }],
  tags: [{ name: 'Charges', description: 'Take payments' }, { name: 'Customers', description: 'People and companies you bill' }, { name: 'Refunds', description: 'Return money' }],
  paths: {
    '/charges': { get: { tags: ['Charges'], summary: 'List charges', responses: { 200: { description: 'OK' } } }, post: { tags: ['Charges'], summary: 'Create a charge', requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Charge' } } } }, responses: { 201: { description: 'Created' } } } },
    '/charges/{id}': { get: { tags: ['Charges'], summary: 'Retrieve a charge', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } }, patch: { tags: ['Charges'], summary: 'Update a charge', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } } },
    '/customers': { get: { tags: ['Customers'], summary: 'List customers', responses: { 200: { description: 'OK' } } }, post: { tags: ['Customers'], summary: 'Create a customer', responses: { 201: { description: 'Created' } } } },
    '/customers/{id}': { delete: { tags: ['Customers'], summary: 'Delete a customer', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } } },
    '/refunds': { post: { tags: ['Refunds'], summary: 'Refund a charge', responses: { 201: { description: 'Created' } } } },
  },
  components: { schemas: { Charge: { type: 'object', required: ['amount', 'currency'], properties: { amount: { type: 'integer', example: 4999 }, currency: { type: 'string', example: 'usd' }, customer: { type: 'string', example: 'cus_8f2k' } } } } },
};
const yaml = `openapi: 3.0.3
info:
  title: Acme Payments API
  version: 2.4.0
servers:
  - url: https://api.acme.dev/v2
paths:
  /charges:
    get:
      summary: List charges
    post:
      summary: Create a charge
  /charges/{id}:
    get:
      summary: Retrieve a charge
  /customers:
    get:
      summary: List customers
  /refunds:
    post:
      summary: Refund a charge`;
export const view = {
  getContext: async () => ({ extension: { config: mode === 'cfg' ? { source: 'paste', specText: yaml, tryItOut: true } : mode === 'url' ? { source: 'url', url: 'https://github.com/acme/payments/blob/main/openapi.yaml' } : { source: 'url', url: 'x', tryItOut: true } } }),
  submit: async () => {},
};
export async function invoke(name) {
  if (name === 'getSpec') return { ok: true, spec: petstore, licensed: true };
  if (name === 'validate') return { ok: true, title: 'Acme Payments API', version: '2.4.0', endpoints: 9 };
  if (name === 'scanSpace') return { ok: true, results: [
    { id: '1', title: 'Payments API reference', macros: [{ key: 'swagger-ui-macro', convertible: true }] },
    { id: '2', title: 'Webhooks v1', macros: [{ key: 'open-api-viewer', convertible: true }] },
    { id: '3', title: 'Internal auth service', macros: [{ key: 'swagger-ui-macro', convertible: true }, { key: 'oas-embed', convertible: true }] },
    { id: '4', title: 'Legacy partner API', macros: [{ key: 'openapi-render', convertible: false }] },
  ] };
  if (name === 'convertPage') return { ok: true, converted: 1 };
}
