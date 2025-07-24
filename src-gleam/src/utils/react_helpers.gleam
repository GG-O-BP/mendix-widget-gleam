import gleam/dict.{type Dict}
import gleam/dynamic.{type Dynamic}
import gleam/list
import gleam/string

// React element creation
@external(javascript, "react", "createElement")
pub fn create_element(
  tag: String,
  props: Dynamic,
  children: List(Dynamic),
) -> Dynamic

// Basic props creation
pub fn create_props(class_name: String) -> Dynamic {
  create_props_object([#("className", to_dynamic(class_name))])
}

pub fn create_empty_props() -> Dynamic {
  create_props_object([])
}

pub fn create_props_with_style(
  class_name: String,
  styles: Dict(String, String),
) -> Dynamic {
  let style_object =
    dict.to_list(styles)
    |> list.map(fn(pair) { #(pair.0, to_dynamic(pair.1)) })
    |> create_props_object_from_pairs

  create_props_object([
    #("className", to_dynamic(class_name)),
    #("style", style_object),
  ])
}

// Text node creation (in React, text is just a string)
pub fn create_text_node(text: String) -> Dynamic {
  to_dynamic(text)
}

// Class name utilities
pub fn create_class_name(classes: List(String)) -> String {
  classes
  |> list.filter(fn(class) { !string.is_empty(class) })
  |> string.join(" ")
}

// Property extraction using FFI
pub fn extract_string_prop(obj: Dynamic, key: String, default: String) -> String {
  extract_string_prop_ffi(obj, key, default)
}

pub fn extract_int_prop(obj: Dynamic, key: String, default: Int) -> Int {
  extract_int_prop_ffi(obj, key, default)
}

pub fn extract_bool_prop(obj: Dynamic, key: String, default: Bool) -> Bool {
  extract_bool_prop_ffi(obj, key, default)
}

// Event handler helpers
pub fn create_props_with_handler(
  class_name: String,
  event_name: String,
  handler: fn() -> Nil,
) -> Dynamic {
  create_props_object([
    #("className", to_dynamic(class_name)),
    #(event_name, to_dynamic(handler)),
  ])
}

// React element creation with proper child handling
pub fn create_element_with_children(
  tag: String,
  props: Dynamic,
  children: List(Dynamic),
) -> Dynamic {
  create_element(tag, props, children)
}

// Preview object for Mendix Studio Pro
pub fn create_preview_object() -> Dynamic {
  create_props_object([
    #("type", to_dynamic("Container")),
    #("children", to_dynamic([])),
  ])
}

// List conversion utilities
pub fn gleam_list_to_js_array(gleam_list: List(a)) -> Dynamic {
  to_dynamic(gleam_list)
}

// Safe property extraction with Result type
pub fn extract_prop_safe(obj: Dynamic, key: String) -> Result(Dynamic, String) {
  case extract_prop_raw(obj, key) {
    value ->
      case is_undefined(value) {
        True -> Error("Property not found")
        False -> Ok(value)
      }
  }
}

// Create a div element with class and children
pub fn create_div(class_name: String, children: List(Dynamic)) -> Dynamic {
  let props = create_props(class_name)
  create_element("div", props, children)
}

// Create a span element with class and text
pub fn create_span(class_name: String, text: String) -> Dynamic {
  let props = create_props(class_name)
  let text_node = create_text_node(text)
  create_element("span", props, [text_node])
}

// Create button with click handler
pub fn create_button(
  class_name: String,
  text: String,
  on_click: fn() -> Nil,
) -> Dynamic {
  let props = create_props_with_handler(class_name, "onClick", on_click)
  let text_node = create_text_node(text)
  create_element("button", props, [text_node])
}

// FFI functions for low-level JavaScript operations
@external(javascript, "./react_helpers_ffi.js", "createPropsObject")
pub fn create_props_object(pairs: List(#(String, Dynamic))) -> Dynamic

@external(javascript, "./react_helpers_ffi.js", "createPropsObjectFromPairs")
fn create_props_object_from_pairs(pairs: List(#(String, Dynamic))) -> Dynamic

@external(javascript, "./react_helpers_ffi.js", "extractPropRaw")
fn extract_prop_raw(obj: Dynamic, key: String) -> Dynamic

@external(javascript, "./react_helpers_ffi.js", "isUndefined")
fn is_undefined(value: Dynamic) -> Bool

// FFI function to convert any value to Dynamic
@external(javascript, "./react_helpers_ffi.js", "toDynamic")
pub fn to_dynamic(value: a) -> Dynamic

// FFI functions for property extraction
@external(javascript, "./react_helpers_ffi.js", "extractStringProp")
fn extract_string_prop_ffi(obj: Dynamic, key: String, default: String) -> String

@external(javascript, "./react_helpers_ffi.js", "extractIntProp")
fn extract_int_prop_ffi(obj: Dynamic, key: String, default: Int) -> Int

@external(javascript, "./react_helpers_ffi.js", "extractBoolProp")
fn extract_bool_prop_ffi(obj: Dynamic, key: String, default: Bool) -> Bool
