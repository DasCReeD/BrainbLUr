# BrainBlur Runbook

Operational and deployment guide for the BrainBlur visualizer.

## Deployment Procedures
BrainBlur is a purely static site deployed to GitHub Pages.
*   **CI/CD Pipeline:** Deployment is entirely automated via GitHub Actions (`.github/workflows/deploy.yml`).
*   **Trigger:** Any commit pushed or merged to the `main` branch will automatically trigger a Vite build and deploy the `dist/` folder to the `gh-pages` branch.
*   **Rollback:** To rollback a deployment, use `git revert` on the `main` branch or manually trigger the GitHub Action from an older, stable commit.

## Monitoring and Alerts
Since there is no active backend server, monitoring relies entirely on client-side browser performance:
*   **Memory Profiling:** Watch for memory leaks when users rapidly cycle through thousands of presets.
*   **Browser FPS:** The Butterchurn WebGL canvas targets 60fps.

## Common Issues and Fixes

### 1. "Audio Capture Failed" or "Black Screen"
*   **Cause:** The user failed to toggle the "Also share system audio" checkbox in the Chrome screen share dialog, or the browser blocked the `AudioContext` from starting automatically.
*   **Fix:** We have implemented a dummy `AudioContext` that resumes on the first user click. The new Tutorial UI explicitly warns users about the system audio toggle.

### 2. UI Freezes on Load
*   **Cause:** Loading 40,000+ presets into the DOM simultaneously blocks the main thread.
*   **Fix:** Presets are now loaded in the background, and the `preset-browser.js` uses a `requestAnimationFrame` batch-renderer to append items to the list asynchronously.

### 3. Missing Dependencies on Fresh Clone
*   **Cause:** The massive `weekly` and `baron` preset packs are not installed.
*   **Fix:** Run `npm install` to ensure all `butterchurn-presets-*` packages are fetched from npm.
