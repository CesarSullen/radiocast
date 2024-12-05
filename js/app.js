const radioPlayer = document.getElementById("radioPlayer");
const radioSource = document.getElementById("radioSource");
const radioCover = document.getElementById("radioCover");
const radioName = document.getElementById("radioName");

let currentStationIndex = 0;
let currentGenreIndex = 0;
let currentStationUrl;

const lofiStations = [
	"https://de1.api.radio-browser.info/json/stations/byname/Lo-Fi%20Girl",
	"https://de1.api.radio-browser.info/json/stations/byname/MoE%20Lofi",
	"https://de1.api.radio-browser.info/json/stations/byname/NIA%20Radio%20Lo-Fi",
	"https://de1.api.radio-browser.info/json/stations/byname/CodeRadio%20from%20FreeCodeCamp",
];
const animeStations = [
	"https://de1.api.radio-browser.info/json/stations/byname/Anime%20Para%20Ti",
	"https://de1.api.radio-browser.info/json/stations/byname/stereoanime",
	"https://de1.api.radio-browser.info/json/stations/byname/Patchwork%20Archive",
	"https://de1.api.radio-browser.info/json/stations/byname/Gotann",
];
const kpopStations = [
	"https://de1.api.radio-browser.info/json/stations/byname/Exclusively%20BTS",
	"https://de1.api.radio-browser.info/json/stations/byname/Listen.moe%20Kpop",
	"https://de1.api.radio-browser.info/json/stations/byname/OnlyHit%20K-Pop",
	"https://de1.api.radio-browser.info/json/stations/byname/juka%20radio%20kpop",
];
const rockStations = [
	"https://de1.api.radio-browser.info/json/stations/byname/Spreeradio%20Rock",
	"https://de1.api.radio-browser.info/json/stations/byname/Best%20Net%20Radio%20-%2080s%20Metal",
	"https://de1.api.radio-browser.info/json/stations/byname/DrGnu%20-%2090th%20Rock",
	"https://de1.api.radio-browser.info/json/stations/byname/DrGnu%20-%20Hard%20Side",
];
const edmStations = [
	"https://de1.api.radio-browser.info/json/stations/byname/0nline%20DEEJAY%20RADIO",
	"https://de1.api.radio-browser.info/json/stations/byname/181.FM%20-%20The%20Vibe%20of%20Vegas",
	"https://de1.api.radio-browser.info/json/stations/byname/1Mix EDM Radio",
	"https://de1.api.radio-browser.info/json/stations/byname/Air%20Connect",
];
const popStations = [
	"https://de1.api.radio-browser.info/json/stations/byname/RADIO%20PSR%2090er",
	"https://de1.api.radio-browser.info/json/stations/byname/Radio%20PSR%20Live%20Chemnitz",
	"https://de1.api.radio-browser.info/json/stations/byname/i%20love%20radio%20-%20popstars",
];
const gtaStations = [
	"https://de1.api.radio-browser.info/json/stations/byname/GTA%20Radio",
];

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
			currentStationUrl = animeStations[currentStationIndex];
			break;
		case 2:
			currentStationUrl = kpopStations[currentStationIndex];
			break;
		case 3:
			currentStationUrl = rockStations[currentStationIndex];
			break;
		case 4:
			currentStationUrl = edmStations[currentStationIndex];
			break;
		case 5:
			currentStationUrl = popStations[currentStationIndex];
			break;
		case 6:
			currentStationUrl = gtaStations[currentStationIndex];
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

// Control Buttons
const prevBtn = document.getElementById("prevBtn");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const nextBtn = document.getElementById("nextBtn");

function switchNextStation() {
	currentStationIndex = (currentStationIndex + 1) % lofiStations.length;
	getStations();
}
function switchPrevStation() {
	currentStationIndex =
		(currentStationIndex - 1 + lofiStations.length) % lofiStations.length;
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
const lofiGenreCard = document.getElementById("lofiGenreCard");
const animeGenreCard = document.getElementById("animeGenreCard");
const kpopGenreCard = document.getElementById("kpopGenreCard");
const rockGenreCard = document.getElementById("rockGenreCard");
const edmGenreCard = document.getElementById("edmGenreCard");
const popGenreCard = document.getElementById("popGenreCard");
const gtaGenreCard = document.getElementById("gtaGenreCard");

function selectGenre(genreIndex) {
	currentGenreIndex = genreIndex;
	currentStationIndex = 0;
	getStations();
}

function deselectAllCards() {
	lofiGenreCard.classList.remove("selected");
	animeGenreCard.classList.remove("selected");
	kpopGenreCard.classList.remove("selected");
	rockGenreCard.classList.remove("selected");
	edmGenreCard.classList.remove("selected");
	popGenreCard.classList.remove("selected");
}

lofiGenreCard.addEventListener("click", function () {
	deselectAllCards();
	selectGenre(0);
	this.classList.add("selected");
});
animeGenreCard.addEventListener("click", function () {
	deselectAllCards();
	selectGenre(1);
	this.classList.add("selected");
});
kpopGenreCard.addEventListener("click", function () {
	deselectAllCards();
	selectGenre(2);
	this.classList.add("selected");
});
rockGenreCard.addEventListener("click", function () {
	deselectAllCards();
	selectGenre(3);
	this.classList.add("selected");
});
edmGenreCard.addEventListener("click", function () {
	deselectAllCards();
	selectGenre(4);
	this.classList.add("selected");
});
popGenreCard.addEventListener("click", function () {
	deselectAllCards();
	selectGenre(5);
	this.classList.add("selected");
});
gtaGenreCard.addEventListener("click", function () {
	deselectAllCards();
	selectGenre(6);
	this.classList.add("selected");
});
