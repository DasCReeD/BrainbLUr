import butterchurn from 'butterchurn'
import butterchurnPresets from 'butterchurn-presets'

let visualizer = null
let audioContext = null

// Start with just the base presets for immediate rendering
let presetsMap = butterchurnPresets.getPresets ? butterchurnPresets.getPresets() : butterchurnPresets
let presetKeys = Object.keys(presetsMap).slice(0, 250)

export async function initEngine(canvas, audioCtx, audioNode) {
  audioContext = audioCtx
  
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  visualizer = butterchurn.createVisualizer(audioContext, canvas, {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1
  })

  // Start background loading the massive preset packs after a slight delay
  // This prevents the UI from freezing on initial load while downloading ~200MB of presets
  setTimeout(async () => {
    try {
      console.log('[Milkdrop] Background loading extended presets...')
      // Dynamically import the heavy packs
      const [weekly, baron] = await Promise.all([
        import('butterchurn-presets-weekly'),
        import('butterchurn-presets-baron')
      ])

      presetsMap = {
        ...(butterchurnPresets.getPresets ? butterchurnPresets.getPresets() : butterchurnPresets),
        ...(weekly.getPresets ? weekly.getPresets() : weekly),
        ...(baron.getPresets ? baron.getPresets() : baron)
      }
      
      presetKeys = Object.keys(presetsMap)
      console.log(`[Milkdrop] Successfully loaded ${presetKeys.length} total presets!`)
      
      // Dispatch event to UI so the preset browser can rebuild its list
      window.dispatchEvent(new CustomEvent('milkdrop:presets-loaded'))
    } catch (e) {
      console.error('[Milkdrop] Error background loading presets:', e)
    }
  }, 2000)

  // Set initial preset
  loadRandomPreset()

  // Handle resize
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    visualizer.setRendererSize(window.innerWidth, window.innerHeight)
  })

  // Connect audio
  visualizer.connectAudio(audioNode)

  // Start render loop
  function render() {
    visualizer.render()
    requestAnimationFrame(render)
  }
  requestAnimationFrame(render)

  return visualizer
}

export function loadRandomPreset() {
  if (!visualizer) return
  const randomKey = presetKeys[Math.floor(Math.random() * presetKeys.length)]
  visualizer.loadPreset(presetsMap[randomKey], 2.0) // 2.0 second blend
  return { name: randomKey, index: presetKeys.indexOf(randomKey) }
}

export function loadPresetByIndex(index) {
  if (!visualizer || index < 0 || index >= presetKeys.length) return
  const key = presetKeys[index]
  visualizer.loadPreset(presetsMap[key], 2.0)
  return { name: key, index }
}

export function reconnectAudio(audioNode) {
  if (visualizer) {
    visualizer.connectAudio(audioNode)
  }
}

export function getPresetKeys() {
  return presetKeys
}

export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('milkdrop_favorites') || '[]')
  } catch (e) {
    return []
  }
}

export function isFavorite(key) {
  return getFavorites().includes(key)
}

export function toggleFavorite(key) {
  let favs = getFavorites()
  if (favs.includes(key)) {
    favs = favs.filter(k => k !== key)
  } else {
    favs.push(key)
  }
  localStorage.setItem('milkdrop_favorites', JSON.stringify(favs))
  return favs.includes(key)
}

export function loadRandomFavoritePreset() {
  if (!visualizer) return null
  const favs = getFavorites()
  const validFavs = favs.filter(k => presetKeys.includes(k))
  
  if (validFavs.length === 0) return loadRandomPreset() // fallback
  
  const randomKey = validFavs[Math.floor(Math.random() * validFavs.length)]
  visualizer.loadPreset(presetsMap[randomKey], 2.0)
  return { name: randomKey, index: presetKeys.indexOf(randomKey) }
}

