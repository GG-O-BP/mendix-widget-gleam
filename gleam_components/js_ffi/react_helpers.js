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
