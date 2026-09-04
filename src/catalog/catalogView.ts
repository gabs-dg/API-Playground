import { fetchApi } from "../api/fetchApi.js";
import { renderApiCard } from "../layouts/components/apiCard.js";
import { renderApiDetails } from "../layouts/components/apiDetailsModal.js";
import { escapeHtml, faviconForDomain, type CatalogApi } from "../layouts/components/api.js";
import { renderApiSearchResult } from "../layouts/components/apiSearchResult.js";

interface CatalogViewElements {
	apiList: HTMLElement | null;
	searchInput: HTMLInputElement | null;
	emptyState: HTMLElement | null;
	count: HTMLElement | null;
	modal: HTMLElement | null;
	modalContent: HTMLElement | null;
	modalClose: HTMLButtonElement | null;
	content: HTMLElement | null;
	urlInput: HTMLInputElement | null;
	explorerModal: HTMLElement | null;
	explorerGrid: HTMLElement | null;
	explorerSearch: HTMLInputElement | null;
	explorerCount: HTMLElement | null;
	explorerMessage: HTMLElement | null;
	explorerClose: HTMLButtonElement | null;
}

const catalogSourceUrl = "https://api.apis.guru/v2/list.json";
const explorerPageSize = 36;
let catalogApis: CatalogApi[] = [];
let filteredExplorerApis: CatalogApi[] = [];
let explorerVisibleCount = 0;

function getElements(): CatalogViewElements {
	return {
		apiList: document.getElementById("api-list"),
		searchInput: document.getElementById("api-search") as HTMLInputElement | null,
		emptyState: document.getElementById("api-empty"),
		count: document.getElementById("catalog-count"),
		modal: document.getElementById("api-modal"),
		modalContent: document.getElementById("api-modal-content"),
		modalClose: document.getElementById("api-modal-close") as HTMLButtonElement | null,
		content: document.querySelector(".content"),
		urlInput: document.getElementById("req-url") as HTMLInputElement | null,
		explorerModal: document.getElementById("explorer-modal"),
		explorerGrid: document.getElementById("explorer-grid"),
		explorerSearch: document.getElementById("explorer-search") as HTMLInputElement | null,
		explorerCount: document.getElementById("explorer-count"),
		explorerMessage: document.getElementById("explorer-message"),
		explorerClose: document.getElementById("explorer-close") as HTMLButtonElement | null,
	};
}

function setSelectedCard(apiId: string, sourceCard?: HTMLElement): void {
	document.querySelectorAll(".api-card").forEach((card) => card.classList.remove("active"));
	sourceCard?.classList.add("active");
	if (!sourceCard) document.querySelector(`[data-api-id="${CSS.escape(apiId)}"]`)?.classList.add("active");
}

function useApi(api: CatalogApi, elements: CatalogViewElements, sourceCard?: HTMLElement): void {
	if (!elements.urlInput) return;
	closeExplorer(elements);
	elements.urlInput.value = api.url;
	setSelectedCard(api.id, sourceCard);
	elements.content?.scrollIntoView({ behavior: "smooth", block: "start" });
	elements.urlInput.focus();
}

function closeModal(elements: CatalogViewElements): void {
	elements.modal?.classList.add("hidden");
	elements.modal?.setAttribute("aria-hidden", "true");
}

function openDetails(api: CatalogApi, elements: CatalogViewElements): void {
	if (!elements.modal || !elements.modalContent) return;
	closeExplorer(elements);
	elements.modalContent.innerHTML = renderApiDetails(api);
	elements.modal.classList.remove("hidden");
	elements.modal.setAttribute("aria-hidden", "false");
	elements.modalContent.querySelector("[data-modal-test]")?.addEventListener("click", () => {
		useApi(api, elements);
		closeModal(elements);
	});
}

