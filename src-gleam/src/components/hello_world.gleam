// Pure Gleam component using common UI types
// Returns data structures that can be rendered by the mendix layer
import ui/types

// HelloWorld component function that returns pure data structure
pub fn hello_world(sample_text: String) -> types.Element {
  let text_content = "Hello " <> sample_text
  types.div("widget-hello-world", [types.text(text_content)])
}

// Additional component variants for different use cases
pub fn hello_world_with_header(sample_text: String) -> types.Element {
  let greeting = "Hello " <> sample_text
  types.div("widget-hello-world", [
    types.header("widget-title", "Greetings"),
    types.paragraph("widget-message", greeting),
  ])
}

pub fn hello_world_interactive(sample_text: String) -> types.Element {
  let greeting = "Hello " <> sample_text
  types.div("widget-hello-world interactive", [
    types.div("message-container", [types.text(greeting)]),
    types.button("greeting-button", "Say Hello"),
  ])
}

// Simple text-only variant
pub fn hello_world_simple(sample_text: String) -> types.Element {
  types.text("Hello " <> sample_text)
}

// Card-style variant
pub fn hello_world_card(sample_text: String, title: String) -> types.Element {
  let greeting = "Hello " <> sample_text
  types.div("widget-card", [
    types.div("card-header", [types.header("card-title", title)]),
    types.div("card-body", [types.paragraph("card-text", greeting)]),
  ])
}
