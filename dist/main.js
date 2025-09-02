var Honey = (function () {
    'use strict';

    /**
     * @module filters
     */

    const filters = {};

    /**
     * Ajoute un filtre pour la substitution des tokens.
     *
     * @param {string} name - Le nom du filtre.
     * @param {function} fn - La fonction de filtre.
     * @param {number} [priority=0] - La priorité d'exécution.
     * @throws {TypeError} Si le nom n'est pas une chaîne ou si fn n'est pas une fonction.
     */
    function addFilter(name, fn, priority = 0) {
        if (typeof name !== "string" || typeof fn !== "function") {
            throw new TypeError(
                "Invalid arguments: 'name' must be a string and 'fn' must be a function."
            );
        }
        filters[name] = filters[name] || [];
        filters[name].push([fn, priority]);
        filters[name].sort((a, b) => a[1] - b[1]);
    }

    /**
     * Applique un filtre sur un payload donné.
     *
     * @param {string} name - Le nom du filtre.
     * @param {*} payload - La valeur initiale.
     * @param {...*} args - Arguments additionnels pour le filtre.
     * @returns {*} Le résultat après application des filtres.
     */
    function applyFilter(name, payload, ...args) {
        return (filters[name] || []).reduce((result, [fn]) => {
            const substituted = fn(result, ...args);
            return substituted !== undefined ? substituted : "";
        }, payload);
    }

    // Filtre par défaut pour la substitution des tokens
    addFilter("token", (token, data, tag) => {
        const path = token.split(".");
        let dataLookup = data;
        for (let i = 0; i < path.length; i++) {
            if (!Object.prototype.hasOwnProperty.call(dataLookup, path[i])) {
                return "";
            }
            dataLookup = dataLookup[path[i]];
        }
        if (dataLookup instanceof HTMLElement) {
            return dataLookup.outerHTML;
        }
        return dataLookup;
    });

    /**
     * Filtres pour string
     */

    addFilter("uppercase", (value) =>
        typeof value === "string" ? value.toUpperCase() : value
    );

    addFilter("lowercase", (value) =>
        typeof value === "string" ? value.toLowerCase() : value
    );

    addFilter("capitalize", (value) =>
        typeof value === "string"
            ? value.charAt(0).toUpperCase() + value.slice(1)
            : value
    );

    addFilter("truncate", (value, data, template, length = 50, ellipsis = "") =>
        typeof value === "string" && value.length > length
            ? value.slice(0, length) + ellipsis
            : value
    );

    addFilter("trim", (value) =>
        typeof value === "string" ? value.trim() : value
    );

    addFilter("lstrip", (value) =>
        typeof value === "string" ? value.replace(/^\s+/, "") : value
    );

    addFilter("rstrip", (value) =>
        typeof value === "string" ? value.replace(/\s+$/, "") : value
    );

    addFilter("append", (value, data, template, suffix) =>
        typeof value === "string" ? value + suffix : value
    );

    addFilter("default", (value, data, template, defaultValue) =>
        value === null || value === undefined || value === "" ? defaultValue : value
    );

    addFilter("prepend", (value, data, template, prefix) =>
        typeof value === "string" ? prefix + value : value
    );

    addFilter("remove", (value, data, template, substring) =>
        typeof value === "string" ? value.split(substring).join("") : value
    );

    addFilter("remove_first", (value, data, template, substring) =>
        typeof value === "string" ? value.replace(substring, "") : value
    );

    addFilter("replace", (value, data, template, search, replacement) =>
        typeof value === "string" ? value.split(search).join(replacement) : value
    );

    addFilter("replace_first", (value, data, template, search, replacement) =>
        typeof value === "string" ? value.replace(search, replacement) : value
    );

    addFilter("split", (value, data, template, delimiter) =>
        typeof value === "string" ? value.split(delimiter) : value
    );

    addFilter("strip_html", (value) =>
        typeof value === "string" ? value.replace(/<[^>]+>/g, "") : value
    );

    addFilter("url_decode", (value) =>
        typeof value === "string" ? decodeURIComponent(value) : value
    );

    addFilter("url_encode", (value) =>
        typeof value === "string" ? encodeURIComponent(value) : value
    );

    /**
     * Filtres pour nombre
     */

    addFilter("abs", (value) =>
        typeof value === "number" ? Math.abs(value) : value
    );

    addFilter("at_least", (value, data, template, min) =>
        typeof value === "number" ? Math.max(value, Number(min)) : value
    );

    addFilter("at_most", (value, data, template, max) =>
        typeof value === "number" ? Math.min(value, Number(max)) : value
    );

    addFilter("ceil", (value) =>
        typeof value === "number" ? Math.ceil(value) : value
    );

    addFilter("floor", (value) =>
        typeof value === "number" ? Math.floor(value) : value
    );

    addFilter("divided_by", (value, data, template, divisor) =>
        typeof Number(value) === "number" && Number(divisor) !== 0
            ? value / Number(divisor)
            : value
    );

    addFilter("minus", (value, data, template, number) =>
        typeof value === "number" ? value - Number(number) : value
    );

    addFilter("modulo", (value, data, template, divisor) =>
        typeof value === "number" && Number(divisor) !== 0
            ? value % Number(divisor)
            : value
    );

    addFilter("plus", (value, data, template, number) =>
        typeof value === "number" ? value + Number(number) : value
    );

    addFilter("round", (value, data, template, precision) => {
        if (typeof value === "number") {
            precision = Number(precision) || 0;
            const factor = Math.pow(10, precision);
            return Math.round(value * factor) / factor;
        }
        return value;
    });
    addFilter("times", (value, data, template, multiplier) =>
        typeof value === "number" ? value * Number(multiplier) : value
    );

    addFilter("escape", (value) =>
        typeof value === "string"
            ? value
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#39;")
            : value
    );

    addFilter("size", (value) => {
        if (Array.isArray(value)) return value.length;
        if (typeof value === "string") return value.length;
        if (typeof value === "object" && value !== null)
            return Object.keys(value).length;
        return 0;
    });

    /**
     * Filtres pour tableaux
     */
    addFilter("compact", (value) =>
        Array.isArray(value)
            ? value.filter((item) => item !== null && item !== undefined)
            : value
    );
    addFilter("first", (value) => {
        if (Array.isArray(value)) return value[0];
        if (typeof value === "string") return value.charAt(0);
        return value;
    });
    addFilter("last", (value) => {
        if (Array.isArray(value)) return value[value.length - 1];
        if (typeof value === "string") return value.charAt(value.length - 1);
        return value;
    });
    addFilter("join", (value, data, template, delimiter) =>
        Array.isArray(value) ? value.join(delimiter || "") : value
    );
    addFilter("map", (value, data, template, property) =>
        Array.isArray(value) ? value.map((item) => item[property]) : value
    );
    addFilter("reverse", (value) => {
        if (Array.isArray(value)) return [...value].reverse();
        if (typeof value === "string") return value.split("").reverse().join("");
        return value;
    });
    addFilter("slice", (value, data, template, start, length) => {
        if (typeof value === "string")
            return value.substring(Number(start), Number(length));
        if (Array.isArray(value))
            return value.slice(Number(start), Number(start) + Number(length));
        return value;
    });
    addFilter("sort", (value, data, template, property) => {
        if (Array.isArray(value)) {
            return property
                ? [...value].sort((a, b) => (a[property] > b[property] ? 1 : -1))
                : [...value].sort();
        }
        return value;
    });
    addFilter("unique", (value) =>
        Array.isArray(value) ? [...new Set(value)] : value
    );

    /**
     * @module utils
     */

    /**
     * Échappe une chaîne pour être utilisée dans une expression régulière.
     * @param {string} string La chaîne à échapper.
     * @returns {string} La chaîne échappée.
     */
    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    /**
     * Vérifie si une chaîne correspond à un tag HTML valide.
     *
     * @param {string} tagName Le nom du tag à tester.
     * @returns {boolean} true si c'est un élément valide, false sinon.
     */
    function isValidHTMLElement(tagName) {
        const el = document.createElement(tagName);
        return !(el instanceof HTMLUnknownElement);
    }

    const ud =
        typeof window !== "undefined" && typeof window._userdata !== "undefined"
            ? window._userdata
            : {};

    /**
     * @module store
     * @description Objet global servant de store.
     */
    const store = {
        user: {
            name: ud.username || null,
            logged_in: Boolean(ud.session_logged_in || null),
            level: ud.user_level || null,
            id: ud.user_id || null,
            posts: ud.user_posts || 0,
            avatar: ud.avatar || null,
            avatar_link: ud.avatar_link || null,
            group_color: ud.groupcolor || null,
        },
    };

    const extendStore = (data) => {
        return Object.assign({ $store: store }, data);
    };

    /**
     * @module parser
     */


    let uniqueCounter = 0;
    const localContexts = new Map();

    // Cache pour la tokenisation des templates
    const tokenCache = new Map();

    /**
     * Analyse un template et le découpe en segments statiques et tokens.
     * Chaque token est représenté par un objet { type: "token", value, flag }.
     *
     * @param {string} template La chaîne du template.
     * @param {Object} settings La configuration (start, end, path).
     * @returns {Array<Object>} Le tableau des segments.
     */
    function tokenizeTemplate(template, settings) {
        // Le pattern capture un flag optionnel ("!" ou "/") suivi du token.
        const pattern = new RegExp(
            `${escapeRegex(settings.start)}\\s*([!\\/]?)\\s*(${
            settings.path
        })\\s*${escapeRegex(settings.end)}`,
            "gi"
        );
        let tokens = [];
        let lastIndex = 0;
        let match;
        while ((match = pattern.exec(template)) !== null) {
            // Ajoute le segment statique avant le token
            if (match.index > lastIndex) {
                tokens.push({
                    type: "static",
                    value: template.slice(lastIndex, match.index),
                });
            }
            // Ajoute le token, avec match[1] comme flag ("" pour ouverture, "/" pour fermeture, éventuellement "!")
            tokens.push({
                type: "token",
                flag: match[1],
                value: match[2],
            });
            lastIndex = pattern.lastIndex;
        }
        // Ajoute le reste du template s'il existe
        if (lastIndex < template.length) {
            tokens.push({
                type: "static",
                value: template.slice(lastIndex),
            });
        }
        return tokens;
    }

    /**
     * Retourne les tokens pour un template donné en utilisant le cache.
     *
     * @param {string} template Le template à tokeniser.
     * @param {Object} settings Les paramètres de configuration.
     * @returns {Array<Object>} Le tableau des tokens.
     */
    function getTokens(template, settings) {
        if (tokenCache.has(template)) {
            return tokenCache.get(template);
        }
        const tokens = tokenizeTemplate(template, settings);
        tokenCache.set(template, tokens);
        return tokens;
    }

    // Fonction pour extraire les templates imbriqués et les protéger
    function protectNestedTemplates(templateStr) {
        const nestedTemplates = {};
        let counter = 0;
        // On utilise une regex qui capture les balises <template> imbriquées
        const regex = /<template\b[^>]*>([\s\S]*?)<\/template>/gi;
        const protectedStr = templateStr.replace(regex, (match) => {
            const placeholder = `__NESTED_TEMPLATE_${counter}__`;
            nestedTemplates[placeholder] = match;
            counter++;
            return placeholder;
        });
        return { protectedStr, nestedTemplates };
    }

    // Fonction pour restaurer les templates imbriqués après substitution
    function restoreNestedTemplates(templateStr, nestedTemplates) {
        for (const placeholder in nestedTemplates) {
            templateStr = templateStr.replace(
                placeholder,
                nestedTemplates[placeholder]
            );
        }
        return templateStr;
    }

    // Fonction de substitution "protégée"
    function safeSubstitute(templateStr, data, settings) {
        // Protéger les templates imbriqués
        const { protectedStr, nestedTemplates } =
            protectNestedTemplates(templateStr);
        // Appliquer la substitution sur le contenu protégé
        let substituted = substitute(protectedStr, data, settings);
        // Restaurer les templates imbriqués intacts
        substituted = restoreNestedTemplates(substituted, nestedTemplates);
        return substituted;
    }

    function parseFilterArguments(argString) {
        // On commence par trimper l'ensemble de la chaîne d'arguments
        argString = argString.trim();
        const args = [];
        // Ce regex capture :
        //  • un argument entre guillemets doubles : "([^"]*)"
        //  • ou entre guillemets simples : '([^']*)'
        //  • ou un argument non cité : ([^,]+)
        // suivis d'une virgule optionnelle et d'espaces
        const regex = /(?:"([^"]*)"|'([^']*)'|([^,]+))(?:,\s*)?/g;
        let match;
        while ((match = regex.exec(argString)) !== null) {
            if (match[1] !== undefined) {
                // Argument entre guillemets doubles (le groupe 1 ne contient pas les quotes)
                args.push(match[1]);
            } else if (match[2] !== undefined) {
                // Argument entre guillemets simples
                args.push(match[2]);
            } else if (match[3] !== undefined) {
                // Argument non cité, on applique trim
                args.push(match[3].trim());
            }
        }
        return args;
    }

    /**
     * Effectue la substitution sur un template en utilisant les tokens pré-analyzés,
     * et gère les blocs conditionnels et les boucles.
     *
     * @param {string} template Le template original.
     * @param {Object} data Les données pour la substitution.
     * @param {Object} settings La configuration (start, end, path).
     * @returns {string} Le template rendu.
     */
    function substitute(template, data, settings) {
        const tokens = getTokens(template, settings);
        let output = "";
        let index = 0;

        while (index < tokens.length) {
            const segment = tokens[index];

            if (segment.type === "static") {
                output += segment.value;
                index++;
            } else if (segment.type === "token") {
                // Ignore le token de fermeture
                if (segment.flag === "/") {
                    index++;
                    continue;
                }

                // Découpe la valeur du token pour extraire la clé et la chaîne de filtres
                const parts = segment.value.split("|").map((s) => s.trim());
                const tokenKey = parts[0];

                // Recherche d'un bloc de fermeture associé (pour les blocs conditionnels ou les boucles)
                let innerTokens = [];
                let j = index + 1;
                let foundClosing = false;
                while (j < tokens.length) {
                    const nextSegment = tokens[j];
                    // Pour la fermeture, on compare uniquement la clé sans filtres
                    if (
                        nextSegment.type === "token" &&
                        nextSegment.flag === "/" &&
                        nextSegment.value.trim() === tokenKey
                    ) {
                        foundClosing = true;
                        break;
                    }
                    innerTokens.push(nextSegment);
                    j++;
                }

                let substituted;
                try {
                    // On récupère la valeur initiale du token via le filtre par défaut "token"
                    substituted = applyFilter("token", tokenKey, data, template);
                } catch (e) {
                    console.warn(e.message);
                    substituted = "";
                }

                // Si des filtres additionnels sont présents, on les applique successivement
                for (let i = 1; i < parts.length; i++) {
                    let filterSpec = parts[i]; // ex. "truncate: 100, \"…\"" ou "join: ', '"
                    let filterName = filterSpec;
                    let filterArgs = [];
                    if (filterSpec.indexOf(":") !== -1) {
                        let [name, argString] = filterSpec.split(":", 2);
                        filterName = name.trim();
                        // Utilisation de la fonction dédiée pour parser les arguments
                        filterArgs = parseFilterArguments(argString);
                    }
                    substituted = applyFilter(
                        filterName,
                        substituted,
                        data,
                        template,
                        ...filterArgs
                    );
                }

                if (foundClosing) {
                    // Cas d'un bloc
                    const innerTemplate = innerTokens
                        .map((tok) =>
                            tok.type === "static"
                                ? tok.value
                                : `${settings.start}${tok.flag ? tok.flag : ""}${
                                  tok.value
                              }${settings.end}`
                        )
                        .join("");

                    if (typeof substituted === "boolean") {
                        output += substituted
                            ? substitute(innerTemplate, data, settings)
                            : "";
                    } else if (typeof substituted === "object") {
                        // Cas de boucle (itération sur un objet)
                        for (const key in substituted) {
                            if (substituted.hasOwnProperty(key)) {
                                const loopData = Object.assign(
                                    {},
                                    substituted[key],
                                    {
                                        _key: key,
                                        _value: substituted[key],
                                    }
                                );
                                let renderedBlock = substitute(
                                    innerTemplate,
                                    loopData,
                                    settings
                                ).trim();
                                const uniqueId = "potion_" + uniqueCounter++;
                                localContexts.set(uniqueId, loopData);
                                renderedBlock = renderedBlock.replace(
                                    /^\s*<([a-zA-Z0-9-]+)/,
                                    `<$1 data-potion-key="${uniqueId}"`
                                );
                                output += renderedBlock;
                            }
                        }
                    } else {
                        output += substituted;
                    }
                    index = j + 1; // Passer après le token de fermeture
                } else {
                    // Cas de substitution simple
                    output += substituted;
                    index++;
                }
            }
        }
        return output;
    }

    /**
     * Expose la Map des contextes locaux pour une utilisation externe.
     * @type {Map<string, Object>}
     */
    const localContextsMap = localContexts;

    /**
     * @module events
     */


    /**
     * Récupère le contexte local en remontant dans l'arborescence du DOM.
     *
     * @param {Element} element L'élément DOM sur lequel commencer la recherche.
     * @param {Object} defaultData Le contexte global par défaut.
     * @returns {Object} Le contexte local trouvé ou defaultData.
     */
    function getLocalContext(element, defaultData) {
        let el = element;
        while (el && el !== document.body) {
            const key = el.getAttribute("data-potion-key");
            if (key) {
                const context = localContextsMap.get(key);
                if (context !== undefined) {
                    return context;
                }
            }
            el = el.parentElement;
        }
        return defaultData;
    }

    /**
     * Convertit un argument textuel en sa valeur.
     *
     * @param {string} arg L'argument sous forme de chaîne.
     * @param {Object} data Les données à utiliser pour la résolution.
     * @returns {*} La valeur résolue.
     */
    function parseEventArgs(arg, data) {
        if (arg === "true") return true;
        if (arg === "false") return false;
        if (!isNaN(arg)) return Number(arg);
        const match = arg.match(/^["'](.*)["']$/);
        return match ? match[1] : data[arg] || arg;
    }

    /**
     * Lie les événements définis sur un élément en gérant les modifiers.
     *
     * @param {Element} element L'élément sur lequel binder les événements.
     * @param {Object} data L'objet global de données.
     */
    function bindEvents(element, data) {
        [...element.attributes]
            .filter((attr) => attr.name.startsWith("@"))
            .forEach((attr) => {
                const parts = attr.name.slice(1).split(".");
                const eventType = parts[0];
                const modifiers = parts.slice(1);
                const regex = /^(\w+)(?:\((.*)\))?$/;
                const match = attr.value.match(regex);
                if (!match) {
                    console.warn(
                        "Potion: impossible de parser l'expression de l'événement:",
                        attr.value
                    );
                    return;
                }
                const fnName = match[1];
                const argsStr = match[2] || "";
                const localData = getLocalContext(element, data);
                const args = argsStr
                    ? argsStr
                          .split(",")
                          .map((arg) => parseEventArgs(arg.trim(), localData))
                    : [];
                const callback =
                    typeof localData[fnName] === "function"
                        ? localData[fnName]
                        : typeof data[fnName] === "function"
                        ? data[fnName]
                        : null;
                if (typeof callback === "function") {
                    element.removeEventListener(
                        eventType,
                        element._boundEvents?.[eventType]
                    );
                    const handler = (event) => {
                        if (
                            modifiers.includes("self") &&
                            event.target !== event.currentTarget
                        )
                            return;
                        if (modifiers.includes("prevent")) event.preventDefault();
                        if (modifiers.includes("stop")) event.stopPropagation();
                        if (
                            modifiers.includes("stopImmediate") &&
                            event.stopImmediatePropagation
                        )
                            event.stopImmediatePropagation();
                        // Autres vérifications pour MouseEvent/KeyboardEvent...
                        const context = { ...data, ...localData };

                        callback.call(context, event, ...args);
                    };
                    element._boundEvents = {
                        ...element._boundEvents,
                        [eventType]: handler,
                    };
                    const options = {};
                    if (modifiers.includes("capture")) options.capture = true;
                    if (modifiers.includes("once")) options.once = true;
                    if (modifiers.includes("passive")) options.passive = true;
                    element.addEventListener(eventType, handler, options);
                } else {
                    console.warn(
                        `Potion: function '${fnName}' not found in local context or data.`
                    );
                }
                element.removeAttribute(attr.name);
            });
    }

    /**
     * @module dom
     */

    /**
     * Enregistre les références d'éléments dans un objet de données.
     * Les éléments doivent avoir un attribut "#ref".
     * @param {Element} container Le container du rendu.
     * @param {Object} data Les données de l'application.
     */
    function registerRefs(container, data) {
        const refs = {};
        // Recherche les éléments ayant l'attribut "#ref" dans le container
        container.querySelectorAll("[\\#ref]").forEach((el) => {
            const refName = el.getAttribute("#ref");
            if (refName) {
                refs[refName] = el;
                el.removeAttribute("#ref");
            }
        });
        data.$refs = Object.assign({}, data.$refs, refs);
    }

    /**
     * Compare deux nœuds DOM et met à jour l'ancien nœud en fonction des différences.
     *
     * @param {Node} oldNode Le nœud existant dans le DOM.
     * @param {Node} newNode Le nouveau nœud généré.
     */
    function diffNodes(oldNode, newNode) {
        if (
            oldNode.nodeType !== newNode.nodeType ||
            oldNode.nodeName !== newNode.nodeName
        ) {
            oldNode.parentNode.replaceChild(newNode.cloneNode(true), oldNode);
            return;
        }
        if (oldNode.nodeType === Node.TEXT_NODE) {
            if (oldNode.textContent !== newNode.textContent) {
                oldNode.textContent = newNode.textContent;
            }
            return;
        }
        if (oldNode.nodeType === Node.ELEMENT_NODE) {
            Array.from(newNode.attributes).forEach((attr) => {
                if (attr.name.startsWith("@") || attr.name.startsWith("#")) return;
                if (oldNode.getAttribute(attr.name) !== attr.value) {
                    oldNode.setAttribute(attr.name, attr.value);
                }
            });
            Array.from(oldNode.attributes).forEach((attr) => {
                if (attr.name.startsWith("@") || attr.name.startsWith("#")) return;
                if (!newNode.hasAttribute(attr.name)) {
                    oldNode.removeAttribute(attr.name);
                }
            });
            const oldChildren = Array.from(oldNode.childNodes);
            const newChildren = Array.from(newNode.childNodes);
            const max = Math.max(oldChildren.length, newChildren.length);
            for (let i = 0; i < max; i++) {
                if (i >= oldChildren.length) {
                    oldNode.appendChild(newChildren[i].cloneNode(true));
                } else if (i >= newChildren.length) {
                    oldNode.removeChild(oldChildren[i]);
                } else {
                    diffNodes(oldChildren[i], newChildren[i]);
                }
            }
        }
    }

    /**
     * Met à jour le DOM en comparant un HTML généré avec l'état actuel.
     *
     * @param {Element} containerElement L'élément container du rendu.
     * @param {string} newHTML Le nouveau HTML généré.
     */
    function updateDOM(containerElement, newHTML) {
        const tagName = containerElement.tagName.toLowerCase();

        const parser = new DOMParser();
        const newDoc = parser.parseFromString(
            `<${tagName}>${newHTML}</${tagName}>`,
            "text/html"
        );
        const newContainer = newDoc.body.firstChild;

        // Recopier les attributs du container existant
        [...containerElement.attributes].forEach((attr) => {
            newContainer.setAttribute(attr.name, attr.value);
        });

        diffNodes(containerElement, newContainer);
    }

    /**
     * @module reactivity
     */

    /**
     * Cache pour stocker les proxys déjà créés pour chaque objet.
     * WeakMap permet de ne pas empêcher la collecte de déchets.
     */
    const proxyCache = new WeakMap();

    /**
     * Crée un Proxy réactif profond pour observer un objet donné.
     * Optimisé en utilisant un cache pour éviter de créer plusieurs proxies pour le même objet.
     *
     * @param {Object} target L'objet à observer.
     * @param {Function} onChange Callback appelée lors d'une modification.
     * @param {number} [maxDepth=Infinity] Profondeur maximale d'observation.
     * @param {number} [currentDepth=0] (Usage interne) Profondeur actuelle.
     * @returns {Object} Le Proxy réactif.
     */
    function deepProxy(
        target,
        onChange,
        maxDepth = Infinity,
        currentDepth = 0
    ) {
        if (typeof target !== "object" || target === null) return target;
        // Si la profondeur maximale est atteinte, renvoyer l'objet sans Proxy
        if (currentDepth >= maxDepth) return target;

        // Vérifier si le Proxy existe déjà pour cet objet
        if (proxyCache.has(target)) {
            return proxyCache.get(target);
        }

        const proxy = new Proxy(target, {
            get(obj, prop) {
                const value = Reflect.get(obj, prop);
                // Proxyfier récursivement en augmentant la profondeur
                return deepProxy(value, onChange, maxDepth, currentDepth + 1);
            },
            set(obj, prop, value) {
                const oldValue = obj[prop];
                const result = Reflect.set(obj, prop, value);
                if (oldValue !== value) {
                    onChange();
                }
                return result;
            },
        });
        proxyCache.set(target, proxy);
        return proxy;
    }

    let templates = {};
    let initialized = false;

    const defaultSettings = {
        start: "[",
        end: "]",
        path: "[^\\]]+",
        type: "template/potion",
        attr: "data-name",
        tag: "div",
        class: "",
    };

    let settings = { ...defaultSettings };

    if (typeof window !== "undefined") {
        // scan le dom pour les templates de type template/potion
        document
            .querySelectorAll(`template[type="${settings.type}"]`)
            .forEach((el) => {
                const templateName = el.getAttribute(settings.attr);
                templates[templateName] = el.innerHTML;
            });
    }

    /**
     * Rendu de template depuis une chaîne ou un template en cache.
     *
     * @param {string} template - La chaîne du template ou le templateName en cache.
     * @param {Object} data - Les données pour la substitution.
     * @returns {string} Le template rendu.
     */
    function Potion(template, data) {
        // Injecter $store dans les données
        data = extendStore(data);
        if (!initialized) {
            initialized = true;
            applyFilter("init", template, data);
        }
        template = applyFilter("templateBefore", template, data);
        if (!template.includes(settings.start)) {
            template = templates[template] || template;
        }
        template = applyFilter("template", template, data);
        if (template && data !== undefined) {
            template = safeSubstitute(template, data, settings);
        }
        return applyFilter("templateAfter", template, data);
    }

    /**
     * Crée un conteneur à partir d'un template HTML présent dans le DOM.
     *
     * @param {HTMLTemplateElement} templateElement - L'élément template.
     * @param {Object} data - Les données pour le rendu.
     * @returns {Element} Le conteneur créé.
     */
    function createContainerFromTemplate(templateElement, data, customSettings) {
        customSettings = { ...settings, ...customSettings };

        // Injecter $store dans les données
        data = extendStore(data);
        const renderedHTML = Potion(
            templateElement.innerHTML,
            data);
        let container;

        if (customSettings.tag && isValidHTMLElement(customSettings.tag)) {
            container = document.createElement(customSettings.tag);
        } else {
            container = document.createElement(settings.tag);
        }
        container.innerHTML = renderedHTML;

        [...templateElement.attributes].forEach((attr) => {
            if (attr.name !== "type") {
                container.setAttribute(attr.name, attr.value);
            }
        });

        if (customSettings.class) {
            container.classList.add(...customSettings.class.split(" "));
        }

        data.$root = container;

        registerRefs(container, data);

        bindEvents(container, data);
        container.querySelectorAll("*").forEach((child) => bindEvents(child, data));

        templateElement.parentNode.replaceChild(container, templateElement);
        return container;
    }

    /**
     * Rendu synchrone avec réactivité.
     *
     * @param {string} templateName - Le nom du template.
     * @param {Object} data - Les données.
     * @returns {Object} L'objet réactif.
     */
    function renderSync(templateName, data, customSettings) {
        const templateElement = document.querySelector(
            `template[data-name='${templateName}']`
        );
        if (!templateElement) {
            throw new Error(
                `Potion: template with name '${templateName}' not found`
            );
        }

        // Injecter $store dans les données
        data = extendStore(data);

        const originalTemplateContent = templateElement.innerHTML;

        // Déclare une fonction mutable pour onChange
        let onChangeCallback = () => {};

        // Crée le proxy avec un callback qui délègue à onChangeCallback
        const proxy = deepProxy(data, () => {
            onChangeCallback();
        });

        // Crée le container en passant le proxy (qui sera utilisé pour le rendu initial)
        const containerElement = createContainerFromTemplate(
            templateElement,
            proxy,
            customSettings
        );

        // Maintenant, on définit onChangeCallback pour utiliser containerElement
        onChangeCallback = () => {
            const updatedHTML = Potion(originalTemplateContent, proxy);
            updateDOM(containerElement, updatedHTML);
            bindEvents(containerElement, proxy);
            containerElement
                .querySelectorAll("*")
                .forEach((child) => bindEvents(child, proxy));
        };

        return proxy;
    }

    /**
     * La fonction principale 'potion' qui effectue un rendu ponctuel.
     *
     * @param {string} template - Le template sous forme de chaîne.
     * @param {Object} data - Les données pour le rendu.
     * @returns {string} Le template rendu.
     */
    function potion(template, data) {
        return Potion(template, data);
    }

    potion.sync = renderSync;
    potion.render = function (templateName, data, customSettings) {
        const templateElement = document.querySelector(
            `template[data-name='${templateName}']`
        );
        if (!templateElement)
            throw new Error(
                `Potion: template with name '${templateName}' not found`
            );
        return createContainerFromTemplate(templateElement, data, customSettings);
    };

    potion.addFilter = addFilter;
    potion.applyFilter = applyFilter;

    const textNodesUnder = (el) => {
        var n,
            a = [],
            walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
        while ((n = walk.nextNode())) a.push(n);
        return a;
    };

    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    const slugify = (text) =>
        text
            .toString()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "")
            .replace(/--+/g, "-");

    const getNumbersFromText = (text) => {
        return text.replace(/\D/g, "");
    };

    const get_res_id = (p) => {
        var m = p.match(/\/[tfc]([1-9][0-9]*)(p[1-9][0-9]*)?-/);
        if (!m) m = p.match(/^\/u([1-9][0-9]*)[a-z]*$/);
        if (!m) return 0;
        return +m[1];
    };

    const getBasicVariableInnerHTML = (el, arr) => {
        const obj = {};
        arr.forEach((item) => {
            const elem = el.querySelector(`var[title="${item}"]`);
            const name = item.split("_")[1] || item;
            if (elem) obj[name] = elem.innerHTML;
        });
        return obj;
    };

    const getLinkAndImage = (el, name) => {
        const link = el.querySelector("a");
        if (!link) return null;
        const obj = {};
        obj[name] = {
            url: link.href,
        };
        getStrictImg(el)
            ? (obj[name].img = getStrictImg(el))
            : (obj[name].text = link.innerHTML);
        return obj;
    };

    const extractLinkAndImage = (el, label) => {
        const fields = el.querySelectorAll(`[title^="${label}"]`);
        const fieldObj = {};
        fields.forEach((field) => {
            const title = field.getAttribute("title");
            const obj = getLinkAndImage(field, title);
            if (obj) {
                fieldObj[title.split("_")[1]] = obj[title];
            }
        });
        return fieldObj;
    };

    const getStrictText = (el) => {
        if (!el.textContent) return;
        return el.textContent.trim();
    };

    const getStrictImg = (el) => {
        const img = el.querySelector("img");
        if (!img) return null;
        const obj = {
            src: img.src,
            element: img,
        };
        return obj;
    };

    function parseUserDate(dateStr) {
        // Nettoyage initial : suppression des espaces en début/fin,
        // suppression du jour de la semaine (ex: "Sam", "Dim", etc.) et des suffixes ordinaux (st, nd, rd, th)
        dateStr = dateStr
            .trim()
            .replace(/^(?:[A-Za-zéûÀ-ÖØ-öø-ÿ]{3,4}\s+)/, "")
            .replace(/(\d+)(st|nd|rd|th)/gi, "$1");

        // Liste des patterns à tester
        const patterns = [
            // "D j M Y - G:i" => "Sam 1 Mar 2025 - 22:48"
            {
                regex: /^(\d{1,2})\s+([A-Za-zéûÀ-ÖØ-öø-ÿ]+)\s+(\d{4})\s*[-,]\s*(\d{1,2}):(\d{2})$/,
                process: (m) =>
                    new Date(
                        parseInt(m[3], 10),
                        parseMonth(m[2]),
                        parseInt(m[1], 10),
                        parseInt(m[4], 10),
                        parseInt(m[5], 10)
                    ),
            },
            // "D j M - G:i" => "Sam 1 Mar - 22:48" (on assume l'année en cours)
            {
                regex: /^(\d{1,2})\s+([A-Za-zéûÀ-ÖØ-öø-ÿ]+)\s*[-,]\s*(\d{1,2}):(\d{2})$/,
                process: (m) =>
                    new Date(
                        new Date().getFullYear(),
                        parseMonth(m[2]),
                        parseInt(m[1], 10),
                        parseInt(m[3], 10),
                        parseInt(m[4], 10)
                    ),
            },
            // "D j M Y - G:i:s" => "Sam 1 Mar 2025 - 22:48:44"
            {
                regex: /^(\d{1,2})\s+([A-Za-zéûÀ-ÖØ-öø-ÿ]+)\s+(\d{4})\s*[-,]\s*(\d{1,2}):(\d{2}):(\d{2})$/,
                process: (m) =>
                    new Date(
                        parseInt(m[3], 10),
                        parseMonth(m[2]),
                        parseInt(m[1], 10),
                        parseInt(m[4], 10),
                        parseInt(m[5], 10),
                        parseInt(m[6], 10)
                    ),
            },
            // "D j M Y - H:i:s a" => "Sam 1 Mar 2025 - 22:48:44 pm"
            {
                regex: /^(\d{1,2})\s+([A-Za-zéûÀ-ÖØ-öø-ÿ]+)\s+(\d{4})\s*[-,]\s*(\d{1,2}):(\d{2}):(\d{2})\s*([ap]m)$/i,
                process: (m) => {
                    let hour = parseInt(m[4], 10);
                    const ampm = m[7].toLowerCase();
                    if (ampm === "pm" && hour < 12) hour += 12;
                    if (ampm === "am" && hour === 12) hour = 0;
                    return new Date(
                        parseInt(m[3], 10),
                        parseMonth(m[2]),
                        parseInt(m[1], 10),
                        hour,
                        parseInt(m[5], 10),
                        parseInt(m[6], 10)
                    );
                },
            },
            // "d.m.y G:i" => "01.03.25 22:48"
            {
                regex: /^(\d{2})\.(\d{2})\.(\d{2})\s+(\d{1,2}):(\d{2})$/,
                process: (m) => {
                    let yr = parseInt(m[3], 10);
                    yr += yr < 50 ? 2000 : 1900;
                    return new Date(
                        yr,
                        parseInt(m[2], 10) - 1,
                        parseInt(m[1], 10),
                        parseInt(m[4], 10),
                        parseInt(m[5], 10)
                    );
                },
            },
            // "d/m/y, h:i a" => "01/03/25, 10:48 pm"
            {
                regex: /^(\d{2})\/(\d{2})\/(\d{2}),\s*(\d{1,2}):(\d{2})\s*([ap]m)$/i,
                process: (m) => {
                    let yr = parseInt(m[3], 10);
                    yr += yr < 50 ? 2000 : 1900;
                    let hour = parseInt(m[4], 10);
                    const ampm = m[6].toLowerCase();
                    if (ampm === "pm" && hour < 12) hour += 12;
                    if (ampm === "am" && hour === 12) hour = 0;
                    return new Date(
                        yr,
                        parseInt(m[2], 10) - 1,
                        parseInt(m[1], 10),
                        hour,
                        parseInt(m[5], 10)
                    );
                },
            },
            // "D d M Y, g:i a" => "Sam 01 Mar 2025, 10:48 pm"
            {
                regex: /^(\d{1,2})\s+([A-Za-zéûÀ-ÖØ-öø-ÿ]+)\s+(\d{4}),\s*(\d{1,2}):(\d{2})\s*([ap]m)$/i,
                process: (m) => {
                    let hour = parseInt(m[4], 10);
                    const ampm = m[6].toLowerCase();
                    if (ampm === "pm" && hour < 12) hour += 12;
                    if (ampm === "am" && hour === 12) hour = 0;
                    return new Date(
                        parseInt(m[3], 10),
                        parseMonth(m[2]),
                        parseInt(m[1], 10),
                        hour,
                        parseInt(m[5], 10)
                    );
                },
            },
            // "D d M Y, H:i" => "Sam 01 Mar 2025, 22:48"
            {
                regex: /^(\d{1,2})\s+([A-Za-zéûÀ-ÖØ-öø-ÿ]+)\s+(\d{4}),\s*(\d{1,2}):(\d{2})$/,
                process: (m) =>
                    new Date(
                        parseInt(m[3], 10),
                        parseMonth(m[2]),
                        parseInt(m[1], 10),
                        parseInt(m[4], 10),
                        parseInt(m[5], 10)
                    ),
            },
            // "D M d, Y g:i a" => "Sam Mar 01, 2025 10:48 pm"
            {
                regex: /^([A-Za-zéûÀ-ÖØ-öø-ÿ]+)\s+(\d{1,2}),\s*(\d{4})\s+(\d{1,2}):(\d{2})\s*([ap]m)$/i,
                process: (m) => {
                    let hour = parseInt(m[4], 10);
                    const ampm = m[6].toLowerCase();
                    if (ampm === "pm" && hour < 12) hour += 12;
                    if (ampm === "am" && hour === 12) hour = 0;
                    return new Date(
                        parseInt(m[3], 10),
                        parseMonth(m[1]),
                        parseInt(m[2], 10),
                        hour,
                        parseInt(m[5], 10)
                    );
                },
            },
            // "D M d Y, H:i" => "Sam Mar 01 2025, 22:48"
            {
                regex: /^([A-Za-zéûÀ-ÖØ-öø-ÿ]+)\s+(\d{1,2})\s+(\d{4}),\s*(\d{1,2}):(\d{2})$/,
                process: (m) =>
                    new Date(
                        parseInt(m[3], 10),
                        parseMonth(m[1]),
                        parseInt(m[2], 10),
                        parseInt(m[4], 10),
                        parseInt(m[5], 10)
                    ),
            },
            // "jS F Y, g:i a" => "1st Mars 2025, 10:48 pm"
            {
                regex: /^(\d{1,2})\s+[a-z]{2}\s+([A-Za-zéûÀ-ÖØ-öø-ÿ]+)\s+(\d{4}),\s*(\d{1,2}):(\d{2})\s*([ap]m)$/i,
                process: (m) => {
                    let hour = parseInt(m[4], 10);
                    const ampm = m[6].toLowerCase();
                    if (ampm === "pm" && hour < 12) hour += 12;
                    if (ampm === "am" && hour === 12) hour = 0;
                    return new Date(
                        parseInt(m[3], 10),
                        parseMonth(m[2]),
                        parseInt(m[1], 10),
                        hour,
                        parseInt(m[5], 10)
                    );
                },
            },
            // "jS F Y, H:i" => "1st Mars 2025, 22:48"
            {
                regex: /^(\d{1,2})\s+[a-z]{2}\s+([A-Za-zéûÀ-ÖØ-öø-ÿ]+)\s+(\d{4}),\s*(\d{1,2}):(\d{2})$/,
                process: (m) =>
                    new Date(
                        parseInt(m[3], 10),
                        parseMonth(m[2]),
                        parseInt(m[1], 10),
                        parseInt(m[4], 10),
                        parseInt(m[5], 10)
                    ),
            },
            // "F jS Y, g:i a" => "Mars 1st 2025, 10:48 pm"
            {
                regex: /^([A-Za-zéûÀ-ÖØ-öø-ÿ]+)\s+(\d{1,2})\s*[a-z]{2}\s+(\d{4}),\s*(\d{1,2}):(\d{2})\s*([ap]m)$/i,
                process: (m) => {
                    let hour = parseInt(m[4], 10);
                    const ampm = m[6].toLowerCase();
                    if (ampm === "pm" && hour < 12) hour += 12;
                    if (ampm === "am" && hour === 12) hour = 0;
                    return new Date(
                        parseInt(m[3], 10),
                        parseMonth(m[1]),
                        parseInt(m[2], 10),
                        hour,
                        parseInt(m[5], 10)
                    );
                },
            },
            // "F jS Y, H:i" => "Mars 1st 2025, 22:48"
            {
                regex: /^([A-Za-zéûÀ-ÖØ-öø-ÿ]+)\s+(\d{1,2})\s*[a-z]{2}\s+(\d{4}),\s*(\d{1,2}):(\d{2})$/,
                process: (m) =>
                    new Date(
                        parseInt(m[3], 10),
                        parseMonth(m[1]),
                        parseInt(m[2], 10),
                        parseInt(m[4], 10),
                        parseInt(m[5], 10)
                    ),
            },
            // "j/n/Y, g:i a" => "1/3/2025, 10:48 pm"
            {
                regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}):(\d{2})\s*([ap]m)$/i,
                process: (m) => {
                    let hour = parseInt(m[4], 10);
                    const ampm = m[6].toLowerCase();
                    if (ampm === "pm" && hour < 12) hour += 12;
                    if (ampm === "am" && hour === 12) hour = 0;
                    return new Date(
                        parseInt(m[3], 10),
                        parseInt(m[2], 10) - 1,
                        parseInt(m[1], 10),
                        hour,
                        parseInt(m[5], 10)
                    );
                },
            },
            // "j/n/Y, H:i" => "1/3/2025, 22:48"
            {
                regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}):(\d{2})$/,
                process: (m) =>
                    new Date(
                        parseInt(m[3], 10),
                        parseInt(m[2], 10) - 1,
                        parseInt(m[1], 10),
                        parseInt(m[4], 10),
                        parseInt(m[5], 10)
                    ),
            },
            // "n/j/Y, g:i a" => "3/1/2025, 10:48 pm"
            {
                regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}):(\d{2})\s*([ap]m)$/i,
                process: (m) => {
                    let hour = parseInt(m[4], 10);
                    const ampm = m[6].toLowerCase();
                    if (ampm === "pm" && hour < 12) hour += 12;
                    if (ampm === "am" && hour === 12) hour = 0;
                    return new Date(
                        parseInt(m[3], 10),
                        parseInt(m[1], 10) - 1,
                        parseInt(m[2], 10),
                        hour,
                        parseInt(m[5], 10)
                    );
                },
            },
            // "n/j/Y, H:i" => "3/1/2025, 22:48"
            {
                regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}):(\d{2})$/,
                process: (m) =>
                    new Date(
                        parseInt(m[3], 10),
                        parseInt(m[1], 10) - 1,
                        parseInt(m[2], 10),
                        parseInt(m[4], 10),
                        parseInt(m[5], 10)
                    ),
            },
            // "Y-m-d, g:i a" => "2025-03-01, 10:48 pm"
            {
                regex: /^(\d{4})-(\d{1,2})-(\d{1,2}),\s*(\d{1,2}):(\d{2})\s*([ap]m)$/i,
                process: (m) => {
                    let hour = parseInt(m[4], 10);
                    const ampm = m[6].toLowerCase();
                    if (ampm === "pm" && hour < 12) hour += 12;
                    if (ampm === "am" && hour === 12) hour = 0;
                    return new Date(
                        parseInt(m[1], 10),
                        parseInt(m[2], 10) - 1,
                        parseInt(m[3], 10),
                        hour,
                        parseInt(m[5], 10)
                    );
                },
            },
            // "Y-m-d, H:i" => "2025-03-01, 22:48"
            {
                regex: /^(\d{4})-(\d{1,2})-(\d{1,2}),\s*(\d{1,2}):(\d{2})$/,
                process: (m) =>
                    new Date(
                        parseInt(m[1], 10),
                        parseInt(m[2], 10) - 1,
                        parseInt(m[3], 10),
                        parseInt(m[4], 10),
                        parseInt(m[5], 10)
                    ),
            },
            // "Y-m-d, H:i:s" => "2025-03-01, 22:48:44"
            {
                regex: /^(\d{4})-(\d{1,2})-(\d{1,2}),\s*(\d{1,2}):(\d{2}):(\d{2})$/,
                process: (m) =>
                    new Date(
                        parseInt(m[1], 10),
                        parseInt(m[2], 10) - 1,
                        parseInt(m[3], 10),
                        parseInt(m[4], 10),
                        parseInt(m[5], 10),
                        parseInt(m[6], 10)
                    ),
            },
        ];

        // Fonction utilitaire pour convertir un nom de mois en indice (0 pour janvier)
        function parseMonth(monthStr) {
            const m = monthStr.toLowerCase();
            const months = {
                jan: 0,
                january: 0,
                janv: 0,
                feb: 1,
                february: 1,
                févr: 1,
                mar: 2,
                march: 2,
                mars: 2,
                apr: 3,
                april: 3,
                avr: 3,
                may: 4,
                mai: 4,
                jun: 5,
                june: 5,
                juin: 5,
                jul: 6,
                july: 6,
                juil: 6,
                aug: 7,
                august: 7,
                août: 7,
                sep: 8,
                sept: 8,
                september: 8,
                oct: 9,
                october: 9,
                nov: 10,
                november: 10,
                dec: 11,
                december: 11,
                déc: 11,
                decembre: 11,
            };
            return months[m] !== undefined ? months[m] : 0;
        }

        // Parcours des patterns pour tenter une correspondance
        for (let { regex, process } of patterns) {
            const match = dateStr.match(regex);
            if (match) {
                return process(match);
            }
        }
        // Dernier recours : utiliser le constructeur natif
        const parsed = new Date(dateStr);
        return isNaN(parsed.getTime()) ? new Date(NaN) : parsed;
    }

    const getDateAndParse = (el) => {
        const date = el.querySelector("var[title*='date']");
        if (!date) return null;
        const text = date.textContent;
        const obj = {
            text: text,
            timestamp: parseUserDate(text),
        };
        return obj;
    };

    const get_forum_status = (str) => {
        if (str.includes("Pas de nouveaux")) return "no-new";
        if (str.includes("verrouillé")) return "lock";
        return "new";
    };

    const get_forum_subs = (el) => {
        const subs = el.querySelectorAll('[title="subs"] a[title]');
        return Array.from(subs).map((sub) => {
            const url = new URL(sub.href).pathname;
            return {
                name: sub.innerText,
                url,
                fid: `f${get_res_id(url)}`,
                description: sub.title,
            };
        });
    };

    const get_forum_lastpost = (el) => {
        const base = {
            state: "",
            title: "",
            author: {
                username: "",
                avatar: "",
                color: "",
            },
            date: "",
            url: "",
            anchor: "",
        };

        const result = { ...base };

        const lastpostUser = el.querySelector('[title="lastpost-user"]');
        if (lastpostUser) {
            const dateTextNodes = textNodesUnder(lastpostUser);
            if (dateTextNodes.length) {
                result.state = "visible";
                result.date = dateTextNodes[0].textContent || "";
                result.author.username = dateTextNodes[1]?.textContent || "";
                const usernameLink = lastpostUser.querySelector('a[href^="/u"]');
                result.author.url = usernameLink ? usernameLink.href : "";
            }
        }

        const titleElem = el.querySelector('[title="lastpost-title"]');
        if (titleElem) {
            result.title = titleElem.textContent;
            result.url = titleElem.nextSibling?.textContent || "";
        }

        const lastpostAvatar = el.querySelector('[title="lastpost-avatar"]');
        if (lastpostAvatar) {
            const img = lastpostAvatar.querySelector("img");
            if (img) result.author.avatar = img.src;
        }

        const lastpostColor = el.querySelector('span[style^="color"]');
        if (lastpostColor) {
            result.author.color = lastpostColor.style.color;
        }

        const lastpostAnchor = el.querySelector(".last-post-icon");
        if (lastpostAnchor) {
            const img = lastpostAnchor.querySelector("img");
            if (img) result.status_img = img.src;
            result.anchor = lastpostAnchor.href;
        }

        return result;
    };

    function buildForums(cat) {
        const namedVars = [
            "name",
            "description",
            "status_img",
            "url",
            "posts",
            "topics",
        ];
        const forums = [];

        cat.querySelectorAll(".for_ref").forEach((forum) => {
            const urlElem = forum.querySelector('[title="url"]');
            const url = urlElem ? urlElem.innerHTML : "";
            const ref = `f${get_res_id(url)}`;
            const statusElem = forum.querySelector('[title="status"]');
            const statusStr = statusElem ? statusElem.innerHTML : "";
            const lastpostElem = forum.querySelector('[title="lastpost"]');

            const forumObj = {
                cid: cat.dataset.ref,
                id: ref,
                status: get_forum_status(statusStr),
                lastpost: lastpostElem ? get_forum_lastpost(lastpostElem) : {},
            };

            Array.from(forum.children)
                .filter((el) => namedVars.includes(el.title))
                .forEach((el) => {
                    forumObj[el.title] = el.innerHTML;
                });

            const descriptionImg = forum.querySelector('[title="description"] img');
            forumObj.image = descriptionImg ? descriptionImg.src : "";
            forumObj.subs = get_forum_subs(forum);
            forums.push(forumObj);
        });

        return forums;
    }

    function index_box(template, template_name) {
        const data = {
            categories: [],
            category: {},
            forum: {},
        };

        template.querySelectorAll(".cat_ref").forEach((cat) => {
            const ref = cat.dataset.ref;
            const titleElem = cat.querySelector('[title="title"]');
            const title = titleElem ? titleElem.textContent : "";
            const forums = buildForums(cat);
            const catObj = {
                id: ref,
                title,
                url: `/${ref}-${slugify(title)}`,
                forums,
            };

            data.categories.push(catObj);
            data.category[ref] = catObj;
            forums.forEach((forum) => {
                data.forum[forum.fid] = forum;
            });
        });

        return data;
    }

    function extractPagination(template) {
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

    const extractMember = (member) => {
        const basicVariables = [
            "avatar",
            "url",
            "username",
            "date_joined",
            "date_last",
            "posts",
        ];
        const memberObj = {
            ...getBasicVariableInnerHTML(member, basicVariables),
            contacts: extractLinkAndImage(member, "contact"),
        };

        return memberObj;
    };

    function memberlist_body(template) {
        const data = {
            page: {},
            pagination: extractPagination(template),
            users: [],
        };

        template.querySelectorAll(".ref_member").forEach((member) => {
            data["users"].push(extractMember(member));
        });

        return data;
    }

    /* import { extractBreadcrumbs } from "../general/breadcrumbs"; */

    const extractProfileFieldsContent = (field) => {
        return field.querySelector(".content").innerHTML;
    };

    const extractAwards = (post) => {
        const awards = post.querySelectorAll("[title='poster_awards'] .award");
        const awardsArr = [];
        awards.forEach((award) => {
            const imgUrl = award.style
                .getPropertyValue("--award-image")
                .replace(/url\((['"])?(.*?)\1\)/gi, "$2");
            const tooltip = award.querySelector(".award_tooltiptext");
            const titleText =
                tooltip
                    .querySelector(".award_tooltiptext_title")
                    ?.textContent.trim() || "";
            const descriptionText = Array.from(tooltip.childNodes)
                .filter(
                    (node) =>
                        node.nodeType === Node.TEXT_NODE &&
                        node.textContent.trim() !== ""
                )
                .map((node) => node.textContent.trim())
                .join(" ");
            const img = document.createElement("img");
            img.src = imgUrl;
            awardsArr.push({
                img: {
                    src: imgUrl,
                    element: img,
                },
                title: titleText,
                description: descriptionText || "",
            });
        });
        return awardsArr;
    };

    const extractProfileFields = (post) => {
        const fields = post.querySelectorAll("[title='poster_field']");
        const fieldObj = {};
        fields.forEach((field) => {
            const label = field
                .querySelector(".label")
                .textContent.replace(":", "")
                .trim();
            const color = field.querySelector("span[style]").style.color || null;
            const content = extractProfileFieldsContent(field);
            fieldObj[slugify(label)] = {
                label,
                color,
                content,
            };
        });
        return fieldObj;
    };

    const extractParticipants = (post) => {
        const participants = post.querySelector("[title='participants']");
        if (!participants) return null;
        const participantsArr = [];
        participants.querySelectorAll(".poster").forEach((participant) => {
            const avatarUrl = participant.style
                .getPropertyValue("--poster-avatar")
                .replace(/url\((['"])?(.*?)\1\)/gi, "$2");
            const img = document.createElement("img");
            img.src = avatarUrl;
            participantsArr.push({
                name: participant.title,
                avatar: {
                    src: avatarUrl,
                    element: img,
                },
                url: participant.querySelector("a").href,
            });
        });
        return {
            users: participantsArr,
            count: getNumbersFromText(
                participants.querySelector(".poster-count").textContent
            ),
        };
    };

    const extractPoster = (post) => {
        const basicVariables = ["poster_uid"];
        const posterObj = {
            ...getBasicVariableInnerHTML(post, basicVariables),
            rank: {
                text: getStrictText(post.querySelector("[title='poster_rank']")),
                img: getStrictImg(post.querySelector("[title='poster_rankImg']")),
            },
            awards: extractAwards(post),
            avatar: getStrictImg(post.querySelector("[title='poster_avatar']")),
            fields: extractProfileFields(post),
            //TODO: RPG & Contact customs, vote & attachments, like
        };
        posterObj["url"] = `/u${posterObj.uid}`;
        return posterObj;
    };

    const extractPost = (post) => {
        const basicVariables = [
            "id",
            "body",
            "tid",
            "pid",
            "signature",
            "url",
            "subject",
        ];

        const postObj = {
            ...getBasicVariableInnerHTML(post, basicVariables),
            date: getDateAndParse(post),
            contacts: extractLinkAndImage(post, "contact"),
            actions: extractLinkAndImage(post, "action"),
            poster: extractPoster(post),
        };

        return postObj;
    };

    function viewtopic_body(template) {
        const data = {
            page: {
                /* navigation: extractBreadcrumbs(
                    template.querySelector('var[title="navigation"]')
                ), */
                actions: extractLinkAndImage(template, "paction"),
                participants: extractParticipants(template),
            },
            pagination: extractPagination(template),
            posts: [],
        };

        template.querySelectorAll(".ref_post").forEach((ref) => {
            data["posts"].push(extractPost(ref));
        });

        return data;
    }

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
                data = index_box(element);
                break;
            case "memberlist_body":
                data = memberlist_body(element);
                break;
            case "viewtopic_body":
                data = viewtopic_body(element);
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

    var Component = function (options = {}) {
        if (!(this instanceof Component)) {
            return new Component(options);
        }
        this.options = { ...DEFAULT_OPTIONS, ...options };

        this.init();
        this.initUI();
    };

    Component.prototype.init = function () {
        ENABLED_TEMPLATES.forEach((template_name) => {
            let data = TemplateData(template_name);

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

    return Component;

})();
