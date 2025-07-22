import { createElement } from "react";
import { hello_world } from "./gleam/hello_world.mjs";

export function preview({ sampleText }) {
    return hello_world(sampleText);
}

export function getPreviewCss() {
    return require("./ui/MendixWidgetGleam.css");
}
