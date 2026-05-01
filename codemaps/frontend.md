# Frontend Map
*Freshness: 2026-05-01*

## Entry Points
*   `index.html`: Holds the `#canvas` and `#webamp-container` mount points.
*   `src/js/main.js`: Main bootstrap file.

## Engine Modules
*   `engine.js`: Initializes Butterchurn. Manages the core visual loop. Implements the dynamic background hydration of heavy preset packs to prevent TTI blocking.
*   `audio.js`: Contains `captureTabAudio` using `navigator.mediaDevices.getDisplayMedia` to intercept system-wide audio output.

## UI Modules
*   `milkdrop-controls.js`: The central "Controller" for the bottom bar UI. Injects the DOM, wires up event listeners for Next/Prev, Lock, Fav, and Zen mode.
*   `preset-browser.js`: Manages the preset gallery modal. Includes a batch-renderer (`renderBatch`) and an `All / Favorites` tab filtering system.
*   `skin-browser.js`: Manages the Webamp skin selection modal.
*   `tutorial.js`: Manages the first-time visitor setup modal (persisted via `localStorage`).

## Webamp Integration
*   `webamp-init.js`: Instantiates `Webamp`, sets the default skin, binds it to the DOM, and exposes the audio context to the visualizer engine.

## Styles
*   `src/css/style.css`: A single vanilla CSS file defining variables, typography (Inter), glassmorphism components, and layout utilities.
