let tag = "lofi";
let url = `https://de1.api.radio-browser.info/json/stations/bytag/${tag}`;

function startPlaying() {
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

			const radioPlayer = document.getElementById("radioPlayer");
			const radioSource = document.getElementById("radioSource");
			const radioIcon = document.getElementById("radioIcon");
			const radioName = document.getElementById("radioName");

			radioSource.src = selectedStation.url_resolved;
			radioIcon.src = stationIcon;
			radioName.textContent = stationName;
			radioPlayer.load();
			radioPlayer.play();
		})
		.catch((error) => console.error("Error:", error));
}
startPlaying();

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
prevBtn.addEventListener("click", startPlaying);
nextBtn.addEventListener("click", startPlaying);

// Volume Control
const volumeControl = document.getElementById("volumeControl");

radioPlayer.volume = 1;
volumeControl.value = radioPlayer.volume;

volumeControl.addEventListener("input", function () {
	radioPlayer.volume = this.value;
});
