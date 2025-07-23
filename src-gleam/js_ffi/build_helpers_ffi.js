// Build helpers FFI for executing shell commands

import { execSync } from "child_process";
import path from "path";

// Execute a shell command in a specific directory
export function execCommand(command, cwd) {
  try {
    const result = execSync(command, {
      cwd: cwd,
      encoding: "utf8",
      stdio: ["inherit", "pipe", "pipe"],
    });

    return { tag: "Ok", values: [result] };
  } catch (error) {
    const errorMessage = error.message || "Command execution failed";
    return { tag: "Error", values: [errorMessage] };
  }
}

// Check if a path exists
export function pathExists(filePath) {
  try {
    import("fs")
      .then((fs) => {
        return fs.existsSync(filePath);
      })
      .catch(() => false);
  } catch (e) {
    return false;
  }
}

// Get current working directory
export function getCurrentDir() {
  return process.cwd();
}

// Join paths (platform-independent)
export function joinPaths(parts) {
  if (!Array.isArray(parts) || parts.length === 0) {
    return "";
  }
  return path.join(...parts);
}

// Get directory name from path
export function getDirname(filePath) {
  return path.dirname(filePath);
}

// Get basename from path
export function getBasename(filePath) {
  return path.basename(filePath);
}

// Check if path is absolute
export function isAbsolute(filePath) {
  return path.isAbsolute(filePath);
}

// Resolve path
export function resolvePath(filePath) {
  return path.resolve(filePath);
}

// Extract a field from a JSON object
export function extractJsonField(jsonObj, fieldName) {
  try {
    if (jsonObj && typeof jsonObj === "object") {
      return jsonObj[fieldName];
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

// Parse JSON string and return Result-style object
export function parseJson(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    return { tag: "Ok", values: [parsed] };
  } catch (error) {
    const errorMessage = error.message || "Invalid JSON";
    return { tag: "Error", values: [errorMessage] };
  }
}

// Convert dynamic value to string safely
export function convertToString(value) {
  try {
    if (typeof value === "string") {
      return { tag: "Ok", values: [value] };
    } else if (value !== undefined && value !== null) {
      return { tag: "Ok", values: [String(value)] };
    } else {
      return { tag: "Error", values: ["Value is null or undefined"] };
    }
  } catch (error) {
    const errorMessage = error.message || "Failed to convert to string";
    return { tag: "Error", values: [errorMessage] };
  }
}
