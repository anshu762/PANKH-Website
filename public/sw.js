/**
 * Pankh Poultry Intelligence — Service Worker (PWA Shell & Offline Cache)
 *
 * Strategy:
 * - /_next/static/ chunks: NETWORK-FIRST only (these are build-hashed, never stale-serve from cache)
 * - /api/ routes: Network-only (never cache)
 * - Farmer dashboard pages: Network-first with cache fallback
 * - Core app shell (/, /dashboard, icons): Pre-cached on install
 *
 * Cache Versioning:
 * - CACHE_VERSION must be bumped on every deployment (handled via sw.js regeneration)
 * - Old caches are automatically cleaned on activate
 */

const CACHE_VERSION = "v5";
const CACHE_NAME = `pankh-core-${CACHE_VERSION}`;
const DATA_CACHE_NAME = `pankh-data-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  "/icon.svg",
  "/manifest.webmanifest",
];

// ── Install: pre-cache minimal static assets only ──────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(PRECACHE_ASSETS).catch((err) => {
          // Non-fatal: app still works without pre-cache
          console.warn("[Pankh SW] Pre-cache warning (non-fatal):", err);
        })
      )
      .then(() => self.skipWaiting())
  );
});

// ── Activate: delete ALL old versioned caches ───────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== DATA_CACHE_NAME)
            .map((name) => {
              console.log("[Pankh SW] Deleting old cache:", name);
              return caches.delete(name);
            })
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch: per-resource strategy ────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and non-HTTP requests
  if (request.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  // 1. Next.js static build chunks (/_next/static/) → NETWORK-FIRST, NO cache fallback
  //    These are content-hashed. If network fails, let it fail cleanly (no stale JS/CSS).
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      fetch(request).catch(() => {
        // Only serve from cache if we have an exact match for this hash — never stale
        return caches.match(request);
      })
    );
    // Opportunistically update cache in background (don't block response)
    event.waitUntil(
      fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, res.clone()));
          }
        })
        .catch(() => {})
    );
    return;
  }

  // 2. API routes → NETWORK-ONLY (never cache API responses)
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/data/")) {
    event.respondWith(fetch(request));
    return;
  }

  // 3. Auth routes → NETWORK-ONLY
  if (url.pathname.startsWith("/login") || url.pathname.startsWith("/register")) {
    event.respondWith(fetch(request));
    return;
  }

  // 4. Static assets (icons, svg) → CACHE-FIRST (these rarely change)
  if (
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".webmanifest")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((res) => {
            if (res && res.status === 200) {
              cache.put(request, res.clone());
            }
            return res;
          });
        })
      )
    );
    return;
  }

  // 5. Farmer dashboard pages → NETWORK-FIRST with cache fallback (offline support)
  if (url.pathname.startsWith("/dashboard") || url.pathname === "/") {
    event.respondWith(
      fetch(request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const cloned = networkRes.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => cache.put(request, cloned));
          }
          return networkRes;
        })
        .catch(() =>
          caches.match(request).then((cached) => {
            if (cached) return cached;
            // Fallback to cached home
            return caches.match("/");
          })
        )
    );
    return;
  }

  // 6. Default: NETWORK-FIRST, no caching
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
