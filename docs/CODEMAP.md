# Codemap

> Module-level architecture map for BrainBlur. Updated as the project evolves.

## Directory Structure

```
BrainbLUr/
├── index.html                  # App entry point (canvas + overlay DOM)
├── vite.config.js              # Vite build configuration
├── package.json                # Dependencies and scripts
│
├── src/
│   ├── js/
│   │   ├── engine.js           # Butterchurn visualizer wrapper
│   │   ├── audio.js            # Web Audio API capture (tab + mic)
│   │   ├── presets.js          # Preset loading, cycling, blending
│   │   └── ui.js               # Overlay controls + keyboard shortcuts
│   └── css/
│       └── style.css           # All styles (canvas, overlay, animations)
│
├── public/
│   ├── presets/                 # Converted JSON preset chunks
│   │   ├── manifest.json       # Index of all available presets
│   │   ├── chunk-001.json      # Preset batch 1 (~50 presets)
│   │   └── ...
│   └── textures/               # MilkDrop texture files (jpg/png)
│
├── scripts/
│   └── convert-presets.js      # Build tool: .milk → JSON converter
│
├── raw-presets/                # Raw .milk files (git-ignored, not deployed)
│
├── docs/
│   ├── ARCHITECTURE.md         # Technical deep-dive
│   ├── CODEMAP.md              # This file
│   └── CONTRIBUTING.md         # How to contribute
│
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD: build + deploy to GitHub Pages
│
├── .gitignore
├── LICENSE                     # GPL-3.0
└── README.md                   # Project overview
```

## Module Map

| Module | File | Responsibility | Depends On |
|--------|------|---------------|------------|
| **Engine** | `src/js/engine.js` | Init Butterchurn, render loop, canvas resize | `butterchurn` (npm) |
| **Audio** | `src/js/audio.js` | AudioContext, getDisplayMedia, getUserMedia, AnalyserNode | Web Audio API |
| **Presets** | `src/js/presets.js` | Load manifest, lazy-load chunks, cycle, blend | Engine, `butterchurn-presets` (npm) |
| **UI** | `src/js/ui.js` | Overlay DOM, controls, keyboard shortcuts, auto-hide | Audio, Presets, Engine |
| **Converter** | `scripts/convert-presets.js` | Batch .milk → JSON conversion (build-time only) | Node.js, butterchurn internals |

## Data Flow

```
audio.js ──► engine.js ──► <canvas>
                 ▲
presets.js ──────┘
     ▲
ui.js ──► (controls all modules)
```

## Key APIs

### engine.js
```javascript
init(canvas)                    // Create Butterchurn visualizer
connectAudio(audioNode)         // Feed audio data to visualizer
loadPreset(preset, blendSec)    // Load preset with blend transition
resize()                        // Resize to window dimensions
startRenderLoop()               // Begin requestAnimationFrame loop
destroy()                       // Cleanup WebGL resources
```

### audio.js
```javascript
captureTabAudio()               // getDisplayMedia → { audioContext, audioNode }
captureMicAudio()               // getUserMedia → { audioContext, audioNode }
isTabCaptureSupported()         // Feature detection
cleanup()                       // Stop tracks, close context
```

### presets.js
```javascript
init()                          // Load manifest.json
startCycling(intervalSec)       // Auto-cycle with random preset
stopCycling()                   // Pause auto-cycle
nextPreset() / prevPreset()     // Manual navigation
lockPreset() / unlockPreset()   // Pin current preset
getCurrentPresetName()          // Get display name
```

### ui.js
```javascript
init(engine, audio, presets)    // Wire up all controls
show() / hide()                 // Overlay visibility
updateStatus(text)              // Status bar text
```
