import { initRequestBuilder } from "./layouts/components/requestBuilder.js";
import { initCatalog } from "./catalog/catalogView.js";
import { initExportModal } from "./layouts/components/exportModal.js";
import { initShortcuts } from "./shortcuts.js";

function initApp(): void {
	initRequestBuilder();
	initCatalog();
	initExportModal();
	initShortcuts();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initApp, { once: true });
} else {
	initApp();
}