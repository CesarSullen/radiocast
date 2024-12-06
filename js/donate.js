const copiedAlert = document.querySelector(".copied-alert");

document.querySelectorAll(".copy-icon").forEach((icon) => {
	icon.addEventListener("click", async (event) => {
		const addressToCopy = event.target.getAttribute("data-address");

		try {
			await navigator.clipboard.writeText(addressToCopy);
			console.log("Dirección copiada: ", addressToCopy);
			showCopiedAlert();
		} catch (err) {
			console.error("Error al copiar: ", err);
		}
	});
});

function showCopiedAlert() {
	const alert = document.querySelector(".copied-alert");

	alert.style.animation = "none"; // Reinicia la animación

	// Forzar el reflow para reiniciar la animación
	alert.offsetHeight; // Esto provoca un reflow

	// Ahora aplica la animación de fadeOut
	alert.style.animation = "fadeOut 2s ease-in";
}
