// Quizlly service worker v3.
// Rule: the app shell (navigations/index.html) is NETWORK-FIRST so a new
// deploy can never pair a stale index.html with deleted hashed assets
// (that frankenbuild white-screens React with invalid-hook errors).
// Content-hashed build assets are immutable, so cache-first is safe for them.
const VERSION = 'quizlly-v3';
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => c.addAll(['/manifest.webmanifest', '/icon-192.png', '/icon-512.png']))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});
self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket')) return;
  // SPA navigations: network first, cached shell only when truly offline.
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put('/index.html', copy));
        }
        return res;
      }).catch(() => caches.match('/index.html').then((hit) => {
        if (hit) return hit;
        return Response.error();
      })),
    );
    return;
  }
  // Everything else same-origin (hashed JS/CSS/img): cache first, net fallback.
  e.respondWith(
    caches.match(request, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(request).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(request, copy));
        }
        return res;
      }).catch(() => Response.error());
    }),
  );
});
