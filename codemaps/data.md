# Data Map
*Freshness: 2026-05-01*

## State Persistence (localStorage)
The application relies strictly on standard web APIs for persistence.

### `milkdrop_favorites`
- **Type**: JSON Array of Strings
- **Description**: Stores the exact preset name identifiers that the user has starred.
- **Example**: `["Geiss - Drop Shadow", "Rovastar - Starscape"]`

### `milkdrop_tutorial_seen`
- **Type**: String (`'true'` or unset)
- **Description**: Flag to prevent the first-load system audio setup tutorial from appearing on subsequent visits.

## Memory / Process Data
*   **Presets Map**: Loaded via dynamic `import()` of `butterchurn-presets`, `butterchurn-presets-baron`, and `butterchurn-presets-weekly`. Stored in memory via an aggregated `Object.assign({}, pack1, pack2, ...)` mapped structure inside `engine.js`.
*   **Audio Data**: Captured as a float32 array time-domain and frequency-domain buffer by Webamp's underlying `AudioContext.createAnalyser()`.
