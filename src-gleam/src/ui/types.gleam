// Common UI types for pure Gleam components
// These types represent a virtual DOM structure that can be converted to React

pub type ElementType {
  Div
  Span
  Text
  Button
  Input
  Label
  Header
  Section
  Article
  Paragraph
  Link
  Image
  List
  ListItem
}

pub type Element {
  Element(
    element_type: ElementType,
    class_name: String,
    text_content: String,
    attributes: List(#(String, String)),
    children: List(Element),
  )
  TextNode(content: String)
}

pub type Style {
  Style(property: String, value: String)
}

pub type EventHandler {
  OnClick
  OnChange
  OnSubmit
  OnFocus
  OnBlur
}

pub type Attribute {
  Class(String)
  Id(String)
  Href(String)
  Src(String)
  Alt(String)
  Placeholder(String)
  Value(String)
  Type(String)
  Disabled(Bool)
  CustomAttribute(name: String, value: String)
}

// Helper functions for creating elements
pub fn element(
  element_type: ElementType,
  class_name: String,
  children: List(Element),
) -> Element {
  Element(
    element_type: element_type,
    class_name: class_name,
    text_content: "",
    attributes: [],
    children: children,
  )
}

pub fn element_with_text(
  element_type: ElementType,
  class_name: String,
  text: String,
) -> Element {
  Element(
    element_type: element_type,
    class_name: class_name,
    text_content: text,
    attributes: [],
    children: [],
  )
}

pub fn element_with_attributes(
  element_type: ElementType,
  class_name: String,
  attributes: List(#(String, String)),
  children: List(Element),
) -> Element {
  Element(
    element_type: element_type,
    class_name: class_name,
    text_content: "",
    attributes: attributes,
    children: children,
  )
}

pub fn text(content: String) -> Element {
  TextNode(content)
}

// Common element creators
pub fn div(class_name: String, children: List(Element)) -> Element {
  element(Div, class_name, children)
}

pub fn span(class_name: String, text: String) -> Element {
  element_with_text(Span, class_name, text)
}

pub fn button(class_name: String, text: String) -> Element {
  element_with_text(Button, class_name, text)
}

pub fn paragraph(class_name: String, text: String) -> Element {
  element_with_text(Paragraph, class_name, text)
}

pub fn header(class_name: String, text: String) -> Element {
  element_with_text(Header, class_name, text)
}

pub fn input(class_name: String, placeholder: String) -> Element {
  element_with_attributes(
    Input,
    class_name,
    [#("placeholder", placeholder)],
    [],
  )
}

pub fn label(class_name: String, text: String) -> Element {
  element_with_text(Label, class_name, text)
}
