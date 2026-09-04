import { escapeHtml, logoMarkup, type CatalogApi } from "./api.js";

export function renderApiDetails(api: CatalogApi): string {
	return `
		<div class="modal-api-heading">
			<span class="modal-api-icon">${logoMarkup(api, "modal-logo")}</span>
			<div>
				<span class="eyebrow">API DETAILS</span>
				<h2 id="api-modal-title">${escapeHtml(api.name)}</h2>
				<p>Desenvolvida por ${escapeHtml(api.provider)}</p>
			</div>
		</div>
		<p class="modal-description">${escapeHtml(api.description)}</p>
		<dl class="api-detail-list">
			<div><dt>Categoria</dt><dd>${escapeHtml(api.category)}</dd></div>
			<div><dt>Autenticação</dt><dd>${escapeHtml(api.auth)}</dd></div>
			<div><dt>Método</dt><dd>GET</dd></div>
		</dl>
		<div class="modal-url-block">
			<span>Endpoint para teste</span>
			<code>${escapeHtml(api.url)}</code>
		</div>
		<button class="modal-test-button" type="button" data-modal-test="${escapeHtml(api.id)}">
			Testar esta API <span class="iconify" data-icon="ph:arrow-right"></span>
		</button>
	`;
}
