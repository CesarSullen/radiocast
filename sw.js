// Cache version
const CACHE_NAME = "radiocast-v1.1.2";

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
	"./assets/icon-192.png",
	"./assets/icon-512.png",
	"./assets/icon-512-maskable.png",
	"./assets/next-fill.svg",
	"./assets/prev-fill.svg",
	"./assets/play-fill.svg",
	"./assets/pause-fill.svg",
	"./assets/heart-straight-fill.svg",
	"./assets/caret-down.svg",
	"./assets/cell-tower.svg",
	"./assets/heart-straight.svg",
	"./assets/caret-up.svg",
	"./assets/moon-stars-fill.svg",
];

// Max time to wait for the network before giving up
const NETWORK_TIMEOUT = 6000;

// Files needed to render the app: if these fail, the install fails
const CORE_ASSETS = STATIC_ASSETS.slice(0, 6);

// Install: precache the app shell
self.addEventListener("install", (event) => {
	self.skipWaiting();
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE_NAME);
			await cache.addAll(CORE_ASSETS);

			// The rest is best effort, one missing file must not block the update
			await Promise.allSettled(
				STATIC_ASSETS.slice(CORE_ASSETS.length).map((url) => cache.add(url)),
			);
		})(),
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

// Fetch with a timeout so a hanging connection never blocks the app
async function fetchWithTimeout(request) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), NETWORK_TIMEOUT);
	try {
		return await fetch(request, { signal: controller.signal });
	} finally {
		clearTimeout(timer);
	}
}

// Fetch: cache-first for same-origin static files only (never streams or APIs)
self.addEventListener("fetch", (event) => {
	const { request } = event;
	const sameOrigin = new URL(request.url).origin === self.location.origin;

	if (request.method !== "GET" || !sameOrigin || request.headers.has("range")) {
		return;
	}

	event.respondWith(
		(async () => {
			// ignoreSearch lets "./?view=favs" open from cache
			const cached = await caches.match(request, { ignoreSearch: true });
			if (cached) return cached;

			try {
				const response = await fetchWithTimeout(request);
				if (response.ok) {
					const cache = await caches.open(CACHE_NAME);
					cache.put(request, response.clone());
				}
				return response;
			} catch (err) {
				// Offline or too slow: fall back to the app shell for page loads
				if (request.mode === "navigate") {
					const shell = await caches.match("./index.html");
					if (shell) return shell;
				}
				return Response.error();
			}
		})(),
	);
});
