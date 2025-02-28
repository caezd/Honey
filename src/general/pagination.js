export function extractPagination(template) {
    const paginationEl = template.querySelector('var[title="pagination"]');
    if (!paginationEl || paginationEl.children.length == 0) return null;
    const labelAnchor = paginationEl.querySelector(
        'a[href^="javascript:Pagination();"]'
    );
    let currentPage = null,
        totalPages = null;
    if (labelAnchor) {
        const strongs = labelAnchor.querySelectorAll("strong");
        if (strongs.length >= 2) {
            currentPage = strongs[0].textContent.trim();
            totalPages = strongs[1].textContent.trim();
        }
    }

    // Le conteneur des pages est généralement le dernier élément enfant (un <span>)
    const pagesContainer = paginationEl.lastElementChild;

    let prev = null;
    let next = null;

    // Identifier les flèches de navigation en recherchant les liens ayant la classe "pag-img"
    const arrowNodes = pagesContainer.querySelectorAll("a.pag-img");
    arrowNodes.forEach((arrow) => {
        const img = arrow.querySelector("img");
        if (img) {
            const altText = img.getAttribute("alt").trim();
            if (altText === "Précédent") {
                prev = arrow.getAttribute("href");
            } else if (altText === "Suivant") {
                next = arrow.getAttribute("href");
            }
        }
    });

    // Extraire les numéros de pages :
    // On récupère les <strong> (page active) et les <a> (pages cliquables), en ignorant les flèches
    const pageNodes = pagesContainer.querySelectorAll(
        "a:not(.pag-img), strong"
    );
    const pages = [];
    pageNodes.forEach((node) => {
        const pageNumber = node.textContent.trim();
        if (!pageNumber) return; // ignorer les nœuds vides ou les séparateurs
        if (node.tagName.toLowerCase() === "strong") {
            pages.push({
                page: pageNumber,
                href: null, // pas de lien pour la page active
                active: true,
            });
        } else if (node.tagName.toLowerCase() === "a") {
            pages.push({
                page: pageNumber,
                href: node.getAttribute("href"),
                active: false,
            });
        }
    });

    return {
        currentPage,
        totalPages,
        pages,
        prev,
        next,
    };
}
