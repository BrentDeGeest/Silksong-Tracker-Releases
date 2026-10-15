// Offline support for the website version (not used in the Android app or when the page is opened from disk).
// Pages, code and data: the newest from the internet when online, the saved copy when offline.
// Pictures: the saved copy first (they rarely change), fetched once and kept.
const CACHE = "silksong-map-v37";
const CORE = ["./", "index.html", "css/app.css", "manifest.webmanifest", "img/map.jpg", "img/icons/icon-192.png",
  "js/pics.js", "js/report.js", "js/tips.js", "js/app.js", "js/helper.js",
  "data/areas.js", "data/groups.js", "data/items.js", "data/wishes.js", "data/story.js", "data/routes.js", "data/nav-grid.js",
  "data/gates.js", "data/difficulty.js", "data/pics.js", "data/missable.js", "data/builds.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())) });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())) });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url); if (e.request.method !== "GET" || u.origin !== location.origin) return;   // GitHub API, forms: straight to the internet
  const pic = /\/img\//.test(u.pathname) && !/map\.jpg$/.test(u.pathname);
  if (pic) { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(n => { if (n.ok) { const c = n.clone(); caches.open(CACHE).then(k => k.put(e.request, c)) } return n }))); return }
  e.respondWith(fetch(e.request).then(n => { if (n.ok) { const c = n.clone(); caches.open(CACHE).then(k => k.put(e.request, c)) } return n })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html"))));
});
