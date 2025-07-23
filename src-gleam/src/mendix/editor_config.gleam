import gleam/dynamic.{type Dynamic}
import utils/react_helpers

// Type definitions for editor config
pub type PropertyType {
  StringProperty
  BooleanProperty
  NumberProperty
}

pub type Property {
  Property(
    key: String,
    caption: String,
    description: String,
    property_type: PropertyType,
    required: Bool,
  )
}

pub type PropertyGroup {
  PropertyGroup(caption: String, properties: List(Property))
}

pub type Problem {
  Problem(
    property: String,
    severity: String,
    // "error" | "warning" | "deprecation"
    message: String,
    studio_message: String,
    url: String,
    studio_url: String,
  )
}

// Main editor config functions
pub fn get_properties(
  _values: Dynamic,
  default_properties: Dynamic,
  _target: String,
) -> Dynamic {
  // For now, just return the default properties
  // You can add custom logic here to modify properties based on values
  default_properties
}

pub fn check(_values: Dynamic) -> List(Problem) {
  // Add validation logic here
  // Return empty list for now - no errors
  []
}

pub fn get_preview(
  _values: Dynamic,
  _is_dark_mode: Bool,
  _version: List(Int),
) -> Dynamic {
  // Return a simple preview structure for Studio Pro
  react_helpers.create_preview_object()
}

pub fn get_custom_caption(_values: Dynamic, _platform: String) -> String {
  "{{WIDGET_NAME}}"
}
