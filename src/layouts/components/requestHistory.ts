interface HistoryItem {
    id: string;
    method: string;
    url: string;
    headers: string;
    body: string;
    timestamp: number;
}

const STORAGE_KEY = "api-playground-history";
const MAX_HISTORY = 5;

export function initRequestHistory(): void {
    const historyContainer = document.getElementById("request-history");
    const sendBtn = document.getElementById("sendBtn");
    
    if (!historyContainer || !sendBtn) return;

    const loadHistory = (): HistoryItem[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (err) {
            console.error("Erro ao carregar histórico", err);
            return [];
        }
    };

    const saveHistory = (history: HistoryItem[]): void => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        } catch (err) {
            console.error("Erro ao salvar histórico", err);
        }
    };

    const addToHistory = (): void => {
        const method = (document.getElementById("req-method") as HTMLSelectElement)?.value || "GET";
        const url = (document.getElementById("req-url") as HTMLInputElement)?.value || "";
        const headers = (document.getElementById("req-headers") as HTMLTextAreaElement)?.value || "";
        const body = (document.getElementById("req-body") as HTMLTextAreaElement)?.value || "";

        if (!url) return;

        const history = loadHistory();
        const newItem: HistoryItem = {
            id: Date.now().toString(),
            method,
            url,
            headers,
            body,
            timestamp: Date.now()
        };

        history.unshift(newItem);
        if (history.length > MAX_HISTORY) {
            history.pop();
        }

        saveHistory(history);
        renderHistory();
    };

    const loadFromHistory = (item: HistoryItem): void => {
        const methodSelect = document.getElementById("req-method") as HTMLSelectElement;
        const urlInput = document.getElementById("req-url") as HTMLInputElement;
        const headersTextarea = document.getElementById("req-headers") as HTMLTextAreaElement;
        const bodyTextarea = document.getElementById("req-body") as HTMLTextAreaElement;

        if (methodSelect) methodSelect.value = item.method;
        if (urlInput) urlInput.value = item.url;
        if (headersTextarea) headersTextarea.value = item.headers;
        if (bodyTextarea) bodyTextarea.value = item.body;
    };

    const renderHistory = (): void => {
        const history = loadHistory();
        historyContainer.innerHTML = "";

        if (history.length === 0) {
            historyContainer.innerHTML = '<p class="history-empty">Nenhuma requisição recente</p>';
            return;
        }

        history.forEach(item => {
            const historyItem = document.createElement("div");
            historyItem.className = "history-item";
            
            const timeAgo = getTimeAgo(item.timestamp);
            const urlPreview = item.url.length > 40 ? item.url.substring(0, 40) + "..." : item.url;
            
            historyItem.innerHTML = `
                <div class="history-item-header">
                    <span class="history-method ${item.method.toLowerCase()}">${item.method}</span>
                    <span class="history-time">${timeAgo}</span>
                </div>
                <div class="history-url">${urlPreview}</div>
            `;
            
            historyItem.addEventListener("click", () => {
                loadFromHistory(item);
            });
            
            historyContainer.appendChild(historyItem);
        });
    };

    const getTimeAgo = (timestamp: number): string => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return "agora";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        return `${days}d`;
    };

    sendBtn.addEventListener("click", addToHistory);
    renderHistory();
}