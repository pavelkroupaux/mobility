/** App entry: theme, router, tab bar, service worker. */
import { icon } from './icons.js';
import { applyTheme } from './theme.js';
import { toast, closeSheet } from './ui.js';
import { homeView } from './views/home.js';
import { routineView } from './views/routine.js';
import { libraryView } from './views/library.js';
import { exerciseView } from './views/exercise.js';
import { builderView } from './views/builder.js';
import { historyView } from './views/history.js';
import { settingsView } from './views/settings.js';
import { playerView } from './views/player.js';

const routes = [
  { re: /^#\/?$/, view: homeView, tab: 'home' },
  { re: /^#\/routine\/([^/]+)$/, view: routineView, tab: 'home' },
  { re: /^#\/play\/([^/]+)$/, view: playerView, player: true },
  { re: /^#\/library$/, view: libraryView, tab: 'library' },
  { re: /^#\/exercise\/([^/]+)$/, view: exerciseView, tab: 'library' },
  { re: /^#\/builder(?:\/([^/]+))?$/, view: builderView, tab: 'home' },
  { re: /^#\/history$/, view: historyView, tab: 'history' },
  { re: /^#\/settings$/, view: settingsView, tab: 'settings' },
];

const TABS = [
  { id: 'home', label: 'Home', href: '#/', icon: 'home' },
  { id: 'library', label: 'Library', href: '#/library', icon: 'library' },
  { id: 'history', label: 'Progress', href: '#/history', icon: 'history' },
  { id: 'settings', label: 'Settings', href: '#/settings', icon: 'settings' },
];

const app = document.getElementById('app');
const nav = document.getElementById('nav');
let cleanup = null;

function renderNav(active) {
  nav.innerHTML = `<div class="tabbar__inner">${TABS.map((t) => `<a class="tab ${t.id === active ? 'is-active' : ''}" href="${t.href}" aria-label="${t.label}" ${t.id === active ? 'aria-current="page"' : ''}>${icon(t.icon)}<span>${t.label}</span></a>`).join('')}</div>`;
}

function route() {
  const raw = location.hash || '#/';
  const [path, qs = ''] = raw.split('?');
  const query = new URLSearchParams(qs);
  const match = routes.find((r) => r.re.test(path)) || routes[0];
  const params = (path.match(match.re) || []).slice(1).map((p) => (p == null ? p : decodeURIComponent(p)));

  if (typeof cleanup === 'function') cleanup();
  cleanup = null;
  closeSheet();

  app.classList.toggle('is-player', !!match.player);
  nav.classList.toggle('is-hidden', !!match.player);
  document.body.classList.toggle('no-scroll', !!match.player);
  renderNav(match.tab);
  cleanup = match.view(app, params, query) || null;
  window.scrollTo({ top: 0 });
}

// ---------- service worker ----------
async function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register('./sw.js');
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w?.addEventListener('statechange', () => {
        if (w.state === 'installed' && navigator.serviceWorker.controller) {
          toast('Update available', { action: 'Reload', duration: 0, onAction: () => { w.postMessage({ type: 'SKIP_WAITING' }); } });
        }
      });
    });
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (!refreshing) { refreshing = true; location.reload(); } });
  } catch (e) { console.warn('SW registration failed', e); }
}

// ---------- boot ----------
applyTheme();
window.addEventListener('hashchange', route);
window.addEventListener('installable', () => { if (location.hash === '' || location.hash === '#/') route(); });
route();
registerSW();
