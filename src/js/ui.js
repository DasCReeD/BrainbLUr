/**
 * ui.js — Overlay Controller
 *
 * Manages the overlay bar, info panel, keyboard shortcuts,
 * auto-hide behavior, and touch gestures.
 */

import * as presets from './presets.js'

let overlayEl, presetNameEl, lockBtn, infoPanel, splashScreen
let hideTimer = null
const AUTO_HIDE_MS = 3000

/**
 * Initialize the UI overlay and wire up all controls.
 * @param {object} callbacks - { onStartTab, onStartMic, onStop }
 */
export function init(callbacks) {
  overlayEl = document.getElementById('overlay')
  presetNameEl = document.getElementById('preset-name')
  lockBtn = document.getElementById('btn-lock')
  infoPanel = document.getElementById('info-panel')
  splashScreen = document.getElementById('splash-screen')

  // Splash screen buttons
  document.getElementById('btn-start-tab').addEventListener('click', callbacks.onStartTab)
  document.getElementById('btn-start-mic').addEventListener('click', callbacks.onStartMic)

  // Overlay control buttons
  document.getElementById('btn-next').addEventListener('click', () => presets.nextPreset())
  document.getElementById('btn-prev').addEventListener('click', () => presets.prevPreset())
  document.getElementById('btn-lock').addEventListener('click', () => presets.toggleLock())
  document.getElementById('btn-fullscreen').addEventListener('click', toggleFullscreen)
  document.getElementById('btn-stop').addEventListener('click', callbacks.onStop)

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeydown)

  // Auto-hide overlay on mouse inactivity
  document.addEventListener('mousemove', showOverlayTemporarily)
  document.addEventListener('touchstart', showOverlayTemporarily, { passive: true })

  // Listen for preset events
  window.addEventListener('brainblur:preset-changed', (e) => {
    updatePresetName(e.detail.name)
  })

  window.addEventListener('brainblur:preset-lock', (e) => {
    updateLockState(e.detail.locked)
  })

  // Browser compat hint
  const compatEl = document.getElementById('splash-compat')
  if (compatEl && !navigator.mediaDevices?.getDisplayMedia) {
    compatEl.textContent = '⚠ Tab audio capture not supported in this browser. Use microphone instead.'
    const tabBtn = document.getElementById('btn-start-tab')
    if (tabBtn) {
      tabBtn.style.opacity = '0.5'
      tabBtn.title = 'Not supported in this browser'
    }
  }

  // Touch gestures (swipe left/right for preset change)
  setupTouchGestures()
}

/**
 * Dismiss the splash screen and show the overlay.
 */
export function dismissSplash() {
  if (splashScreen) {
    splashScreen.classList.add('dismissed')
  }
  showOverlayTemporarily()
}

/**
 * Show the overlay, then hide after AUTO_HIDE_MS.
 */
function showOverlayTemporarily() {
  if (!overlayEl) return
  overlayEl.classList.remove('hidden')
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    overlayEl.classList.add('hidden')
  }, AUTO_HIDE_MS)
}

/**
 * Update the displayed preset name.
 */
function updatePresetName(name) {
  if (presetNameEl) {
    // Truncate very long names
    const display = name.length > 50 ? name.substring(0, 47) + '...' : name
    presetNameEl.textContent = display
    presetNameEl.title = name
  }
}

/**
 * Update lock button visual state.
 */
function updateLockState(locked) {
  if (lockBtn) {
    lockBtn.textContent = locked ? '🔒' : '🔓'
    lockBtn.classList.toggle('active', locked)
  }
}

/**
 * Handle keyboard shortcuts.
 */
function handleKeydown(e) {
  // Don't capture if user is typing in an input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

  switch (e.key) {
    case 'ArrowRight':
    case 'n':
    case 'N':
      e.preventDefault()
      presets.nextPreset()
      showOverlayTemporarily()
      break

    case 'ArrowLeft':
    case 'p':
    case 'P':
      e.preventDefault()
      presets.prevPreset()
      showOverlayTemporarily()
      break

    case 'l':
    case 'L':
      e.preventDefault()
      presets.toggleLock()
      showOverlayTemporarily()
      break

    case 'f':
    case 'F':
      e.preventDefault()
      toggleFullscreen()
      break

    case 'i':
    case 'I':
      e.preventDefault()
      toggleInfoPanel()
      break

    case 'Escape':
      if (infoPanel && !infoPanel.classList.contains('hidden')) {
        infoPanel.classList.add('hidden')
      }
      break
  }
}

/**
 * Toggle fullscreen mode.
 */
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {})
  } else {
    document.exitFullscreen().catch(() => {})
  }
}

/**
 * Toggle info panel visibility.
 */
function toggleInfoPanel() {
  if (infoPanel) {
    infoPanel.classList.toggle('hidden')
  }
}

/**
 * Set up touch swipe gestures for mobile.
 */
function setupTouchGestures() {
  let touchStartX = 0
  const MIN_SWIPE = 50

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX
  }, { passive: true })

  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX
    if (Math.abs(dx) > MIN_SWIPE) {
      if (dx > 0) presets.prevPreset()
      else presets.nextPreset()
      showOverlayTemporarily()
    }
  }, { passive: true })
}
