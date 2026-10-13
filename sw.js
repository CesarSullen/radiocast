// Cache version
const CACHE_NAME = "radiocast-v1.1.1";

const STATIC_ASSETS = [
	// Page
	"./index.html",
	"./manifest.json",

	// Styles and scripts
	"./css/style.css",
	"./js/stations.js",
	"./js/supabase-config.js",
	"./js/main.js",

	// Font
	"./typography/poppins-400.woff2",
	"./typography/poppins-600.woff2",

	// Icons and images
	"./assets/logo.png",
	"./assets/next-fill.svg",
	"./assets/prev-fill.svg",
	"./assets/play-fill.svg",
	"./assets/pause-fill.svg",
	"./assets/heart-straight-fill.svg",
	"./assets/live-vector.svg",
	"./assets/caret-down.svg",
	"./assets/music-notes-fill.svg",
	"./assets/moon-stars-fill.svg",
];

// Install: precache the app shell
self.addEventListener("install", (event) => {
	self.skipWaiting();
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
	);
});

// Activate: remove old caches
self.addEventListener("activate", (event) => {
	event.waitUntil(
		(async () => {
			const keys = await caches.keys();
			await Promise.all(
				keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
			);
			await self.clients.claim();
		})(),
	);
});

// Fetch: cache-first for same-origin static files only (never streams or APIs)
self.addEventListener("fetch", (event) => {
	const { request } = event;
	const sameOrigin = new URL(request.url).origin === self.location.origin;

	if (request.method !== "GET" || !sameOrigin || request.headers.has("range")) {
		return;
	}

	event.respondWith(
		caches.match(request).then((cached) => {
			if (cached) return cached;

			return fetch(request).then((response) => {
				if (response.ok) {
					const copy = response.clone();
					caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
				}
				return response;
			});
		}),
	);
});
