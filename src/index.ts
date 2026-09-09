import { initRequestBuilder } from "./layouts/components/requestBuilder.js";
import { initCatalog } from "./catalog/catalogView.js";
import { initExportModal } from "./layouts/components/exportModal.js";
import { initShortcuts } from "./shortcuts.js";
import { initDocs } from "./docs.js";
import { renderFooter } from "./shared/footer.js";
import { initResponseActions } from "./layouts/components/responseActions.js";
import { initQuickHeaders } from "./layouts/components/quickHeaders.js";
import { initRequestHistory } from "./layouts/components/requestHistory.js";

function initApp(): void {
    initRequestBuilder();
    initCatalog();
    initExportModal();
    initShortcuts();
    initDocs();
    renderFooter();
    initResponseActions();
    initQuickHeaders();
    initRequestHistory();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp, { once: true });
} else {
    initApp();
}