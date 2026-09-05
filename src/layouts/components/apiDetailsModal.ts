import { escapeHtml, logoMarkup, type CatalogApi } from "./api.js";

function parseSimpleMarkdown(text: string): string {
	const lines = text.split('\n');
	let html = '';
	let inCodeBlock = false;

	for (const line of lines) {
		if (line.startsWith('```')) {
			inCodeBlock = !inCodeBlock;
			html += inCodeBlock ? '<pre><code>' : '</code></pre>';
			continue;
		}

		if (inCodeBlock) {
			html += escapeHtml(line) + '\n';
			continue;
		}

		if (line.startsWith('#### ')) {
			html += `<h4>${line.slice(5)}</h4>`;
		} else if (line.startsWith('### ')) {
			html += `<h3>${line.slice(4)}</h3>`;
		} else if (line.startsWith('## ')) {
			html += `<h2>${line.slice(3)}</h2>`;
		} else if (line.startsWith('# ')) {
			html += `<h1>${line.slice(2)}</h1>`;
		} else if (line.trim() === '') {
			html += '</p><p>';
		} else {
			let processed = escapeHtml(line)
				.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
				.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
				.replace(/\*(.+?)\*/g, '<em>$1</em>')
				.replace(/`(.+?)`/g, '<code>$1</code>');

			if (line.startsWith('$ ')) {
				html += `<pre><code>${processed.slice(2)}</code></pre>`;
			} else {
				html += processed + '<br>';
			}
		}
	}

	return `<p>${html}</p>`;
}

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
		<div class="modal-description">${parseSimpleMarkdown(api.description)}</div>
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