import gleam/dynamic.{type Dynamic}
import utils/react_helpers

pub type ReactElement

// HelloWorld component function
pub fn hello_world(sample_text: String) -> Dynamic {
  let text_content = "Hello " <> sample_text
  react_helpers.create_div("widget-hello-world", [
    react_helpers.create_text_node(text_content),
  ])
}
