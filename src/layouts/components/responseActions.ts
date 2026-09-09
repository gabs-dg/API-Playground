import { showToast } from "../../toast.js";

export function initResponseActions(): void {
    const responseBox = document.getElementById("response");
    const responseActions = document.getElementById("response-actions");
    
    if (!responseBox || !responseActions) return;

    const btnCopyResponse = document.getElementById("btn-copy-response");
    const btnFormatJson = document.getElementById("btn-format-json");
    const btnMinifyJson = document.getElementById("btn-minify-json");

    btnCopyResponse?.addEventListener("click", async () => {
        const responseText = responseBox.textContent || "";
        if (!responseText || responseText === "Clique em SEND REQUEST para testar") {
            showToast("Nenhuma resposta para copiar", "error");
            return;
        }
        
        try {
            await navigator.clipboard.writeText(responseText);
            showToast("Resposta copiada!", "success", 2000);
        } catch (err) {
            showToast("Falha ao copiar resposta", "error");
        }
    });

    btnFormatJson?.addEventListener("click", () => {
        const responseText = responseBox.textContent || "";
        if (!responseText || responseText === "Clique em SEND REQUEST para testar") {
            showToast("Nenhuma resposta para formatar", "error");
            return;
        }
        
        try {
            const parsed = JSON.parse(responseText);
            responseBox.textContent = JSON.stringify(parsed, null, 2);
            showToast("JSON formatado!", "success", 2000);
        } catch (err) {
            showToast("JSON inválido para formatar", "error");
        }
    });

    btnMinifyJson?.addEventListener("click", () => {
        const responseText = responseBox.textContent || "";
        if (!responseText || responseText === "Clique em SEND REQUEST para testar") {
            showToast("Nenhuma resposta para minificar", "error");
            return;
        }
        
        try {
            const parsed = JSON.parse(responseText);
            responseBox.textContent = JSON.stringify(parsed);
            showToast("JSON minificado!", "success", 2000);
        } catch (err) {
            showToast("JSON inválido para minificar", "error");
        }
    });
}