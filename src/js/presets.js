/**
 * presets.js — Preset Manager
 *
 * Loads presets from butterchurn-presets npm package,
 * handles random cycling with smooth blend transitions,
 * and supports lock/next/prev controls.
 */

import butterchurnPresets from 'butterchurn-presets'

let allPresets = {}
let presetNames = []
let currentIndex = -1
let isLocked = false
let cycleTimerId = null
let loadPresetFn = null // injected from engine

// Config
const CYCLE_INTERVAL_MS = 20000  // 20 seconds between preset changes
const BLEND_SECONDS = 2.7       // Smooth blend duration

/**
 * Initialize the preset manager.
 * @param {Function} engineLoadPreset - engine.loadPreset function
 */
export function init(engineLoadPreset) {
  loadPresetFn = engineLoadPreset

  // Load all presets from the butterchurn-presets package
  allPresets = butterchurnPresets.getPresets()
  presetNames = Object.keys(allPresets)

  console.log(`[Presets] Loaded ${presetNames.length} presets`)
}

/**
 * Get total number of available presets.
 */
export function getCount() {
  return presetNames.length
}

/**
 * Get the name of the currently loaded preset.
 */
export function getCurrentPresetName() {
  if (currentIndex < 0 || currentIndex >= presetNames.length) return 'None'
  return presetNames[currentIndex]
}

/**
 * Load a random preset.
 */
export function loadRandom() {
  if (presetNames.length === 0) return
  let idx
  do {
    idx = Math.floor(Math.random() * presetNames.length)
  } while (idx === currentIndex && presetNames.length > 1)

  loadByIndex(idx)
}

/**
 * Load a specific preset by index.
 * @param {number} index
 */
export function loadByIndex(index) {
  if (index < 0 || index >= presetNames.length) return
  currentIndex = index
  const name = presetNames[currentIndex]
  const preset = allPresets[name]

  if (loadPresetFn && preset) {
    loadPresetFn(preset, BLEND_SECONDS)
  }

  window.dispatchEvent(new CustomEvent('brainblur:preset-changed', {
    detail: { name, index: currentIndex }
  }))
}

/**
 * Load the first preset immediately (no blend).
 */
export function loadFirst() {
  if (presetNames.length === 0) return
  currentIndex = Math.floor(Math.random() * presetNames.length)
  const name = presetNames[currentIndex]
  const preset = allPresets[name]

  if (loadPresetFn && preset) {
    loadPresetFn(preset, 0) // instant load, no blend
  }

  window.dispatchEvent(new CustomEvent('brainblur:preset-changed', {
    detail: { name, index: currentIndex }
  }))
}

/**
 * Go to the next preset.
 */
export function nextPreset() {
  if (isLocked) return
  const idx = (currentIndex + 1) % presetNames.length
  loadByIndex(idx)
}

/**
 * Go to the previous preset.
 */
export function prevPreset() {
  if (isLocked) return
  const idx = (currentIndex - 1 + presetNames.length) % presetNames.length
  loadByIndex(idx)
}

/**
 * Lock the current preset (stops auto-cycling from changing it).
 */
export function lockPreset() {
  isLocked = true
  window.dispatchEvent(new CustomEvent('brainblur:preset-lock', { detail: { locked: true } }))
}

/**
 * Unlock the current preset.
 */
export function unlockPreset() {
  isLocked = false
  window.dispatchEvent(new CustomEvent('brainblur:preset-lock', { detail: { locked: false } }))
}

/**
 * Toggle lock state.
 */
export function toggleLock() {
  if (isLocked) unlockPreset()
  else lockPreset()
}

/**
 * Check if preset is locked.
 */
export function getIsLocked() {
  return isLocked
}

/**
 * Start auto-cycling presets.
 */
export function startCycling() {
  stopCycling()
  cycleTimerId = setInterval(() => {
    if (!isLocked) {
      loadRandom()
    }
  }, CYCLE_INTERVAL_MS)
}

/**
 * Stop auto-cycling.
 */
export function stopCycling() {
  if (cycleTimerId) {
    clearInterval(cycleTimerId)
    cycleTimerId = null
  }
}
