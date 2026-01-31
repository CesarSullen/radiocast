const CACHE_NAME = "radiocast-static-v5.2";
const STATIC_ASSETS = [
	// HTML
	"./index.html",

	// CSS
	"./css/style.css",

	// JS
	"./js/main.js",

	// Manifest
	"./manifest.json",

	// Fonts
	"./typography/Poppins-Regular.ttf",

	// Icons and assets
	"./assets/logo.png",
	"./assets/next-fill.svg",
	"./assets/prev-fill.svg",
	"./assets/play-fill.svg",
	"./assets/pause-fill.svg",
	"./assets/heart-straight-fill.svg",
	"./assets/live-vector.svg",
	"./assets/caret-down.svg",
	"./assets/music-notes-fill.svg",
	"./assets/slogan.svg",

	// Screenshots
	"./assets/screenshots/mobile-1.png",
	"./assets/screenshots/mobile-2.png",
	"./assets/screenshots/desktop-1.png",
];

// Install: precache
self.addEventListener("install", (event) => {
	self.skipWaiting();
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(STATIC_ASSETS);
		})
	);
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
	event.waitUntil(
		(async () => {
			const keys = await caches.keys();
			await Promise.all(
				keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
			);
			await self.clients.claim();
		})()
	);
});

// Fetch: cache-first strategy
self.addEventListener("fetch", (event) => {
	if (event.request.method !== "GET") return;

	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			return (
				cachedResponse ||
				fetch(event.request).then((networkResponse) => {
					return caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, networkResponse.clone());
						return networkResponse;
					});
				})
			);
		})
	);
});
