import potion from "@poumon/potion";
import { index_box } from "./template/index_box.js";
import { memberlist_body } from "./template/memberlist_body.js";
import { viewtopic_body } from "./template/viewtopic_body.js";

const ENABLED_TEMPLATES = ["index_box", "memberlist_body", "viewtopic_body"];

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
    }

    return data;
};

const DEFAULT_OPTIONS = {
    sync: true,
};

window.$honey = {};

var Component = function (options) {
    this.options = { ...DEFAULT_OPTIONS, ...options };

    this.init();
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
        console.log(window.$honey[template_name]);
    });
};

Component.prototype.render = function (template, data) {};

export default Component;
