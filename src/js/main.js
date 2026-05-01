/**
 * main.js — BrainBlur Entry Point
 *
 * Initializes Webamp with Butterchurn visualizer
 * and the skin browser gallery.
 */

import '../css/style.css'
import { init as initWebamp } from './webamp-init.js'
import { init as initSkinBrowser } from './skin-browser.js'
import { init as initPresetBrowser } from './preset-browser.js'

async function main() {
  console.log('🧠 BrainBlur v0.2.0 — Webamp Edition')

  const container = document.getElementById('webamp-container')
  if (!container) {
    console.error('[Main] #webamp-container not found')
    return
  }

  try {
    // Initialize Webamp with Butterchurn
    await initWebamp(container)

    // Initialize skin browser
    await initSkinBrowser()
    
    // Initialize preset browser
    initPresetBrowser()

    console.log('[Main] All systems go!')
  } catch (err) {
    console.error('[Main] Initialization failed:', err)
  }
}

// Go
main()
