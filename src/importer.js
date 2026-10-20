// Finds OpenAPI/Swagger macros from other (mostly retiring Connect) apps in a space
// and rewrites them as SpecPort macros. Pure ADF helpers live here so they can be unit tested.
export const OUR_MACRO = 'specdeck-openapi';
const LEGACY = /swagger|openapi|open-api|oas/i;

/** Walk an ADF doc and return every extension node that looks like a competing API-doc macro. */
export function findLegacyMacros(adf) {
  const hits = [];
  (function walk(node, path) {
    if (!node || typeof node !== 'object') return;
    if (['extension', 'bodiedExtension', 'inlineExtension'].includes(node.type)) {
      const key = node.attrs?.extensionKey || '';
      if (LEGACY.test(key) && !key.includes(OUR_MACRO)) hits.push({ path, key, spec: extractSource(node) });
    }
    (node.content || []).forEach((c, i) => walk(c, [...path, i]));
  })(adf, []);
  return hits;
}

/** Best guess at where the old macro kept its spec: a URL parameter, inline text, or an attachment name. */
export function extractSource(node) {
  const params = node.attrs?.parameters?.macroParams || node.attrs?.parameters || {};
  const values = Object.values(params).map(v => (v && typeof v === 'object' ? v.value : v)).filter(v => typeof v === 'string');
  const url = values.find(v => /^https?:\/\//.test(v));
  if (url) return { source: 'url', url };
  const file = values.find(v => /\.(ya?ml|json)$/i.test(v));
  if (file) return { source: 'attachment', attachment: file };
  const text = node.attrs?.text || collectText(node) || values.find(v => /openapi|swagger/.test(v));
  if (text && /openapi|swagger/.test(text)) return { source: 'paste', specText: text };
  return null;
}
function collectText(node) {
  if (node.type === 'text') return node.text;
  return (node.content || []).map(collectText).join('\n');
}

/** Build a SpecPort extension node. extensionKey format: <appId>/<environmentId>/static/<macroKey>. */
export function buildOurMacro(spec, { appId, environmentId }) {
  return {
    type: 'extension',
    attrs: {
      extensionType: 'com.atlassian.ecosystem',
      extensionKey: `${appId}/${environmentId}/static/${OUR_MACRO}`,
      parameters: {
        extensionTitle: 'OpenAPI / Swagger Docs (SpecPort)',
        guestParams: spec,
        localId: crypto.randomUUID(),
      },
      layout: 'default',
    },
  };
}

/** Replace the nodes at the given paths. Returns a new doc. */
export function replaceAt(adf, replacements) {
  const doc = structuredClone(adf);
  for (const { path, node } of replacements) {
    let parent = doc;
    for (const i of path.slice(0, -1)) parent = parent.content[i];
    parent.content[path[path.length - 1]] = node;
  }
  return doc;
}
