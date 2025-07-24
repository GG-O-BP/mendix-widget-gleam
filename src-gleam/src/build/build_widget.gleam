import filepath
import gleam/dict.{type Dict}
import gleam/dynamic.{type Dynamic}
import gleam/io

import gleam/list
import gleam/result
import gleam/string
import simplifile

// Configuration type
pub type BuildConfig {
  BuildConfig(
    src_gleam_dir: String,
    src_dir: String,
    templates_dir: String,
    js_ffi_dir: String,
    build_dir: String,
    package_json_path: String,
  )
}

// Widget configuration type
pub type WidgetConfig {
  WidgetConfig(
    widget_name: String,
    widget_name_lower: String,
    package_path: String,
    version: String,
  )
}

// Create default build configuration
pub fn default_config() -> BuildConfig {
  let current_dir = "."
  BuildConfig(
    src_gleam_dir: current_dir,
    src_dir: filepath.join(current_dir, "../src"),
    templates_dir: filepath.join(current_dir, "templates"),
    js_ffi_dir: filepath.join(current_dir, "js_ffi"),
    build_dir: filepath.join(current_dir, "build/dev/javascript"),
    package_json_path: filepath.join(current_dir, "../package.json"),
  )
}

// Read and parse package.json
pub fn get_widget_config(config: BuildConfig) -> Result(WidgetConfig, String) {
  use content <- result.try(case simplifile.read(config.package_json_path) {
    Ok(content) -> Ok(content)
    Error(_) -> Error("Failed to read package.json")
  })

  use json_value <- result.try(case parse_json(content) {
    Ok(value) -> Ok(value)
    Error(msg) -> Error("Failed to parse package.json: " <> msg)
  })

  use widget_name <- result.try(extract_string_field(json_value, "widgetName"))
  use package_path <- result.try(
    extract_string_field(json_value, "packagePath")
    |> result.or(Ok("empty")),
  )
  use version <- result.try(
    extract_string_field(json_value, "version")
    |> result.or(Ok("1.0.0")),
  )

  Ok(WidgetConfig(
    widget_name: widget_name,
    widget_name_lower: string.lowercase(widget_name),
    package_path: package_path,
    version: version,
  ))
}

// Extract string field from dynamic JSON using FFI
fn extract_string_field(json: Dynamic, field: String) -> Result(String, String) {
  case extract_json_field(json, field) {
    value ->
      case is_undefined(value) {
        True -> Error("Field " <> field <> " not found")
        False ->
          case convert_to_string(value) {
            Ok(str) -> Ok(str)
            Error(msg) ->
              Error("Field " <> field <> " is not a string: " <> msg)
          }
      }
  }
}

// FFI function to parse JSON string
@external(javascript, "./build_helpers_ffi.js", "parseJson")
fn parse_json(json_string: String) -> Result(Dynamic, String)

// FFI function to extract field from JSON object
@external(javascript, "./build_helpers_ffi.js", "extractJsonField")
fn extract_json_field(json: Dynamic, field: String) -> Dynamic

// FFI function to check if value is undefined
@external(javascript, "./build_helpers_ffi.js", "isUndefined")
fn is_undefined(value: Dynamic) -> Bool

// FFI function to convert dynamic value to string safely
@external(javascript, "./build_helpers_ffi.js", "convertToString")
fn convert_to_string(value: Dynamic) -> Result(String, String)

// Execute shell command (using FFI)
@external(javascript, "./build_helpers_ffi.js", "execCommand")
fn exec_command(command: String, cwd: String) -> Result(String, String)

// Build Gleam code
pub fn build_gleam(config: BuildConfig) -> Result(Nil, String) {
  io.println("Building Gleam code...")
  case exec_command("gleam build", config.src_gleam_dir) {
    Ok(_) -> Ok(Nil)
    Error(msg) -> Error("Gleam build failed: " <> msg)
  }
}

// Copy file
pub fn copy_file(src: String, dest: String) -> Result(Nil, String) {
  use content <- result.try(case simplifile.read(src) {
    Ok(content) -> Ok(content)
    Error(_) -> Error("Failed to read source file: " <> src)
  })

  use _ <- result.try(ensure_dir(filepath.directory_name(dest)))

  case simplifile.write(dest, content) {
    Ok(_) -> {
      io.println("Copied: " <> dest)
      Ok(Nil)
    }
    Error(_) -> Error("Failed to write file: " <> dest)
  }
}

