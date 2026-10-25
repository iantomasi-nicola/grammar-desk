/* Grammar Desk service worker: opens instantly and works offline.
   App files: network first with a short timeout (the newest version when online, the saved one when not).
   Libraries, fonts and icons: cache first, in their own cache that survives updates. Nothing from other sites is touched. */
const V = "gd-core-2", HEAVY = "gd-heavy-2";
const CORE = ["./", "index.html", "app.css", "config.js", "manifest.webmanifest",
  "js/cloud.js", "js/ai.js", "js/gg-core.js", "js/app.js", "js/files.js", "js/settings.js", "js/boot.js", "vendor/supabase.js"];
const WARM = ["vendor/pdf.min.js", "vendor/pdf.worker.min.js", "vendor/jszip.min.js", "icons/icon-192.png", "icons/icon-512.png", "icons/favicon-32.png", "icons/apple-180.png",
  "fonts/atkinson-hyperlegible-latin-400-normal.woff2", "fonts/atkinson-hyperlegible-latin-700-normal.woff2", "fonts/atkinson-hyperlegible-latin-400-italic.woff2",
  "fonts/bricolage-grotesque-latin-wght-normal.woff2", "fonts/kalam-latin-400-normal.woff2", "fonts/kalam-latin-700-normal.woff2"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("gd-") && k !== V && k !== HEAVY).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
/* the page asks for this once it is idle (and after other apps on this site cleaned their caches): everything needed offline is kept */
const warm = async () => {
  const core = await caches.open(V), heavy = await caches.open(HEAVY);
  for (const [c, list] of [[core, CORE], [heavy, WARM]]) for (const u of list) { if (!(await c.match(u))) { try { const r = await fetch(u); if (r.ok) await c.put(u, r); } catch (x) {} } }
};
self.addEventListener("message", (e) => { if (e.data === "warm") e.waitUntil(warm()); });
const timeout = (p, ms) => new Promise((ok, no) => { const t = setTimeout(() => no(new Error("timeout")), ms); p.then((r) => { clearTimeout(t); ok(r); }, (x) => { clearTimeout(t); no(x); }); });
self.addEventListener("fetch", (e) => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== "GET" || u.origin !== location.origin) return;
  if (/\/(fonts|icons)\/|\/vendor\/(pdf|jszip)/.test(u.pathname)) {
    e.respondWith(caches.open(HEAVY).then((c) => c.match(req, { ignoreSearch: true }).then((r) => r || fetch(req).then((r2) => { if (r2.ok) c.put(req, r2.clone()); return r2; }))));
    return;
  }
  const net = fetch(req).then((r) => { if (r.ok) { const c = r.clone(); caches.open(V).then((x) => x.put(req, c)); } return r; });
  e.respondWith(timeout(net, req.mode === "navigate" ? 3500 : 6000).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || (req.mode === "navigate" ? caches.match("index.html") : net))));
});
