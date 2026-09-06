export function showToast(message: string, type: "success" | "error" | "info" = "info", duration = 3000): void {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let icon = "ph:info";
    if (type === "success") icon = "ph:check-circle";
    if (type === "error") icon = "ph:x-circle";

    toast.innerHTML = `
        <span class="toast-icon"><span class="iconify" data-icon="${icon}"></span></span>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, duration);
}