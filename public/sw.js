// 🧠 Mind Loop — PWA Service Worker (Fixed)
const CACHE_NAME = "mindloop-cache-v1";

const ASSETS_TO_CACHE = [
  "/",
  "/manifest.json",
  "/icons/brand-orb.png",
  "/icons/ios/icon-180.png",
];

// ✅ Install — pre-cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
  console.log("✅ [SW] Installed & Cached Core Assets");
});

// ✅ Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
  console.log("♻️ [SW] Activated & Cleaned Old Caches");
});

// ✅ Fetch — cache-first (GET only, skip POST/PUT/etc.)
self.addEventListener("fetch", (event) => {
  // 🚫 Skip non-GET requests (prevents crash)
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            // ✅ Only cache successful responses
            if (!response || response.status !== 200 || response.type !== "basic")
              return response;

            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, cloned);
            });
            return response;
          })
          .catch(() => caches.match("/"))
      );
    })
  );
});
