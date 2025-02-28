import { getBasicVariableInnerHTML } from "../utils";
import { extractPagination } from "../general/pagination";

const extractContactImages = (el) => {
    const contacts = el.querySelectorAll('[title^="contact"]');
    const obj = {};
    contacts.forEach((contact) => {
        const type = contact.title;
        const link = contact.querySelector("a");
        const img = contact.querySelector("img");

        if (link && img) {
            obj[type] = {
                link_url: link.href,
                link_title: link.title,
                img_url: img.src,
                img_alt: img.alt,
                img_element: img,
            };
        }
    });
    return obj;
};

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
        ...extractContactImages(member),
    };

    return memberObj;
};

export function memberlist_body(template) {
    const data = {
        page: {},
        pagination: extractPagination(template),
        members: [],
    };

    template.querySelectorAll(".ref_member").forEach((member) => {
        data["members"].push(extractMember(member));
    });

    return data;
}
