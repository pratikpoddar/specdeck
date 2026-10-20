import yaml from 'js-yaml';

/** Turn a github.com blob URL into its raw.githubusercontent.com equivalent. */
export function toRawUrl(url) {
  const u = new URL(url.trim());
  if (u.hostname === 'raw.githubusercontent.com') return u.toString();
  if (u.hostname === 'github.com') {
    const parts = u.pathname.split('/').filter(Boolean); // owner repo blob ref ...path
    if (parts.length >= 5 && parts[2] === 'blob') {
      const [owner, repo, , ref, ...path] = parts;
      return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path.join('/')}`;
    }
  }
  throw new Error('Only GitHub file links are supported in this version. Paste the spec or attach it instead.');
}

/** Parse JSON or YAML text and check it looks like an OpenAPI / Swagger document. */
export function parseSpec(text) {
  if (!text || !text.trim()) throw new Error('The spec is empty.');
  let doc;
  try { doc = JSON.parse(text); } catch { doc = yaml.load(text); }
  if (!doc || typeof doc !== 'object') throw new Error('Could not read the spec as JSON or YAML.');
  if (!doc.openapi && !doc.swagger) throw new Error('This does not look like an OpenAPI 3 or Swagger 2 document (no "openapi" or "swagger" field).');
  return doc;
}

/** Flat list of endpoints, used for PDF/Word export and the summary header. */
export function listEndpoints(doc) {
  const out = [];
  const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
  for (const [path, item] of Object.entries(doc.paths || {})) {
    for (const m of methods) {
      if (item && item[m]) out.push({ method: m.toUpperCase(), path, summary: item[m].summary || item[m].operationId || '' });
    }
  }
  return out;
}
