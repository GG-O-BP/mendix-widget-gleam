# mendix-widget-gleam
This project demonstrates an unconventional approach to developing Mendix custom widgets using Gleam, a functional programming language that compiles to JavaScript. Rather than the typical JavaScript/TypeScript implementation, this experimental sample leverages Gleam's type safety and functional paradigms.

## 📁 Project Structure

```
src-gleam/
├── src/
│   ├── components/        # React components
│   │   └── hello_world.gleam
│   ├── mendix/            # Mendix widget related
│   │   ├── widget.gleam
│   │   └── editor_config.gleam
│   ├── utils/             # Utilities and helpers
│   │   └── react_helpers.gleam
│   └── build/             # Build related
│       └── build_widget.gleam
├── js_ffi/               # JavaScript FFI helpers
│   ├── react_helpers_ffi.js
│   └── build_helpers_ffi.js
├── templates/            # Template files
│   ├── widget.xml
│   ├── package.xml
│   └── widget.css
├── build.js             # Node.js build script
└── gleam.toml          # Gleam project configuration
```

## 📂 Directory Description

### `src/components/` - React Components
Contains React components and UI-related Gleam code.

- `hello_world.gleam`: Basic Hello World component
- Add new React components to this folder

### `src/mendix/` - Mendix Widget Related
Code responsible for integration with the Mendix platform.

- `widget.gleam`: Main widget component and editor preview
- `editor_config.gleam`: Mendix Studio configuration and property management

### `src/utils/` - Utilities and Helpers
Reusable utility functions.

- `react_helpers.gleam`: React component creation and manipulation helpers

### `src/build/` - Build Related
Code related to the build process.

- `build_widget.gleam`: Gleam build script (currently not in use)

### `js_ffi/` - JavaScript FFI
Minimal JavaScript FFI helper functions.

- `react_helpers_ffi.js`: React-related JavaScript functions
- `build_helpers_ffi.js`: Build-related JavaScript functions

### `templates/` - Template Files
Mendix widget configuration file templates.

- `widget.xml`: Widget configuration template
- `package.xml`: Package configuration template
- `widget.css`: CSS template

## 🛠️ Development Workflow

### 1. Adding a New React Component
```gleam
// src/components/my_component.gleam
import gleam/dynamic.{type Dynamic}
import utils/react_helpers

pub fn my_component(props: Dynamic) -> Dynamic {
  react_helpers.create_div("my-component", [
    react_helpers.create_text_node("My Component")
  ])
}
```

### 2. Using in Main Widget
```gleam
// src/mendix/widget.gleam
import components/my_component

pub fn mendix_widget_gleam(props: Dynamic) -> Dynamic {
  my_component.my_component(props)
}
```

### 3. Build and Test
```bash
# Compile Gleam code and generate files
npm run build:gleam

# Build complete Mendix widget
npm run build

# Start development server
npm run dev
```

## 🔧 Development Guidelines

### Module Structure
- **React Components**: Place in `src/components/`
- **Mendix Integration**: Place in `src/mendix/`
- **Utilities**: Place in `src/utils/`
- **Build Tools**: Place in `src/build/`

### Import Rules
```gleam
// External libraries
import gleam/dynamic
import gleam/string

// Internal project modules
import components/hello_world
import utils/react_helpers
import mendix/widget
```

### Function Naming
- **UI Components**: `component_name(props: Dynamic) -> Dynamic`
- **Helper Functions**: `helper_action(param: Type) -> ReturnType`
- **FFI Functions**: `ffi_function_name(...) -> ...`

## 🚀 Build Process

1. **Gleam Compilation**: Generate `.mjs` files with `gleam build`
2. **File Copying**: Copy built files to `../src/gleam/`
3. **Import Path Modification**: Change relative paths to absolute paths
4. **JSX File Generation**: Generate React wrapper files
5. **Template Processing**: Generate XML and CSS files
6. **Mendix Build**: Create final widget package

## 📝 Important Considerations

- **Minimise FFI**: Keep JavaScript code to a minimum and develop primarily with Gleam
- **Type Safety**: Utilise safe conversion functions when using Dynamic types
- **Module Separation**: Clearly separate modules by functionality
- **Import Paths**: Essential to check import paths when changing folder structure

## 📚 References

- [Gleam Official Documentation](https://gleam.run/)
- [Mendix Pluggable Widgets](https://docs.mendix.com/apidocs-mxsdk/apidocs/pluggable-widgets/)
- [React Official Documentation](https://reactjs.org/)
