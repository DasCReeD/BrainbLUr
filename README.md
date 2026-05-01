# 🧠 BrainBlur

**Web-native MilkDrop 2 visualizer** — thousands of psychedelic audio-reactive presets running in your browser via WebGL 2.

> **[🚀 Launch Live Demo →](https://dascreed.github.io/BrainbLUr/)**

---

## What Is This?

BrainBlur brings the legendary **MilkDrop** music visualizer — the iconic Winamp plugin that defined a generation of trippy visuals — to the modern web. No plugins, no downloads. Just open a tab, share your audio, and let the shaders melt your brain.

**Powered by:**
- [Butterchurn](https://github.com/jberg/butterchurn) — the definitive WebGL 2 reimplementation of MilkDrop 2
- [Cream of the Crop](https://github.com/projectM-visualizer/presets-cream-of-the-crop) — 9,795 community-curated presets from two decades of MilkDrop artistry

## Features

- 🎨 **Full-screen WebGL 2** visualizer running at 60fps
- 🎵 **Tab Audio Capture** — visualize music from YouTube, Spotify, or any browser tab
- 🎤 **Microphone Fallback** — works on Firefox/Safari via mic input
- 🔄 **Auto-cycling Presets** — smooth shader-blend transitions every 15–30 seconds
- ⌨️ **Keyboard Shortcuts** — Space, arrows, F for fullscreen, L to lock a preset
- 📱 **Mobile-friendly** — responsive canvas with touch gesture controls
- 🚀 **GitHub Pages** — zero-infrastructure static deployment

## Quick Start

```bash
# Clone
git clone https://github.com/DasCReeD/BrainbLUr.git
cd BrainbLUr

# Install
npm install

# Run locally
npm run dev
```

Open `http://localhost:3000`, click **Start**, and select the tab playing your music.

## Controls

| Key | Action |
|-----|--------|
| `Space` | Start/stop audio capture |
| `→` or `N` | Next preset |
| `←` or `P` | Previous preset |
| `L` | Lock/unlock current preset |
| `F` | Toggle fullscreen |
| `I` | Toggle info panel |

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full technical deep-dive and [docs/CODEMAP.md](docs/CODEMAP.md) for the module map.

```
User's Music Tab ──► getDisplayMedia() ──► AudioContext ──► AnalyserNode
                                                                 │
                                                                 ▼
          Preset JSON ──► Butterchurn Engine ──► WebGL 2 Canvas (fullscreen)
```

## Credits

- **[Butterchurn](https://github.com/jberg/butterchurn)** by Jordan Berg — MIT License
- **[MilkDrop](http://www.geisswerks.com/about_milkdrop.html)** by Ryan Geiss
- **[ProjectM](https://github.com/projectM-visualizer)** community & ISOSCELES for curating the preset archives
- **[Winamp](http://www.winamp.com/)** by Nullsoft
- All the legendary preset creators — especially [Flexi](https://twitter.com/Flexi23)

## License

[MIT](LICENSE)
