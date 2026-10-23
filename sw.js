const CACHE_NAME = 'jorge-vinuela-pwa-v12';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/la-seleccion-de-jorge/',
  '/styles.css',
  '/gallery.css',
  '/script.js',
  '/gallery.js',
  '/reviews.js',
  '/reviews.css',
  '/manifest.webmanifest',
  '/assets/pwa-icon.svg?v=7',
  '/assets/favicon.svg?v=7',
  '/assets/logo.png',
  '/assets/salon-interior.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('jorge-vinuela-pwa-') && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  // Never cache API responses in the service worker; review data refreshes from Google.
  if (new URL(request.url).pathname.startsWith('/api/')) return;
  if (request.mode === 'navigate') {
    const navigationPath = new URL(request.url).pathname;
    const cacheKey = navigationPath === '/' ? '/' : navigationPath;
    event.respondWith(fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(cacheKey, copy));
      }
      return response;
    }).catch(() => caches.match(cacheKey).then((cached) => cached || caches.match('/'))));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    });
  }));
});
