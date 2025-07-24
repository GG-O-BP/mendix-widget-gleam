import { createElement } from "react";
import { editor_preview } from "./build/dev/javascript/components/mendix/widget.mjs";

export function preview(props) {
    return editor_preview(props);
}

export function getPreviewCss() {
    return require("./ui/MendixWidgetGleam.css");
}
