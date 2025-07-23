const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const config = {
  srcGleamDir: path.join(__dirname),
  srcDir: path.join(__dirname, "..", "src"),
  templatesDir: path.join(__dirname, "templates"),
  jsFFIDir: path.join(__dirname, "js_ffi"),
  buildDir: path.join(__dirname, "build", "dev", "javascript"),
  packageJsonPath: path.join(__dirname, "..", "package.json"),
};

// Read package.json to get widget name
function getWidgetConfig() {
  const packageJson = JSON.parse(
    fs.readFileSync(config.packageJsonPath, "utf8")
  );
  return {
    widgetName: packageJson.widgetName,
    widgetNameLower: packageJson.widgetName.toLowerCase(),
    packagePath: packageJson.packagePath || "ggobp",
    version: packageJson.version || "1.0.0",
  };
}

// Ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Copy file with template replacement
function copyTemplate(templatePath, destPath, replacements) {
  let content = fs.readFileSync(templatePath, "utf8");

  // Replace all template placeholders
  Object.entries(replacements).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    content = content.replace(regex, value);
  });

  ensureDir(path.dirname(destPath));
  fs.writeFileSync(destPath, content, "utf8");
  console.log(`Generated: ${destPath}`);
}

// Copy file without modification
function copyFile(srcPath, destPath) {
  ensureDir(path.dirname(destPath));
  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied: ${destPath}`);
}

// Copy directory recursively
function copyDir(srcDir, destDir) {
  ensureDir(destDir);
  const items = fs.readdirSync(srcDir);

  items.forEach((item) => {
    const srcPath = path.join(srcDir, item);
    const destPath = path.join(destDir, item);

    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  });
}

// Fix import paths in generated JavaScript files
function fixImportPaths(filePath, replacements) {
  let content = fs.readFileSync(filePath, "utf8");

  // Fix relative import paths
  replacements.forEach(([from, to]) => {
    content = content.replace(new RegExp(from, "g"), to);
  });

  fs.writeFileSync(filePath, content, "utf8");
}

// Generate JSX wrapper for main widget
function generateWidgetJSX(widgetConfig) {
  const content = `import { createElement } from "react";
import { mendix_widget_gleam } from "./gleam/widget.mjs";
import "./ui/${widgetConfig.widgetName}.css";

export function ${widgetConfig.widgetName}(props) {
    return mendix_widget_gleam(props);
}
`;

  const destPath = path.join(config.srcDir, `${widgetConfig.widgetName}.jsx`);
  ensureDir(path.dirname(destPath));
  fs.writeFileSync(destPath, content, "utf8");
  console.log(`Generated: ${destPath}`);
}

// Generate JSX wrapper for editor preview
function generateEditorPreviewJSX(widgetConfig) {
  const content = `import { createElement } from "react";
import { editor_preview, get_preview_css } from "./gleam/widget.mjs";

export function preview(props) {
    return editor_preview(props);
}

export function getPreviewCss() {
    return require("./ui/${widgetConfig.widgetName}.css");
}
`;

  const destPath = path.join(
    config.srcDir,
    `${widgetConfig.widgetName}.editorPreview.jsx`
  );
  ensureDir(path.dirname(destPath));
  fs.writeFileSync(destPath, content, "utf8");
  console.log(`Generated: ${destPath}`);
}

// Generate editor config JS
function generateEditorConfigJS(widgetConfig) {
  const content = `import {
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
`;

  const destPath = path.join(
    config.srcDir,
    `${widgetConfig.widgetName}.editorConfig.js`
  );
  ensureDir(path.dirname(destPath));
  fs.writeFileSync(destPath, content, "utf8");
  console.log(`Generated: ${destPath}`);
}

// Main build function
function build() {
  console.log("Starting Gleam to Mendix Widget build...");

  try {
    // Get widget configuration
    const widgetConfig = getWidgetConfig();
    console.log(`Building widget: ${widgetConfig.widgetName}`);

    // Build Gleam code
    console.log("Building Gleam code...");
    execSync("gleam build", {
      cwd: config.srcGleamDir,
      stdio: "inherit",
    });

    // Clean and create src directory structure
    const srcGleamDestDir = path.join(config.srcDir, "gleam");
    if (fs.existsSync(srcGleamDestDir)) {
      fs.rmSync(srcGleamDestDir, { recursive: true, force: true });
    }
    ensureDir(srcGleamDestDir);

    // Copy built Gleam files
    const gleamBuildComponentsDir = path.join(config.buildDir, "components");
    const gleamStdlibDir = path.join(config.buildDir, "gleam_stdlib");
    const preludePath = path.join(config.buildDir, "prelude.mjs");

    // Copy component files
    if (fs.existsSync(gleamBuildComponentsDir)) {
      const componentFiles = fs.readdirSync(gleamBuildComponentsDir);
      componentFiles.forEach((file) => {
        if (file.endsWith(".mjs")) {
          copyFile(
            path.join(gleamBuildComponentsDir, file),
            path.join(srcGleamDestDir, file)
          );
        }
      });
    }

    // Copy stdlib
    if (fs.existsSync(gleamStdlibDir)) {
      copyDir(gleamStdlibDir, path.join(srcGleamDestDir, "gleam_stdlib"));
    }

    // Copy prelude
    if (fs.existsSync(preludePath)) {
      copyFile(preludePath, path.join(srcGleamDestDir, "prelude.mjs"));
    }

    // Copy JS FFI helpers
    if (fs.existsSync(config.jsFFIDir)) {
      const ffiFiles = fs.readdirSync(config.jsFFIDir);
      ffiFiles.forEach((file) => {
        copyFile(
          path.join(config.jsFFIDir, file),
          path.join(srcGleamDestDir, file)
        );
      });
    }

    // Fix import paths in copied files
    const importReplacements = [
      ["../gleam_stdlib/", "./gleam_stdlib/"],
      ["../js_ffi/", "./"],
      ["../prelude.mjs", "./prelude.mjs"],
    ];

    const gleamFiles = fs
      .readdirSync(srcGleamDestDir)
      .filter((f) => f.endsWith(".mjs"));
    gleamFiles.forEach((file) => {
      fixImportPaths(path.join(srcGleamDestDir, file), importReplacements);
    });

    // Generate JSX/JS files
    generateWidgetJSX(widgetConfig);
    generateEditorPreviewJSX(widgetConfig);
    generateEditorConfigJS(widgetConfig);

    // Process and copy template files
    const templateReplacements = {
      WIDGET_NAME: widgetConfig.widgetName,
      WIDGET_NAME_LOWER: widgetConfig.widgetNameLower,
      PACKAGE_PATH: widgetConfig.packagePath,
      VERSION: widgetConfig.version,
    };

    // Copy and process XML template
    const xmlTemplatePath = path.join(config.templatesDir, "widget.xml");
    const xmlDestPath = path.join(
      config.srcDir,
      `${widgetConfig.widgetName}.xml`
    );
    if (fs.existsSync(xmlTemplatePath)) {
      copyTemplate(xmlTemplatePath, xmlDestPath, templateReplacements);
    }

    // Copy and process package.xml template
    const packageXmlTemplatePath = path.join(
      config.templatesDir,
      "package.xml"
    );
    const packageXmlDestPath = path.join(config.srcDir, "package.xml");
    if (fs.existsSync(packageXmlTemplatePath)) {
      copyTemplate(
        packageXmlTemplatePath,
        packageXmlDestPath,
        templateReplacements
      );
    }

    // Copy and process CSS template
    const cssTemplatePath = path.join(config.templatesDir, "widget.css");
    const cssDestPath = path.join(
      config.srcDir,
      "ui",
      `${widgetConfig.widgetName}.css`
    );
    if (fs.existsSync(cssTemplatePath)) {
      ensureDir(path.join(config.srcDir, "ui"));
      copyTemplate(cssTemplatePath, cssDestPath, templateReplacements);
    }

    console.log("Build completed successfully!");
    console.log(`Generated files for widget: ${widgetConfig.widgetName}`);
  } catch (error) {
    console.error("Build failed:", error.message);
    process.exit(1);
  }
}

// Run build if called directly
if (require.main === module) {
  build();
}

module.exports = { build };
