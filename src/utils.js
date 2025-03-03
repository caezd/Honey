export const textNodesUnder = (el) => {
    var n,
        a = [],
        walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    while ((n = walk.nextNode())) a.push(n);
    return a;
};

export function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export const varDump = (obj, depth = 0, visited = new WeakSet()) => {
    const indent = "  ".repeat(depth);
    let output = "";

    // Gestion des valeurs null ou non-objet
    if (obj === null) {
        return indent + "null\n";
    }
    if (typeof obj !== "object") {
        return indent + obj + " (" + typeof obj + ")\n";
    }

    // Détection des références circulaires
    if (visited.has(obj)) {
        return indent + "[Circular]\n";
    }
    visited.add(obj);

    if (Array.isArray(obj)) {
        output += indent + "Array(" + obj.length + ") [\n";
        obj.forEach((value, index) => {
            output +=
                indent +
                "  [" +
                index +
                "] => " +
                varDump(value, depth + 1, visited);
        });
        output += indent + "]\n";
    } else {
        const keys = Object.keys(obj);
        output += indent + "Object(" + keys.length + ") {\n";
        keys.forEach((key) => {
            output +=
                indent +
                "  [" +
                key +
                "] => " +
                varDump(obj[key], depth + 1, visited);
        });
        output += indent + "}\n";
    }

    return output;
};

export const slugify = (text) =>
    text
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-");

export const getNumbersFromText = (text) => {
    return text.replace(/\D/g, "");
};

export const get_res_type = (p) => {
    var m = p.match(/\/([tfc])[1-9][0-9]*/);
    if (!m) return "";
    return m[1];
};

export const get_res_id = (p) => {
    var m = p.match(/\/[tfc]([1-9][0-9]*)(p[1-9][0-9]*)?-/);
    if (!m) m = p.match(/^\/u([1-9][0-9]*)[a-z]*$/);
    if (!m) return 0;
    return +m[1];
};

export const getBasicVariableInnerHTML = (el, arr) => {
    const obj = {};
    arr.forEach((item) => {
        const elem = el.querySelector(`var[title="${item}"]`);
        const name = item.split("_")[1] || item;
        if (elem) obj[name] = elem.innerHTML;
    });
    return obj;
};

export const getLinkAndImage = (el, name) => {
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

export const extractLinkAndImage = (el, label) => {
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

export const getStrictText = (el) => {
    if (!el.textContent) return;
    return el.textContent.trim();
};

export const getStrictImg = (el) => {
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

export const getDateAndParse = (el) => {
    const date = el.querySelector("var[title*='date']");
    if (!date) return null;
    const text = date.textContent;
    const obj = {
        text: text,
        timestamp: parseUserDate(text),
    };
    return obj;
};
