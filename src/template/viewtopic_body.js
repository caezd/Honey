import { getBasicVariableInnerHTML } from "../utils";
import { extractPagination } from "../general/pagination";

const extractPost = (post) => {
    const basicVariables = ["id", "body"];

    const postObj = {
        ...getBasicVariableInnerHTML(post, basicVariables),
    };

    console.log(postObj);

    return postObj;
};

export function viewtopic_body(template) {
    const data = {
        page: {},
        pagination: extractPagination(template),
        posts: [],
    };

    template.querySelectorAll(".ref_post").forEach((ref) => {
        data["posts"].push(extractPost(ref));
    });

    return data;
}
