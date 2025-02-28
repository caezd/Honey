export const textNodesUnder = (el) => {
    var n,
        a = [],
        walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    while ((n = walk.nextNode())) a.push(n);
    return a;
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
        if (elem) obj[item] = elem.innerHTML;
    });
    return obj;
};
