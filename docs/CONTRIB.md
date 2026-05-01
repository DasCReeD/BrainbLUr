# Contributing to BrainBlur

Welcome to BrainBlur! This guide outlines the development workflow for the web-native MilkDrop 2 visualizer.

## Available Scripts (from package.json)

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Starts the local Vite development server with Hot Module Replacement (HMR). |
| `build` | `vite build` | Bundles the application for production deployment. |
| `preview` | `vite preview` | Previews the production build locally. |
| `convert-presets` | `node scripts/convert-presets.js` | Utility script for converting raw MilkDrop presets into JSON. |

## Environment Setup
*   **Prerequisites:** Node.js (v18+ recommended) and npm/pnpm.
*   **Dependencies:** The project relies on `butterchurn`, `webamp`, and massive preset packs (`butterchurn-presets-baron`, `butterchurn-presets-weekly`).
*   **Env Variables:** There are no environment variables (`.env`) required for this purely static frontend application.

## Development Workflow
1.  **Start the Server:** Run `npm run dev` to start the local Vite server.
2.  **Architecture:** The UI is heavily modularized within `src/js/`. When adding new features, follow the existing pattern of separating DOM logic (e.g., `preset-browser.js`, `milkdrop-controls.js`) from engine logic (`engine.js`).
3.  **Aesthetics:** We utilize a "glassmorphism" design language defined in `src/css/style.css`.
4.  **Audio Testing:** To test the audio visualizer, you can either drop an MP3 into the Winamp window or use the **Capture** button to hook into your system audio via the `getDisplayMedia` API. Ensure you select "Also share system audio" in the browser prompt.

## Testing Procedures
Since this is a WebGL-heavy visual application, testing is primarily manual:
*   Ensure Webamp initializes successfully.
*   Ensure Butterchurn transitions correctly between presets.
*   Verify the heavy preset packs (200MB+) load smoothly in the background without freezing the UI.
