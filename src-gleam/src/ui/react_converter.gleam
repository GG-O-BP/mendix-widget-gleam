// React converter for pure Gleam UI elements
// Converts ui/types.Element to React Dynamic elements
import gleam/dynamic.{type Dynamic}
import gleam/list
import ui/types
import utils/react_helpers

// Convert pure Gleam Element to React Dynamic
pub fn element_to_react(element: types.Element) -> Dynamic {
  case element {
    types.TextNode(content) -> react_helpers.create_text_node(content)
    types.Element(element_type, class_name, text_content, attributes, children) -> {
      let react_children = list.map(children, element_to_react)
      let tag_name = element_type_to_tag(element_type)
      let props = create_props_with_attributes(class_name, attributes)

      case text_content {
        "" ->
          react_helpers.create_element_with_children(
            tag_name,
            props,
            react_children,
          )
        text ->
          react_helpers.create_element_with_children(tag_name, props, [
            react_helpers.create_text_node(text),
            ..react_children
          ])
      }
    }
  }
}

// Convert ElementType to HTML tag name
fn element_type_to_tag(element_type: types.ElementType) -> String {
  case element_type {
    types.Div -> "div"
    types.Span -> "span"
    types.Text -> "span"
    types.Button -> "button"
    types.Input -> "input"
    types.Label -> "label"
    types.Header -> "h2"
    types.Section -> "section"
    types.Article -> "article"
    types.Paragraph -> "p"
    types.Link -> "a"
    types.Image -> "img"
    types.List -> "ul"
    types.ListItem -> "li"
  }
}

// Create props object with class name and attributes
fn create_props_with_attributes(
  class_name: String,
  attributes: List(#(String, String)),
) -> Dynamic {
  let base_props = [#("className", react_helpers.to_dynamic(class_name))]
  let all_props =
    list.append(
      base_props,
      list.map(attributes, fn(attr) {
        #(attr.0, react_helpers.to_dynamic(attr.1))
      }),
    )
  react_helpers.create_props_object(all_props)
}

// Convert a list of elements to React elements
pub fn elements_to_react(elements: List(types.Element)) -> List(Dynamic) {
  list.map(elements, element_to_react)
}

// Utility function to wrap an element in a container
pub fn wrap_in_container(
  element: types.Element,
  container_class: String,
) -> Dynamic {
  let container = types.div(container_class, [element])
  element_to_react(container)
}

// Convert element with error boundary wrapper
pub fn element_to_react_safe(element: types.Element) -> Dynamic {
  // For now, just convert directly
  // In the future, this could add error handling
  element_to_react(element)
}

// Convert element with additional React props
pub fn element_to_react_with_props(
  element: types.Element,
  additional_props: List(#(String, Dynamic)),
) -> Dynamic {
  case element {
    types.TextNode(content) -> react_helpers.create_text_node(content)
    types.Element(element_type, class_name, text_content, attributes, children) -> {
      let react_children = list.map(children, element_to_react)
      let tag_name = element_type_to_tag(element_type)

      // Merge class name, attributes, and additional props
      let base_props = [#("className", react_helpers.to_dynamic(class_name))]
      let attr_props =
        list.map(attributes, fn(attr) {
          #(attr.0, react_helpers.to_dynamic(attr.1))
        })
      let all_props = list.flatten([base_props, attr_props, additional_props])
      let props = react_helpers.create_props_object(all_props)

      case text_content {
        "" ->
          react_helpers.create_element_with_children(
            tag_name,
            props,
            react_children,
          )
        text ->
          react_helpers.create_element_with_children(tag_name, props, [
            react_helpers.create_text_node(text),
            ..react_children
          ])
      }
    }
  }
}
