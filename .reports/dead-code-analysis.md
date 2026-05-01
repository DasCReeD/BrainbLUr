# Dead Code Analysis Report

**Date:** 2026-05-01
**Tools Used:** `knip`, `depcheck`

## 1. Dependency Analysis (`depcheck`)
No unused dependencies were found in the main `package.json`. The warnings emitted by `depcheck` were isolated to the `.\.gemini\skills` directory, which is part of the agentic harness and not the actual application bundle.

## 2. Unused Files (`knip`)
`knip` flagged the following files as unused:
- `scripts/build-skin-manifest.js`
- Numerous files in `.\.gemini\skills\...`

**Categorization:**
- `scripts/build-skin-manifest.js`: **[DANGER]** This is a critical build script used manually or via CI to package Winamp skins. It should **not** be deleted.
- `.gemini/*`: **[SAFE]** These are workflow files, but they belong to the agent harness and are ignored for application pruning.

## 3. Unused Exports (`knip`)
`knip` flagged the following exports within `src/js/` as unused:

1. `getInstance` (`src/js/webamp-init.js`)
2. `close` (`src/js/preset-browser.js`)
3. `getVisualizer` (`src/js/engine.js`)
4. `isTabCaptureSupported` (`src/js/audio.js`)
5. `captureMicAudio` (`src/js/audio.js`)
6. `cleanup` (`src/js/audio.js`)
7. `getAudioContext` (`src/js/audio.js`)

**Categorization:**
- `getInstance`, `getVisualizer`, `getAudioContext`: **[CAUTION]** These are getter utilities. While currently unused by `main.js` or the UI, they provide architectural access to Singletons (Webamp, Butterchurn, AudioContext) which might be needed for console debugging or future feature additions.
- `close`: **[CAUTION]** Preset browser close logic, possibly unused because closing is handled via a generic UI event listener rather than an explicit export.
- `isTabCaptureSupported`, `captureMicAudio`, `cleanup`: **[SAFE]** These audio utilities appear to be dead code, likely remnants from testing different audio capture strategies before settling on Webamp's audio node.

## Conclusion
Most unused code is architectural scaffolding (getters/scripts). Very few actual "dead" application files exist.
