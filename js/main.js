// DOM Elements
const radioPlayer = document.getElementById("radioPlayer");
const radioSource = document.getElementById("radioSource");
const radioCover = document.getElementById("radioCover");
const radioName = document.getElementById("radioName");

const prevBtn = document.getElementById("prevBtn");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const nextBtn = document.getElementById("nextBtn");

const favIcon = document.getElementById("favIcon");
const genresSection = document.querySelector(".genres-section");
const artistsSection = document.querySelector(".artists-section");
const favsSection = document.querySelector(".favs-section");

let currentStationIndex = 0;
let currentGenreIndex = 0;
let stations = [];
let artistMap = [];
let favStations = [];

// Load genres and artists
const GENRES_URL = "./js/genres.json";
const ARTISTS_URL = "./js/artists.json";

function loadGenres() {
	fetch(GENRES_URL)
		.then((res) => res.json())
		.then((data) => {
			stations = data;
			createGenreCards();
			console.log("Genres loaded:", stations);
		})
		.catch((err) => console.error("Error loading genres:", err));
}

function loadArtists() {
	fetch(ARTISTS_URL)
		.then((res) => res.json())
		.then((data) => {
			artistMap = data;
			createArtistCards();
			console.log("Artists loaded:", artistMap);
		})
		.catch((err) => console.error("Error loading artists:", err));
}

// LOAD FAVORITES
function loadFavStations() {
	const storedFavs = localStorage.getItem("favStations");
	if (storedFavs) {
		favStations = JSON.parse(storedFavs);
		createFavsCards();
	}
}

// PLAYBACK FUNCTIONS
function startPlaying(stationURL, stationName, stationCover) {
	radioSource.src = stationURL;
	radioName.textContent = stationName;
	radioCover.src = stationCover;

	updateFavIcon();
	radioPlayer.load();
	radioPlayer.play().catch((err) => console.error("Playback blocked:", err));
}

function togglePlayPauseButtons(isPlaying) {
	if (isPlaying) {
		playBtn.classList.add("hidden");
		playBtn.classList.remove("shown");
		pauseBtn.classList.add("shown");
		pauseBtn.classList.remove("hidden");
	} else {
		pauseBtn.classList.add("hidden");
		pauseBtn.classList.remove("shown");
		playBtn.classList.add("shown");
		playBtn.classList.remove("hidden");
	}
}

// STATIONS FUNCTIONS
function getStations() {
	if (!stations.length) {
		console.error("Stations not loaded yet");
		return;
	}
	const currentGenre = stations[currentGenreIndex];
	const selectedGenreIndicator = document.getElementById(
		"selectedGenreIndicator"
	);
	if (selectedGenreIndicator) {
		selectedGenreIndicator.innerText = currentGenre.genre;
		selectedGenreIndicator.classList.remove("hidden");
	}

	const currentStationUrl = currentGenre.urls[currentStationIndex];
	fetch(currentStationUrl)
		.then((res) => res.json())
		.then((data) => {
			if (data.length > 0) {
				startPlaying(data[0].url_resolved, data[0].name, "./assets/logo.png");
			}
		})
		.catch((err) => console.error("Error fetching stations:", err));
}

// SWITCH STATIONS
function switchNextStation() {
	if (!stations.length) return;
	currentStationIndex =
		(currentStationIndex + 1) % stations[currentGenreIndex].urls.length;
	getStations();
}

function switchPrevStation() {
	if (!stations.length) return;
	currentStationIndex =
		(currentStationIndex - 1 + stations[currentGenreIndex].urls.length) %
		stations[currentGenreIndex].urls.length;
	getStations();
}

// EVENT LISTENERS
playBtn.addEventListener("click", () => {
	if (currentStationIndex === 0 && currentGenreIndex === 0) {
		getStations();
	} else {
		radioPlayer.play().catch((err) => console.error("Playback blocked:", err));
		togglePlayPauseButtons(true);
	}
});

pauseBtn.addEventListener("click", () => {
	radioPlayer.pause();
	togglePlayPauseButtons(false);
});

prevBtn.addEventListener("click", switchPrevStation);
nextBtn.addEventListener("click", switchNextStation);

// SYNC BUTTONS AND AUDIO EVENTS
radioPlayer.addEventListener("play", () => togglePlayPauseButtons(true));
radioPlayer.addEventListener("pause", () => togglePlayPauseButtons(false));

// FAVORITES

