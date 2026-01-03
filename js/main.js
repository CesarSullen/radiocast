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
					name: "Epic Lounge",
					url: "https://all.api.radio-browser.info/json/stations/byuuid/c72d442a-d73b-40f1-b741-e143b620eecf",
					cover: "https://i.ibb.co/9Hc5TxR/Jazz-Hop-Lounge.jpg",
				},
				{
					id: 2,
					name: "MoE Lofi",
					url: "https://all.api.radio-browser.info/json/stations/byuuid/526b6bad-68f3-4197-9cfa-fa8b341830bb",
					cover:
						"https://zeno.fm/_ipx/_/https://images.zeno.fm/DDbFNwXFnMQZpksowdmNPcLxdS0gZ9hM7iK0g7BWHjs/rs:fill:288:288/g:ce:0:0/aHR0cHM6Ly9wcm94eS56ZW5vLmZtL2NvbnRlbnQvc3RhdGlvbnMvYWd4emZucGxibTh0YzNSaGRITnlNZ3NTQ2tGMWRHaERiR2xsYm5RWWdJRElnTEdVdkFvTUN4SU9VM1JoZEdsdmJsQnliMlpwYkdVWWdJQ0luLXZkbFFnTW9nRUVlbVZ1YncvaW1hZ2UvP3U9MTY2MTg2NzkwMjAwMA.webp",
				},
				{
					id: 3,
					name: "BGMVibes",
					url: "https://all.api.radio-browser.info/json/stations/byuuid/a1e34b61-f532-4308-b2b9-b44c69f8507d",
					cover:
						"https://radio.sutekihost.com/static/uploads/album_art.1743805787.jpg",
				},
				{
					id: 4,
					name: "Hunter FM",
					url: "https://all.api.radio-browser.info/json/stations/byuuid/5008eff6-2ad8-4b72-8d08-ea92b316abbe",
					cover:
						"https://cdn.hunter.fm/image/thumb/station/lo-fi-third/400x400ht.jpg",
				},
				{
					id: 5,
					name: "Radio Record",
					url: "https://all.api.radio-browser.info/json/stations/byuuid/251e6b0c-2536-4a15-a948-2f6bbf5fb14b",
					cover: "https://cdn-profiles.tunein.com/s255374/images/logog.png",
				},
				{
					id: 6,
					name: "Radio ZUM4",
					url: "https://all.api.radio-browser.info/json/stations/byuuid/938ba257-1ac8-49a5-bf60-eb26f0fe75ec",
					cover:
						"https://res.cloudinary.com/super7/image/upload/v1698337048/rz-api-prod/images/radio_zum_4_study_work.jpg",
				},
				{
					id: 7,
					name: "NIA Radio",
					url: "https://all.api.radio-browser.info/json/stations/byuuid/ab9697c4-f1cf-48bc-b4d8-4d15ad5618fa",
					cover: "https://nia.nc/static/preloader-logo.svg",
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
		const streamUrl = data[0].url;

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
		item.innerHTML = `
            <div class="audio-waves left">
                <div class="line"></div>
                <div class="line"></div>
                <div class="line"></div>
            </div>
            <span class="station-name">${station.name}</span>
            <div class="audio-waves right">
                <div class="line"></div>
                <div class="line"></div>
                <div class="line"></div>
            </div>
        `;
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
		item.innerHTML = `
            <div class="audio-waves left">
                <div class="line"></div>
                <div class="line"></div>
                <div class="line"></div>
            </div>
            <span class="station-name">${station.name}</span>
            <div class="audio-waves right">
                <div class="line"></div>
                <div class="line"></div>
                <div class="line"></div>
            </div>
        `;
		item.dataset.url = station.url;

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
if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker
			.register("./sw.js")
			.then(() => console.log("Service Worker registered"))
			.catch((err) => console.error("SW registration failed:", err));
	});
}
