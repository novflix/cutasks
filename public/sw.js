const CACHE_NAME = 'cutasks-v6';
const STATIC_ASSETS = [
  '/',
  '/index.html',
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

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('firestore.googleapis.com')) return;
  if (event.request.url.includes('localhost:5173') || event.request.url.includes('@vite')) return;

  const url = new URL(event.request.url);
  const isAssetsRequest = url.pathname.startsWith('/assets/');

  // Assets: network only, no cache
  if (isAssetsRequest) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Other requests: cache-first with network fallback
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request)
          .then((response) => {
            if (response.ok && event.request.url.startsWith(self.location.origin)) {
              cache.put(event.request, response.clone());
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
