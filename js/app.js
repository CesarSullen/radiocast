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

let currentStationIndex = 0;
let currentGenreIndex = 0;
let stations = [];
let artistMap = [];
let favStations = [];

// Load genres from the JSON file
function loadGenres() {
	fetch("./js/genres.json")
		.then((response) => response.json())
		.then((data) => {
			stations = data;
			console.log("Genres loaded:", stations);
			createGenreCards();
		})
		.catch((error) => console.error("Error loading genres:", error));
}

// Load artists from the JSON file
function loadArtists() {
	fetch("./js/artists.json")
		.then((response) => response.json())
		.then((data) => {
			artistMap = data;
			console.log("Artists loaded:", artistMap);
			createArtistCards();
		})
		.catch((error) => console.error("Error loading artists:", error));
}

// Start playing a station
function startPlaying(stationURL, stationName, stationCover) {
	console.log(`Now playing: ${stationName} - URL: ${stationURL}`);
	radioSource.src = stationURL;
	radioName.textContent = stationName;
	radioCover.src = stationCover;

	updateFavIcon();
	togglePlayPauseButtons(true);
	radioPlayer.load();
	radioPlayer.play();
}

// Toggle between play and pause buttons
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

// Get stations based on the selected genre
function getStations() {
	const currentGenre = stations[currentGenreIndex];
	const selectedGenreIndicator = document.getElementById(
		"selectedGenreIndicator"
	);

	selectedGenreIndicator.innerText = currentGenre.genre;
	selectedGenreIndicator.classList.remove("hidden");

	const currentStationUrl = currentGenre.urls[currentStationIndex];

	fetch(currentStationUrl)
		.then((response) => response.json())
		.then((data) => {
			if (data.length > 0) {
				const stationName = data[0].name;
				const stationURL = data[0].url_resolved;
				startPlaying(stationURL, stationName, "./assets/logo.JPG");
			}
		})
		.catch((error) => console.error("Error fetching stations:", error));
}

// Control buttons event listeners
playBtn.addEventListener("click", () => {
	if (currentStationIndex === 0 && currentGenreIndex === 0) {
		getStations();
	} else {
		togglePlayPauseButtons(true);
		radioPlayer.play();
	}
});

pauseBtn.addEventListener("click", () => {
	togglePlayPauseButtons(false);
	radioPlayer.pause();
});

// Functions for switching between stations
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

prevBtn.addEventListener("click", switchPrevStation);
nextBtn.addEventListener("click", switchNextStation);

// Genre selection handling
const genreCards = document.querySelectorAll(".genres-section .card");

function selectGenre(genreIndex) {
	currentGenreIndex = genreIndex;
	currentStationIndex = 0;
	getStations();
}

function deselectAllCards() {
	document
		.querySelectorAll(".card")
		.forEach((card) => card.classList.remove("selected"));
}

genreCards.forEach((card, index) => {
	card.addEventListener("click", function () {
		deselectAllCards();
		selectGenre(index);
		this.classList.add("selected");
	});
});

// Function to create genre cards
function createGenreCards() {
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
			console.log(`Selected Genre: ${genreInfo.genre}`);
		});

		genresSection.appendChild(genreCard);
	});
}

// Function to create artist cards
function createArtistCards() {
	artistMap.forEach((artistInfo) => {
		const artistCard = document.createElement("div");
		artistCard.classList.add("card", "artist-card");
		// HTML structure
		artistCard.innerHTML = `
		<div class = "img-container">
			<img src = "${artistInfo.img}" class="card-img" />
			<div class = "audio-waves">
				<div class="line hidden"></div>
				<div class="line hidden"></div>
				<div class="line hidden"></div>
			</div>
		</div>
		<div class="card-info">
			<p class="cart-title">${artistInfo.name}</p>
			<div class="card-genre">${artistInfo.genre[0]}</div>
		</div>
		`;

		artistCard.addEventListener("click", function () {
			deselectAllCards();
			this.classList.add("selected");

			const foundIndex = stations.findIndex((station) =>
				artistInfo.genre.includes(station.genre)
			);

			if (foundIndex > -1) {
				currentGenreIndex = foundIndex;
			}
			fetchArtistStation(artistInfo.url, artistInfo.img);
		});

		artistsSection.appendChild(artistCard);
	});
}

// Function to fetch and play a specific artist's station
function fetchArtistStation(url, artistPicture) {
	fetch(url)
		.then((response) => response.json())
		.then((data) => {
			if (data.length > 0) {
				startPlaying(data[0].url_resolved, data[0].name, artistPicture);
			}
		})
		.catch((error) => console.error("Error fetching artist station:", error));
}

favIcon.addEventListener("click", () => {
	const currentStation = {
		name: radioName.textContent,
		url: radioSource.src,
		cover: radioCover.src,
	};

	if (favIcon.classList.contains("favicon-selected")) {
		favIcon.classList.remove("favicon-selected");

		favStations = favStations.filter(
			(station) => station.url !== currentStation.url
		);
	} else {
		favIcon.classList.add("favicon-selected");
		favStations.push(currentStation);
	}

	console.log("Estaciones favoritas:", favStations);
});

// Function to check if a station is marked as fav
function updateFavIcon() {
	const currentStation = {
		url: radioSource.src,
	};

	if (favStations.some((station) => station.url === currentStation.url)) {
		favIcon.classList.add("favicon-selected");
	} else {
		favIcon.classList.remove("favicon-selected");
	}
}

// Initial calls to load genres and artists
loadGenres();
loadArtists();

// Snow Theme
const snowContainer = document.getElementById("snow");

function createSnowflake() {
	const snowflake = document.createElement("div");
	snowflake.classList.add("snowflake");

	const size = Math.random() * 10 - 2;
	snowflake.style.width = `${size}px`;
	snowflake.style.height = `${size}px`;

	snowflake.style.left = Math.random() * window.innerWidth + "px";
	snowflake.style.top = Math.random() * window.innerHeight + "px";
	snowflake.style.animationDuration = Math.random() * 3 + 2 + "s";
	snowflake.style.opacity = Math.random();

	snowContainer.appendChild(snowflake);

	// Eliminar el copo de nieve después de que ha caído
	setTimeout(() => {
		snowflake.remove();
	}, 5000); // Tiempo de vida del copo de nieve
}

setInterval(createSnowflake, 200); // Cada 200 ms
