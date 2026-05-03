const CACHE_NAME = 'health-tracker-v2';
const STATIC_URLS = [
  '/', '/index.html', '/manifest.json',
  '/src/api.js', '/src/auth.js', '/src/app.js',
  '/src/utils/calc.js', '/src/utils/format.js',
  '/src/components/wheel.js', '/src/components/chart.js',
  '/src/pages/login.js', '/src/pages/dashboard.js',
  '/src/pages/meals.js', '/src/pages/health.js',
  '/src/pages/water.js', '/src/pages/ai.js', '/src/pages/profile.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

const API_PREFIX = 'https://health-tracker-api-1.onrender.com/api/v1';

// Install: precache статика
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        STATIC_URLS.map(url =>
          cache.add(url).catch(() => {/* ignore failed */})
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate: чистим старые кеши
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Стратегии кеширования
async function networkFirst(request) {
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: 'Нет соединения' }), {
      status: 503, headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(res => {
    if (res.ok) cache.put(request, res.clone());
    return res;
  }).catch(() => cached);
  return cached || fetchPromise;
}

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // API: Network First с fallback
  if (url.includes(API_PREFIX) || url.includes('/api/')) {
    e.respondWith(networkFirst(e.request));
    return;
  }

  // Статика: Cache First
  if (STATIC_URLS.includes(url) || url.match(/\.(js|css|html|json|svg|png)$/)) {
    e.respondWith(cacheFirst(e.request));
    return;
  }

  // Всё остальное: Stale-While-Revalidate
  e.respondWith(staleWhileRevalidate(e.request));
});

// Push-уведомления
self.addEventListener('push', e => {
  let data = { title: 'Health Tracker', body: 'Напоминание', icon: '/icon-192.png' };
  try {
    if (e.data) data = { ...data, ...JSON.parse(e.data.text()) };
  } catch {}

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.icon,
    tag: 'health-tracker',
    requireInteraction: true,
    vibrate: [200, 100, 200]
  };

  e.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
