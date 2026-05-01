# Contributing to BrainBlur

Welcome to BrainBlur! This document provides guidelines and instructions for contributing to the project. BrainBlur is a web-native MilkDrop visualizer powered by the Butterchurn WebGL engine.

## Development Workflow

BrainBlur uses [Vite](https://vitejs.dev/) as its build tool and development server.

### Available Scripts

These scripts are defined in `package.json`:

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `vite` | Starts the Vite development server with Hot Module Replacement (HMR). Use this for local development. |
| `npm run build` | `vite build` | Compiles the project into static files in the `dist/` directory, optimized for production. |
| `npm run preview` | `vite preview` | Locally previews the production build created by `npm run build`. |
| `npm run convert-presets` | `node scripts/convert-presets.js` | Runs the preset conversion script to process `.milk` files or other preset formats. |

### Environment Setup

1. Ensure you have **Node.js** installed (v18+ recommended).
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) There is currently no `.env` requirement. If backend integrations are added in the future, copy `.env.example` to `.env` and fill in the required variables.

### Testing Procedures

Currently, BrainBlur relies on manual testing. 
- Ensure all visualizer presets render correctly in `npm run dev`.
- Verify the UI components (preset browser, skin browser) function properly without throwing console errors.
- Test system audio capture by clicking the Microphone button and verifying the `getDisplayMedia` hook connects accurately to the global `AudioContext` without `InvalidAccessError` exceptions.

## Making Changes

1. **Keep it focused**: Adhere to the project's rule of MANY SMALL FILES over FEW LARGE FILES.
2. **Immutability**: Avoid mutating objects.
3. **Review**: Ensure no `console.log` statements remain in your production code.
