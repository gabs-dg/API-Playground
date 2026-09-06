import { showToast } from "./toast.js";

export function initShortcuts(): void {
    document.addEventListener("keydown", (e) => {
        const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
        const modifier = isMac ? e.metaKey : e.ctrlKey;

        if (modifier && e.key === "k") {
            e.preventDefault();
            const searchInput = document.getElementById("api-search") as HTMLInputElement;
            if (searchInput) {
                searchInput.focus();
                showToast("Busca focada", "info", 1500);
            }
        }

        if (modifier && e.key === "Enter") {
            e.preventDefault();
            const sendBtn = document.getElementById("sendBtn") as HTMLButtonElement;
            if (sendBtn && !sendBtn.disabled) {
                sendBtn.click();
                showToast("Requisição enviada", "success", 1500);
            }
        }
    });
}