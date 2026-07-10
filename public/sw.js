const CACHE_NAME = 'cutasks-v4';
const MAX_CACHE_ENTRIES = 100;
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/logo.svg',
  '/logo-mini.svg',
  '/logo-light.svg',
  '/logo-mini-light.svg',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

async function trimCache(cache, maxEntries) {
  const keys = await cache.keys();
  const excess = keys.length - maxEntries;
  if (excess > 0) {
    for (let i = 0; i < excess; i++) {
      await cache.delete(keys[i]);
    }
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('firestore.googleapis.com')) return;
  if (event.request.url.includes('localhost:5173') || event.request.url.includes('@vite')) return;

  const url = new URL(event.request.url);
  const isAssetsRequest = url.pathname.startsWith('/assets/');

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      if (isAssetsRequest) {
        return fetch(event.request)
          .then((response) => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => cache.match(event.request));
      }

      return cache.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request)
          .then((response) => {
            if (response.ok && event.request.url.startsWith(self.location.origin)) {
              cache.put(event.request, response.clone());
              trimCache(cache, MAX_CACHE_ENTRIES);
            }
            return response;
          })
          .catch(() => cached || new Response('', { status: 504 }));

        return cached || fetchPromise;
      });
    })
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'CuTasks', body: event.data.text() };
  }

  const options = {
    body: payload.body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: payload.tag || 'cutasks-push',
    data: payload.url || '/app/home',
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || 'CuTasks', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const rawUrl = event.notification.data || '/app/home';
  const url = typeof rawUrl === 'string' && rawUrl.startsWith('/') ? rawUrl : '/app/home';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      return clients.openWindow(url);
    })
  );
});
