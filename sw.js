const CACHE = 'order-pad-v19-bolt-timer';
const CORE = ['./', './index.html', './bolt.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './receipt-logo.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const h = new URL(e.request.url).hostname;
  if (h !== self.location.hostname && h !== 'fonts.googleapis.com' && !h.endsWith('gstatic.com')) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match(new URL(e.request.url).pathname.endsWith('/bolt.html') ? './bolt.html' : './index.html')))
  );
});