function renderSearch(filter: string, elements: CatalogViewElements): void {
	const normalizedFilter = filter.trim().toLowerCase();
	const results = normalizedFilter
		? catalogApis.filter((api) => `${api.name} ${api.provider} ${api.description} ${api.url}`.toLowerCase().includes(normalizedFilter))
		: [];
	if (elements.count) elements.count.textContent = String(results.length).padStart(2, "0");
	if (elements.emptyState) elements.emptyState.classList.toggle("hidden", results.length > 0);
	if (elements.apiList) elements.apiList.innerHTML = results.map(renderApiSearchResult).join("");
	elements.apiList?.querySelectorAll<HTMLButtonElement>("[data-api-id]").forEach((result) => {
		result.addEventListener("click", () => {
			const api = catalogApis.find((item) => item.id === result.dataset.apiId);
			if (api) openDetails(api, elements);
		});
	});
}

function bindStatusCheck(card: HTMLElement, api: CatalogApi): void {
	card.querySelector<HTMLButtonElement>("[data-check-api]")?.addEventListener("click", async (event) => {
		event.stopPropagation();
		const button = event.currentTarget as HTMLButtonElement;
		const status = card.querySelector<HTMLElement>(`[data-status-for="${CSS.escape(api.id)}"]`);
		if (!status) return;
		button.disabled = true;
		status.className = "api-status checking";
		status.innerHTML = '<span class="status-dot"></span> Verificando...';
		try {
			const result = await fetchApi({ url: api.url, method: "GET", params: {}, headers: {}, auth: { type: "none" } });
			status.className = result.ok ? "api-status online" : "api-status offline";
			status.innerHTML = `<span class="status-dot"></span> ${result.status} ${result.statusText || "OK"}`;
		} catch {
			status.className = "api-status offline";
			status.innerHTML = '<span class="status-dot"></span> Indisponível';
		} finally {
			button.disabled = false;
		}
	});
}

function bindExplorerCard(card: HTMLElement, elements: CatalogViewElements): void {
	const api = catalogApis.find((item) => item.id === card.dataset.apiId);
	if (!api) return;
	card.addEventListener("click", (event) => {
		if ((event.target as HTMLElement).closest("button")) return;
		closeExplorer(elements);
		openDetails(api, elements);
	});
	card.querySelector<HTMLButtonElement>("[data-test-api]")?.addEventListener("click", (event) => {
		event.stopPropagation();
		closeExplorer(elements);
		useApi(api, elements, card);
	});
	bindStatusCheck(card, api);
}

function appendExplorerCards(elements: CatalogViewElements): void {
	if (!elements.explorerGrid) return;
	const nextVisibleCount = Math.min(explorerVisibleCount + explorerPageSize, filteredExplorerApis.length);
	const batch = filteredExplorerApis.slice(explorerVisibleCount, nextVisibleCount);
	elements.explorerGrid.insertAdjacentHTML("beforeend", batch.map(renderApiCard).join(""));
	elements.explorerGrid.querySelectorAll<HTMLElement>("[data-api-id]").forEach((card) => {
		if (card.dataset.bound === "true") return;
		card.dataset.bound = "true";
		bindExplorerCard(card, elements);
	});
	explorerVisibleCount = nextVisibleCount;
	if (elements.explorerCount) elements.explorerCount.textContent = `${filteredExplorerApis.length} encontradas · mostrando ${explorerVisibleCount}`;
	if (explorerVisibleCount < filteredExplorerApis.length && elements.explorerGrid.scrollHeight <= elements.explorerGrid.clientHeight) {
		requestAnimationFrame(() => appendExplorerCards(elements));
	}
}

function renderExplorerCards(filter: string, elements: CatalogViewElements): void {
	if (!elements.explorerGrid) return;
	const normalizedFilter = filter.trim().toLowerCase();
	filteredExplorerApis = catalogApis.filter((api) => `${api.name} ${api.provider} ${api.description} ${api.category}`.toLowerCase().includes(normalizedFilter));
	explorerVisibleCount = 0;
	elements.explorerGrid.innerHTML = "";
	if (elements.explorerMessage) elements.explorerMessage.classList.toggle("hidden", filteredExplorerApis.length > 0);
	appendExplorerCards(elements);
}

