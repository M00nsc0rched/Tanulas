// Tanulás service worker — hálózat először, offline esetén a gyorsítótárból.
// Kiadáskor emeld a verziót (és a js/app.js APP_VERSION értékét).
const CACHE = 'tanulas-v1.0.0';

const SHELL = [
  './',
  'index.html',
  'css/app.css',
  'js/app.js',
  'data/artifacts.json',
  'manifest.webmanifest',
  'icons/favicon.svg',
  'icons/icon-32.png',
  'icons/apple-touch-icon.png',
  'icons/icon-192.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // A ?t=… cache-bust paraméter nélkül tároljuk, hogy offline is megtalálja.
  const key = url.origin + url.pathname;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(key, copy));
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(key);
        if (cached) return cached;
        if (req.mode === 'navigate') return caches.match(new URL('./', self.location).href);
        return Response.error();
      }),
  );
});
