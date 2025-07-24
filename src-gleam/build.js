#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const config = {
  srcGleamDir: __dirname,
  srcDir: path.join(__dirname, "..", "src"),
  templatesDir: path.join(__dirname, "templates"),
  jsFFIDir: path.join(__dirname, "js_ffi"),
  buildDir: path.join(__dirname, "build", "dev", "javascript"),
  packageJsonPath: path.join(__dirname, "..", "package.json"),
};

// Read and parse package.json
function getWidgetConfig() {
  try {
    const content = fs.readFileSync(config.packageJsonPath, "utf8");
    const packageJson = JSON.parse(content);

    return {
      widgetName: packageJson.widgetName,
      widgetNameLower: packageJson.widgetName.toLowerCase(),
      packagePath: packageJson.packagePath || "sbtglobal",
      version: packageJson.version || "1.0.0",
    };
  } catch (error) {
    throw new Error(`Failed to read package.json: ${error.message}`);
  }
}

// Ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Copy file
function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log(`Copied: ${dest}`);
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

// Process template with replacements
function processTemplate(templatePath, destPath, replacements) {
  let content = fs.readFileSync(templatePath, "utf8");

  Object.entries(replacements).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    content = content.replace(regex, value);
  });

  ensureDir(path.dirname(destPath));
  fs.writeFileSync(destPath, content, "utf8");
  console.log(`Generated: ${destPath}`);
}

// Generate main widget JSX file
function generateWidgetJSX(widgetConfig) {
  const content = `import { createElement } from "react";
import { mendix_widget_gleam } from "./build/dev/javascript/components/mendix/widget.mjs";
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

// Generate editor preview JSX file
function generateEditorPreviewJSX(widgetConfig) {
  const content = `import { createElement } from "react";
import { editor_preview } from "./build/dev/javascript/components/mendix/widget.mjs";

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

// Generate editor config JS file
function generateEditorConfigJS(widgetConfig) {
  const content = `import {
    get_properties,
    check,
    get_preview,
    get_custom_caption
} from "./build/dev/javascript/components/mendix/editor_config.mjs";

export function getProperties(values, defaultProperties, target) {
    return get_properties(values, defaultProperties, target);
}

export function getPreview(values, isDarkMode, version) {
    return get_preview(values, isDarkMode, version);
}

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

// Clean and setup destination directories
function cleanDestination() {
  const buildDestDir = path.join(config.srcDir, "build");

  if (fs.existsSync(buildDestDir)) {
    fs.rmSync(buildDestDir, { recursive: true, force: true });
  }

  ensureDir(buildDestDir);
}

// Copy entire Gleam build output with original structure
function copyGleamBuildOutput() {
  const buildDestDir = path.join(config.srcDir, "build", "dev", "javascript");

  if (fs.existsSync(config.buildDir)) {
    copyDir(config.buildDir, buildDestDir);
    console.log(`Copied Gleam build output to: ${buildDestDir}`);
  }

  // Copy FFI files to their respective locations within the build structure
  if (fs.existsSync(config.jsFFIDir)) {
    // Copy react_helpers_ffi.js to utils directory
    const reactHelpersFfiSrc = path.join(
      config.jsFFIDir,
      "react_helpers_ffi.js"
    );
    if (fs.existsSync(reactHelpersFfiSrc)) {
      const utilsDir = path.join(buildDestDir, "components", "utils");
      if (fs.existsSync(utilsDir)) {
        copyFile(
          reactHelpersFfiSrc,
          path.join(utilsDir, "react_helpers_ffi.js")
        );
      }
    }

    // Copy build_helpers_ffi.js to build directory
    const buildHelpersFfiSrc = path.join(
      config.jsFFIDir,
      "build_helpers_ffi.js"
    );
    if (fs.existsSync(buildHelpersFfiSrc)) {
      const buildDir = path.join(buildDestDir, "components", "build");
      if (fs.existsSync(buildDir)) {
        copyFile(
          buildHelpersFfiSrc,
          path.join(buildDir, "build_helpers_ffi.js")
        );
      }
    }
  }
}

// Process templates
function processTemplates(widgetConfig) {
  const replacements = {
    WIDGET_NAME: widgetConfig.widgetName,
    WIDGET_NAME_LOWER: widgetConfig.widgetNameLower,
    PACKAGE_PATH: widgetConfig.packagePath,
    VERSION: widgetConfig.version,
  };

  // Process XML template
  const xmlTemplate = path.join(config.templatesDir, "widget.xml");
  const xmlDest = path.join(config.srcDir, `${widgetConfig.widgetName}.xml`);
  if (fs.existsSync(xmlTemplate)) {
    processTemplate(xmlTemplate, xmlDest, replacements);
  }

  // Process package.xml template
  const packageXmlTemplate = path.join(config.templatesDir, "package.xml");
  const packageXmlDest = path.join(config.srcDir, "package.xml");
  if (fs.existsSync(packageXmlTemplate)) {
    processTemplate(packageXmlTemplate, packageXmlDest, replacements);
  }

  // Process CSS template
  const cssTemplate = path.join(config.templatesDir, "widget.css");
  const cssDest = path.join(
    config.srcDir,
    "ui",
    `${widgetConfig.widgetName}.css`
  );
  if (fs.existsSync(cssTemplate)) {
    ensureDir(path.join(config.srcDir, "ui"));
    processTemplate(cssTemplate, cssDest, replacements);
  }
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

    // Clean and setup
    cleanDestination();

    // Copy entire build output maintaining original structure
    copyGleamBuildOutput();

    // Generate JavaScript/JSX files with correct import paths
    generateWidgetJSX(widgetConfig);
    generateEditorPreviewJSX(widgetConfig);
    generateEditorConfigJS(widgetConfig);

    // Process templates
    processTemplates(widgetConfig);

    console.log("Build completed successfully!");
    console.log(`Generated files for widget: ${widgetConfig.widgetName}`);
    console.log("Build structure maintains Gleam's native import paths.");
  } catch (error) {
    console.error("Build failed:", error.message);
    process.exit(1);
  }
}

// Run build
if (require.main === module) {
  build();
}

module.exports = { build };
