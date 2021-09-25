const ASSETS = [
    "/",
    "/calc.css",
    "/calc.js",
    "/images/apple-touch-icon.png",
    "/images/android-chrome-192x192.png",
    "/login.html",
    "/logging_in.html",
    "/error.html"
]

let cache_name = "CALC-1.2-sdgsdf";

self.addEventListener("install", event => {
    console.log(`installing to ${cache_name}...`);
    caches.keys().then(async keys => keys.forEach(key => caches.delete(key)))
        .then(()=> {
            event.waitUntil(
                caches
                    .open(cache_name)
                    .then(cache => {
                        return cache.addAll(ASSETS);
                    })
                    .catch(err => console.log(err))
            );
        });
});
self.addEventListener("fetch", event => {
    if (navigator.onLine) {
        console.log("FETCHIN'")
        event.respondWith(
            fetch(event.request).catch(err =>
                self.caches.open(cache_name).then(cache => cache.match("/offline.html"))
            )
        );
    } else {
        console.log(`LOADING FROM CACHE ${cache_name} ${event.request.url}`)
        event.respondWith(
            fetch(event.request).catch(err =>
                caches.match(event.request).then(response => response)
            )
        );
    }
});
