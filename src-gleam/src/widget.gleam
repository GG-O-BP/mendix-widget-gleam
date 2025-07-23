import gleam/dynamic.{type Dynamic}
import hello_world

// FFI binding for React.createElement
@external(javascript, "react", "createElement")
fn create_element(
  tag: String,
  props: Dynamic,
  children: List(Dynamic),
) -> Dynamic

// FFI binding for creating props object
@external(javascript, "../js_ffi/react_helpers.js", "createProps")
fn create_props(class_name: String) -> Dynamic

// FFI binding for creating empty props
@external(javascript, "../js_ffi/react_helpers.js", "createEmptyProps")
fn create_empty_props() -> Dynamic

// FFI function to extract properties from dynamic objects and convert to string
@external(javascript, "../js_ffi/react_helpers.js", "extractStringProp")
fn extract_string_property(obj: Dynamic, key: String, default: String) -> String

// Main widget component
pub fn mendix_widget_gleam(props: Dynamic) -> Dynamic {
  // Extract sampleText from props using FFI with default fallback
  let sample_text = extract_string_property(props, "sampleText", "World")
  hello_world.hello_world(sample_text)
}

// Editor preview component
pub fn editor_preview(props: Dynamic) -> Dynamic {
  let sample_text = extract_string_property(props, "sampleText", "Preview")
  hello_world.hello_world(sample_text)
}

// Function to get preview CSS - returns the CSS import
pub fn get_preview_css() -> String {
  "./ui/{{WIDGET_NAME}}.css"
}
