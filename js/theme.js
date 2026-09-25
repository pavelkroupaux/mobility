import { store } from './store.js';
export function applyTheme() {
  const t = store.getSettings().theme;
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
}