favIcon.addEventListener("click", () => {
	const currentStation = {
		name: radioName.textContent,
		url: radioSource.src,
		cover: radioCover.src,
	};

	if (favIcon.classList.contains("favicon-selected")) {
		favIcon.classList.remove("favicon-selected");
		favStations = favStations.filter((st) => st.url !== currentStation.url);
	} else {
		favIcon.classList.add("favicon-selected");
		favStations.push(currentStation);
	}

	createFavsCards();
	saveFavStations();
});

function updateFavIcon() {
	const currentStation = { url: radioSource.src };
	if (favStations.some((st) => st.url === currentStation.url)) {
		favIcon.classList.add("favicon-selected");
	} else {
		favIcon.classList.remove("favicon-selected");
	}
}

function saveFavStations() {
	localStorage.setItem("favStations", JSON.stringify(favStations));
}

// CREATE CARDS
function deselectAllCards() {
	document
		.querySelectorAll(".card")
		.forEach((card) => card.classList.remove("selected"));
}

function selectGenre(index) {
	currentGenreIndex = index;
	currentStationIndex = 0;
	getStations();
}

function createGenreCards() {
	genresSection.innerHTML = "";
	stations.forEach((genreInfo, index) => {
		const genreCard = document.createElement("div");
		genreCard.classList.add("card");
		if (index === 0) genreCard.classList.add("selected");

		genreCard.innerHTML = `
            <div class="audio-waves">
                <div class="line hidden"></div>
                <div class="line hidden"></div>
                <div class="line hidden"></div>
            </div>
            <p class="card-title">${genreInfo.genre}</p>
            <div class="audio-waves">
                <div class="line hidden"></div>
                <div class="line hidden"></div>
                <div class="line hidden"></div>
            </div>
        `;

		genreCard.addEventListener("click", function () {
			deselectAllCards();
			this.classList.add("selected");
			selectGenre(index);
		});

		genresSection.appendChild(genreCard);
	});
}

function createArtistCards() {
	artistsSection.innerHTML = "";
	artistMap.forEach((artist) => {
		const artistCard = document.createElement("div");
		artistCard.classList.add("card", "artist-card");
		artistCard.innerHTML = `
            <div class="img-container">
                <img src="${artist.img}" class="card-img"/>
                <div class="audio-waves">
                    <div class="line hidden"></div>
                    <div class="line hidden"></div>
                    <div class="line hidden"></div>
                </div>
            </div>
            <div class="card-info">
                <p class="card-title">${artist.name}</p>
                <div class="card-genre">${artist.genre[0]}</div>
            </div>
        `;

		artistCard.addEventListener("click", function () {
			deselectAllCards();
			this.classList.add("selected");

			const foundIndex = stations.findIndex((station) =>
				artist.genre.includes(station.genre)
			);
			if (foundIndex > -1) currentGenreIndex = foundIndex;

			fetchArtistStation(artist.url, artist.img);
		});

		artistsSection.appendChild(artistCard);
	});
}

function fetchArtistStation(url, img) {
	fetch(url)
		.then((res) => res.json())
		.then((data) => {
			if (data.length > 0)
				startPlaying(data[0].url_resolved, data[0].name, img);
		})
		.catch((err) => console.error("Error fetching artist station:", err));
}

function createFavsCards() {
	favsSection.innerHTML = "";
	favStations.forEach((station) => {
		const favCard = document.createElement("div");
		favCard.classList.add("card", "fav-card");
		favCard.innerHTML = `
            <div class="audio-waves">
                <div class="line hidden"></div>
                <div class="line hidden"></div>
                <div class="line hidden"></div>
            </div>
            <p class="card-title">${station.name}</p>
            <div class="audio-waves">
                <div class="line hidden"></div>
                <div class="line hidden"></div>
                <div class="line hidden"></div>
            </div>
        `;

		favCard.addEventListener("click", function () {
			deselectAllCards();
			this.classList.add("selected");
			startPlaying(station.url, station.name, station.cover);
		});

		favsSection.appendChild(favCard);
	});
}

// INITIALIZATION
loadGenres();
loadArtists();
loadFavStations();

// ACCORDION LOGIC
const items = document.querySelectorAll(".accordion-item");

items.forEach((item) => {
	const header = item.querySelector(".accordion-header");

	header.addEventListener("click", () => {
		const content = item.querySelector(".accordion-content");
		const toggle = item.querySelector(".accordion-toggle");

		content.classList.toggle("active");
		toggle.classList.toggle("turned");
	});
});

// SERVICE WORKER
if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker
			.register("./sw.js")
			.then(() => console.log("Service Worker registered"))
			.catch((err) => console.error("SW registration failed:", err));
	});
}
