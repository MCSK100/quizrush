// Quizlly service worker v4 — Android + Apple (iOS 16.4+ standalone) safe.
// Rule: the app shell (navigations/index.html) is NETWORK-FIRST so a new
// deploy can never pair a stale index.html with deleted hashed assets
// (that frankenbuild white-screens React with invalid-hook errors).
// Content-hashed build assets are immutable, so cache-first is safe for them.
//
// iOS notes:
// - iOS standalone Safari sometimes issues same-origin doc requests without
//   request.mode === 'navigate', so detect navigations via the Accept header too.
// - iOS probes /apple-touch-icon.png on install — keep it precached.
const VERSION = 'quizlly-v4';
const PRECACHE = [
  '/manifest.webmanifest',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/quizlly-favicon.png',
];
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => c.addAll(PRECACHE))
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
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
function isNavigation(request) {
  if (request.mode === 'navigate') return true;
  if (request.method !== 'GET') return false;
  if (request.destination === 'document') return true;
  const accept = request.headers.get('accept') || '';
  return accept.includes('text/html');
}
self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket')) return;
  // SPA navigations: network first, cached shell only when truly offline.
  if (isNavigation(request)) {
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
