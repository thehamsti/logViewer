# Log Viewer

> **Note**
> This project was created as an exploration of Tauri v2's features and capabilities. It's not intended for production use but rather as a learning exercise and reference implementation.

A simple log file viewer built with Tauri v2, React, and TypeScript. This was an exploratory project to understand Tauri v2's capabilities and new features.

## Tech Stack

- **Tauri v2** - For native cross-platform functionality
- **React** - UI framework
- **Vite** - Bundler and dev server
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - For styling
- **shadcn/ui** - For beautiful, accessible components
- **Deno** - For build scripts and development

## Features

- 🚀 Fast native performance
- 🎨 Modern UI with dark/light mode support
- 📱 Responsive design
- 🔄 Automatic updates via GitHub releases
- 🎯 Cross-platform support (Windows, macOS, Linux)

## Auto Updates

The app is configured with automatic updates through GitHub releases. When code is pushed to the `release` branch, a GitHub Action automatically:

1. Builds the application for all platforms (Windows, macOS Intel/ARM, Linux)
2. Creates a new release
3. Uploads the built artifacts
4. Generates update manifests

## Development Setup

1. Install dependencies:

```bash
deno install
```

2. Run the development server:

```bash
deno task tauri dev
```

## Building

```bash
deno task tauri build
```

## License

No license do whatever you want.

## Contact

[X](https://x.com/thehamsti)

[GitHub](https://github.com/thehamsti)

[Email](mailto:john@hamsti.com)

## Contributing

Feel free to open issues or submit pull requests if you find bugs or have suggestions for improvements.