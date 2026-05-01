import { initEngine, loadPresetByIndex, getPresetKeys, loadRandomPreset, reconnectAudio } from './engine.js'
import { toggle as toggleSkinBrowser } from './skin-browser.js'
import { toggle as togglePresetBrowser } from './preset-browser.js'
import { captureTabAudio } from './audio.js'

let isLocked = false
let currentPresetIndex = 0
let presetTimer = null
let isDoubleSize = true // Start doubled by default
let isWinampHidden = false

export async function initMilkdropControls(webampInstance) {
  // Apply initial default zoom
  document.getElementById('webamp-container').classList.add('zoom-2x')

  // Create UI
  const controlBar = document.createElement('div')
  controlBar.id = 'milkdrop-controls'
  controlBar.innerHTML = `
    <button id="btn-milk-system" title="Capture Default Audio (No Popups)">🎤 Capture</button>
    <button id="btn-milk-winamp" title="Toggle Winamp Player">👁 Winamp</button>
    <button id="btn-milk-skins" title="Browse Skins (S)">🎨 Skins</button>
    <button id="btn-milk-presets" title="Preset Gallery">🌌 Presets</button>
    <button id="btn-milk-scale" title="Toggle 1x/2x Scale">🔍 2x</button>
    <button id="btn-milk-prev" title="Previous Preset (Backspace)">⏮</button>
    <button id="btn-milk-lock" title="Lock Preset (L)">🔓</button>
    <div id="milk-preset-name" title="Current Preset">Initializing...</div>
    <button id="btn-milk-next" title="Next Preset (Space)">⏭</button>
  `
  document.body.appendChild(controlBar)

  const nameEl = document.getElementById('milk-preset-name')
  const lockBtn = document.getElementById('btn-milk-lock')
  const scaleBtn = document.getElementById('btn-milk-scale')
  const winampBtn = document.getElementById('btn-milk-winamp')
  const skinsBtn = document.getElementById('btn-milk-skins')
  const presetsBtn = document.getElementById('btn-milk-presets')
  const zenBtn = document.getElementById('btn-zen-mode')
  const systemBtn = document.getElementById('btn-milk-system')

  let dummyCtx = null

  // Capture Audio Button Logic (No Popups!)
  systemBtn.addEventListener('click', async () => {
    try {
      nameEl.textContent = 'Starting Audio Capture...'
      const { audioContext, audioNode } = await captureTabAudio(dummyCtx)
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      // Reconnect Butterchurn to the live stream
      reconnectAudio(audioNode)

      systemBtn.style.color = '#fff'
      systemBtn.style.background = 'rgba(30, 215, 96, 0.4)'
      systemBtn.innerText = '🎤 Active'
      nameEl.textContent = 'Audio Hooked Successfully!'
      setTimeout(() => {
        updatePresetDisplay({ name: getPresetKeys()[currentPresetIndex], index: currentPresetIndex })
      }, 2000)
    } catch (err) {
      console.error('[Milkdrop] Audio capture failed:', err)
      nameEl.textContent = 'Capture Cancelled. Click Capture to try again.'
      systemBtn.innerText = '🎤 Error'
    }
  })

  // Resume the dummy context on first click anywhere so the visualizer isn't stuck on a black frame
  const resumeDummy = () => {
    if (dummyCtx && dummyCtx.state === 'suspended') {
      dummyCtx.resume()
    }
    document.removeEventListener('click', resumeDummy)
  }
  document.addEventListener('click', resumeDummy)

  // Wire new modals
  skinsBtn.addEventListener('click', toggleSkinBrowser)
  presetsBtn.addEventListener('click', togglePresetBrowser)

  // Toggle Winamp Visibility
  winampBtn.addEventListener('click', () => {
    isWinampHidden = !isWinampHidden
    const wa = document.getElementById('webamp-container')
    if (isWinampHidden) {
      wa.style.display = 'none'
      winampBtn.style.opacity = '0.5'
    } else {
      wa.style.display = ''
      winampBtn.style.opacity = '1'
    }
  })

  // Zen Mode Logic
  let zenMode = false
  function toggleZenMode() {
    zenMode = !zenMode
    const wa = document.getElementById('webamp-container')
    
    if (zenMode) {
      wa.classList.add('zen-hidden')
      controlBar.classList.add('zen-hidden')
      zenBtn.style.opacity = '0.2'
    } else {
      wa.classList.remove('zen-hidden')
      controlBar.classList.remove('zen-hidden')
      zenBtn.style.opacity = '1'
    }
  }

  zenBtn.addEventListener('click', toggleZenMode)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && zenMode) {
      toggleZenMode()
    }
  })

  function updatePresetDisplay(preset) {
    if (preset) {
      nameEl.textContent = preset.name
      currentPresetIndex = preset.index
    }
  }

  function startAutoTransition() {
    if (presetTimer) clearInterval(presetTimer)
    if (!isLocked) {
      presetTimer = setInterval(() => {
        updatePresetDisplay(loadRandomPreset())
      }, 15000) // Change every 15s
    }
  }

  // Next Preset
  document.getElementById('btn-milk-next').addEventListener('click', () => {
    const keys = getPresetKeys()
    let nextIdx = currentPresetIndex + 1
    if (nextIdx >= keys.length) nextIdx = 0
    updatePresetDisplay(loadPresetByIndex(nextIdx))
    startAutoTransition()
  })

  // Previous Preset
  document.getElementById('btn-milk-prev').addEventListener('click', () => {
    const keys = getPresetKeys()
    let prevIdx = currentPresetIndex - 1
    if (prevIdx < 0) prevIdx = keys.length - 1
    updatePresetDisplay(loadPresetByIndex(prevIdx))
    startAutoTransition()
  })

  // Lock Preset
  lockBtn.addEventListener('click', () => {
    isLocked = !isLocked
    lockBtn.textContent = isLocked ? '🔒' : '🔓'
    if (isLocked) {
      if (presetTimer) clearInterval(presetTimer)
    } else {
      startAutoTransition()
    }
  })

  // Toggle 1x/2x Scale
  scaleBtn.addEventListener('click', () => {
    isDoubleSize = !isDoubleSize
    scaleBtn.textContent = isDoubleSize ? '🔍 2x' : '🔍 1x'
    const container = document.getElementById('webamp-container')
    if (isDoubleSize) {
      container.classList.add('zoom-2x')
    } else {
      container.classList.remove('zoom-2x')
    }
  })

  // Initialize visualizer with a dummy audio context so it runs beautifully on load!
  async function initSilentVisuals() {
    const canvas = document.getElementById('canvas')
    dummyCtx = new (window.AudioContext || window.webkitAudioContext)()
    await initEngine(canvas, dummyCtx, dummyCtx.createGain())
    
    updatePresetDisplay(loadRandomPreset())
    startAutoTransition()
  }

  initSilentVisuals()
}
