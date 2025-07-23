import {
    get_properties,
    check,
    get_preview,
    get_custom_caption
} from "./gleam/editor_config.mjs";

/**
 * @typedef Property
 * @type {object}
 * @property {string} key
 * @property {string} caption
 * @property {string} description
 * @property {string[]} objectHeaders
 * @property {ObjectProperties[]} objects
 * @property {Properties[]} properties
 */

/**
 * @typedef Problem
 * @type {object}
 * @property {string} property
 * @property {("error" | "warning" | "deprecation")} severity
 * @property {string} message
 * @property {string} studioMessage
 * @property {string} url
 * @property {string} studioUrl
 */

/**
 * @param {object} values
 * @param {object} defaultProperties
 * @param {("web"|"desktop")} target
 * @returns {object}
 */
export function getProperties(values, defaultProperties, target) {
    return get_properties(values, defaultProperties, target);
}

/**
 * @param {object} values
 * @param {boolean} isDarkMode
 * @param {number[]} version
 * @returns {object}
 */
export function getPreview(values, isDarkMode, version) {
    return get_preview(values, isDarkMode, version);
}

/**
 * @param {Object} values
 * @param {("web"|"desktop")} platform
 * @returns {string}
 */
export function getCustomCaption(values, platform) {
    return get_custom_caption(values, platform);
}
