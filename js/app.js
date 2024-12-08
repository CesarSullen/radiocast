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
			"https://de1.api.radio-browser.info/json/stations/byuuid/2b2d80db-e0c8-42ad-89e4-7653ef3773f8", //Lo-Fi Girl
			"https://de1.api.radio-browser.info/json/stations/byuuid/526b6bad-68f3-4197-9cfa-fa8b341830bb", //MoE Lofi
			"https://de1.api.radio-browser.info/json/stations/byuuid/ab9697c4-f1cf-48bc-b4d8-4d15ad5618fa", //NIA Radio Lo-Fi
			"https://de1.api.radio-browser.info/json/stations/byuuid/e6c3360f-46f9-4cc6-9a58-cf66902f8acf", //Code Radio From Free Code Camp
		],
	},
	{
		genre: "Anime",
		urls: [
			"https://de1.api.radio-browser.info/json/stations/byuuid/1adf1539-e647-44c3-85d8-b437b768fb8c", //Anime Para Ti
			"https://de1.api.radio-browser.info/json/stations/byuuid/57f52194-0dce-4c4d-8b53-a2fc396777ba", //Stereoanime
			"https://de1.api.radio-browser.info/json/stations/byuuid/2119387e-f76a-449f-b15d-315ba83c2dfe", //Patchwork Archive
			"https://de1.api.radio-browser.info/json/stations/byuuid/a53d9e63-0cc6-4f37-83ed-d99119b504a8", //Gotann
		],
	},
	{
		genre: "K-Pop",
		urls: [
			"https://de1.api.radio-browser.info/json/stations/byuuid/721b8f32-8071-4cca-a10f-c999d3b65346", //Exclusively BTS
			"https://de1.api.radio-browser.info/json/stations/byuuid/43be83dc-340b-11e8-bb9b-52543be04c81", //Listen moe Kpop
			"https://de1.api.radio-browser.info/json/stations/byuuid/2e53ff8e-1d21-4e04-b0e9-f68257c4e7e9", //Only Hit K-Pop
			"https://de1.api.radio-browser.info/json/stations/byuuid/2973ff08-fb80-4281-8b7a-33bd213b06d4", //Juka Radio kpop
		],
	},
	{
		genre: "Rock",
		urls: [
			"https://de1.api.radio-browser.info/json/stations/byuuid/77e606ea-bf7d-11e9-8502-52543be04c81", //BestNetRadio 80s Metal
			"https://de1.api.radio-browser.info/json/stations/byuuid/21f3ee29-812f-49bf-92c7-f56368ca86dc", //DrGnu Hard Side
			"https://de1.api.radio-browser.info/json/stations/byuuid/ba93ec29-66c9-4bee-8f71-b71481001c8e", //Exclusively AC/DC
			"https://de1.api.radio-browser.info/json/stations/byuuid/413e09ae-dbdc-48e8-a42a-81cd3e5dd176", //DrGnu 90s Rock
			"https://de1.api.radio-browser.info/json/stations/byuuid/c6cf12d2-1a28-4e68-9d7e-a6cbe15b9b99", //Exclusively Metallica
			"https://de1.api.radio-browser.info/json/stations/byuuid/32b2e232-8634-4eb5-a820-af28ae9709f2", //Exclusively Guns N Roses
			"https://de1.api.radio-browser.info/json/stations/byuuid/f41fc2e8-94ef-4c9e-b799-97b90c99e85a", //Exclusively Iron Maiden
			"https://de1.api.radio-browser.info/json/stations/byuuid/Ex2528fcc2-7816-4e60-aa13-59e5bcc6dc50", //Exclusively Green Day
			"https://de1.api.radio-browser.info/json/stations/byuuid/32f1ac32-3b5c-4209-be6c-bb612d384041", //Eclusively Nirvana
			"https://de1.api.radio-browser.info/json/stations/byuuid/7f39d4e6-ef08-4298-94ea-709c912503ba", //Exclusively Aerosmith
		],
	},
	{
		genre: "EDM",
		urls: [
			"https://de1.api.radio-browser.info/json/stations/byuuid/f3c8f36c-5543-4cf3-906f-0fa307420f18", //0nline DEEJAY RADIO
			"https://de1.api.radio-browser.info/json/stations/byuuid/be61261d-ba40-4ab1-a045-34f0c49b0ca6", //Exclusively Daft Punk
			"https://de1.api.radio-browser.info/json/stations/byuuid/9638a8de-0601-11e8-ae97-52543be04c81", //181.FM The Vibe of Vegas
			"https://de1.api.radio-browser.info/json/stations/byuuid/d177cdd0-175c-11ea-a620-52543be04c81", //1Mix EDM Radio
			"https://de1.api.radio-browser.info/json/stations/byuuid/910703ee-6c0e-4801-9ad4-cd073ca27409", //Air Connect
		],
	},
	{
		genre: "Pop",
		urls: [
			"https://de1.api.radio-browser.info/json/stations/byuuid/e160390d-2e3a-42b0-8bdc-eb0d8be48d7b", //Backstreet Boys
			"https://de1.api.radio-browser.info/json/stations/byuuid/48ec5f27-c7e5-405a-9ddb-b1415f4f4c1d", //Radio PSR 90er
			"https://de1.api.radio-browser.info/json/stations/byuuid/751c4733-6b5a-4abb-8b31-198afb27f3a2", //Exclusively Adele
			"https://de1.api.radio-browser.info/json/stations/byuuid/4c74c8b7-862a-441a-8e9b-9554e417f2b5", //Radio PSR Live Chemnitz
			"https://de1.api.radio-browser.info/json/stations/byuuid/c740d6d9-6482-4931-81a8-03ec1a631ede", //Exclusively Michael Jackson
			"https://de1.api.radio-browser.info/json/stations/byuuid/d6eb8a3e-27f3-11e8-91bf-52543be04c81", //i love radio - popstars
			"https://de1.api.radio-browser.info/json/stations/byuuid/79dd25b0-0f7a-41eb-a9ff-a373b7abb553", //Exclusively Justin Bieber
			"https://de1.api.radio-browser.info/json/stations/byuuid/85817f91-210b-4ab8-b03c-b9b333b39874", //Exclusively Lana Del Rey
			"https://de1.api.radio-browser.info/json/stations/byuuid/5c10f556-c26f-4b19-bb63-bff43aa626d4", //Exclusively The Weeknd
			"https://de1.api.radio-browser.info/json/stations/byuuid/29f29d98-c1f9-4d75-b96d-02d15a151fcf", //Exclusively Taylor Swift
		],
	},
	{
		genre: "Hip-Hop",
		urls: [
			"https://de1.api.radio-browser.info/json/stations/byuuid/480a7506-d337-4364-9846-6948561b417f", //Gtronic Radio
			"https://de1.api.radio-browser.info/json/stations/byuuid/e97a236a-f5d8-48fc-910b-dba9c39c6695", //Exclusively 2Pac
			"https://de1.api.radio-browser.info/json/stations/byuuid/0b713eed-751c-4883-beb2-d5c3452013bc", //Exclusively Post Malone
			"https://de1.api.radio-browser.info/json/stations/byuuid/1f52f655-7b5b-462a-89e9-8de28f7ad029", //Hot 107.1
			"https://de1.api.radio-browser.info/json/stations/byuuid/28317be8-2e51-406e-9613-70ce124b633f", //Exclusively 50	Cent
			"https://de1.api.radio-browser.info/json/stations/byuuid/45c721f1-debe-4bc5-9db4-f16174e7e60c", //W.D.O.P.E. Dopetrackz Radio
			"https://de1.api.radio-browser.info/json/stations/byuuid/a00b92dd-3716-4d2b-9637-489e21bade98", //Exclusively Kayne West
		],
	},
	{
		genre: "Reggae",
		urls: [
			"https://de1.api.radio-browser.info/json/stations/byuuid/996a804e-c197-4b80-b19f-9019f72d32a8", //Exclusively Bob Marley
			"https://de1.api.radio-browser.info/json/stations/byuuid/1ce33acf-2457-11e8-91bf-52543be04c81", //Allzic Radio Reggae
			"https://de1.api.radio-browser.info/json/stations/byuuid/0dadaba1-629d-11e8-b15b-52543be04c81", //007FM
			"https://de1.api.radio-browser.info/json/stations/byuuid/962f8fe4-0601-11e8-ae97-52543be04c81", //181.FM - Reggae Roots
		],
	},
	{
		genre: "Latino",
		urls: [
			"https://de1.api.radio-browser.info/json/stations/byuuid/d7f67ff5-8103-406b-b168-5f8424babea3", //Bachata Radio
			"https://de1.api.radio-browser.info/json/stations/byuuid/21741ce7-2f1c-451d-b6dd-8ebb0cc7a884", //Estrella 92.3 FM
			"https://de1.api.radio-browser.info/json/stations/byuuid/d1b4a4ee-e101-4191-aecb-05ec78bb92d3", //Latina bachata
			"https://de1.api.radio-browser.info/json/stations/byuuid/eabc2a6b-e71d-4282-a646-ba45bfbc7842", //Latina 104
		],
	},
	{
		genre: "Opera",
		urls: [
			"https://de1.api.radio-browser.info/json/stations/byuuid/13b45d2a-ef33-4b41-8eec-b206583eaccc", //Antenna 2 Opera
			"https://de1.api.radio-browser.info/json/stations/byuuid/61cbd7d9-96f5-4200-9d3e-d1890ef84ead", //1.FM-Otto Opera House
			"https://de1.api.radio-browser.info/json/stations/byuuid/b9f8b7ee-a6dd-4c74-815b-ae8f5e7b77e5", //OperaRadio MRG.FM
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
