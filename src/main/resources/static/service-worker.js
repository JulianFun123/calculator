const ASSETS = [
    "/",
    "/calc.css",
    "/calc.js",
    "/images/apple-touch-icon.png",
    "/images/android-chrome-192x192.png",
    "/login.html",
    "/logging_in.html",
    "/error.html",
    "https://fonts.googleapis.com/css2?family=DM+Sans:wght@200;300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap",
    "https://js.gjni.eu/jdom.js",
    "https://js.gjni.eu/accounts/oauth2.js",
    "https://js.gjni.eu/cajax/2.0.0.js"
]

let cache_name = "CALC-1.2-bh4vwsd";

self.addEventListener("install", event => {
    console.log(`installing to ${cache_name}...`);
    if (navigator.onLine) {
        event.waitUntil(
            caches.keys().then(async keys => {
                for (let key of keys)
                    await caches.delete(key)
                return "";
            }).then(() => {
                caches
                    .open(cache_name)
                    .then(cache => {
                        return cache.addAll(ASSETS);
                    })
                    .catch(err => console.log(err))
                return "";
            })
        );
    }
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
