/**
 * main.js — BrainBlur Application Entry Point
 *
 * Wires together audio, engine, presets, and UI modules.
 */

import * as audio from './audio.js'
import * as engine from './engine.js'
import * as presets from './presets.js'
import * as ui from './ui.js'

/**
 * Start the visualizer with the given audio source.
 * @param {'tab'|'mic'} mode
 */
async function start(mode) {
  try {
    // 1. Capture audio
    let result
    if (mode === 'tab') {
      result = await audio.captureTabAudio()
    } else {
      result = await audio.captureMicAudio()
    }

    const { audioContext, audioNode } = result

    // 2. Initialize engine
    const canvas = document.getElementById('visualizer-canvas')
    engine.init(canvas, audioContext)
    engine.connectAudio(audioNode)

    // 3. Initialize presets
    presets.init(engine.loadPreset)
    presets.loadFirst()
    presets.startCycling()

    // 4. Start rendering
    engine.startRenderLoop()

    // 5. Dismiss splash, show overlay
    ui.dismissSplash()

    console.log(`[BrainBlur] Started with ${mode} audio — ${presets.getCount()} presets loaded`)
  } catch (err) {
    console.error('[BrainBlur] Failed to start:', err)
    const hint = document.getElementById('splash-hint')
    if (hint) {
      hint.textContent = `Error: ${err.message}`
      hint.style.color = '#ef4444'
    }
  }
}

/**
 * Stop the visualizer and return to splash.
 */
function stop() {
  presets.stopCycling()
  engine.stopRenderLoop()
  engine.destroy()
  audio.cleanup()

  // Show splash again
  const splash = document.getElementById('splash-screen')
  if (splash) splash.classList.remove('dismissed')

  const hint = document.getElementById('splash-hint')
  if (hint) {
    hint.textContent = 'Select the browser tab playing your music'
    hint.style.color = ''
  }
}

// Listen for audio stream ending (user stopped sharing)
window.addEventListener('brainblur:audio-ended', () => {
  stop()
})

// Initialize UI
ui.init({
  onStartTab: () => start('tab'),
  onStartMic: () => start('mic'),
  onStop: () => stop()
})

console.log('[BrainBlur] Ready — click Start to begin')
