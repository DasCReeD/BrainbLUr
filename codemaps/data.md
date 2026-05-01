# Data Models and Structures

**Freshness Timestamp:** 2026-05-01T13:55:00-04:00

BrainBlur deals primarily with third-party visualization formats and audio stream objects. It does not use traditional databases.

## 1. Web Audio Graph Nodes
*   **AudioContext**: The global `AudioContext` instantiated at startup. It governs timing and sample rates.
*   **MediaStreamAudioSourceNode**: Created dynamically in `audio.js` via `getDisplayMedia` when the user enables System Audio capture. This node is connected directly to Butterchurn's internal analyzer.
*   **GainNode**: Used as a silent/dummy source for initial visualizer boot so the WebGL context can start rendering immediately.

## 2. Butterchurn Presets
*   Butterchurn consumes `.milk` files transpiled into nested JSON structures.
*   These presets contain equation logic and texture instructions for the WebGL fragment/vertex shaders.
*   `butterchurn-presets` and other preset packs bundle these JSON objects.

## 3. Webamp Skins
*   Winamp `.wsz` skins are standard ZIP archives containing BMP files, cursor files, and a `pledit.txt` metadata file.
*   The Skin Browser loads these dynamically, passing the raw URL/blob to Webamp.
