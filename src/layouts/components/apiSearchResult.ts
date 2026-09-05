import { escapeHtml, logoMarkup, type CatalogApi } from "./api.js";

export function renderApiSearchResult(api: CatalogApi): string {
	return `
		<button class="api-result-row" type="button" data-api-id="${escapeHtml(api.id)}">
			<span class="api-result-icon">${logoMarkup(api, "api-result-logo")}</span>
			<span class="api-result-copy"><strong>${escapeHtml(api.name)}</strong><small>${escapeHtml(api.description)}</small></span>
			<span class="iconify api-result-arrow" data-icon="ph:arrow-up-right"></span>
		</button>
	`;
}