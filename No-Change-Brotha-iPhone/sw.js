// Service Worker: hält die App offline verfügbar.
// Bei jeder neuen Version VERSION erhöhen, damit das iPhone die neuen Dateien lädt.
const VERSION = 'ncb-v1';
const FILES = [
  './', 'index.html', 'styles.css', 'manifest.webmanifest',
  'app.js', 'logic.js', 'personas.js',
  'icon-180.png', 'icon-192.png', 'icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin === location.origin) {
    // Erst Netz (für Updates), sonst Cache (offline)
    e.respondWith(
      fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request).then((r) => r || caches.match('index.html')))
    );
  } else if (url.hostname.includes('fonts.g')) {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(e.request, copy));
      return res;
    })));
  }
});
