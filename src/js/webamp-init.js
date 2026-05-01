/**
 * webamp-init.js — Webamp + Butterchurn Integration
 *
 * Initializes the Webamp player with native MilkDrop (Butterchurn)
 * visualizer support. Handles skin loading, audio source switching,
 * and exposes the webamp instance for skin browser integration.
 */

import Webamp from 'webamp'
import { initMilkdropControls } from './milkdrop-controls.js'

let webampInstance = null
const BASE_URL = import.meta.env.BASE_URL || '/BrainbLUr/'

/**
 * Initialize and render Webamp.
 * @param {HTMLElement} container - DOM element to mount Webamp into
 * @returns {Promise<Webamp>} the webamp instance
 */
export async function init(container) {
  // Load skin manifest to find the default skin
  let defaultSkinUrl = null
  try {
    const res = await fetch(`${BASE_URL}skins/manifest.json`)
    const manifest = await res.json()
    if (manifest.defaultSkin) {
      defaultSkinUrl = `${BASE_URL}skins/${manifest.defaultSkin}`
    }
  } catch (err) {
    console.warn('[Webamp] Could not load skin manifest, using default skin')
  }

  const config = {
    // Initial playlist — empty
    initialTracks: [],

    // Equalizer and playlist visible by default (No Milkdrop)
    __initialWindowLayout: {
      main: { position: { x: 20, y: 20 } },
      equalizer: { position: { x: 20, y: 136 } },
      playlist: { position: { x: 295, y: 20 }, size: [275, 232] }
    }
  }

  // Apply initial skin if available
  if (defaultSkinUrl) {
    config.initialSkin = { url: defaultSkinUrl }
  }

  webampInstance = new Webamp(config)

  // Render when ready
  await webampInstance.renderWhenReady(container)

  // Prevent Webamp from being closed (it destroys itself)
  webampInstance.onClose(() => {
    // Re-show instead of destroying
    webampInstance.reopen()
  })

  // Wait for Webamp to render
  setTimeout(() => {
    if (webampInstance.store) {
      // Initialize custom Milkdrop UI controls for standalone engine
      initMilkdropControls(webampInstance)
    }
  }, 500)

  console.log('[Webamp] Initialized as decoupled skin interface')

  return webampInstance
}

/**
 * Change the Webamp skin.
 * @param {string} skinUrl - URL to a .wsz file
 */
export async function setSkin(skinUrl) {
  if (webampInstance) {
    await webampInstance.setSkinFromUrl(skinUrl)
  }
}