// Ensure directory exists
pub fn ensure_dir(dir_path: String) -> Result(Nil, String) {
  case simplifile.create_directory_all(dir_path) {
    Ok(_) -> Ok(Nil)
    Error(_) -> Error("Failed to create directory: " <> dir_path)
  }
}

// Copy directory recursively
pub fn copy_dir(src_dir: String, dest_dir: String) -> Result(Nil, String) {
  use _ <- result.try(ensure_dir(dest_dir))

  use files <- result.try(case simplifile.read_directory(src_dir) {
    Ok(files) -> Ok(files)
    Error(_) -> Error("Failed to read directory: " <> src_dir)
  })

  list.try_each(files, fn(file) {
    let src_path = filepath.join(src_dir, file)
    let dest_path = filepath.join(dest_dir, file)

    case simplifile.is_directory(src_path) {
      Ok(True) -> copy_dir(src_path, dest_path)
      Ok(False) -> copy_file(src_path, dest_path)
      Error(_) -> Error("Failed to check if path is directory: " <> src_path)
    }
  })
}

// Process template with replacements
pub fn process_template(
  template_path: String,
  dest_path: String,
  replacements: Dict(String, String),
) -> Result(Nil, String) {
  use content <- result.try(case simplifile.read(template_path) {
    Ok(content) -> Ok(content)
    Error(_) -> Error("Failed to read template: " <> template_path)
  })

  let processed_content =
    dict.fold(replacements, content, fn(acc, key, value) {
      string.replace(acc, "{{" <> key <> "}}", value)
    })

  use _ <- result.try(ensure_dir(filepath.directory_name(dest_path)))

  case simplifile.write(dest_path, processed_content) {
    Ok(_) -> {
      io.println("Generated: " <> dest_path)
      Ok(Nil)
    }
    Error(_) -> Error("Failed to write processed template: " <> dest_path)
  }
}

