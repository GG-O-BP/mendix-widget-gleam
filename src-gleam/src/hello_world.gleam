import gleam/dynamic.{type Dynamic}

// import gleam/string

// FFI binding for React.createElement
@external(javascript, "react", "createElement")
fn create_element(
  tag: String,
  props: Dynamic,
  children: List(Dynamic),
) -> Dynamic

// FFI binding for creating a text node
@external(javascript, "../js_ffi/react_helpers.js", "createTextNode")
fn create_text_node(text: String) -> Dynamic

// FFI binding for creating props object
@external(javascript, "../js_ffi/react_helpers.js", "createProps")
fn create_props(class_name: String) -> Dynamic

pub type ReactElement

// HelloWorld component function
pub fn hello_world(sample_text: String) -> Dynamic {
  let props = create_props("widget-hello-world")
  let text_content = "Hello " <> sample_text
  let text_node = create_text_node(text_content)
  create_element("div", props, [text_node])
}
