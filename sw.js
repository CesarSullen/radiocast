const CACHE_NAME = "radiocast-static-v2";
const STATIC_ASSETS = [
	// HTML
	"./index.html",

	// CSS
	"./css/style.css",

	// JS
	"./js/main.js",

	// Manifest
	"./manifest.json",

	// Icons and assets
	"./assets/logo.png",
	"./assets/user-circle-fill.svg",
	"./assets/next-fill.svg",
	"./assets/prev-fill.svg",
	"./assets/play-fill.svg",
	"./assets/pause-fill.svg",
	"./assets/heart-straight-fill.svg",
	"./assets/live-vector.svg",
	"./assets/caret-down.svg",
	"./assets/music-notes-fill.svg",
	"./assets/slogan.svg",
];

// Install event: precache
self.addEventListener("install", (event) => {
	self.skipWaiting();
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(STATIC_ASSETS);
		})
	);
});

// Activate event: clean old caches
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

// Fetch
self.addEventListener("fetch", (event) => {
	if (event.request.method !== "GET") return;

	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			if (cachedResponse) return cachedResponse;

			return fetch(event.request)
				.then((networkResponse) => {
					return caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, networkResponse.clone());
						return networkResponse;
					});
				})
				.catch(() => {
					// Optional fallback for offline JSON requests or HTML pages
					if (event.request.url.endsWith(".json")) {
						return new Response("[]", {
							headers: { "Content-Type": "application/json" },
						});
					}
					if (event.request.headers.get("accept")?.includes("text/html")) {
						return caches.match("./index.html");
					}
				});
		})
	);
});