function mapRemoteCatalog(data: unknown): CatalogApi[] {
	if (!data || typeof data !== "object") return [];
	return Object.entries(data as Record<string, unknown>).flatMap(([id, value]) => {
		if (!value || typeof value !== "object") return [];
		const entry = value as { info?: { title?: string; description?: string }; preferred?: string; versions?: Record<string, { swaggerUrl?: string; info?: { title?: string; description?: string } }> };
		const version = entry.versions?.[entry.preferred ?? ""] ?? Object.values(entry.versions ?? {})[0];
		const url = version?.swaggerUrl;
		if (!url) return [];
		const providerDomain = id.split(":")[0].split("/")[0];
		return [{
			id: `remote-${id.replace(/[^a-z0-9]/gi, "-")}`,
			name: version?.info?.title ?? entry.info?.title ?? id,
			provider: id.split("/")[0] || "API pública",
			url,
			description: version?.info?.description ?? entry.info?.description ?? "Especificação OpenAPI pública.",
			icon: "ph:globe-hemisphere-west",
			category: "OpenAPI",
			auth: "Consulte a documentação",
			logoUrl: faviconForDomain(providerDomain) ?? faviconForDomain(url),
		}];
	});
}

async function loadCatalog(elements: CatalogViewElements): Promise<void> {
	try {
		const result = await fetchApi({ url: catalogSourceUrl, method: "GET", params: {}, headers: {}, auth: { type: "none" } });
		catalogApis = mapRemoteCatalog(result.data);
		if (elements.explorerMessage) elements.explorerMessage.classList.add("hidden");
	} catch {
		catalogApis = [];
		if (elements.explorerMessage) elements.explorerMessage.textContent = "Não foi possível carregar o catálogo remoto.";
	}
	renderSearch(elements.searchInput?.value ?? "", elements);
	renderExplorerCards(elements.explorerSearch?.value ?? "", elements);
}

function openExplorer(elements: CatalogViewElements): void {
	elements.explorerModal?.classList.remove("hidden");
	elements.explorerModal?.setAttribute("aria-hidden", "false");
	elements.explorerSearch?.focus();
}

function closeExplorer(elements: CatalogViewElements): void {
	elements.explorerModal?.classList.add("hidden");
	elements.explorerModal?.setAttribute("aria-hidden", "true");
}

export function initCatalog(): void {
	const elements = getElements();
	if (!elements.apiList || !elements.searchInput) return;
	const search = (): void => renderSearch(elements.searchInput?.value ?? "", elements);
	elements.searchInput.addEventListener("input", search);
	elements.searchInput.addEventListener("keydown", (event) => {
		if (event.key !== "Enter") return;
		event.preventDefault();
		search();
		elements.apiList?.querySelector<HTMLButtonElement>(".api-result-row")?.focus();
	});
	elements.modalClose?.addEventListener("click", () => closeModal(elements));
	elements.modal?.addEventListener("click", (event) => {
		if (event.target === elements.modal) closeModal(elements);
	});
	document.querySelector<HTMLButtonElement>("[data-open-explorer]")?.addEventListener("click", () => openExplorer(elements));
	elements.explorerSearch?.addEventListener("input", () => renderExplorerCards(elements.explorerSearch?.value ?? "", elements));
	elements.explorerGrid?.addEventListener("scroll", () => {
		if (!elements.explorerGrid || explorerVisibleCount >= filteredExplorerApis.length) return;
		if (elements.explorerGrid.scrollTop + elements.explorerGrid.clientHeight >= elements.explorerGrid.scrollHeight - 320) appendExplorerCards(elements);
	});
	elements.explorerClose?.addEventListener("click", () => closeExplorer(elements));
	elements.explorerModal?.addEventListener("click", (event) => {
		if (event.target === elements.explorerModal) closeExplorer(elements);
	});
	document.addEventListener("keydown", (event) => {
		if (event.key !== "Escape") return;
		closeModal(elements);
		closeExplorer(elements);
	});
	renderSearch("", elements);
	void loadCatalog(elements);
}
