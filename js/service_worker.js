const CACHE_NAME = "RadioCast";
const urlsToCache = [
	"./",
	"./index.html",
	"./style/style.css",
	"./js/app.js",
	"./js/accordion.js",
	"./js/service_worker.js",
	"./assets/logo.JPG",
];

// Instalación del Service Worker
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log("Cache abierta");
			return cache.addAll(urlsToCache);
		})
	);
});

// Intercepción de solicitudes
self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			return response || fetch(event.request);
		})
	);
});

// Actualización del cache
self.addEventListener("activate", (event) => {
	const cacheWhitelist = [CACHE_NAME];
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheWhitelist.indexOf(cacheName) === -1) {
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});
