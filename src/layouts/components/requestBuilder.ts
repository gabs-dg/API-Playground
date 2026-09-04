import { fetchApi, type AuthConfig, type RequestConfig } from "../../api/fetchApi.js";

function parseLines(value: string): Record<string, string> {
	return value.split(/\r?\n/).reduce<Record<string, string>>((result, line) => {
		const separator = line.includes(":") ? ":" : "=";
		const index = line.indexOf(separator);
		if (index < 1) return result;
		const key = line.slice(0, index).trim();
		const itemValue = line.slice(index + 1).trim();
		if (key) result[key] = itemValue;
		return result;
	}, {});
}

function formatResponse(data: unknown): string {
	if (typeof data === "string") return data || "(resposta vazia)";
	return JSON.stringify(data, null, 2) ?? "(resposta vazia)";
}

function getAuthConfig(): AuthConfig {
	const type = (document.getElementById("auth-type") as HTMLSelectElement | null)?.value;
	switch (type) {
		case "bearer":
			return { type: "bearer", token: (document.getElementById("auth-token") as HTMLInputElement | null)?.value.trim() ?? "" };
		case "basic":
			return {
				type: "basic",
				username: (document.getElementById("auth-username") as HTMLInputElement | null)?.value ?? "",
				password: (document.getElementById("auth-password") as HTMLInputElement | null)?.value ?? "",
			};
		case "api-key":
			return {
				type: "api-key",
				name: (document.getElementById("auth-key-name") as HTMLInputElement | null)?.value.trim() ?? "",
				value: (document.getElementById("auth-key-value") as HTMLInputElement | null)?.value ?? "",
			};
		default:
			return { type: "none" };
	}
}

function updateAuthFields(): void {
	const type = (document.getElementById("auth-type") as HTMLSelectElement | null)?.value;
	document.querySelectorAll<HTMLElement>(".auth-field").forEach((field) => field.classList.add("hidden"));
	if (type === "bearer") document.getElementById("auth-token-field")?.classList.remove("hidden");
	if (type === "basic") {
		document.getElementById("auth-username-field")?.classList.remove("hidden");
		document.getElementById("auth-password-field")?.classList.remove("hidden");
	}
	if (type === "api-key") {
		document.getElementById("auth-key-name-field")?.classList.remove("hidden");
		document.getElementById("auth-key-value-field")?.classList.remove("hidden");
	}
}

export function initRequestBuilder(): void {
	const sendButton = document.getElementById("sendBtn") as HTMLButtonElement | null;
	const methodInput = document.getElementById("req-method") as HTMLSelectElement | null;
	const urlInput = document.getElementById("req-url") as HTMLInputElement | null;
	const paramsInput = document.getElementById("req-params") as HTMLTextAreaElement | null;
	const headersInput = document.getElementById("req-headers") as HTMLTextAreaElement | null;
	const bodyInput = document.getElementById("req-body") as HTMLTextAreaElement | null;
	const statusElement = document.getElementById("status");
	const timeElement = document.getElementById("time");
	const responseElement = document.getElementById("response");
	const authTypeInput = document.getElementById("auth-type");

	if (!sendButton || !methodInput || !urlInput || !paramsInput || !headersInput || !bodyInput || !statusElement || !timeElement || !responseElement) return;
	authTypeInput?.addEventListener("change", updateAuthFields);
	updateAuthFields();

	sendButton.addEventListener("click", async () => {
		const url = urlInput.value.trim();
		if (!url) {
			statusElement.textContent = "ERROR";
			timeElement.textContent = "-";
			responseElement.textContent = "Informe uma URL válida.";
			return;
		}

		sendButton.disabled = true;
		statusElement.textContent = "...";
		timeElement.textContent = "-";
		responseElement.textContent = "Carregando...";
		const request: RequestConfig = {
			url,
			method: methodInput.value.toUpperCase(),
			params: parseLines(paramsInput.value),
			headers: parseLines(headersInput.value),
			body: bodyInput.value.trim() || undefined,
			auth: getAuthConfig(),
		};
		const startTime = performance.now();

		try {
			const result = await fetchApi(request);
			statusElement.textContent = String(result.status);
			statusElement.className = result.ok ? "status-tag success" : "status-tag error";
			responseElement.textContent = formatResponse(result.data);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Erro desconhecido";
			statusElement.textContent = "ERROR";
			statusElement.className = "status-tag error";
			responseElement.textContent = JSON.stringify({ error: message }, null, 2);
		} finally {
			timeElement.textContent = `${Math.round(performance.now() - startTime)} ms`;
			sendButton.disabled = false;
		}
	});
}
