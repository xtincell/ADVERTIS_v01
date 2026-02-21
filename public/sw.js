// ==========================================================================
// ADVERTIS Service Worker — PWA offline support
// Cache-first for static assets, network-first for API/navigation.
// ==========================================================================

const CACHE_NAME = "advertis-v1";

// App shell to pre-cache on install
const APP_SHELL = ["/", "/offline"];

// File extensions that qualify as static assets
const STATIC_EXTENSIONS = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/;

// --------------------------------------------------------------------------
// Install — pre-cache the app shell
// --------------------------------------------------------------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

// --------------------------------------------------------------------------
// Activate — clean up old caches
// --------------------------------------------------------------------------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

// --------------------------------------------------------------------------
// Fetch — routing strategy
// --------------------------------------------------------------------------
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // --- API / tRPC / auth calls → network-first ---
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/trpc/") ||
    url.pathname.startsWith("/auth/")
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  // --- Navigation requests (HTML pages) → network-first with offline fallback ---
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          // Try cache, then fall back to /offline page
          caches.match(request).then((cached) => cached ?? caches.match("/offline")),
        ),
    );
    return;
  }

  // --- Static assets (JS, CSS, images, fonts) → cache-first ---
  if (STATIC_EXTENSIONS.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // --- Everything else → network-first ---
  event.respondWith(networkFirst(request));
});

// --------------------------------------------------------------------------
// Strategies
// --------------------------------------------------------------------------

/** Cache-first: serve from cache if available, otherwise fetch and cache. */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Return a basic offline response for assets
    return new Response("", { status: 503, statusText: "Offline" });
  }
}

/** Network-first: try network, fall back to cache. */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? new Response("", { status: 503, statusText: "Offline" });
  }
}
