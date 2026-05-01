import butterchurn from 'butterchurn'
import butterchurnPresets from 'butterchurn-presets'
import * as butterchurnWeekly from 'butterchurn-presets-weekly'
import * as butterchurnBaron from 'butterchurn-presets-baron'

let visualizer = null
let audioContext = null

// Combine presets from default and extra packs
const presetsMap = {
  ...butterchurnPresets,
  ...butterchurnWeekly,
  ...butterchurnBaron
}

// Extract keys and cap to exactly the top 250
const presetKeys = Object.keys(presetsMap).slice(0, 250)

export async function initEngine(canvas, audioCtx, audioNode) {
  audioContext = audioCtx
  
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  visualizer = butterchurn.createVisualizer(audioContext, canvas, {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1
  })

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

