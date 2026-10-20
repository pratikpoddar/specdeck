import Resolver from '@forge/resolver';
import api, { route, fetch, assumeTrustedRoute } from '@forge/api';
import { kvs } from '@forge/kvs';
import { toRawUrl, parseSpec, listEndpoints } from './spec.js';

const CACHE_TTL_MS = 10 * 60 * 1000;

async function fetchGithub(url) {
  const raw = toRawUrl(url);
  const key = 'gh:' + Buffer.from(raw).toString('base64url').slice(0, 400);
  const cached = await kvs.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.text;
  const res = await fetch(raw);
  if (!res.ok) throw new Error(`GitHub returned ${res.status}. Is the file public?`);
  const text = await res.text();
  if (text.length < 200000) await kvs.set(key, { at: Date.now(), text });
  return text;
}

async function fetchAttachment(pageId, filename) {
  const list = await api.asUser().requestConfluence(
    route`/wiki/api/v2/pages/${pageId}/attachments?filename=${filename}`, { headers: { Accept: 'application/json' } });
  if (!list.ok) throw new Error(`Could not list attachments (${list.status}).`);
  const att = (await list.json()).results?.[0];
  if (!att) throw new Error(`Attachment "${filename}" was not found on this page.`);
  const file = await api.asUser().requestConfluence(route`/wiki/rest/api/content/${pageId}/child/attachment/${att.id}/download`);
  if (!file.ok) throw new Error(`Could not download the attachment (${file.status}).`);
  return file.text();
}

export async function loadSpec(config = {}, context = {}) {
  const source = config.source || (config.url ? 'url' : config.attachment ? 'attachment' : 'paste');
  let text;
  if (source === 'url') text = await fetchGithub(config.url);
  else if (source === 'attachment') text = await fetchAttachment(context.extension?.content?.id || context.content?.id, config.attachment);
  else text = config.specText;
  return parseSpec(text);
}

const resolver = new Resolver();
resolver.define('getSpec', async ({ payload, context }) => {
  try {
    const config = { ...(context.extension?.config || {}), ...(payload?.config || {}) };
    if (context.extension?.autoConvertLink && !config.url) { config.url = context.extension.autoConvertLink; config.source = 'url'; }
    return { ok: true, spec: await loadSpec(config, context) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});
resolver.define('validate', async ({ payload, context }) => {
  try {
    const spec = await loadSpec(payload.config, context);
    return { ok: true, title: spec.info?.title, version: spec.info?.version, endpoints: listEndpoints(spec).length };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});
export const handler = resolver.getDefinitions();

/** PDF / Word export: a plain endpoint table, since the interactive viewer can't be printed. */
export async function exportHandler(payload) {
  const text = (t, marks) => ({ type: 'text', text: t || ' ', ...(marks ? { marks } : {}) });
  const cell = (t, header) => ({ type: header ? 'tableHeader' : 'tableCell', content: [{ type: 'paragraph', content: [text(t)] }] });
  try {
    const spec = await loadSpec(payload.config || payload.extensionPayload?.config, payload.context || {});
    const rows = listEndpoints(spec).map(e => ({ type: 'tableRow', content: [cell(e.method), cell(e.path), cell(e.summary)] }));
    return {
      type: 'doc', version: 1, content: [
        { type: 'heading', attrs: { level: 3 }, content: [text(`${spec.info?.title || 'API'} ${spec.info?.version || ''}`)] },
        { type: 'table', content: [{ type: 'tableRow', content: [cell('Method', 1), cell('Path', 1), cell('Summary', 1)] }, ...rows] },
      ],
    };
  } catch (e) {
    return { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [text(`API docs could not be exported: ${e.message}`)] }] };
  }
}

// ---------- Importer (space settings page) ----------
import { findLegacyMacros, buildOurMacro, replaceAt } from './importer.js';

async function spacePages(spaceId) {
  const pages = [];
  let next = `/wiki/api/v2/spaces/${encodeURIComponent(spaceId)}/pages?limit=50&body-format=atlas_doc_format`;
  while (next && pages.length < 2000) {
    const res = await api.asUser().requestConfluence(assumeTrustedRoute(next));
    if (!res.ok) throw new Error(`Could not list pages (${res.status}).`);
    const data = await res.json();
    pages.push(...data.results);
    next = data._links?.next || null;
  }
  return pages;
}

resolver.define('scanSpace', async ({ context }) => {
  try {
    const spaceId = context.extension?.space?.id;
    const results = [];
    for (const p of await spacePages(spaceId)) {
      const adf = JSON.parse(p.body?.atlas_doc_format?.value || '{}');
      const hits = findLegacyMacros(adf);
      if (hits.length) results.push({ id: p.id, title: p.title, macros: hits.map(h => ({ key: h.key, convertible: !!h.spec })) });
    }
    return { ok: true, results };
  } catch (e) { return { ok: false, error: e.message }; }
});

resolver.define('convertPage', async ({ payload, context }) => {
  try {
    const res = await api.asUser().requestConfluence(route`/wiki/api/v2/pages/${payload.pageId}?body-format=atlas_doc_format`);
    const page = await res.json();
    const adf = JSON.parse(page.body.atlas_doc_format.value);
    const ids = { appId: process.env.APP_UUID, environmentId: context.environmentId };
    if (!ids.appId) throw new Error('APP_UUID is not set. Run: forge variables set APP_UUID <uuid from manifest app id>');
    const reps = findLegacyMacros(adf).filter(h => h.spec).map(h => ({ path: h.path, node: buildOurMacro(h.spec, ids) }));
    if (!reps.length) return { ok: true, converted: 0 };
    const put = await api.asUser().requestConfluence(route`/wiki/api/v2/pages/${payload.pageId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: page.id, status: 'current', title: page.title,
        body: { representation: 'atlas_doc_format', value: JSON.stringify(replaceAt(adf, reps)) },
        version: { number: page.version.number + 1, message: 'Migrated API docs to SpecDeck' } }),
    });
    if (!put.ok) throw new Error(`Update failed (${put.status}).`);
    return { ok: true, converted: reps.length };
  } catch (e) { return { ok: false, error: e.message }; }
});
