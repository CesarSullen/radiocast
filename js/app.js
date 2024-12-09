const radioPlayer = document.getElementById("radioPlayer");
const radioSource = document.getElementById("radioSource");
const radioCover = document.getElementById("radioCover");
const radioName = document.getElementById("radioName");

let currentStationIndex = 0;
let currentGenreIndex = 0;
let currentStationUrl;

function loadGenres() {
	fetch("./js/genres.json")
		.then((response) => response.json())
		.then((data) => {
			stations = data;
			console.log("Géneros cargados:", stations);
		})
		.catch((error) => console.error("Error al cargar los géneros:", error));
}

function loadArtists() {
	fetch("./js/artists.json")
		.then((response) => response.json())
		.then((data) => {
			artistMap = data; // Guardar los artistas en la variable artistMap
			console.log("Artistas cargados:", artistMap);
		})
		.catch((error) => console.error("Error al cargar los artistas:", error));
}

function startPlaying(stationURL, stationName) {
	console.log(`Reproduciendo: ${stationName} - URL: ${stationURL}`);
	radioSource.src = stationURL;
	radioName.textContent = stationName;
	radioPlayer.load();
	radioPlayer.play();
}

function getStations() {
	const currentGenre = stations[currentGenreIndex];
	const selectedGenreIndicator = document.getElementById(
		"selectedGenreIndicator"
	);
	selectedGenreIndicator.innerText = currentGenre.genre;
	selectedGenreIndicator.classList.remove("hidden");

	currentStationUrl = currentGenre.urls[currentStationIndex];
	fetch(currentStationUrl, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	})
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

function deselectArtistCards() {
	const artistCards = document.querySelectorAll(".artist-cards .card");
	artistCards.forEach((card) => card.classList.remove("selected"));
}

function switchNextStation() {
	deselectArtistCards();
	currentStationIndex =
		(currentStationIndex + 1) % stations[currentGenreIndex].urls.length;
	getStations();
}

function switchPrevStation() {
	deselectArtistCards();
	currentStationIndex =
		(currentStationIndex - 1 + stations[currentGenreIndex].urls.length) %
		stations[currentGenreIndex].urls.length;
	getStations();
}

playBtn.addEventListener("click", () => {
	playBtn.classList.add("hidden");
	pauseBtn.classList.remove("hidden");

	getStations();
	radioPlayer.play();
});

pauseBtn.addEventListener("click", () => {
	pauseBtn.classList.add("hidden");
	playBtn.classList.remove("hidden");

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
const genreCards = document.querySelectorAll(".genres-section .card");

function selectGenre(genreIndex) {
	currentGenreIndex = genreIndex;
	currentStationIndex = 0;

	playBtn.classList.remove("shown");
	playBtn.classList.add("hidden");

	pauseBtn.classList.remove("hidden");
	pauseBtn.classList.add("shown");

	getStations();
}
function fetchArtistStation(url) {
	fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	})
		.then((response) => response.json())
		.then((data) => {
			data.forEach((stationData) => {
				const stationName = stationData.name;
				const stationURL = stationData.url_resolved;

				startPlaying(stationURL, stationName);
			});
		})
		.catch((error) => console.error("Error fetching artist station:", error));
}

function deselectAllCards() {
	genreCards.forEach((card) => card.classList.remove("selected"));
	artistCards.forEach((card) => card.classList.remove("selected"));
}

genreCards.forEach((card, index) => {
	card.addEventListener("click", function () {
		deselectAllCards();
		selectGenre(index);
		this.classList.add("selected");
	});
});

const artistCards = document.querySelectorAll(".artist-cards .card");

artistCards.forEach((card, index) => {
	card.addEventListener("click", function () {
		deselectAllCards();
		this.classList.add("selected");

		const artistInfo = artistMap[index];

		currentGenreIndex = stations.findIndex((station) =>
			station.urls.includes(artistInfo.url)
		);
		currentStationIndex = stations[currentGenreIndex].urls.findIndex(
			(url) => url === artistInfo.url
		);
		fetchArtistStation(artistInfo.url);
	});
});

function fetchArtistStation(url) {
	fetch(url)
		.then((response) => response.json())
		.then((data) => {
			data.forEach((stationData) => {
				startPlaying(stationData.url_resolved, stationData.name);
			});
		})
		.catch((error) => console.error("Error fetching artist station:", error));
}

loadGenres();
loadArtists();
