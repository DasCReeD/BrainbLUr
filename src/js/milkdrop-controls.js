import { initEngine, loadPresetByIndex, getPresetKeys, loadRandomPreset, reconnectAudio, getFavorites, isFavorite, toggleFavorite, loadRandomFavoritePreset } from './engine.js'
import { toggle as toggleSkinBrowser } from './skin-browser.js'
import { toggle as togglePresetBrowser } from './preset-browser.js'
import { captureTabAudio } from './audio.js'
import { initTutorial } from './tutorial.js'

let isLocked = false
let currentPresetIndex = 0
let presetTimer = null
let isWinampHidden = false
let transitionMode = 'all' // 'all' or 'favs'

export async function initMilkdropControls(webampInstance) {
  // Apply initial default zoom
  document.getElementById('webamp-container').classList.add('zoom-2x')

  // Create UI
  const controlBar = document.createElement('div')
  controlBar.id = 'milkdrop-controls'
  controlBar.innerHTML = `
    <div class="milk-control-group left">
      <button id="btn-milk-system" title="Capture Default Audio (No Popups)"><i>🎤</i><span>Capture</span></button>
      <button id="btn-milk-winamp" title="Toggle Winamp Player"><i>🎵</i><span>Winamp</span></button>
      <button id="btn-milk-skins" title="Browse Skins (S)"><i>🎨</i><span>Skins</span></button>
      <button id="btn-milk-presets" title="Preset Gallery"><i>🌌</i><span>Presets</span></button>
    </div>
    <div class="milk-control-group center">
      <button id="btn-milk-prev" title="Previous Preset (Backspace)"><i>⏮</i><span>Prev</span></button>
      <button id="btn-milk-mode" title="Transition Mode"><i>🎲</i><span>All</span></button>
      <button id="btn-milk-lock" title="Lock Preset (L)"><i>🔓</i><span>Lock</span></button>
      <div id="milk-preset-name" title="Current Preset"><span class="marquee-container">Initializing...</span></div>
      <button id="btn-milk-fav" title="Favorite Preset"><i>☆</i><span>Fav</span></button>
      <button id="btn-milk-next" title="Next Preset (Space)"><i>⏭</i><span>Next</span></button>
    </div>
  `
  document.body.appendChild(controlBar)

  const nameEl = document.getElementById('milk-preset-name')
  const lockBtn = document.getElementById('btn-milk-lock')
  const modeBtn = document.getElementById('btn-milk-mode')
  const favBtn = document.getElementById('btn-milk-fav')
  const winampBtn = document.getElementById('btn-milk-winamp')
  const skinsBtn = document.getElementById('btn-milk-skins')
  const presetsBtn = document.getElementById('btn-milk-presets')
  const zenBtn = document.getElementById('btn-zen-mode')
  const systemBtn = document.getElementById('btn-milk-system')

  // Initialize tutorial on load
  initTutorial()

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
      systemBtn.innerHTML = '<i>🎤</i><span>Active</span>'
      nameEl.textContent = 'Audio Hooked Successfully!'
      setTimeout(() => {
        updatePresetDisplay({ name: getPresetKeys()[currentPresetIndex], index: currentPresetIndex })
      }, 2000)
    } catch (err) {
      console.error('[Milkdrop] Audio capture failed:', err)
      nameEl.textContent = 'Capture Cancelled. Click Capture to try again.'
      systemBtn.innerHTML = '<i>🎤</i><span>Error</span>'
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
    // Webamp injects the #webamp div directly into the body or container when it renders
    const wa = document.getElementById('webamp') || document.getElementById('webamp-container')
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

  function updateFavButtonState(isFav) {
    if (isFav) {
      favBtn.classList.add('is-fav')
      favBtn.innerHTML = '<i>⭐</i><span>Fav</span>'
    } else {
      favBtn.classList.remove('is-fav')
      favBtn.innerHTML = '<i>☆</i><span>Fav</span>'
    }
  }

  window.addEventListener('milkdrop:favorites-updated', () => {
    const keys = getPresetKeys()
    updateFavButtonState(isFavorite(keys[currentPresetIndex]))
  })

  function updatePresetDisplay(preset) {
    if (preset) {
      // Check if text is long enough to need scrolling
      if (preset.name.length > 35) {
        nameEl.innerHTML = `<span class="marquee-scroll">${preset.name}</span>`
      } else {
        nameEl.innerHTML = `<span class="marquee-container">${preset.name}</span>`
      }
      currentPresetIndex = preset.index
      updateFavButtonState(isFavorite(preset.name))
    }
  }
  window.updateMilkdropPresetDisplay = updatePresetDisplay

  function startAutoTransition() {
    if (presetTimer) clearInterval(presetTimer)
    if (!isLocked) {
      presetTimer = setInterval(() => {
        if (transitionMode === 'favs') {
          updatePresetDisplay(loadRandomFavoritePreset())
        } else {
          updatePresetDisplay(loadRandomPreset())
        }
      }, 15000) // Change every 15s
    }
  }

  function getFilteredNextIndex(dir) {
    const keys = getPresetKeys()
    if (transitionMode === 'favs') {
      const favs = getFavorites()
      const validFavs = favs.filter(k => keys.includes(k))
      if (validFavs.length > 0) {
        const currentKey = keys[currentPresetIndex]
        let idx = validFavs.indexOf(currentKey)
        if (idx === -1) idx = dir > 0 ? -1 : 0
        idx = (idx + dir + validFavs.length) % validFavs.length
        return keys.indexOf(validFavs[idx])
      }
    }
    return (currentPresetIndex + dir + keys.length) % keys.length
  }

  // Next Preset
  document.getElementById('btn-milk-next').addEventListener('click', () => {
    const nextIdx = getFilteredNextIndex(1)
    updatePresetDisplay(loadPresetByIndex(nextIdx))
    startAutoTransition()
  })

  // Previous Preset
  document.getElementById('btn-milk-prev').addEventListener('click', () => {
    const prevIdx = getFilteredNextIndex(-1)
    updatePresetDisplay(loadPresetByIndex(prevIdx))
    startAutoTransition()
  })

  // Favorite Preset
  favBtn.addEventListener('click', () => {
    const keys = getPresetKeys()
    const currentKey = keys[currentPresetIndex]
    if (!currentKey) return
    const nowFav = toggleFavorite(currentKey)
    updateFavButtonState(nowFav)
    window.dispatchEvent(new CustomEvent('milkdrop:favorites-updated'))
  })

  // Transition Mode Toggle
  modeBtn.addEventListener('click', () => {
    transitionMode = transitionMode === 'all' ? 'favs' : 'all'
    if (transitionMode === 'favs') {
      modeBtn.innerHTML = '<i>⭐</i><span>Favs</span>'
      modeBtn.classList.add('is-fav')
    } else {
      modeBtn.innerHTML = '<i>🎲</i><span>All</span>'
      modeBtn.classList.remove('is-fav')
    }
    startAutoTransition()
  })

  // Lock Preset
  lockBtn.addEventListener('click', () => {
    isLocked = !isLocked
    lockBtn.innerHTML = isLocked ? '<i>🔒</i><span>Lock</span>' : '<i>🔓</i><span>Lock</span>'
    if (isLocked) {
      if (presetTimer) clearInterval(presetTimer)
    } else {
      startAutoTransition()
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
