export function initQuickHeaders(): void {
    const quickHeadersContainer = document.getElementById("quick-headers");
    const headersTextarea = document.getElementById("req-headers") as HTMLTextAreaElement;
    
    if (!quickHeadersContainer || !headersTextarea) return;

    const quickHeaders = [
        { label: "Content-Type: JSON", value: "Content-Type: application/json" },
        { label: "Accept: JSON", value: "Accept: application/json" },
        { label: "Authorization: Bearer", value: "Authorization: Bearer " },
        { label: "User-Agent", value: "User-Agent: API-Playground/1.0" }
    ];

    quickHeaders.forEach(header => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quick-header-btn";
        btn.textContent = `+ ${header.label}`;
        btn.addEventListener("click", () => {
            const currentValue = headersTextarea.value;
            const newValue = currentValue ? `${currentValue}\n${header.value}` : header.value;
            headersTextarea.value = newValue;
        });
        quickHeadersContainer.appendChild(btn);
    });
}