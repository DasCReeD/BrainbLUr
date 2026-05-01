# Overall Architecture

**Freshness Timestamp:** 2026-05-01T13:55:00-04:00

BrainBlur is a WebGL-based visualizer application running entirely in the browser. It combines Webamp (a Winamp 2 reimplementation) with Butterchurn (a WebGL port of the MilkDrop visualizer).

## High-Level Components

*   **Entry Point (`src/js/main.js`):** Coordinates the initialization of the application's three main pillars: Webamp, the Skin Browser, and the Preset Browser.
*   **Webamp Core (`src/js/webamp-init.js`):** Instantiates the Webamp player and injects the Butterchurn engine as an add-on module.
*   **Visualization Engine (`src/js/engine.js` & `src/js/milkdrop-controls.js`):** Manages the rendering canvas, interacts with the Butterchurn instance, loads the massive preset packs (`butterchurn-presets`).
*   **Audio Pipeline (`src/js/audio.js`):** Manages the system audio hook via `getDisplayMedia`. Integrates seamlessly with the global `AudioContext` to feed real-time desktop audio data into the Butterchurn visualizer without cross-context restrictions.
*   **UI Components (`src/js/skin-browser.js`, `src/js/preset-browser.js`):** Manages auxiliary user interfaces outside the main Webamp player, allowing users to browse visualization presets and Winamp skins dynamically.
*   **Build System:** Vite (`vite.config.js` and `package.json`).
