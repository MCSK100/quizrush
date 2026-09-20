import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Never auto-reload on controllerchange: after a deploy the new SW taking
  // control used to force a reload loop that looked like a blank/slow page.
  // Updates apply silently on next navigation instead.
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => { /* offline / iOS private mode */ });
  });
}
