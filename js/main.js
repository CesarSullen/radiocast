/* ===================== GLOBAL STATE ==================== */
const audio = document.getElementById("radioPlayer");

const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

const radioName = document.getElementById("radioName");
const radioCover = document.getElementById("radioCover");
const favIcon = document.getElementById("favIcon");

const stationsSection = document.querySelector(".stations-section");
const favsSection = document.querySelector(".favs-section");

let lofiStations = [];
let currentStationIndex = 0;
let isPlaying = false;

let favStations = JSON.parse(localStorage.getItem("favStations")) || [];

/* ===================== LOAD STATIONS ==================== */
async function loadStations() {
	try {
		const data = {
			stations: [
				{
					id: 1,
					name: "MoE Lofi",
					url: "https://all.api.radio-browser.info/json/stations/byuuid/526b6bad-68f3-4197-9cfa-fa8b341830bb",
					cover: "./assets/logo.png",
				},
				{
					id: 2,
					name: "NIA Radio Lo-Fi",
					url: "https://all.api.radio-browser.info/json/stations/byuuid/ab9697c4-f1cf-48bc-b4d8-4d15ad5618fa",
					cover: "./assets/logo.png",
				},
				{
					id: 3,
					name: "Nightwave Plaza",
					url: "https://all.api.radio-browser.info/json/stations/byuuid/e35e3676-58e2-48ba-94bf-e32cc024b7cb",
					cover: "./assets/logo.png",
				},
				{
					id: 4,
					name: "Laut LoFi",
					url: "https://all.api.radio-browser.info/json/stations/byuuid/ef52b56c-6830-4346-b4d3-e42e5ae5d928",
					cover: "./assets/logo.png",
				},
			],
		};

		lofiStations = data.stations;
		createStationsAccordion();
		renderFavs();
	} catch (err) {
		console.error("Error loading stations:", err);
	}
}

/* ===================== AUDIO CONTROL ==================== */
async function playCurrentStation() {
	const station = lofiStations[currentStationIndex];
	if (!station) return;

	try {
		const response = await fetch(station.url);
		const data = await response.json();
		const streamUrl = data[0].url_resolved;

		audio.src = streamUrl;
		audio.play();

		isPlaying = true;
		updatePlayUI();
		updateRadioInfo(station);
		updateAccordionSelection(station);
	} catch (err) {
		console.error("Error fetching stream URL:", err);
		radioName.textContent = "Error al cargar";
	}
}

function togglePlay() {
	if (audio.src === "" || !isPlaying) {
		if (audio.src === "") {
			playCurrentStation();
		} else {
			audio.play();
			isPlaying = true;
			updatePlayUI();
		}
	} else {
		audio.pause();
		isPlaying = false;
		updatePlayUI();
	}
}

function updatePlayUI() {
	playBtn.classList.toggle("hidden", isPlaying);
	pauseBtn.classList.toggle("hidden", !isPlaying);
}

function switchNextStation() {
	currentStationIndex = (currentStationIndex + 1) % lofiStations.length;
	playCurrentStation();
}

function switchPrevStation() {
	currentStationIndex =
		(currentStationIndex - 1 + lofiStations.length) % lofiStations.length;
	playCurrentStation();
}

/* ===================== UI UPDATE ==================== */
function updateRadioInfo(station) {
	radioName.textContent = station.name;
	radioCover.src = station.cover || "./assets/logo.png";

	favIcon.classList.toggle(
		"active",
		favStations.some((fav) => fav.url === station.url)
	);
}

function updateAccordionSelection(station) {
	document.querySelectorAll(".station-item").forEach((item) => {
		const stationUrl = item.dataset.url;
		item.classList.toggle("selected", stationUrl === station.url);
	});
}

/* ===================== ACCORDION: STATIONS ==================== */
function createStationsAccordion() {
	stationsSection.innerHTML = "<hr />";

	lofiStations.forEach((station, index) => {
		const item = document.createElement("div");
		item.classList.add("station-item");
		item.textContent = station.name;

		item.dataset.url = station.url;

		item.addEventListener("click", () => {
			currentStationIndex = index;
			playCurrentStation();
		});

		stationsSection.appendChild(item);
	});
}

/* ===================== FAVORITES ==================== */
function toggleFavorite() {
	const station = lofiStations[currentStationIndex];
	if (!station) return;

	const exists = favStations.find((fav) => fav.url === station.url);

	if (exists) {
		favStations = favStations.filter((fav) => fav.url !== station.url);
	} else {
		favStations.push(station);
	}

	localStorage.setItem("favStations", JSON.stringify(favStations));
	renderFavs();
	updateRadioInfo(station);
}

function renderFavs() {
	favsSection.innerHTML = "";

	favStations.forEach((station) => {
		const item = document.createElement("div");
		item.classList.add("station-item");
		item.textContent = station.name;

		item.addEventListener("click", () => {
			const index = lofiStations.findIndex((s) => s.url === station.url);
			if (index !== -1) {
				currentStationIndex = index;
				playCurrentStation();
			}
		});

		favsSection.appendChild(item);
	});
}

/* ===================== ACCORDION TOGGLE ==================== */
function initAccordion() {
	const items = document.querySelectorAll(".accordion-item");

	items.forEach((item) => {
		const header = item.querySelector(".accordion-header");

		header.addEventListener("click", () => {
			item.querySelector(".accordion-content").classList.toggle("active");
			item.querySelector(".accordion-toggle").classList.toggle("turned");
		});
	});
}

/* ===================== EVENTS ==================== */
playBtn.addEventListener("click", togglePlay);
pauseBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", switchNextStation);
prevBtn.addEventListener("click", switchPrevStation);
favIcon.addEventListener("click", toggleFavorite);

/* ===================== INIT ==================== */
document.addEventListener("DOMContentLoaded", () => {
	initAccordion();
	loadStations();
});

// SERVICE WORKER (opcional)

/* if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker
			.register("./sw.js")
			.then(() => console.log("Service Worker registered"))
			.catch((err) => console.error("SW registration failed:", err));
	});
}
 */
