# Architecture

## System Overview

BrainBlur is a **static web application** that runs a real-time audio-reactive visualizer entirely in the browser. There is no backend server — the final deployment is pure HTML, JavaScript, CSS, and JSON preset data, served from GitHub Pages.

## Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                            │
│                                                                  │
│  ┌─────────────┐    getDisplayMedia()    ┌──────────────────┐   │
│  │ Music Tab   │ ──────────────────────► │  audio.js        │   │
│  │ (YouTube,   │     MediaStream         │  - AudioContext   │   │
│  │  Spotify)   │                         │  - AnalyserNode   │   │
│  └─────────────┘                         └────────┬─────────┘   │
│                                                   │              │
│                                          audioNode│              │
│                                                   ▼              │
│  ┌─────────────┐   JSON preset    ┌──────────────────────────┐  │
│  │ presets.js   │ ──────────────► │  engine.js                │  │
│  │ - manifest   │                 │  - butterchurn.createViz  │  │
│  │ - lazy load  │                 │  - connectAudio()         │  │
│  │ - cycle/blend│                 │  - loadPreset()           │  │
│  └──────┬───────┘                 │  - render() loop          │  │
│         │                         └────────────┬─────────────┘  │
│         │                                      │                 │
│  ┌──────▼───────┐                    WebGL 2   │                 │
│  │  ui.js       │                              ▼                 │
│  │  - overlay   │                   ┌────────────────────┐      │
│  │  - controls  │                   │  <canvas>          │      │
│  │  - shortcuts │                   │  Full-screen       │      │
│  └──────────────┘                   │  60fps render      │      │
│                                     └────────────────────┘      │
└──────────────────────────────────────────────────────────────────┘
```

## Module Responsibilities

### `audio.js` — Audio Capture Pipeline
Handles acquiring audio input from the user's system. Two strategies:

1. **Tab Audio** (`getDisplayMedia`): The primary path for Chromium browsers. Captures audio from a specific browser tab without CORS restrictions. Requires user gesture and `video: true` (video track is immediately discarded).

2. **Microphone** (`getUserMedia`): Fallback for Firefox/Safari. Captures ambient audio from the user's microphone. Lower quality but universally supported.

Both paths produce a `MediaStreamAudioSourceNode` connected to an `AnalyserNode` that feeds FFT data to Butterchurn.

### `engine.js` — Butterchurn Wrapper
Thin wrapper around the `butterchurn` library:
- Creates the WebGL 2 visualizer instance bound to a `<canvas>` element
- Manages the `requestAnimationFrame` render loop
- Handles canvas resize (responsive to window size changes)
- Exposes `loadPreset(preset, blendSeconds)` for smooth transitions

### `presets.js` — Preset Manager
Manages the preset library with lazy-loading:
- On init, fetches `manifest.json` (lightweight index of all presets)
- Loads preset chunks on demand (~50 presets per JSON chunk)
- Implements LRU cache (keeps 3 most recent chunks in memory)
- Auto-cycles presets every 15–30 seconds with configurable blend time
- Supports lock/unlock, next/prev, and random selection

### `ui.js` — Overlay Controller
Renders a semi-transparent overlay with controls:
- Auto-hides after 3 seconds of inactivity
- Keyboard shortcuts for all actions
- Touch gesture support (swipe for preset change)
- Displays current preset name and status

## Preset Pipeline

```
Raw .milk files ──► convert-presets.js ──► Chunked JSON files ──► public/presets/
                    (Node.js build step)   (chunk-001.json...)    (served statically)
```

The `.milk` → JSON conversion is a build-time step, not a runtime operation. The browser only ever loads pre-converted JSON objects.

## Browser Compatibility

| Feature | Chrome/Edge | Firefox | Safari |
|---------|-------------|---------|--------|
| WebGL 2 | ✅ | ✅ | ✅ (15.2+) |
| Tab Audio Capture | ✅ | ❌ | ❌ |
| Mic Input | ✅ | ✅ | ✅ |
| Fullscreen API | ✅ | ✅ | ✅ |

## Deployment

The app is deployed as a static site to GitHub Pages via GitHub Actions. Every push to `main` triggers:
1. `npm ci` — install dependencies
2. `npm run build` — Vite bundles everything into `dist/`
3. Upload `dist/` as a Pages artifact
4. Deploy to `dascreed.github.io/BrainbLUr`
