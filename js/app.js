const radioPlayer = document.getElementById("radioPlayer");
const radioSource = document.getElementById("radioSource");
const radioCover = document.getElementById("radioCover");
const radioName = document.getElementById("radioName");

const lofiStations = [
	"https://de1.api.radio-browser.info/json/stations/byname/Lo-Fi%20Girl",
	"https://de1.api.radio-browser.info/json/stations/byname/MoE%20Lofi",
	"https://de1.api.radio-browser.info/json/stations/byname/NIA%20Radio%20Lo-Fi",
	"https://de1.api.radio-browser.info/json/stations/byname/CodeRadio%20from%20FreeCodeCamp",
];
const rockStations = [
	"https://de1.api.radio-browser.info/json/stations/byname/Spreeradio%20Rock",
	"https://de1.api.radio-browser.info/json/stations/byname/Best%20Net%20Radio%20-%2080s%20Metal",
	"https://de1.api.radio-browser.info/json/stations/byname/DrGnu%20-%2090th%20Rock",
	"https://de1.api.radio-browser.info/json/stations/byname/DrGnu%20-%20Hard%20Side",
];
const animeStations = [
	"https://de1.api.radio-browser.info/json/stations/byname/Anime%20Para%20Ti",
	"https://de1.api.radio-browser.info/json/stations/byname/stereoanime",
	"https://de1.api.radio-browser.info/json/stations/byname/Patchwork%20Archive",
	"https://de1.api.radio-browser.info/json/stations/byname/Gotann",
];

const genres = ["lofi", "rock", "anime"];

let currentStationIndex = 0;
let currentGenreIndex = 0;
let currentStationUrl;

function startPlaying(stationURL, stationName) {
	console.log(`Reproduciendo: ${stationName} - URL: ${stationURL}`);

	radioSource.src = stationURL;
	radioName.textContent = stationName;
	radioPlayer.load();
	radioPlayer.play();
}

function getStations() {
	switch (currentGenreIndex) {
		case 0:
			currentStationUrl = lofiStations[currentStationIndex];
			break;
		case 1:
			currentStationUrl = rockStations[currentStationIndex];
			break;
		case 2:
			currentStationUrl = animeStations[currentStationIndex];
			break;
	}
	fetch(currentStationUrl)
		.then((response) => response.json())
		.then((data) => {
			data.forEach((station) => {
				const stationName = station.name;
				const stationURL = station.url_resolved;

				startPlaying(stationURL, stationName);
			});
		});
}

function switchNextStation() {
	currentStationIndex = (currentStationIndex + 1) % lofiStations.length;
	getStations();
}

function switchPrevStation() {
	currentStationIndex =
		(currentStationIndex - 1 + lofiStations.length) % lofiStations.length;
	getStations();
}

// Control Buttons
const prevBtn = document.getElementById("prevBtn");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const nextBtn = document.getElementById("nextBtn");

playBtn.addEventListener("click", () => {
	playBtn.classList.remove("shown");
	playBtn.classList.add("hidden");

	pauseBtn.classList.remove("hidden");
	pauseBtn.classList.add("shown");

	radioPlayer.play();
});
pauseBtn.addEventListener("click", () => {
	pauseBtn.classList.remove("shown");
	pauseBtn.classList.add("hidden");

	playBtn.classList.remove("hidden");
	playBtn.classList.add("shown");

	radioPlayer.pause();
});

prevBtn.addEventListener("click", switchPrevStation);
nextBtn.addEventListener("click", switchNextStation);

// Volume Control
const volumeControl = document.getElementById("volumeControl");

radioPlayer.volume = 1;
volumeControl.value = radioPlayer.volume;

volumeControl.addEventListener("input", function () {
	radioPlayer.volume = this.value;
});

// Cards and genre selection
const lofiGenreCard = document.getElementById("lofiGenreCard");
const rockGenreCard = document.getElementById("rockGenreCard");
const animeGenreCard = document.getElementById("animeGenreCard");

function selectGenre(genreIndex) {
	currentGenreIndex = genreIndex;
	currentStationIndex = 0;
	getStations();
}

function deselectAllCards() {
	lofiGenreCard.classList.remove("selected");
	rockGenreCard.classList.remove("selected");
	animeGenreCard.classList.remove("selected");
}

lofiGenreCard.addEventListener("click", function () {
	deselectAllCards();
	selectGenre(0);
	this.classList.add("selected");
});

rockGenreCard.addEventListener("click", function () {
	deselectAllCards();
	selectGenre(1);
	this.classList.add("selected");
});

animeGenreCard.addEventListener("click", function () {
	deselectAllCards();
	selectGenre(2);
	this.classList.add("selected");
});

getStations();
lofiGenreCard.classList.add("selected");
