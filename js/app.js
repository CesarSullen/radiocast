const radioPlayer = document.getElementById("radioPlayer");
const radioSource = document.getElementById("radioSource");
const radioCover = document.getElementById("radioCover");
const radioName = document.getElementById("radioName");

let currentStationIndex = 0;
let currentGenreIndex = 0;
let currentStationUrl;

const stations = [
	{
		genre: "Lo-Fi",
		urls: [
			"https://de1.api.radio-browser.info/json/stations/byname/Lo-Fi%20Girl",
			"https://de1.api.radio-browser.info/json/stations/byname/MoE%20Lofi",
			"https://de1.api.radio-browser.info/json/stations/byname/NIA%20Radio%20Lo-Fi",
			"https://de1.api.radio-browser.info/json/stations/byname/CodeRadio%20from%20FreeCodeCamp",
		],
	},
	{
		genre: "Anime",
		urls: [
			"https://de1.api.radio-browser.info/json/stations/byname/Anime%20Para%20Ti",
			"https://de1.api.radio-browser.info/json/stations/byname/stereoanime",
			"https://de1.api.radio-browser.info/json/stations/byname/Patchwork%20Archive",
			"https://de1.api.radio-browser.info/json/stations/byname/Gotann",
		],
	},
	{
		genre: "K-Pop",
		urls: [
			"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%20BTS",
			"https://de1.api.radio-browser.info/json/stations/byname/Listen.moe%20Kpop",
			"https://de1.api.radio-browser.info/json/stations/byname/OnlyHit%20K-Pop",
			"https://de1.api.radio-browser.info/json/stations/byname/juka%20radio%20kpop",
		],
	},
	{
		genre: "Rock",
		urls: [
			"https://de1.api.radio-browser.info/json/stations/byname/Best%20Net%20Radio%20-%2080s%20Metal",
			"https://de1.api.radio-browser.info/json/stations/byname/DrGnu%20-%20Hard%20Side",
			"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%20AC%2FDC",
			"https://de1.api.radio-browser.info/json/stations/byname/DrGnu%20-%2090th%20Rock",
			"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%20Metallica",
			"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%20Guns%20N%E2%80%99%20Roses",
			"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%20Iron%20Maiden",
			"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%20Green%20Day",
			"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%20Nirvana",
			"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%20Aerosmith",
		],
	},
	{
		genre: "EDM",
		urls: [
			"https://de1.api.radio-browser.info/json/stations/byname/0nline%20DEEJAY%20RADIO",
			"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%20Daft%20Punk",
			"https://de1.api.radio-browser.info/json/stations/byname/181.FM%20-%20The%20Vibe%20of%20Vegas",
			"https://de1.api.radio-browser.info/json/stations/byname/1Mix%20EDM%20Radio",
			"https://de1.api.radio-browser.info/json/stations/byname/Air%20Connect",
		],
	},
	{
		genre: "Pop",
		urls: [
			"https://de1.api.radio-browser.info/json/stations/byname/Backstreet%20Boys",
			"https://de1.api.radio-browser.info/json/stations/byname/RADIO%20PSR%2090er",
			"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%20Adele",
			"https://de1.api.radio-browser.info/json/stations/byname/Radio%20PSR%20Live%20Chemnitz",
			"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%20%20Michael%20Jackson",
			"https://de1.api.radio-browser.info/json/stations/byname/i%20love%20radio%20-%20popstars",
			"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%20Justin%20Bieber",
			"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%20Lana%20Del%20Rey",
			"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%20James%20Blunt",
			"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%20The%20Weeknd",
			"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%20Taylor%20Swift",
		],
	},
	{
		genre: "Hip-Hop",
		urls: [
			"https://de1.api.radio-browser.info/json/stations/byname/gtronic%20radio",
			"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%202Pac",
			"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%20Post%20Malone",
			"https://de1.api.radio-browser.info/json/stations/byname/hot%20107.1",
			"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%2050%20Cent",
			"https://de1.api.radio-browser.info/json/stations/byname/W.D.O.P.E.%20Dopetrackz%20Radio",
			"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%20Kanye%20West",
		],
	},
	{
		genre: "Reggae",
		urls: [
			"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%20Bob%20Marley",
			"https://de1.api.radio-browser.info/json/stations/byname/Allzic%20Radio%20Reggae",
			"https://de1.api.radio-browser.info/json/stations/byname/007FM",
			"https://de1.api.radio-browser.info/json/stations/byname/181.FM%20-%20Reggae%20Roots",
		],
	},
	{
		genre: "GTA",
		urls: [
			"https://de1.api.radio-browser.info/json/stations/byname/GTA%20Radio",
			"https://de1.api.radio-browser.info/json/stations/byname/laut.fm%20Gta%20Classics",
			"https://de1.api.radio-browser.info/json/stations/byname/Radio%20Greenstone",
		],
	},
];

function startPlaying(stationURL, stationName) {
	console.log(`Reproduciendo: ${stationName} - URL: ${stationURL}`);
	radioSource.src = stationURL;
	radioName.textContent = stationName;
	radioPlayer.load();
	radioPlayer.play();
}

function getStations() {
	const currentGenre = stations[currentGenreIndex];
	currentStationUrl = currentGenre.urls[currentStationIndex];

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

// Control Buttons
const prevBtn = document.getElementById("prevBtn");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const nextBtn = document.getElementById("nextBtn");

function switchNextStation() {
	currentStationIndex =
		(currentStationIndex + 1) % stations[currentGenreIndex].urls.length;
	getStations();
}

function switchPrevStation() {
	currentStationIndex =
		(currentStationIndex - 1 + stations[currentGenreIndex].urls.length) %
		stations[currentGenreIndex].urls.length;
	getStations();
}

playBtn.addEventListener("click", () => {
	playBtn.classList.remove("shown");
	playBtn.classList.add("hidden");

	pauseBtn.classList.remove("hidden");
	pauseBtn.classList.add("shown");

	getStations();
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
const genreCards = document.querySelectorAll(".genre-card");

function selectGenre(genreIndex) {
	currentGenreIndex = genreIndex;
	currentStationIndex = 0;

	playBtn.classList.remove("shown");
	playBtn.classList.add("hidden");

	pauseBtn.classList.remove("hidden");
	pauseBtn.classList.add("shown");

	getStations();
}

function deselectAllCards() {
	genreCards.forEach((card) => card.classList.remove("selected"));
}

genreCards.forEach((card, index) => {
	card.addEventListener("click", function () {
		deselectAllCards();
		selectGenre(index);
		this.classList.add("selected");
	});
});

// Languaje Detection
/* function detectLanguage() {
	const language = navigator.language || navigator.userLanguage;
	if (language.startsWith("es")) {
		window.location.href = "index-es.html";
	}
}

window.onload = detectLanguage; */
