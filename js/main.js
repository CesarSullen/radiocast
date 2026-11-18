/* ===================== HELPERS ===================== */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/* ===================== ELEMENTS ===================== */
const audio = $("#radioPlayer");
const segmented = $("#segmented");
const fullPlayer = $("#fullPlayer");
const sleepSheet = $("#sleepSheet");
const sleepOptions = $("#sleepOptions");

const lists = {
	stations: { view: $("#stationsView"), list: $("#stationsList"), dots: $("#stationsDots") },
	favs: { view: $("#favsView"), list: $("#favsList"), dots: $("#favsDots") },
};

/* ===================== CONSTANTS ===================== */
const FALLBACK_COVER = "./assets/icon-512.png";
const FAVS_KEY = "favStations";
const SLEEP_MINUTES = [15, 30, 45, 60];

// Mirrors of the Radio Browser API; any of them may be down at a given time
const API_MIRRORS = [
	"https://de1.api.radio-browser.info",
	"https://de2.api.radio-browser.info",
	"https://fi1.api.radio-browser.info",
	"https://nl1.api.radio-browser.info",
	"https://at1.api.radio-browser.info",
];
const MIRROR_TIMEOUT = 4000;
const STATUS_TEXT = {
	loading: "Connecting…",
	error: "Connection failed. Press play to retry.",
};

// Empty WAV used once to unlock programmatic playback on iOS
const SILENCE =
	"data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

/* ===================== STATE ===================== */
let currentIndex = 0;
let activeId = null;
let currentView = "stations";
let status = "idle"; // idle | loading | playing | paused | error
let requestId = 0;
let audioUnlocked = false;
let favIds = loadFavs();

const streamCache = new Map();

/* ===================== STATUS ===================== */
function isBusy() {
	return status === "playing" || status === "loading";
}

function setStatus(next) {
	status = next;
	const busy = isBusy();

	document.body.classList.toggle("is-busy", busy);
	document.body.classList.toggle("is-loading", next === "loading");
	document.body.classList.toggle("is-playing", next === "playing");

	$$("[data-bind='status']").forEach((el) => {
		el.textContent = STATUS_TEXT[next] || "";
		el.classList.toggle("is-error", next === "error");
	});
	$$(".play-toggle").forEach((btn) => {
		btn.setAttribute("aria-label", busy ? "Pause" : "Play");
	});

	if ("mediaSession" in navigator) {
		navigator.mediaSession.playbackState = next === "playing" ? "playing" : "paused";
	}
}

/* ===================== AUDIO ===================== */
function hasStream() {
	const src = audio.getAttribute("src");
	return Boolean(src) && !src.startsWith("data:");
}

function unlockAudio() {
	if (audioUnlocked) return;
	audioUnlocked = true;
	audio.src = SILENCE;
	audio.play().catch(() => {});
}

// Closing the connection is what stops the data usage
function releaseStream() {
	audio.pause();
	audio.removeAttribute("src");
	audio.load();
}

function shuffled(list) {
	const copy = [...list];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

async function fetchStationInfo(mirror, uuid) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), MIRROR_TIMEOUT);

	try {
		const response = await fetch(`${mirror}/json/stations/byuuid/${uuid}`, {
			signal: controller.signal,
		});
		if (!response.ok) throw new Error(`${mirror} answered ${response.status}`);

		const [info] = await response.json();
		if (!info) throw new Error(`${mirror} returned no station`);
		return info;
	} finally {
		clearTimeout(timer);
	}
}

// Tries the mirrors in random order until one answers
async function resolveStream(station, id) {
	const cached = streamCache.get(station.id);
	if (cached) return cached;
	if (!navigator.onLine) throw new Error("No internet connection");

	for (const mirror of shuffled(API_MIRRORS)) {
		if (id !== requestId) break;

		try {
			const info = await fetchStationInfo(mirror, station.uuid);
			const streamUrl = info.url_resolved || info.url;
			if (!streamUrl) throw new Error("Station without stream URL");

			streamCache.set(station.id, streamUrl);
			return streamUrl;
		} catch (err) {
			console.warn("Mirror failed:", err.message);
		}
	}

	throw new Error("No Radio Browser mirror answered");
}

