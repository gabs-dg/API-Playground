export interface CatalogApi {
	id: string;
	name: string;
	provider: string;
	url: string;
	description: string;
	icon: string;
	category: string;
	auth: string;
	logoUrl?: string;
}

export function escapeHtml(value: string): string {
	return value.replace(/[&<>'"]/g, (character) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"'": "&#39;",
		'"': "&quot;",
	}[character] ?? character));
}

export function faviconForDomain(domain: string): string | undefined {
	try {
		const hostname = new URL(domain.includes("://") ? domain : `https://${domain}`).hostname;
		return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;
	} catch {
		return undefined;
	}
}

export function logoMarkup(api: CatalogApi, className: string): string {
	const fallback = `<span class="${className}-fallback"${api.logoUrl ? " hidden" : ""}><span class="iconify" data-icon="${escapeHtml(api.icon)}"></span></span>`;
	if (!api.logoUrl) return fallback;
	return `<img class="${className}-image" src="${escapeHtml(api.logoUrl)}" alt="" loading="lazy" decoding="async" onerror="this.hidden=true;this.nextElementSibling.hidden=false">${fallback}`;
}
