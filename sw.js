// Tanulás service worker — hálózat először, offline esetén a gyorsítótárból.
// Kiadáskor emeld a verziót (és a js/app.js APP_VERSION értékét).
const CACHE = 'tanulas-v1.3.0';
// A dokumentumok és a betűkészletek verzióváltáskor is megmaradnak (nem kell újra letölteni a ~50 MB-ot).
const DOCS_CACHE = 'tanulas-docs';
const CDN_CACHE = 'tanulas-cdn';
const CDN_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'];

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

const OFFLINE_DOC = `<!doctype html><html lang="hu"><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark">
<body style="margin:0;min-height:100vh;display:grid;place-items:center;font:17px/1.5 -apple-system,sans-serif;text-align:center;padding:24px">
<div><p style="font-size:40px;margin:0">📶</p><p><strong>Nincs internetkapcsolat</strong></p>
<p style="opacity:.7">Ez a dokumentum még nincs letöltve erre az eszközre.<br>Nyisd meg egyszer online, utána offline is olvasható.</p></div>`;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  const keep = [CACHE, DOCS_CACHE, CDN_CACHE];
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(req) {
  const cache = await caches.open(CDN_CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
  return res;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts / CDN: egyszer letöltve offline is megvan
  if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(cacheFirst(req));
    return;
  }
  if (url.origin !== self.location.origin) return;

  // A ?t=… cache-bust paraméter nélkül tároljuk, hogy offline is megtalálja.
  const key = url.origin + url.pathname;
  const isDoc = url.pathname.includes('/docs/');

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(isDoc ? DOCS_CACHE : CACHE).then((cache) => cache.put(key, copy));
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(key);
        if (cached) return cached;
        if (req.mode === 'navigate') {
          if (isDoc) return new Response(OFFLINE_DOC, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
          return caches.match(new URL('./', self.location).href);
        }
        return Response.error();
      }),
  );
});
