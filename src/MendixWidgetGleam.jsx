import { createElement } from "react";

import { hello_world } from "./gleam/hello_world.mjs";
import "./ui/MendixWidgetGleam.css";

export function MendixWidgetGleam({ sampleText }) {
    return hello_world(sampleText);
}