async function playStation(index = currentIndex) {
	currentIndex = index;
	const station = STATIONS[currentIndex];
	const id = ++requestId;

	unlockAudio();
	showStation(station);
	setStatus("loading");

	try {
		const streamUrl = await resolveStream(station, id);
		if (id !== requestId) return;

		audio.src = streamUrl;
		await audio.play();
	} catch (err) {
		if (id !== requestId) return;
		console.error("Could not play station:", err);
		streamCache.delete(station.id);
		releaseStream();
		setStatus("error");
	}
}

function stopPlayback() {
	requestId++;
	releaseStream();
	setStatus("paused");
}

function togglePlay() {
	if (isBusy()) stopPlayback();
	else playStation();
}

function switchStation(step) {
	playStation((currentIndex + step + STATIONS.length) % STATIONS.length);
}

audio.addEventListener("playing", () => {
	if (hasStream()) setStatus("playing");
});

audio.addEventListener("waiting", () => {
	if (hasStream() && status === "playing") setStatus("loading");
});

// A live stream that errors or ends has dropped the connection
function handleStreamLost() {
	if (!hasStream()) return;
	if (activeId !== null) streamCache.delete(activeId);
	releaseStream();
	setStatus("error");
}

audio.addEventListener("error", handleStreamLost);
audio.addEventListener("ended", handleStreamLost);

/* ===================== STATION DISPLAY ===================== */
function setCover(src) {
	$$(".player-cover").forEach((img) => {
		if (img.getAttribute("src") === src) return;

		img.classList.add("is-swapping");
		setTimeout(() => {
			img.src = src;
		}, 200);
	});
}

$$(".player-cover").forEach((img) => {
	img.addEventListener("load", () => img.classList.remove("is-swapping"));
	img.addEventListener("error", () => {
		if (img.getAttribute("src") !== FALLBACK_COVER) img.src = FALLBACK_COVER;
	});
});

function showStation(station) {
	activeId = station.id;
	document.body.classList.add("has-player");

	$$("[data-bind='name']").forEach((el) => {
		el.textContent = station.name;
	});
	setCover(station.cover || FALLBACK_COVER);
	updateFavButtons();
	markSelected();
	scrollToActiveCard();
	updateMediaSession(station);
}

function markSelected() {
	$$(".station-card").forEach((card) => {
		card.classList.toggle("selected", Number(card.dataset.id) === activeId);
	});
}

function scrollToActiveCard() {
	const card = lists[currentView].list.querySelector(".station-card.selected");
	card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
}

/* ===================== STATION LISTS ===================== */
const WAVES_HTML = `<span class="audio-waves" aria-hidden="true"><span class="line"></span><span class="line"></span><span class="line"></span></span>`;

function createStationCard(station) {
	const card = document.createElement("button");
	card.type = "button";
	card.className = "station-card";
	card.dataset.action = "play-station";
	card.dataset.id = station.id;
	card.innerHTML = `<span class="station-cover-wrap"><img class="station-cover" alt="" loading="lazy" /></span><span class="station-title">${WAVES_HTML}<span class="station-name"></span></span>`;

	const cover = card.querySelector(".station-cover");
	cover.src = station.cover || FALLBACK_COVER;
	cover.addEventListener("error", () => (cover.src = FALLBACK_COVER), { once: true });
	card.querySelector(".station-name").textContent = station.name;

	return card;
}

function renderStations() {
	lists.stations.list.replaceChildren(...STATIONS.map(createStationCard));
	renderDots("stations");
}

function renderFavs() {
	const favs = favIds
		.map((id) => STATIONS.find((station) => station.id === id))
		.filter(Boolean);

	if (favs.length === 0) {
		const note = document.createElement("p");
		note.className = "empty-note";
		note.textContent = "Tap the heart to save a station.";
		lists.favs.list.replaceChildren(note);
	} else {
		lists.favs.list.replaceChildren(...favs.map(createStationCard));
		markSelected();
	}
	renderDots("favs");
}

function renderDots(name) {
	const { list, dots } = lists[name];
	const count = list.querySelectorAll(".station-card").length;

	dots.replaceChildren(
		...Array.from({ length: count > 1 ? count : 0 }, () => {
			const dot = document.createElement("span");
			dot.className = "dot";
			return dot;
		}),
	);
	updateDots(name);
}

// The active dot follows the card closest to the center of the carousel
function updateDots(name) {
	const { list, dots } = lists[name];
	const cards = [...list.querySelectorAll(".station-card")];
	if (cards.length === 0) return;

	const center = list.scrollLeft + list.clientWidth / 2;
	let nearest = 0;
	let best = Infinity;
	cards.forEach((card, index) => {
		const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
		if (distance < best) {
			best = distance;
			nearest = index;
		}
	});

	[...dots.children].forEach((dot, index) => {
		dot.classList.toggle("active", index === nearest);
	});
}

