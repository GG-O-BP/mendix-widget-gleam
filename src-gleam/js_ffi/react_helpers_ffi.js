// Minimal FFI helpers for React operations

// Create a JavaScript object from key-value pairs
export function createPropsObject(pairs) {
  const obj = {};
  if (Array.isArray(pairs)) {
    pairs.forEach(([key, value]) => {
      obj[key] = value;
    });
  }
  return obj;
}

// Alternative name for the same function
export function createPropsObjectFromPairs(pairs) {
  return createPropsObject(pairs);
}

// Extract a property from an object (returns undefined if not found)
export function extractPropRaw(obj, key) {
  try {
    if (obj && typeof obj === "object") {
      return obj[key];
    }
    return undefined;
  } catch (e) {
    return undefined;
  }
}

// Check if a value is undefined
export function isUndefined(value) {
  return value === undefined;
}

// Convert any value to Dynamic (in JavaScript, this is just identity)
export function toDynamic(value) {
  return value;
}

// Create preview object for Mendix Studio Pro
export function createPreviewObject() {
  return {
    type: "Container",
    children: [],
  };
}

// Legacy compatibility functions (minimal implementations)
export function createTextNode(text) {
  return text;
}

export function createProps(className) {
  return { className: className };
}

export function createEmptyProps() {
  return {};
}

export function extractStringProp(obj, key, defaultValue) {
  try {
    if (!obj || typeof obj !== "object") {
      return defaultValue;
    }
    const value = obj[key];
    if (typeof value === "string") {
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

// Extract integer property with default fallback
export function extractIntProp(obj, key, defaultValue) {
  try {
    if (!obj || typeof obj !== "object") {
      return defaultValue;
    }

    const value = obj[key];

    if (typeof value === "number" && Number.isInteger(value)) {
      return value;
    } else if (typeof value === "string") {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? defaultValue : parsed;
    } else {
      return defaultValue;
    }
  } catch (e) {
    return defaultValue;
  }
}

// Extract boolean property with default fallback
export function extractBoolProp(obj, key, defaultValue) {
  try {
    if (!obj || typeof obj !== "object") {
      return defaultValue;
    }

    const value = obj[key];

    if (typeof value === "boolean") {
      return value;
    } else if (typeof value === "string") {
      const lower = value.toLowerCase();
      if (lower === "true" || lower === "1") return true;
      if (lower === "false" || lower === "0") return false;
      return defaultValue;
    } else if (typeof value === "number") {
      return value !== 0;
    } else {
      return defaultValue;
    }
  } catch (e) {
    return defaultValue;
  }
}
