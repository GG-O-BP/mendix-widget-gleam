import components/hello_world
import gleam/dynamic.{type Dynamic}
import utils/react_helpers

// Main widget component
pub fn mendix_widget_gleam(props: Dynamic) -> Dynamic {
  // Extract sampleText from props using Gleam helpers with default fallback
  let sample_text =
    react_helpers.extract_string_prop(props, "sampleText", "World")
  hello_world.hello_world(sample_text)
}

// Editor preview component
pub fn editor_preview(props: Dynamic) -> Dynamic {
  let sample_text =
    react_helpers.extract_string_prop(props, "sampleText", "Preview")
  hello_world.hello_world(sample_text)
}

// Function to get preview CSS - returns the CSS import
pub fn get_preview_css() -> String {
  "./ui/{{WIDGET_NAME}}.css"
}