Object.keys(lists).forEach((name) => {
	let frame = null;
	lists[name].list.addEventListener("scroll", () => {
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(() => updateDots(name));
	});
});

function setView(view) {
	if (view === currentView) return;
	currentView = view;

	segmented.dataset.view = view;
	segmented.querySelectorAll(".segment").forEach((segment) => {
		const selected = segment.dataset.view === view;
		segment.classList.toggle("selected", selected);
		segment.setAttribute("aria-selected", String(selected));
	});

	Object.entries(lists).forEach(([name, { view: section }]) => {
		section.classList.toggle("hidden", name !== view);
	});
	updateDots(view);
	scrollToActiveCard();
}

/* ===================== FAVORITES ===================== */
function loadFavs() {
	try {
		const raw = JSON.parse(localStorage.getItem(FAVS_KEY));
		if (!Array.isArray(raw)) return [];

		// Older versions stored the whole station object
		const ids = raw.map((fav) => (fav && typeof fav === "object" ? fav.id : fav));
		return [...new Set(ids)].filter((id) =>
			STATIONS.some((station) => station.id === id),
		);
	} catch {
		return [];
	}
}

function saveFavs() {
	try {
		localStorage.setItem(FAVS_KEY, JSON.stringify(favIds));
	} catch {
		// Storage unavailable (private mode or full)
	}
}

function updateFavButtons() {
	const isFav = favIds.includes(activeId);

	$$(".fav-btn").forEach((btn) => {
		btn.disabled = activeId === null;
		btn.classList.toggle("active", isFav);
		btn.setAttribute("aria-label", isFav ? "Remove from favorites" : "Add to favorites");
	});
}

function toggleFavorite() {
	if (activeId === null) return;

	favIds = favIds.includes(activeId)
		? favIds.filter((id) => id !== activeId)
		: [...favIds, activeId];

	saveFavs();
	renderFavs();
	updateFavButtons();

	$$(".fav-btn").forEach((btn) => {
		btn.classList.remove("pop");
		void btn.offsetWidth;
		btn.classList.add("pop");
	});
}

$$(".fav-btn").forEach((btn) => {
	btn.addEventListener("animationend", () => btn.classList.remove("pop"));
});

/* ===================== SLEEP TIMER ===================== */
let sleepMinutes = null;
let sleepEndsAt = null;
let sleepTick = null;

function formatRemaining(ms) {
	const total = Math.max(0, Math.ceil(ms / 1000));
	const minutes = Math.floor(total / 60);
	const seconds = String(total % 60).padStart(2, "0");
	return `${minutes}:${seconds}`;
}

function renderSleepOptions() {
	sleepOptions.querySelectorAll(".sleep-chip").forEach((chip) => {
		const minutes = chip.dataset.minutes ? Number(chip.dataset.minutes) : null;
		const selected = minutes === sleepMinutes;
		chip.classList.toggle("selected", selected);
		chip.setAttribute("aria-pressed", String(selected));
	});
}

// While active, the remaining time shows inside every sleep button
function renderSleepRemaining() {
	const active = sleepEndsAt !== null;
	const text = active ? formatRemaining(sleepEndsAt - Date.now()) : "";

	$$(".sleep-btn").forEach((btn) => {
		btn.classList.toggle("is-active", active);
		btn.querySelector(".sleep-time").textContent = text;
	});
}

function checkSleepTimer() {
	if (sleepEndsAt === null) return;

	if (Date.now() >= sleepEndsAt) {
		setSleepTimer(null);
		if (isBusy()) stopPlayback();
		return;
	}
	renderSleepRemaining();
}

function setSleepTimer(minutes) {
	clearInterval(sleepTick);
	sleepTick = null;

	sleepMinutes = minutes;
	sleepEndsAt = minutes ? Date.now() + minutes * 60000 : null;

	if (sleepEndsAt !== null) sleepTick = setInterval(checkSleepTimer, 1000);

	renderSleepOptions();
	renderSleepRemaining();
}

