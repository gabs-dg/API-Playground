export function renderFooter(): void {
    const footerContainer = document.getElementById("site-footer");
    if (!footerContainer) return;

    footerContainer.innerHTML = `
        <div class="footer-main">
            <div class="footer-brand">
                <a class="brand footer-brand-link" href="index.html">
                    <span class="brand-mark"><img src="./assets/LayoutLogo.png" alt="Logo"></span>
                    <span class="brand-copy"><strong>API PLAYGROUND</strong><small>Explore. Teste. Entenda.</small></span>
                </a>
                <p>Um espaço visual para aprender, testar e entender o caminho de uma requisição HTTP.</p>
            </div>
            <div class="footer-column">
                <span class="footer-title">Navegar</span>
                <a href="index.html">Início</a>
                <a href="app.html">Request Builder</a>
                <a href="docs.html">Documentação</a>
                <a href="about.html">Sobre</a>
            </div>
            <div class="footer-column">
                <span class="footer-title">Projeto</span>
                <a href="https://github.com/gabs-dg/API-Playground" target="_blank" rel="noreferrer">Repositório GitHub</a>
                <a href="https://github.com/gabs-dg/API-Playground/issues" target="_blank" rel="noreferrer">Reportar Bug</a>
                <a href="docs.html#boas-praticas">Boas Práticas</a>
            </div>
            <div class="footer-column">
                <span class="footer-title">Desenvolvedores</span>
                <a href="https://github.com/gabs-dg" target="_blank" rel="noreferrer"><span class="iconify" data-icon="ph:github-logo"></span> gabs-dg</a>
                <a href="https://github.com/akiradv" target="_blank" rel="noreferrer"><span class="iconify" data-icon="ph:github-logo"></span> akiradv</a>
                <span class="footer-muted">Feito para quem trabalha com APIs.</span>
            </div>
        </div>
        <div class="footer-bottom">
            <span>API Playground © 2026</span>
            <span>Construído para explorar a web aberta.</span>
        </div>
    `;

    if ((window as any).Iconify) {
        (window as any).Iconify.scan();
    }
}