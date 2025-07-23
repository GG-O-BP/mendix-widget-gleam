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

// Fix import paths in JavaScript files
function fixImportPaths(filePath, replacements) {
  let content = fs.readFileSync(filePath, "utf8");

  replacements.forEach(([from, to]) => {
    content = content.replace(new RegExp(from, "g"), to);
  });

  fs.writeFileSync(filePath, content, "utf8");
}

// Generate main widget JSX file
function generateWidgetJSX(widgetConfig) {
  const content = `import { createElement } from "react";
import { mendix_widget_gleam } from "./gleam/mendix/widget.mjs";
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
import { editor_preview } from "./gleam/mendix/widget.mjs";

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
`;

  const destPath = path.join(
    config.srcDir,
    `${widgetConfig.widgetName}.editorConfig.js`
  );
  ensureDir(path.dirname(destPath));
  fs.writeFileSync(destPath, content, "utf8");
  console.log(`Generated: ${destPath}`);
}

// Clean and recreate gleam destination directory
function cleanGleamDest() {
  const gleamDestDir = path.join(config.srcDir, "gleam");

  if (fs.existsSync(gleamDestDir)) {
    fs.rmSync(gleamDestDir, { recursive: true, force: true });
  }

  ensureDir(gleamDestDir);
}

// Copy built Gleam files
function copyGleamFiles() {
  const gleamDestDir = path.join(config.srcDir, "gleam");
  const stdlibDir = path.join(config.buildDir, "gleam_stdlib");
  const preludePath = path.join(config.buildDir, "prelude.mjs");

  // Copy contents of components directory directly to gleam directory
  const componentsDir = path.join(config.buildDir, "components");
  if (fs.existsSync(componentsDir)) {
    const componentContents = fs.readdirSync(componentsDir);
    componentContents.forEach((item) => {
      const srcPath = path.join(componentsDir, item);
      const destPath = path.join(gleamDestDir, item);
      if (fs.statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        copyFile(srcPath, destPath);
      }
    });
  }

  // Also copy any standalone .mjs files in the build root
  if (fs.existsSync(config.buildDir)) {
    const files = fs.readdirSync(config.buildDir);
    const mjsFiles = files.filter(
      (file) => file.endsWith(".mjs") && file !== "prelude.mjs"
    );

    mjsFiles.forEach((file) => {
      copyFile(path.join(config.buildDir, file), path.join(gleamDestDir, file));
    });
  }

  // Copy stdlib
  if (fs.existsSync(stdlibDir)) {
    copyDir(stdlibDir, path.join(gleamDestDir, "gleam_stdlib"));
  }

  // Copy prelude
  if (fs.existsSync(preludePath)) {
    copyFile(preludePath, path.join(gleamDestDir, "prelude.mjs"));
  }

  // Copy FFI helpers to their respective module directories
  if (fs.existsSync(config.jsFFIDir)) {
    // Copy react_helpers_ffi.js to utils directory (matches utils/react_helpers.gleam)
    const reactHelpersFfi = path.join(config.jsFFIDir, "react_helpers_ffi.js");
    if (fs.existsSync(reactHelpersFfi)) {
      const utilsDir = path.join(gleamDestDir, "utils");
      if (fs.existsSync(utilsDir)) {
        copyFile(reactHelpersFfi, path.join(utilsDir, "react_helpers_ffi.js"));
      }
    }

    // Copy build_helpers_ffi.js to build directory (matches build/build_widget.gleam)
    const buildHelpersFfi = path.join(config.jsFFIDir, "build_helpers_ffi.js");
    if (fs.existsSync(buildHelpersFfi)) {
      const buildDir = path.join(gleamDestDir, "build");
      if (fs.existsSync(buildDir)) {
        copyFile(buildHelpersFfi, path.join(buildDir, "build_helpers_ffi.js"));
      }
    }
  }
}

// Fix import paths in copied files
function fixGleamImports() {
  const gleamDestDir = path.join(config.srcDir, "gleam");

  // Consistent import replacements for all files
  const importReplacements = [
    ["../js_ffi/", "./"],
    ["../../gleam_stdlib/", "../gleam_stdlib/"],
    ["../prelude.mjs", "./prelude.mjs"],
  ];
  const importReplacementsStdlib = [["../prelude.mjs", "../prelude.mjs"]];

  // Recursively process all .mjs files in the gleam directory
  function processDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);

    items.forEach((item) => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        // Recursively process subdirectories
        processDirectory(itemPath);
      } else if (item.endsWith(".mjs")) {
        // Process .mjs files with consistent replacements
        if (itemPath.includes("gleam_stdlib")) {
          fixImportPaths(itemPath, importReplacementsStdlib);
        } else {
          fixImportPaths(itemPath, importReplacements);
        }
      }
    });
  }

  processDirectory(gleamDestDir);
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
    cleanGleamDest();
    copyGleamFiles();
    fixGleamImports();

    // Generate JavaScript/JSX files
    generateWidgetJSX(widgetConfig);
    generateEditorPreviewJSX(widgetConfig);
    generateEditorConfigJS(widgetConfig);

    // Process templates
    processTemplates(widgetConfig);

    console.log("Build completed successfully!");
    console.log(`Generated files for widget: ${widgetConfig.widgetName}`);
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
