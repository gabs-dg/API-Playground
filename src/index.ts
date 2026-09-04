import { initRequestBuilder } from "./layouts/components/requestBuilder.js";
import { initCatalog } from "./catalog/catalogView.js";

function initApp(): void {
	initRequestBuilder();
	initCatalog();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initApp, { once: true });
} else {
	initApp();
}