function createSleepChip(minutes) {
	const chip = document.createElement("button");
	chip.type = "button";
	chip.className = "sleep-chip";
	chip.textContent = minutes === 60 ? "1h" : minutes ? `${minutes}m` : "Off";
	chip.setAttribute("aria-label", minutes ? `${minutes} minutes` : "Turn off sleep timer");
	if (minutes) chip.dataset.minutes = minutes;

	chip.addEventListener("click", () => {
		setSleepTimer(minutes);
		toggleSheet(false);
	});
	return chip;
}

function renderSleep() {
	sleepOptions.replaceChildren(...[...SLEEP_MINUTES, null].map(createSleepChip));
	renderSleepOptions();
}

/* ===================== PLAYER SCREEN AND SHEET ===================== */
function togglePlayerScreen(open) {
	fullPlayer.classList.toggle("is-open", open);
	fullPlayer.setAttribute("aria-hidden", String(!open));
	document.body.classList.toggle("player-open", open);
}

function toggleSheet(open) {
	sleepSheet.classList.toggle("is-open", open);
	sleepSheet.setAttribute("aria-hidden", String(!open));
}

document.addEventListener("keydown", (event) => {
	if (event.key !== "Escape") return;

	if (sleepSheet.classList.contains("is-open")) toggleSheet(false);
	else if (fullPlayer.classList.contains("is-open")) togglePlayerScreen(false);
});

/* ===================== MEDIA SESSION ===================== */
function updateMediaSession(station) {
	if (!("mediaSession" in navigator)) return;

	const cover = new URL(station.cover || FALLBACK_COVER, location.href).href;
	navigator.mediaSession.metadata = new MediaMetadata({
		title: station.name,
		artist: "RadioCast",
		artwork: [{ src: cover }],
	});
}

function initMediaSession() {
	if (!("mediaSession" in navigator)) return;

	const handlers = {
		play: () => playStation(),
		pause: () => stopPlayback(),
		nexttrack: () => switchStation(1),
		previoustrack: () => switchStation(-1),
	};

	for (const [action, handler] of Object.entries(handlers)) {
		try {
			navigator.mediaSession.setActionHandler(action, handler);
		} catch {
			// Action not supported by this browser
		}
	}
}

/* ===================== EVENTS ===================== */
const actions = {
	"play-station": (el) => {
		const index = STATIONS.findIndex((station) => station.id === Number(el.dataset.id));
		if (STATIONS[index].id === activeId && isBusy()) return;
		playStation(index);
	},
	"toggle-play": togglePlay,
	prev: () => switchStation(-1),
	next: () => switchStation(1),
	fav: toggleFavorite,
	"set-view": (el) => setView(el.dataset.view),
	"open-player": () => togglePlayerScreen(true),
	"close-player": () => togglePlayerScreen(false),
	"open-sleep": () => toggleSheet(true),
	"close-sleep": () => toggleSheet(false),
};

document.addEventListener("click", (event) => {
	const el = event.target.closest("[data-action]");
	if (el) actions[el.dataset.action]?.(el);
});

document.addEventListener("visibilitychange", checkSleepTimer);

/* ===================== INIT ===================== */
initMediaSession();
renderStations();
renderFavs();
renderSleep();
updateFavButtons();
setStatus("idle");

/* ===================== VISIT COUNTER ===================== */
async function trackProjectActivity(projectName) {
	if (!navigator.onLine) return;

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 8000);

	try {
		const client = await loadSupabaseClient();
		const { error } = await client
			.rpc("increment_visit", { name_param: projectName })
			.abortSignal(controller.signal);

		if (error) throw error;
	} catch {
		console.warn("Offline mode");
	} finally {
		clearTimeout(timer);
	}
}

// Runs once the app is on screen, so it never competes with it
window.addEventListener("load", () => setTimeout(() => trackProjectActivity("RadioCast"), 1500));

/* ===================== SHORTCUTS ===================== */
// Handle app shortcuts (?view=favs, ?action=sleep)
function handleLaunchParams() {
	const params = new URLSearchParams(location.search);
	if (![...params.keys()].length) return;

	const view = params.get("view");
	const action = params.get("action");

	// Clean the address so a reload does not repeat the action
	history.replaceState(null, "", location.pathname + location.hash);

	if (view === "favs" || view === "stations") setView(view);
	if (action === "sleep") toggleSheet(true);
}
handleLaunchParams();

/* ===================== SERVICE WORKER ===================== */
if ("serviceWorker" in navigator) {
	// Register right away: waiting for "load" delays offline support on slow networks
	navigator.serviceWorker
		.register("./sw.js")
		.catch((err) => console.error("SW registration failed:", err));
}
