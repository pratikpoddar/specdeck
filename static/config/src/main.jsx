import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { invoke, view } from '@forge/bridge';

const tabs = [
  ['paste', 'Paste spec'],
  ['attachment', 'Page attachment'],
  ['url', 'GitHub link'],
];
const box = { width: '100%', boxSizing: 'border-box', padding: 8, border: '1px solid #DCDFE4', borderRadius: 4, fontSize: 14 };

function Config() {
  const [cfg, setCfg] = useState({ source: 'paste', specText: '', attachment: '', url: '', tryItOut: false });
  const [check, setCheck] = useState(null);
  useEffect(() => { view.getContext().then(ctx => setCfg(c => ({ ...c, ...(ctx.extension?.config || {}) }))); }, []);
  const set = (k, v) => { setCfg(c => ({ ...c, [k]: v })); setCheck(null); };

  const validate = async () => { setCheck({ busy: true }); setCheck(await invoke('validate', { config: cfg })); };
  const save = () => view.submit({ config: {
    source: cfg.source,
    specText: cfg.source === 'paste' ? cfg.specText : undefined,
    attachment: cfg.source === 'attachment' ? cfg.attachment : undefined,
    url: cfg.source === 'url' ? cfg.url : undefined,
    tryItOut: !!cfg.tryItOut,
  } });

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {tabs.map(([k, label]) => (
          <button key={k} onClick={() => set('source', k)}
            style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #0C66E4', cursor: 'pointer',
              background: cfg.source === k ? '#0C66E4' : '#fff', color: cfg.source === k ? '#fff' : '#0C66E4' }}>{label}</button>
        ))}
      </div>
      {cfg.source === 'paste' && <textarea rows={16} style={{ ...box, fontFamily: 'monospace' }} placeholder="openapi: 3.0.0 …" value={cfg.specText} onChange={e => set('specText', e.target.value)} />}
      {cfg.source === 'attachment' && <input style={box} placeholder="petstore.yaml (attached to this page)" value={cfg.attachment} onChange={e => set('attachment', e.target.value)} />}
      {cfg.source === 'url' && <input style={box} placeholder="https://github.com/org/repo/blob/main/openapi.yaml" value={cfg.url} onChange={e => set('url', e.target.value)} />}
      <label><input type="checkbox" checked={!!cfg.tryItOut} onChange={e => set('tryItOut', e.target.checked)} /> Enable "Try it out" (calls go from the reader's browser)</label>
      {check && !check.busy && (check.ok
        ? <p style={{ color: '#216E4E', margin: 0 }}>✓ {check.title} {check.version}: {check.endpoints} endpoints</p>
        : <p style={{ color: '#AE2E24', margin: 0 }}>{check.error}</p>)}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={validate} style={{ padding: '6px 12px' }}>{check?.busy ? 'Checking…' : 'Check spec'}</button>
        <button onClick={save} style={{ padding: '6px 12px', background: '#0C66E4', color: '#fff', border: 0, borderRadius: 4 }}>Save</button>
      </div>
    </div>
  );
}
createRoot(document.getElementById('root')).render(<Config />);
