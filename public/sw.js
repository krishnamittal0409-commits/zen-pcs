// public/sw.js
//
// Minimal service worker — its main job is just to EXIST, since Android
// requires an active service worker before it will offer "Install app."
//
// This does NOT make your whole site work offline (your site depends on
// live Supabase data, so full offline support isn't practical or useful
// here). It just caches the absolute basics so the app shell loads
// instantly and Android recognizes this as an installable PWA.

const CACHE_NAME = "zen-pcs-shell-v1";
const SHELL_ASSETS = ["/", "/favicon.ico"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Network-first: always try the real network first (so you get fresh
// Supabase-backed pages), only fall back to cache if totally offline.
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
