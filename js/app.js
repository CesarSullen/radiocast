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
	"https://de1.api.radio-browser.info/json/stations/byname/Rockhausradio",
	"https://de1.api.radio-browser.info/json/stations/byname/%20Gadingharjo%20Core",
	"https://de1.api.radio-browser.info/json/stations/byname/Best%20Net%20Radio%20-%2080s%20Metal",
	"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%20Metallica",
];

const genres = ["lofi", "rock"];

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
const nextBtn = document.getElementById("nextBtn");

playBtn.addEventListener("click", () => {
	if (radioPlayer.paused) {
		radioPlayer.play();

		if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			playBtn.src = "./assets/green-pause-fill.svg";
		} else {
			playBtn.src = "./assets/pause-fill.svg";
		}
	} else {
		radioPlayer.pause();

		if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			playBtn.src = "./assets/green-play-fill.svg";
		} else {
			playBtn.src = "./assets/play-fill.svg";
		}
	}
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

if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
	prevBtn.src = "./assets/green-prev-fill.svg";
	nextBtn.src = "./assets/green-next-fill.svg";
	playBtn.src = "./assets/green-play-fill.svg";
}

// Cards and genre selection
const lofiGenreCard = document.getElementById("lofiGenreCard");
const rockGenreCard = document.getElementById("rockGenreCard");

function selectGenre(genreIndex) {
	currentGenreIndex = genreIndex;
	currentStationIndex = 0;
	getStations();
}

lofiGenreCard.addEventListener("click", function () {
	selectGenre(0);
});
rockGenreCard.addEventListener("click", function () {
	selectGenre(1);
});

getStations();
