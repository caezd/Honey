import { textNodesUnder, get_res_id, slugify } from "../utils.js";

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

export function index_box(template, template_name) {
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
