import { escapeHtml, logoMarkup, type CatalogApi } from "./api.js";

function decodeHtmlEntities(text: string): string {
	const txt = document.createElement("textarea");
	txt.innerHTML = text;
	return txt.value;
}

function parseSimpleMarkdown(text: string): string {
	if (!text) return '';

	const decoded = decodeHtmlEntities(text);
	const isHtml = /<[a-z]+[\s>]/i.test(decoded);

	if (isHtml) {
		return decoded
			.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
			.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
			.replace(/on\w+="[^"]*"/gi, '')
			.replace(/on\w+='[^']*'/gi, '')
			.replace(/<a\s/gi, '<a target="_blank" rel="noopener" ')
			.replace(/<img\s/gi, '<img class="md-image" ');
	}

	const lines = decoded.split('\n');
	let html = '';
	let inCodeBlock = false;
	let codeLang = '';
	let inTable = false;
	let tableHeaderDone = false;
	let listType = '';
	let inBlockquote = false;
	let blockquoteContent = '';

	const flushBlockquote = () => {
		if (inBlockquote) {
			html += `<blockquote>${parseInline(blockquoteContent.trim())}</blockquote>`;
			blockquoteContent = '';
			inBlockquote = false;
		}
	};

	const flushList = () => {
		if (listType) {
			html += listType === 'ul' ? '</ul>' : '</ol>';
			listType = '';
		}
	};

	const flushTable = () => {
		if (inTable) {
			html += '</tbody></table></div>';
			inTable = false;
			tableHeaderDone = false;
		}
	};

	const parseInline = (line: string): string => {
		return line
			.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="md-image">')
			.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
			.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.+?)\*/g, '<em>$1</em>')
			.replace(/~~(.+?)~~/g, '<del>$1</del>')
			.replace(/`([^`]+)`/g, '<code>$1</code>');
	};

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		if (line.startsWith('```')) {
			if (inCodeBlock) {
				html += `</code></pre>`;
				inCodeBlock = false;
				codeLang = '';
			} else {
				codeLang = line.slice(3).trim();
				const langLabel = codeLang ? `<div class="code-lang">${escapeHtml(codeLang)}</div>` : '';
				html += `<pre>${langLabel}<code class="language-${escapeHtml(codeLang)}">`;
				inCodeBlock = true;
			}
			continue;
		}

		if (inCodeBlock) {
			html += escapeHtml(line) + '\n';
			continue;
		}

		if (line.includes('|') && line.trim().startsWith('|')) {
			const isSeparator = /^\|[\s\-:|]+\|$/.test(line.trim());
			if (isSeparator) { tableHeaderDone = true; continue; }
			if (!inTable) {
				html += '<div class="table-wrapper"><table><thead><tr>';
				inTable = true;
			}
			const cells = line.split('|').filter(c => c.trim() !== '');
			if (!tableHeaderDone) {
				cells.forEach(cell => { html += `<th>${parseInline(cell.trim())}</th>`; });
				html += '</tr></thead><tbody>';
			} else {
				html += '<tr>';
				cells.forEach(cell => { html += `<td>${parseInline(cell.trim())}</td>`; });
				html += '</tr>';
			}
			continue;
		} else { flushTable(); }

		if (line.startsWith('#### ')) { flushList(); flushBlockquote(); html += `<h4>${parseInline(line.slice(5))}</h4>`; continue; }
		if (line.startsWith('### ')) { flushList(); flushBlockquote(); html += `<h3>${parseInline(line.slice(4))}</h3>`; continue; }
		if (line.startsWith('## ')) { flushList(); flushBlockquote(); html += `<h2>${parseInline(line.slice(3))}</h2>`; continue; }
		if (line.startsWith('# ')) { flushList(); flushBlockquote(); html += `<h1>${parseInline(line.slice(2))}</h1>`; continue; }

		if (/^(\*{3,}|-{3,}|_{3,})$/.test(line.trim())) { flushList(); flushBlockquote(); html += '<hr>'; continue; }

		if (line.startsWith('> ')) {
			flushList();
			inBlockquote = true;
			blockquoteContent += (blockquoteContent ? ' ' : '') + line.slice(2);
			continue;
		} else { flushBlockquote(); }

		if (/^[-*] /.test(line)) {
			flushBlockquote();
			const content = line.slice(2);
			const checklistMatch = content.match(/^\[([ xX])\]\s*(.*)/);
			if (checklistMatch) {
				const checked = checklistMatch[1].toLowerCase() === 'x' ? 'checked' : '';
				if (listType !== 'ul') { flushList(); html += '<ul class="task-list">'; listType = 'ul'; }
				html += `<li class="task-list-item"><input type="checkbox" ${checked} disabled> ${parseInline(checklistMatch[2])}</li>`;
			} else {
				if (listType !== 'ul') { flushList(); html += '<ul>'; listType = 'ul'; }
				html += `<li>${parseInline(content)}</li>`;
			}
			continue;
		}

		if (/^\d+\. /.test(line)) {
			flushBlockquote();
			const content = line.replace(/^\d+\. /, '');
			if (listType !== 'ol') { flushList(); html += '<ol>'; listType = 'ol'; }
			html += `<li>${parseInline(content)}</li>`;
			continue;
		}

		flushList();
		if (line.trim() === '') { html += '</p><p>'; }
		else { html += parseInline(line) + '<br>'; }
	}

	flushTable();
	flushList();
	flushBlockquote();
	if (inCodeBlock) html += '</code></pre>';

	return `<div class="md-content"><p>${html}</p></div>`;
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