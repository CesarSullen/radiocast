/* ===================== ELEMENTS ===================== */
const audio = document.getElementById("radioPlayer");
const player = document.querySelector(".audio-player");

const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const favBtn = document.getElementById("favBtn");

const radioName = document.getElementById("radioName");
const radioStatus = document.getElementById("radioStatus");
const radioCover = document.getElementById("radioCover");

const stationsList = document.getElementById("stationsList");
const favsList = document.getElementById("favsList");
const sleepOptions = document.getElementById("sleepOptions");
const sleepLabel = document.getElementById("sleepLabel");
const sleepRemaining = document.getElementById("sleepRemaining");

/* ===================== CONSTANTS ===================== */
const FALLBACK_COVER = "./assets/logo.png";
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
let status = "idle"; // idle | loading | playing | paused | error
let requestId = 0;
let audioUnlocked = false;
let favIds = loadFavs();

const streamCache = new Map();

/* ===================== STATUS ===================== */
function setStatus(next) {
	status = next;
	const busy = next === "loading" || next === "playing";

	playBtn.classList.toggle("hidden", busy);
	pauseBtn.classList.toggle("hidden", !busy);
	player.classList.toggle("is-loading", next === "loading");
	document.body.classList.toggle("is-playing", next === "playing");

	radioStatus.textContent = STATUS_TEXT[next] || "";
	radioStatus.classList.toggle("is-error", next === "error");

	if ("mediaSession" in navigator) {
		navigator.mediaSession.playbackState =
			next === "playing" ? "playing" : "paused";
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
	if (status === "playing" || status === "loading") stopPlayback();
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
	if (radioCover.getAttribute("src") === src) return;

	radioCover.classList.add("is-swapping");
	setTimeout(() => {
		radioCover.src = src;
	}, 200);
}

radioCover.addEventListener("load", () => {
	radioCover.classList.remove("is-swapping");
});

radioCover.addEventListener("error", () => {
	if (radioCover.getAttribute("src") !== FALLBACK_COVER) {
		radioCover.src = FALLBACK_COVER;
	}
});

function showStation(station) {
	activeId = station.id;
	radioName.textContent = station.name;
	setCover(station.cover || FALLBACK_COVER);
	updateFavButton();
	markSelected();
	updateMediaSession(station);
}

function markSelected() {
	document.querySelectorAll(".station-item").forEach((item) => {
		item.classList.toggle("selected", Number(item.dataset.id) === activeId);
	});
}

/* ===================== STATION LISTS ===================== */
const WAVES_HTML = `<span class="audio-waves" aria-hidden="true"><span class="line"></span><span class="line"></span><span class="line"></span></span>`;

function createStationItem(station) {
	const item = document.createElement("button");
	item.type = "button";
	item.className = "station-item";
	item.dataset.id = station.id;

	const name = document.createElement("span");
	name.className = "station-name";
	name.textContent = station.name;

	item.insertAdjacentHTML("beforeend", WAVES_HTML);
	item.append(name);
	item.insertAdjacentHTML("beforeend", WAVES_HTML);

	item.addEventListener("click", () => {
		const isActive = station.id === activeId;
		if (isActive && (status === "playing" || status === "loading")) return;
		playStation(STATIONS.indexOf(station));
	});

	return item;
}

function renderStations() {
	stationsList.replaceChildren(...STATIONS.map(createStationItem));
}

function renderFavs() {
	const favs = favIds
		.map((id) => STATIONS.find((station) => station.id === id))
		.filter(Boolean);

	if (favs.length === 0) {
		const note = document.createElement("p");
		note.className = "empty-note";
		note.textContent = "Tap the heart to save a station.";
		favsList.replaceChildren(note);
		return;
	}

	favsList.replaceChildren(...favs.map(createStationItem));
	markSelected();
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

function updateFavButton() {
	favBtn.disabled = activeId === null;
	favBtn.classList.toggle("active", favIds.includes(activeId));
	favBtn.setAttribute(
		"aria-label",
		favIds.includes(activeId) ? "Remove from favorites" : "Add to favorites",
	);
}

function toggleFavorite() {
	if (activeId === null) return;

	favIds = favIds.includes(activeId)
		? favIds.filter((id) => id !== activeId)
		: [...favIds, activeId];

	saveFavs();
	renderFavs();
	updateFavButton();

	favBtn.classList.remove("pop");
	void favBtn.offsetWidth;
	favBtn.classList.add("pop");
}

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

// While active, the time pill replaces the "Sleep" word in the header
function renderSleepRemaining() {
	const active = sleepEndsAt !== null;
	sleepLabel.classList.toggle("hidden", active);
	sleepRemaining.classList.toggle("hidden", !active);
	sleepRemaining.textContent = active
		? formatRemaining(sleepEndsAt - Date.now())
		: "";
}

function checkSleepTimer() {
	if (sleepEndsAt === null) return;

	if (Date.now() >= sleepEndsAt) {
		setSleepTimer(null);
		if (status === "playing" || status === "loading") stopPlayback();
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

	chip.addEventListener("click", () => setSleepTimer(minutes));
	return chip;
}

function renderSleep() {
	sleepOptions.replaceChildren(
		...[...SLEEP_MINUTES, null].map(createSleepChip),
	);
	renderSleepOptions();
}

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

/* ===================== ACCORDION ===================== */
function initAccordion() {
	document.querySelectorAll(".accordion-header").forEach((header) => {
		const panel = header.nextElementSibling;

		header.addEventListener("click", () => {
			const open = header.getAttribute("aria-expanded") !== "true";
			header.setAttribute("aria-expanded", String(open));

			// "auto" can't be transitioned, so animate between pixel heights
			panel.style.height = `${panel.getBoundingClientRect().height}px`;
			panel.classList.toggle("is-open", open);
			void panel.offsetHeight;
			panel.style.height = open ? `${panel.scrollHeight}px` : "0px";
		});

		panel.addEventListener("transitionend", (event) => {
			const done = event.target === panel && event.propertyName === "height";
			if (done && panel.classList.contains("is-open")) {
				panel.style.height = "auto";
			}
		});
	});
}

/* ===================== EVENTS ===================== */
playBtn.addEventListener("click", togglePlay);
pauseBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", () => switchStation(1));
prevBtn.addEventListener("click", () => switchStation(-1));
favBtn.addEventListener("click", toggleFavorite);

favBtn.addEventListener("animationend", () => favBtn.classList.remove("pop"));
document.addEventListener("visibilitychange", checkSleepTimer);

/* ===================== INIT ===================== */
initAccordion();
initMediaSession();
renderStations();
renderFavs();
renderSleep();
updateFavButton();
setStatus("idle");

/* ===================== VISIT COUNTER ===================== */
async function trackProjectActivity(projectName) {
	try {
		const { error } = await _supabase.rpc("increment_visit", {
			name_param: projectName,
		});

		if (error) throw error;
	} catch {
		console.warn("Offline mode");
	}
}

trackProjectActivity("RadioCast");

/* ===================== SERVICE WORKER ===================== */
if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker
			.register("./sw.js")
			.catch((err) => console.error("SW registration failed:", err));
	});
}
