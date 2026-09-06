import { showToast } from "../../toast.js";
interface ExportData {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: string;
}

export function initExportModal(): void {
    const exportModal = document.getElementById("export-modal") as HTMLElement | null;
    const exportCodeBlock = document.getElementById("export-code-block") as HTMLElement | null;
    const btnExport = document.getElementById("btn-export") as HTMLButtonElement | null;
    const btnExportClose = document.getElementById("export-modal-close") as HTMLButtonElement | null;
    const btnCopyCode = document.getElementById("btn-copy-code") as HTMLButtonElement | null;
    const exportTabs = document.querySelectorAll(".export-tab") as NodeListOf<HTMLButtonElement>;

    let currentExportLang = "curl";

    const getExportData = (): ExportData => {
        const method = (document.getElementById("req-method") as HTMLSelectElement)?.value || "GET";
        const url = (document.getElementById("req-url") as HTMLInputElement)?.value || "";
        const headersText = (document.getElementById("req-headers") as HTMLTextAreaElement)?.value || "";
        const bodyText = (document.getElementById("req-body") as HTMLTextAreaElement)?.value || "";
        
        const headers: Record<string, string> = {};
        headersText.split("\n").forEach(line => {
            const parts = line.split(":");
            if (parts.length >= 2) {
                headers[parts[0].trim()] = parts.slice(1).join(":").trim();
            }
        });

        return { method, url, headers, body: bodyText };
    };

    const generateCurl = (data: ExportData): string => {
        let cmd = `curl -X ${data.method} "${data.url}"`;
        for (const [key, value] of Object.entries(data.headers)) {
            cmd += ` \\\n  -H "${key}: ${value}"`;
        }
        if (data.body) {
            cmd += ` \\\n  -d '${data.body.replace(/'/g, "'\\''")}'`;
        }
        return cmd;
    };

    const generateFetch = (data: ExportData): string => {
        const options: any = { method: data.method };
        if (Object.keys(data.headers).length > 0) options.headers = data.headers;
        if (data.body) options.body = data.body;
        
        return `fetch("${data.url}", {\n  ${Object.entries(options).map(([k, v]) => `${k}: ${typeof v === 'string' ? `'${v.replace(/"/g, '\\"')}'` : JSON.stringify(v, null, 2).replace(/\n/g, '\n  ')}`).join(",\n  ")}\n})\n.then(response => response.json())\n.then(data => console.log(data))\n.catch(error => console.error('Error:', error));`;
    };

    const generateAxios = (data: ExportData): string => {
        const config: any = { method: data.method.toLowerCase(), url: data.url };
        if (Object.keys(data.headers).length > 0) config.headers = data.headers;
        if (data.body) config.data = data.body;

        return `axios(${JSON.stringify(config, null, 2).replace(/"([^"]+)":/g, '$1:')})\n  .then(response => console.log(response.data))\n  .catch(error => console.error(error));`;
    };

    const generatePython = (data: ExportData): string => {
        let code = `import requests\n\nurl = "${data.url}"\n`;
        if (Object.keys(data.headers).length > 0) {
            code += `headers = ${JSON.stringify(data.headers, null, 4).replace(/"([^"]+)":/g, "'$1':")}\n`;
        }
        if (data.body) {
            code += `payload = """${data.body}"""\n`;
        }
        code += `\nresponse = requests.request("${data.method}", url`;
        if (Object.keys(data.headers).length > 0) code += `, headers=headers`;
        if (data.body) code += `, data=payload`;
        code += `)\n\nprint(response.text)`;
        return code;
    };

    const updateExportCode = (): void => {
        if (!exportCodeBlock) return;
        const data = getExportData();
        let code = "";
        switch (currentExportLang) {
            case "curl": code = generateCurl(data); break;
            case "fetch": code = generateFetch(data); break;
            case "axios": code = generateAxios(data); break;
            case "python": code = generatePython(data); break;
        }
        exportCodeBlock.textContent = code;
    };

    btnExport?.addEventListener("click", () => {
        updateExportCode();
        exportModal?.classList.remove("hidden");
        exportModal?.setAttribute("aria-hidden", "false");
    });

    btnExportClose?.addEventListener("click", () => {
        exportModal?.classList.add("hidden");
        exportModal?.setAttribute("aria-hidden", "true");
    });

    exportModal?.addEventListener("click", (e) => {
        if (e.target === exportModal) {
            exportModal.classList.add("hidden");
            exportModal.setAttribute("aria-hidden", "true");
        }
    });

    exportTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            exportTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentExportLang = tab.dataset.lang || "curl";
            updateExportCode();
        });
    });

    btnCopyCode?.addEventListener("click", async () => {
        if (!exportCodeBlock) return;
        try {
            await navigator.clipboard.writeText(exportCodeBlock.textContent || "");
            const originalText = btnCopyCode.innerHTML;
            btnCopyCode.innerHTML = '<span class="iconify" data-icon="ph:check"></span> Copiado!';
            showToast("Código copiado com sucesso!", "success", 2000);
            setTimeout(() => {
                btnCopyCode.innerHTML = originalText;
            }, 2000);
        } catch (err) {
            showToast("Falha ao copiar o código", "error");
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && exportModal && !exportModal.classList.contains("hidden")) {
            exportModal.classList.add("hidden");
            exportModal.setAttribute("aria-hidden", "true");
        }
    });
}