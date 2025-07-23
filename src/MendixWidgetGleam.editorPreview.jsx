import { createElement } from "react";
import { editor_preview } from "./gleam/mendix/widget.mjs";

export function preview(props) {
    return editor_preview(props);
}

export function getPreviewCss() {
    return require("./ui/MendixWidgetGleam.css");
}
