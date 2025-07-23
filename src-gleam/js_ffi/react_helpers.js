// React FFI helper functions for Gleam

export function createTextNode(text) {
    return text;
}

export function createProps(className) {
    return {
        className: className
    };
}

export function createPropsWithStyle(className, style) {
    return {
        className: className,
        style: style
    };
}

export function createEmptyProps() {
    return {};
}

// Helper for creating props with arbitrary properties
export function createPropsObject(props) {
    return props || {};
}

// Helper for creating JavaScript objects from key-value pairs
export function createObjectFromPairs(pairs) {
    const obj = {};
    if (Array.isArray(pairs)) {
        pairs.forEach(([key, value]) => {
            obj[key] = value;
        });
    }
    return obj;
}

// Helper for safely extracting values from objects
export function getProperty(obj, key, defaultValue) {
    try {
        if (obj && typeof obj === 'object' && key in obj) {
            return obj[key];
        }
        return defaultValue;
    } catch (e) {
        return defaultValue;
    }
}

// Helper for creating CSS class names
export function createClassName(...classes) {
    return classes.filter(Boolean).join(' ');
}

// Helper for creating props with event handlers
export function createPropsWithHandler(className, eventName, handler) {
    const props = { className };
    if (eventName && handler) {
        props[eventName] = handler;
    }
    return props;
}

// Helper for converting Gleam lists to JavaScript arrays
export function gleamListToArray(gleamList) {
    if (!gleamList) return [];

    const result = [];
    let current = gleamList;

    while (current && current.length > 0) {
        result.push(current[0]);
        current = current[1];
    }

    return result;
}

// Helper for creating React elements with proper child handling
export function createElementWithChildren(tag, props, children) {
    const React = require('react');

    if (Array.isArray(children)) {
        return React.createElement(tag, props, ...children);
    } else if (children) {
        return React.createElement(tag, props, children);
    } else {
        return React.createElement(tag, props);
    }
}

// Helper for creating styled components
export function createStyledProps(className, styles) {
    return {
        className: className,
        style: styles || {}
    };
}

// Helper for handling dynamic props extraction - returns the raw value for Gleam to process
export function extractDynamicProp(obj, key, type, defaultValue) {
    try {
        if (!obj || typeof obj !== 'object') {
            return defaultValue;
        }

        const value = obj[key];

        // Return the raw value - let Gleam handle type checking
        return value !== undefined ? value : defaultValue;
    } catch (e) {
        return defaultValue;
    }
}

// Alternative extraction that returns the value directly without default fallback
export function extractProp(obj, key) {
    try {
        if (!obj || typeof obj !== 'object') {
            return undefined;
        }
        return obj[key];
    } catch (e) {
        return undefined;
    }
}

// Helper specifically for Gleam Result-style extraction
export function extractPropSafe(obj, key, type) {
    try {
        if (!obj || typeof obj !== 'object') {
            return { tag: "Error", values: ["Object not found"] };
        }

        const value = obj[key];

        if (value === undefined) {
            return { tag: "Error", values: ["Property not found"] };
        }

        // Basic type checking
        let isValidType = true;
        switch (type) {
            case 'string':
                isValidType = typeof value === 'string';
                break;
            case 'number':
                isValidType = typeof value === 'number';
                break;
            case 'boolean':
                isValidType = typeof value === 'boolean';
                break;
            case 'array':
                isValidType = Array.isArray(value);
                break;
            case 'object':
                isValidType = typeof value === 'object' && value !== null;
                break;
            default:
                isValidType = true; // Allow any type
        }

        if (isValidType) {
            return { tag: "Ok", values: [value] };
        } else {
            return { tag: "Error", values: [`Expected ${type}, got ${typeof value}`] };
        }
    } catch (e) {
        return { tag: "Error", values: [e.message] };
    }
}

// Helper for creating preview object for Mendix Studio Pro
export function createPreviewObject() {
    return {
        type: "Container",
        children: []
    };
}

// Helper for extracting string properties with default fallback
export function extractStringProp(obj, key, defaultValue) {
    try {
        if (!obj || typeof obj !== 'object') {
            return defaultValue;
        }

        const value = obj[key];

        if (typeof value === 'string') {
            return value;
        } else if (value !== undefined && value !== null) {
            return String(value);
        } else {
            return defaultValue;
        }
    } catch (e) {
        return defaultValue;
    }
}
