const CACHE = 'health-tracker-v1';
const URLS = [
  '/', '/index.html', '/manifest.json',
  '/src/api.js', '/src/auth.js', '/src/app.js',
  '/src/utils/calc.js', '/src/utils/format.js',
  '/src/components/wheel.js', '/src/components/chart.js',
  '/src/components/scanner.js', '/src/components/barcode.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('/api/')) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
