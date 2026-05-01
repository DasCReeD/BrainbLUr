# Frontend Structure

**Freshness Timestamp:** 2026-05-01T13:55:00-04:00

The frontend is a pure JavaScript/CSS application built on top of Vite without a major rendering framework (e.g., React or Vue are not used directly for the outer shell, although Webamp internally uses React).

## Source Map (`src/js/`)

*   `main.js`: Bootstraps the application, loading Webamp, CSS, and side panels.
*   `webamp-init.js`: Configuration and mounting of the Webamp component. Links audio nodes and visualizer instances.
*   `engine.js`: Butterchurn integration. Manages the WebGL canvas, preset transitions, and rendering loops.
*   `audio.js`: Web Audio API wrapper. Handles system audio capture via `getDisplayMedia`, disabling the video track to save resources while preventing Chrome session termination. Shares global `AudioContext`.
*   `milkdrop-controls.js`: UI logic for interacting directly with the visualizer (next/previous preset, full screen, system capture, etc.).
*   `preset-browser.js`: Logic for fetching and displaying the list of available Butterchurn presets.
*   `skin-browser.js`: Logic for loading Winamp `.wsz` skins and applying them to the Webamp instance dynamically.

## Styles (`src/css/`)
*   `style.css`: Global styles, CSS variables, typography, layout for the side panels (browsers), and fullscreen canvas handling (`z-index` configuration).
