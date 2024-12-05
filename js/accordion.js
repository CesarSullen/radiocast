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
