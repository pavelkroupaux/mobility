/* Mobility service worker: precache the app shell, serve cache-first,
   refresh in the background (stale-while-revalidate). */
const BUILD = '__BUILD__'; // replaced with the commit sha by the deploy workflow
const CACHE = `mobility-${BUILD}`;
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/tokens.css',
  './css/app.css',
  './js/app.js',
  './js/audio.js',
  './js/icons.js',
  './js/illustrations.js',
  './js/install.js',
  './js/store.js',
  './js/theme.js',
  './js/ui.js',
  './js/version.js',
  './js/data/exercises.js',
  './js/data/routines.js',
  './js/views/builder.js',
  './js/views/exercise.js',
  './js/views/history.js',
  './js/views/home.js',
  './js/views/library.js',
  './js/views/player.js',
  './js/views/routine.js',
  './js/views/settings.js',
  './icons/favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('mobility-') && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request, { ignoreSearch: true });
    const network = fetch(request).then((res) => {
      if (res && res.ok) cache.put(request, res.clone());
      return res;
    }).catch(() => null);
    if (cached) { event.waitUntil(network); return cached; }
    const res = await network;
    if (res) return res;
    if (request.mode === 'navigate') return (await cache.match('./index.html')) || Response.error();
    return Response.error();
  })());
});
