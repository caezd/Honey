import { getBasicVariableInnerHTML, extractLinkAndImage } from "../utils";
import { extractPagination } from "../general/pagination";

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

export function memberlist_body(template) {
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
