let tag = "lofi";
let url = `https://de1.api.radio-browser.info/json/stations/bytag/${tag}`;

const radioPlayer = document.getElementById("radioPlayer");
const radioSource = document.getElementById("radioSource");
const radioCover = document.getElementById("radioCover");
const radioName = document.getElementById("radioName");

/* function startPlaying() {
	fetch(url)
		.then((response) => response.json())
		.then((data) => {
			let chillStations = data.length;

			let randomIndex = Math.floor(Math.random() * chillStations);
			const selectedStation = data[randomIndex];

			const stationIndex = randomIndex;
			const stationName = selectedStation.name;
			const stationURL = selectedStation.url_resolved;
			const stationIcon = selectedStation.favicon;

			console.log(stationIndex, stationName, stationURL);

			radioSource.src = selectedStation.url_resolved;
			radioCover.src = "./assets/covers/lofi.JPG";
			radioName.textContent = stationName;
			radioPlayer.load();
			radioPlayer.play();
		})
		.catch((error) => console.error("Error:", error));
}
startPlaying(); */

let lofiStations = [];

const LoFiGirl =
	"https://de1.api.radio-browser.info/json/stations/byname/Lo-Fi%20Girl";
const MoELofi =
	"https://de1.api.radio-browser.info/json/stations/byname/MoE%20Lofi";
const NiaRadioLoFi =
	"https://de1.api.radio-browser.info/json/stations/byname/NIA%20Radio%20Lo-Fi";

lofiStations.push(LoFiGirl, MoELofi, NiaRadioLoFi);
let currentStationIndex = 0;

function startPlaying(stationURL, stationName) {
	console.log(`Reproduciendo: ${stationName} - URL: ${stationURL}`);

	radioSource.src = stationURL;
	radioName.textContent = stationName;
	radioPlayer.load();
	radioPlayer.play();
}

function getStations() {
	const currentStationUrl = lofiStations[currentStationIndex];

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

getStations();

// Control Buttons
const prevBtn = document.getElementById("prevBtn");
const playBtn = document.getElementById("playBtn");
const nextBtn = document.getElementById("nextBtn");

playBtn.addEventListener("click", () => {
	if (radioPlayer.paused) {
		radioPlayer.play();
		playBtn.src = "./assets/pause-fill.svg";
	} else {
		radioPlayer.pause();
		playBtn.src = "./assets/play-fill.svg";
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
