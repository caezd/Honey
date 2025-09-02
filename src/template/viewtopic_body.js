import {
    getBasicVariableInnerHTML,
    extractLinkAndImage,
    getStrictText,
    getStrictImg,
    slugify,
    getDateAndParse,
    getNumbersFromText,
} from "../utils";
import { extractPagination } from "../general/pagination";
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

export function viewtopic_body(template) {
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
