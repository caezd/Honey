import potion from "@poumon/potion";
import { varDump, escapeHTML } from "./utils.js";
import { index_box } from "./template/index_box.js";
import { memberlist_body } from "./template/memberlist_body.js";
import { viewtopic_body } from "./template/viewtopic_body.js";

const ENABLED_TEMPLATES = ["index_box", "memberlist_body", "viewtopic_body"];

// Fonction qui crée un nœud de dump interactif pour une propriété donnée.
function createDumpNode(key, value, visited) {
    const container = document.createElement("div");
    container.style.marginLeft = "20px"; // Indentation
    container.style.whiteSpace = "pre-wrap"; // Activer les retours à la ligne

    // Si la valeur est un objet HTML, on le traite comme une valeur primitive.
    if (value instanceof HTMLElement) {
        let displayValue = escapeHTML(value.outerHTML);
        if (displayValue.length > 300) {
            displayValue = displayValue.substring(0, 300) + "…";
        }
        container.innerHTML = `<strong class="dump-key">${escapeHTML(
            key
        )}</strong>: <span class="dump-value">${displayValue}</span> <em class="dump-type">(HTMLElement)</em>`;
        return container;
    }

    // Traitement des objets (et tableaux) non null
    if (typeof value === "object" && value !== null) {
        // Détection des références circulaires
        if (visited.has(value)) {
            container.innerHTML = `<strong class="dump-key">${escapeHTML(
                key
            )}</strong>: [Circular]`;
            return container;
        }
        visited.add(value);

        const isArray = Array.isArray(value);
        // Ligne de titre avec l'indicateur pour le toggle
        const header = document.createElement("div");
        header.style.cursor = "pointer";
        header.style.userSelect = "none";

        const toggleIndicator = document.createElement("span");
        toggleIndicator.textContent = "▶️"; // fermé par défaut
        toggleIndicator.style.display = "inline-block";
        toggleIndicator.style.width = "1em";
        toggleIndicator.className = "toggle-indicator";
        header.appendChild(toggleIndicator);

        header.insertAdjacentHTML(
            "beforeend",
            ` <strong class="dump-key">${escapeHTML(
                key
            )}</strong>: <em class="dump-type">${
                isArray ? "Array(" + value.length + ")" : "Object"
            }</rm>`
        );
        container.appendChild(header);

        // Conteneur des sous-éléments (caché par défaut)
        const childContainer = document.createElement("div");
        childContainer.style.display = "none";

        // Pour chaque propriété de l'objet, on crée un nœud enfant
        for (let prop in value) {
            if (Object.prototype.hasOwnProperty.call(value, prop)) {
                childContainer.appendChild(
                    createDumpNode(prop, value[prop], visited)
                );
            }
        }
        container.appendChild(childContainer);

        // Au clic, on bascule l'affichage des sous-éléments
        header.addEventListener("click", function () {
            if (childContainer.style.display === "none") {
                childContainer.style.display = "block";
                toggleIndicator.textContent = "🔽";
            } else {
                childContainer.style.display = "none";
                toggleIndicator.textContent = "▶️";
            }
        });
    } else {
        // Pour les valeurs primitives
        let displayValue = value;
        if (typeof value === "string") {
            displayValue = escapeHTML(value);
            if (displayValue.length > 300) {
                displayValue = displayValue.substring(0, 300) + "…";
            }
        }
        container.innerHTML = `<strong class="dump-key">${escapeHTML(
            key
        )}</strong>: <span class="dump-value">${displayValue}</span> <em class="dump-type">(${typeof value})</em>`;
    }

    return container;
}

// Fonction principale qui crée un affichage interactif (tree view) pour un objet complet.
function interactiveVarDump(obj) {
    const container = document.createElement("div");
    container.style.fontFamily = "monospace";
    container.style.whiteSpace = "pre-wrap"; // Permettre le retour à la ligne

    // Utilisation d'un WeakSet pour gérer les références circulaires
    const visited = new WeakSet();

    // Si l'objet n'est pas complexe, on affiche simplement sa valeur
    if (typeof obj !== "object" || obj === null) {
        container.textContent = String(obj) + " (" + typeof obj + ")";
        return container;
    }

    // Pour chaque propriété de l'objet, on ajoute un nœud interactif
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            container.appendChild(createDumpNode(key, obj[key], visited));
        }
    }

    return container;
}

const isTemplateSupported = (template_name) => {
    return ENABLED_TEMPLATES.includes(template_name);
};

var TemplateData = function (template_name) {
    let data = {};
    const element = document.querySelector(
        `.honey[data-name="${template_name}"]`
    );
    if (!element) return;

    switch (template_name) {
        case "index_box":
            data = index_box(element, template_name);
            break;
        case "memberlist_body":
            data = memberlist_body(element, template_name);
            break;
        case "viewtopic_body":
            data = viewtopic_body(element, template_name);
            break;
        default:
            return;
    }

    return data;
};

const DEFAULT_OPTIONS = {
    sync: true,
    dev: true,
};

window.$honey = {};

var Component = function (options) {
    this.options = { ...DEFAULT_OPTIONS, ...options };

    this.init();
    this.initUI();
};

Component.prototype.init = function () {
    ENABLED_TEMPLATES.forEach((template_name) => {
        const data = TemplateData(template_name);

        if (!data) return;

        if (
            typeof this.options[template_name] === "function" &&
            isTemplateSupported(template_name)
        ) {
            data = this.options[template_name](data);
        }

        window.$honey[template_name] = this.options.sync
            ? potion.sync(template_name, data)
            : potion.render(template_name, data);
    });
};

Component.prototype.initUI = function () {
    if (this.options.dev) {
        const infoButton = document.createElement("button");
        infoButton.textContent = "Info";

        // Création de la zone d'affichage (overlay) pour le varDump
        const dumpOverlay = document.createElement("div");
        dumpOverlay.style.position = "fixed";
        dumpOverlay.style.top = "10%";
        dumpOverlay.style.left = "10%";
        dumpOverlay.style.width = "80%";
        dumpOverlay.style.height = "80%";
        dumpOverlay.style.backgroundColor = "#f9f9f9";
        dumpOverlay.style.border = "1px solid #ccc";
        dumpOverlay.style.padding = "10px";
        dumpOverlay.style.overflow = "auto";
        dumpOverlay.style.zIndex = 1000;
        dumpOverlay.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
        dumpOverlay.style.display = "none"; // Masquée par défaut
        dumpOverlay.style.whiteSpace = "pre-wrap";

        // Bouton "Fermer" pour masquer l'overlay
        const closeButton = document.createElement("button");
        closeButton.textContent = "Fermer";
        closeButton.style.marginBottom = "10px";
        closeButton.addEventListener("click", () => {
            dumpOverlay.style.display = "none";
        });
        dumpOverlay.appendChild(closeButton);

        // On ajoute l'interactive varDump de window.$honey dans l'overlay
        dumpOverlay.appendChild(interactiveVarDump(window.$honey));

        // On ajoute le bouton et l'overlay au body
        document.body.appendChild(infoButton);
        document.body.appendChild(dumpOverlay);

        // Au clic sur le bouton "Info", on bascule l'affichage de l'overlay
        infoButton.addEventListener("click", () => {
            dumpOverlay.style.display =
                dumpOverlay.style.display === "none" ? "block" : "none";
        });
    }
};

export default Component;
