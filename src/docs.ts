export function initDocs(): void {
    const navLinks = document.querySelectorAll(".docs-nav a");
    if (navLinks.length === 0) return;

    const sections = document.querySelectorAll(".docs-content h1[id], .docs-content h2[id]");
    
    const observerOptions = {
        root: null,
        rootMargin: "-90px 0px -70% 0px",
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                navLinks.forEach((link) => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === `#${id}`) {
                        link.classList.add("active");
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));

    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("href")?.slice(1);
            const targetSection = targetId ? document.getElementById(targetId) : null;
            
            if (targetSection) {
                const headerOffset = 90;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    const copyButtons = document.querySelectorAll(".code-block-copy");
    copyButtons.forEach((btn) => {
        btn.addEventListener("click", async () => {
            const codeBlock = (btn as HTMLElement).parentElement?.nextElementSibling?.querySelector("code");
            if (codeBlock) {
                try {
                    await navigator.clipboard.writeText(codeBlock.textContent || "");
                    const originalHTML = (btn as HTMLElement).innerHTML;
                    (btn as HTMLElement).innerHTML = '<span class="iconify" data-icon="ph:check"></span> Copiado!';
                    setTimeout(() => {
                        (btn as HTMLElement).innerHTML = originalHTML;
                    }, 2000);
                } catch (err) {
                    console.error("Falha ao copiar", err);
                }
            }
        });
    });
}