# BrainBlur Runbook

This runbook contains operational procedures, deployment steps, and troubleshooting guides for BrainBlur.

## Deployment Procedures

BrainBlur is a static web application built with Vite.

1. **Build the Application:**
   ```bash
   npm run build
   ```
2. **Output:** The compiled assets will be placed in the `dist/` directory.
3. **Hosting:** Deploy the contents of the `dist/` directory to any static file hosting service (e.g., GitHub Pages, Vercel, Netlify, AWS S3).

## Monitoring and Alerts

As a purely client-side WebGL application, server-side monitoring is minimal.
- **Client-side Errors:** Monitor the browser console for JavaScript exceptions or WebGL context losses. Look specifically for `InvalidAccessError` when interacting with the Web Audio API if capture systems misbehave.
- **Performance:** Ensure that the Butterchurn rendering engine maintains a stable 60 FPS. Frame drops usually indicate heavy preset computations or hardware limitations.

## Common Issues and Fixes

### Issue: WebGL Context Lost
**Symptoms:** The visualizer suddenly turns black or stops rendering.
**Fix:** The browser may have dropped the WebGL context to save resources. Refreshing the page typically restores the context.

### Issue: Presets Failing to Load
**Symptoms:** Specific presets do not display, or the preset browser fails to parse them.
**Fix:** Check if the preset requires textures or assets that are missing. Verify the output of `npm run convert-presets` to ensure presets were parsed correctly.

### Issue: System Audio Capture Fails
**Symptoms:** Clicking the microphone capture button yields an "Error" state, or the visualizer fails to react to system audio.
**Fix:** 
1. Ensure the user selected a screen and toggled the "Share system audio" switch in the browser's native `getDisplayMedia` dialog.
2. Verify that `audio.js` is accurately sharing the global `dummyCtx` rather than instantiating a localized `AudioContext`, preventing cross-context exceptions.

## Rollback Procedures

If a deployment introduces critical bugs (e.g., UI unresponsive, WebGL crashes):
1. Identify the last known stable Git commit.
2. Revert to that commit: `git revert <commit-hash>`
3. Rebuild the application using `npm run build`.
4. Deploy the newly generated `dist/` folder.
