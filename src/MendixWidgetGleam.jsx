import { createElement } from "react";
import { mendix_widget_gleam } from "./build/dev/javascript/components/mendix/widget.mjs";
import "./ui/MendixWidgetGleam.css";

export function MendixWidgetGleam(props) {
    return mendix_widget_gleam(props);
}
