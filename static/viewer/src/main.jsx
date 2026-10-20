import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { invoke, view } from '@forge/bridge';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

function App() {
  const [state, setState] = useState({ loading: true });
  useEffect(() => {
    (async () => {
      const ctx = await view.getContext();
      const config = ctx.extension?.config || {};
      const hasSource = config.specText || config.url || config.attachment || ctx.extension?.autoConvertLink;
      if (!hasSource) return setState({ empty: true });
      const res = await invoke('getSpec', {});
      setState(res.ok ? { spec: res.spec, tryIt: !!config.tryItOut } : { error: res.error });
    })().catch(e => setState({ error: e.message }));
  }, []);

  if (state.loading) return <p style={{ padding: 16, color: '#626F86' }}>Loading API docs…</p>;
  if (state.empty) return <p style={{ padding: 16 }}>Edit this macro to add an OpenAPI or Swagger spec: paste it, pick a page attachment, or link a GitHub file.</p>;
  if (state.error) return <p style={{ padding: 16, color: '#AE2E24' }}>Couldn't load the spec: {state.error}</p>;
  return (
    <SwaggerUI
      spec={state.spec}
      docExpansion="list"
      defaultModelsExpandDepth={0}
      supportedSubmitMethods={state.tryIt ? ['get', 'post', 'put', 'patch', 'delete'] : []}
    />
  );
}
createRoot(document.getElementById('root')).render(<App />);
