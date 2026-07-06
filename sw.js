const CACHE = 'axd-v7';
const ASSETS = [
  './axd-tracker.html',
  './manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network first, fall back to cache
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  if(e.request.url.startsWith('chrome-extension')) return;

  e.respondWith(
    fetch(e.request).then(response => {
      // Cache fresh response
      if(response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return response;
    }).catch(() => {
      // Offline - serve from cache
      return caches.match(e.request);
    })
  );
});
