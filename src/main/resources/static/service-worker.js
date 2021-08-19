const ASSETS = [
    "/",
    "/calc.css",
    "/calc.js",
    "/images/apple-touch-icon.png",
    "/images/android-chrome-192x192.png",
    "/login.html",
    "/logged_in.html",
    "/error.html"
]
const CACHE_NAME = "CALC-1.1"

self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install');
    e.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        console.log('[Service Worker] Caching all: app shell and content');
        await cache.addAll(ASSETS);
    })());
});

self.addEventListener('fetch', (e) => {
    e.respondWith((async () => {
        const r = await caches.match(e.request);
        console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
        if (r) { return r; }
        const response = await fetch(e.request);
        const cache = await caches.open(CACHE_NAME);
        console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
        cache.put(e.request, response.clone());
        return response;
    })());
});
