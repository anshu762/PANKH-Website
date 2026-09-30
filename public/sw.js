/**
 * Pankh Poultry Intelligence — Service Worker (PWA Shell & Offline Cache)
 *
 * Implements:
 * 1. Pre-caching core app shell & brand icons
 * 2. Stale-while-revalidate for static CSS/JS bundles
 * 3. Network-first with cache fallback for farmer dashboard and flock records
 */

const CACHE_NAME = "pankh-core-v1";
const DATA_CACHE_NAME = "pankh-data-v1";

const PRECACHE_ASSETS = [
  "/",
  "/dashboard",
  "/dashboard/sentinel",
  "/dashboard/connect",
  "/dashboard/economics",
  "/dashboard/ask",
  "/icon.svg",
  "/manifest.webmanifest",
];

// Install Event — Pre-cache core shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn("Pre-cache asset warning (non-fatal):", err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event — Clean up stale caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME && name !== DATA_CACHE_NAME) {
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Event — Network-first for dashboard data, Cache-first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip non-GET and chrome-extension requests
  if (request.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  // 2. Static Next.js Bundles: Stale-While-Revalidate
  if (url.pathname.startsWith("/_next/static/") || url.pathname.endsWith(".svg") || url.pathname.endsWith(".ico")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 3. Farmer Navigation & Dashboard API: Network-first with Cache Fallback
  if (
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/api/notifications")
  ) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback from cached data
          return caches.match(request).then((cached) => {
            if (cached) {
              return cached;
            }
            // Fallback to cached dashboard home if specific deep-link not cached
            return caches.match("/dashboard");
          });
        })
    );
    return;
  }

  // 4. Default Pass-through
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
