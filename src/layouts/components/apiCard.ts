import { escapeHtml, logoMarkup, type CatalogApi } from "./api.js";

export function renderApiCard(api: CatalogApi): string {
	return `
		<article class="api-card" data-api-id="${escapeHtml(api.id)}">
			<div class="api-card-topline">
				<span class="api-icon">${logoMarkup(api, "api-logo")}</span>
				<span class="api-status" data-status-for="${escapeHtml(api.id)}"><span class="status-dot"></span> Não verificado</span>
			</div>
			<h3>${escapeHtml(api.name)}</h3>
			<p class="api-provider">por ${escapeHtml(api.provider)}</p>
			<p class="api-description">${escapeHtml(api.description)}</p>
			<div class="api-url" title="${escapeHtml(api.url)}">${escapeHtml(api.url)}</div>
			<div class="api-card-actions">
				<span class="api-category">${escapeHtml(api.category)}</span>
				<div class="card-actions-right">
					<button class="check-api" type="button" data-check-api="${escapeHtml(api.id)}">Verificar</button>
					<button class="test-api" type="button" data-test-api="${escapeHtml(api.id)}">Testar <span class="iconify" data-icon="ph:arrow-up-right"></span></button>
				</div>
			</div>
		</article>
	`;
}
