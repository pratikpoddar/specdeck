import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { invoke } from '@forge/bridge';

function Importer() {
  const [scan, setScan] = useState(null);
  const [done, setDone] = useState({});
  const run = async () => { setScan({ busy: true }); setScan(await invoke('scanSpace')); };
  const convert = async (id) => { setDone(d => ({ ...d, [id]: '…' })); const r = await invoke('convertPage', { pageId: id });
    setDone(d => ({ ...d, [id]: r.ok ? `✓ ${r.converted} converted` : r.error })); };
  return (
    <div style={{ padding: 16, maxWidth: 800 }}>
      <h2>Migrate API docs to SpecDeck</h2>
      <p>Finds OpenAPI/Swagger macros from other apps in this space and replaces them with SpecDeck, keeping the same spec. Each page gets a new version, so you can roll back from page history.</p>
      <button onClick={run} style={{ padding: '6px 12px', background: '#0C66E4', color: '#fff', border: 0, borderRadius: 4 }}>{scan?.busy ? 'Scanning…' : 'Scan this space'}</button>
      {scan && !scan.busy && !scan.ok && <p style={{ color: '#AE2E24' }}>{scan.error}</p>}
      {scan?.ok && (scan.results.length === 0 ? <p>No other API-doc macros found.</p> :
        <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
          <thead><tr><th align="left">Page</th><th align="left">Macros found</th><th /></tr></thead>
          <tbody>{scan.results.map(p => (
            <tr key={p.id} style={{ borderTop: '1px solid #DCDFE4' }}>
              <td>{p.title}</td>
              <td>{p.macros.map(m => `${m.key}${m.convertible ? '' : ' (manual)'}`).join(', ')}</td>
              <td align="right">{done[p.id] || <button onClick={() => convert(p.id)}>Convert</button>}</td>
            </tr>))}</tbody>
        </table>)}
    </div>
  );
}
createRoot(document.getElementById('root')).render(<Importer />);