// Fix import paths in JavaScript files
pub fn fix_import_paths(
  file_path: String,
  replacements: List(#(String, String)),
) -> Result(Nil, String) {
  use content <- result.try(case simplifile.read(file_path) {
    Ok(content) -> Ok(content)
    Error(_) -> Error("Failed to read file for import fixing: " <> file_path)
  })

  let fixed_content =
    list.fold(replacements, content, fn(acc, replacement) {
      let #(from, to) = replacement
      string.replace(acc, from, to)
    })

  case simplifile.write(file_path, fixed_content) {
    Ok(_) -> Ok(Nil)
    Error(_) -> Error("Failed to write fixed imports: " <> file_path)
  }
}

// Generate main widget JSX file
pub fn generate_widget_jsx(
  config: BuildConfig,
  widget_config: WidgetConfig,
) -> Result(Nil, String) {
  let content =
    "import { createElement } from \"react\";\n"
    <> "import { mendix_widget_gleam } from \"./gleam/widget.mjs\";\n"
    <> "import \"./ui/"
    <> widget_config.widget_name
    <> ".css\";\n\n"
    <> "export function "
    <> widget_config.widget_name
    <> "(props) {\n"
    <> "    return mendix_widget_gleam(props);\n"
    <> "}\n"

  let dest_path =
    filepath.join(config.src_dir, widget_config.widget_name <> ".jsx")

  use _ <- result.try(ensure_dir(filepath.directory_name(dest_path)))

  case simplifile.write(dest_path, content) {
    Ok(_) -> {
      io.println("Generated: " <> dest_path)
      Ok(Nil)
    }
    Error(_) -> Error("Failed to write widget JSX: " <> dest_path)
  }
}

// Generate editor preview JSX file
pub fn generate_editor_preview_jsx(
  config: BuildConfig,
  widget_config: WidgetConfig,
) -> Result(Nil, String) {
  let content =
    "import { createElement } from \"react\";\n"
    <> "import { editor_preview } from \"./gleam/widget.mjs\";\n\n"
    <> "export function preview(props) {\n"
    <> "    return editor_preview(props);\n"
    <> "}\n\n"
    <> "export function getPreviewCss() {\n"
    <> "    return require(\"./ui/"
    <> widget_config.widget_name
    <> ".css\");\n"
    <> "}\n"

  let dest_path =
    filepath.join(
      config.src_dir,
      widget_config.widget_name <> ".editorPreview.jsx",
    )

  use _ <- result.try(ensure_dir(filepath.directory_name(dest_path)))

  case simplifile.write(dest_path, content) {
    Ok(_) -> {
      io.println("Generated: " <> dest_path)
      Ok(Nil)
    }
    Error(_) -> Error("Failed to write editor preview JSX: " <> dest_path)
  }
}

// Generate editor config JS file
pub fn generate_editor_config_js(
  config: BuildConfig,
  widget_config: WidgetConfig,
) -> Result(Nil, String) {
  let content =
    "import {\n"
    <> "    get_properties,\n"
    <> "    check,\n"
    <> "    get_preview,\n"
    <> "    get_custom_caption\n"
    <> "} from \"./gleam/editor_config.mjs\";\n\n"
    <> "export function getProperties(values, defaultProperties, target) {\n"
    <> "    return get_properties(values, defaultProperties, target);\n"
    <> "}\n\n"
    <> "export function getPreview(values, isDarkMode, version) {\n"
    <> "    return get_preview(values, isDarkMode, version);\n"
    <> "}\n\n"
    <> "export function getCustomCaption(values, platform) {\n"
    <> "    return get_custom_caption(values, platform);\n"
    <> "}\n"

  let dest_path =
    filepath.join(
      config.src_dir,
      widget_config.widget_name <> ".editorConfig.js",
    )

  use _ <- result.try(ensure_dir(filepath.directory_name(dest_path)))

  case simplifile.write(dest_path, content) {
    Ok(_) -> {
      io.println("Generated: " <> dest_path)
      Ok(Nil)
    }
    Error(_) -> Error("Failed to write editor config JS: " <> dest_path)
  }
}

// Clean and recreate gleam destination directory
pub fn clean_gleam_dest(config: BuildConfig) -> Result(Nil, String) {
  let gleam_dest_dir = filepath.join(config.src_dir, "gleam")

  case simplifile.delete(gleam_dest_dir) {
    Ok(_) | Error(_) -> Nil
    // Ignore if directory doesn't exist
  }

  ensure_dir(gleam_dest_dir)
}

// Copy built Gleam files
pub fn copy_gleam_files(config: BuildConfig) -> Result(Nil, String) {
  let gleam_dest_dir = filepath.join(config.src_dir, "gleam")
  let components_dir = filepath.join(config.build_dir, "components")
  let stdlib_dir = filepath.join(config.build_dir, "gleam_stdlib")
  let prelude_path = filepath.join(config.build_dir, "prelude.mjs")

  // Copy component files
  use _ <- result.try(case simplifile.is_directory(components_dir) {
    Ok(True) -> {
      use files <- result.try(case simplifile.read_directory(components_dir) {
        Ok(files) -> Ok(files)
        Error(_) -> Error("Failed to read components directory")
      })

      let mjs_files =
        list.filter(files, fn(file) { string.ends_with(file, ".mjs") })

      list.try_each(mjs_files, fn(file) {
        copy_file(
          filepath.join(components_dir, file),
          filepath.join(gleam_dest_dir, file),
        )
      })
    }
    Ok(False) | Error(_) -> Ok(Nil)
  })

  // Copy stdlib
  use _ <- result.try(case simplifile.is_directory(stdlib_dir) {
    Ok(True) ->
      copy_dir(stdlib_dir, filepath.join(gleam_dest_dir, "gleam_stdlib"))
    Ok(False) | Error(_) -> Ok(Nil)
  })

  // Copy prelude
  use _ <- result.try(case simplifile.is_file(prelude_path) {
    Ok(True) ->
      copy_file(prelude_path, filepath.join(gleam_dest_dir, "prelude.mjs"))
    Ok(False) | Error(_) -> Ok(Nil)
  })

  // Copy FFI helpers
  case simplifile.is_directory(config.js_ffi_dir) {
    Ok(True) -> {
      use files <- result.try(
        case simplifile.read_directory(config.js_ffi_dir) {
          Ok(files) -> Ok(files)
          Error(_) -> Error("Failed to read FFI directory")
        },
      )

      list.try_each(files, fn(file) {
        copy_file(
          filepath.join(config.js_ffi_dir, file),
          filepath.join(gleam_dest_dir, file),
        )
      })
    }
    Ok(False) | Error(_) -> Ok(Nil)
  }
}

// Fix import paths in copied files
pub fn fix_gleam_imports(config: BuildConfig) -> Result(Nil, String) {
  let gleam_dest_dir = filepath.join(config.src_dir, "gleam")

  let import_replacements = [
    #("../gleam_stdlib/", "./gleam_stdlib/"),
    #("../js_ffi/", "./"),
    #("../prelude.mjs", "./prelude.mjs"),
  ]

  use files <- result.try(case simplifile.read_directory(gleam_dest_dir) {
    Ok(files) -> Ok(files)
    Error(_) -> Error("Failed to read gleam destination directory")
  })

  let mjs_files =
    list.filter(files, fn(file) { string.ends_with(file, ".mjs") })

  list.try_each(mjs_files, fn(file) {
    fix_import_paths(filepath.join(gleam_dest_dir, file), import_replacements)
  })
}

// Process templates
pub fn process_templates(
  config: BuildConfig,
  widget_config: WidgetConfig,
) -> Result(Nil, String) {
  let replacements =
    dict.from_list([
      #("WIDGET_NAME", widget_config.widget_name),
      #("WIDGET_NAME_LOWER", widget_config.widget_name_lower),
      #("PACKAGE_PATH", widget_config.package_path),
      #("VERSION", widget_config.version),
    ])

  // Process XML template
  use _ <- result.try({
    let xml_template = filepath.join(config.templates_dir, "widget.xml")
    let xml_dest =
      filepath.join(config.src_dir, widget_config.widget_name <> ".xml")
    case simplifile.is_file(xml_template) {
      Ok(True) -> process_template(xml_template, xml_dest, replacements)
      Ok(False) | Error(_) -> Ok(Nil)
    }
  })

  // Process package.xml template
  use _ <- result.try({
    let package_xml_template =
      filepath.join(config.templates_dir, "package.xml")
    let package_xml_dest = filepath.join(config.src_dir, "package.xml")
    case simplifile.is_file(package_xml_template) {
      Ok(True) ->
        process_template(package_xml_template, package_xml_dest, replacements)
      Ok(False) | Error(_) -> Ok(Nil)
    }
  })

  // Process CSS template
  let css_template = filepath.join(config.templates_dir, "widget.css")
  let css_dest =
    filepath.join(config.src_dir, "ui/" <> widget_config.widget_name <> ".css")
  case simplifile.is_file(css_template) {
    Ok(True) -> {
      use _ <- result.try(ensure_dir(filepath.join(config.src_dir, "ui")))
      process_template(css_template, css_dest, replacements)
    }
    Ok(False) | Error(_) -> Ok(Nil)
  }
}

// Main build function
pub fn build() -> Result(Nil, String) {
  io.println("Starting Gleam to Mendix Widget build...")

  let config = default_config()

  use widget_config <- result.try(get_widget_config(config))
  io.println("Building widget: " <> widget_config.widget_name)

  use _ <- result.try(build_gleam(config))
  use _ <- result.try(clean_gleam_dest(config))
  use _ <- result.try(copy_gleam_files(config))
  use _ <- result.try(fix_gleam_imports(config))
  use _ <- result.try(generate_widget_jsx(config, widget_config))
  use _ <- result.try(generate_editor_preview_jsx(config, widget_config))
  use _ <- result.try(generate_editor_config_js(config, widget_config))
  use _ <- result.try(process_templates(config, widget_config))

  io.println("Build completed successfully!")
  io.println("Generated files for widget: " <> widget_config.widget_name)
  Ok(Nil)
}

// Main entry point
pub fn main() {
  case build() {
    Ok(_) -> Nil
    Error(msg) -> {
      io.println_error("Build failed: " <> msg)
      panic as "Build failed"
    }
  }
}
