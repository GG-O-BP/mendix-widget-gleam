import {
    get_properties,
    check,
    get_preview,
    get_custom_caption
} from "./gleam/mendix/editor_config.mjs";

export function getProperties(values, defaultProperties, target) {
    return get_properties(values, defaultProperties, target);
}

export function getPreview(values, isDarkMode, version) {
    return get_preview(values, isDarkMode, version);
}

export function getCustomCaption(values, platform) {
    return get_custom_caption(values, platform);
}
