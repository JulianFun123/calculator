const ASSETS = [
    "/",
    "/calc.css",
    "/calc.js",
    "/apple-touch-icon.png",
    "/android-chrome-192x192.png",
    "/login.html",
    "/logged_in.html",
    "/error.html"
]
const CACHE_NAME = "CALC-1.0"

self.addEventListener('install', function(event) {
    console.log('Install!');

    console.log("Caching")
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(ASSETS);
            })
            .catch(err => console.log(err))
    );
});
self.addEventListener("activate", event => {
    console.log('Activate!');
});
self.addEventListener('fetch', function(event) {
    console.log('Fetch!', event.request);
    if (navigator.onLine === false) {
        console.log("Loading cache")
        event.respondWith(
            fetch(event.request).catch(err =>
                self.cache.open(CACHE_NAME).then(cache => cache.match("/error.html"))
            )
        );
    }
});
