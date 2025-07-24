import components/hello_world
import gleam/dynamic.{type Dynamic}
import ui/react_converter
import utils/react_helpers

// Main widget component
pub fn mendix_widget_gleam(props: Dynamic) -> Dynamic {
  // Extract sampleText from props using Gleam helpers with default fallback
  let sample_text =
    react_helpers.extract_string_prop(props, "sampleText", "World")

  // Get pure Gleam element from component
  let gleam_element = hello_world.hello_world(sample_text)

  // Convert to React element using the converter
  react_converter.element_to_react(gleam_element)
}

// Editor preview component
pub fn editor_preview(props: Dynamic) -> Dynamic {
  let sample_text =
    react_helpers.extract_string_prop(props, "sampleText", "Preview")

  // Get pure Gleam element from component
  let gleam_element = hello_world.hello_world(sample_text)

  // Convert to React element using the converter
  react_converter.element_to_react(gleam_element)
}

// // Alternative widget variants for different use cases
// pub fn mendix_widget_interactive(props: Dynamic) -> Dynamic {
//   let sample_text =
//     react_helpers.extract_string_prop(props, "sampleText", "World")

//   let gleam_element = hello_world.hello_world_interactive(sample_text)
//   react_converter.element_to_react(gleam_element)
// }

// pub fn mendix_widget_with_header(props: Dynamic) -> Dynamic {
//   let sample_text =
//     react_helpers.extract_string_prop(props, "sampleText", "World")

//   let gleam_element = hello_world.hello_world_with_header(sample_text)
//   react_converter.element_to_react(gleam_element)
// }

// pub fn mendix_widget_card(props: Dynamic) -> Dynamic {
//   let sample_text =
//     react_helpers.extract_string_prop(props, "sampleText", "World")
//   let title = react_helpers.extract_string_prop(props, "title", "Widget Card")

//   let gleam_element = hello_world.hello_world_card(sample_text, title)
//   react_converter.element_to_react(gleam_element)
// }

// Function to get preview CSS - returns the CSS import
pub fn get_preview_css() -> String {
  "./ui/{{WIDGET_NAME}}.css"
}
