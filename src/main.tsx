import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/instrument-sans';
import './styles/app.css';
import App from './app/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Capture the browser's install prompt so the More screen can offer "Install the app".
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__g548Install = e as BeforeInstallPromptEvent;
  window.dispatchEvent(new Event('g548-installable'));
});

// Branded launch: hold the splash briefly, then fade it out once the app has mounted.
const splash = document.getElementById('splash');
if (splash) {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  window.setTimeout(() => {
    splash.classList.add('splash--out');
    window.setTimeout(() => splash.remove(), 600);
  }, reduced ? 150 : 760);
}

// Offline app shell (PWA). Skipped in dev so hot reload stays predictable.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}
