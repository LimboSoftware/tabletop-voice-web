const CACHE = "tabletop-voice-beta-v37";
const ASSETS = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icon.svg",
  "./privacy.html",
  "./roster-transfer/",
  "./roster-transfer/index.html",
  "./roster-transfer/style.css",
  "./roster-transfer/app.js"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never cache third-party requests, API/data fetches, or URLs containing
  // one-time transfer/share parameters.
  if (url.origin !== self.location.origin) return;
  if (url.search) {
    if (request.mode === "navigate") {
      event.respondWith(fetch(request).catch(() => caches.match("./index.html")));
    }
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then(hit => hit || caches.match("./index.html"))
      )
    );
    return;
  }

  // Cache only known static app assets. Do not turn arbitrary GET responses
  // into persistent browser storage.
  const isStaticAsset = /\.(?:html|css|js|webmanifest|svg|png|ico)$/i.test(url.pathname);
  if (!isStaticAsset) return;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (!response || !response.ok || response.type !== "basic") return response;
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(request, copy));
        return response;
      });
    })
  );
});
