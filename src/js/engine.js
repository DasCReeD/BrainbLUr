/**
 * engine.js — Butterchurn Visualizer Wrapper
 *
 * Manages the WebGL 2 Butterchurn instance, the render loop,
 * and canvas resizing.
 */

import butterchurn from 'butterchurn'

let visualizer = null
let canvas = null
let animFrameId = null
let isRunning = false

/**
 * Initialize the Butterchurn visualizer on a canvas element.
 * @param {HTMLCanvasElement} canvasEl
 * @param {AudioContext} audioContext
 */
export function init(canvasEl, audioContext) {
  canvas = canvasEl
  resize()

  visualizer = butterchurn.createVisualizer(audioContext, canvas, {
    width: canvas.width,
    height: canvas.height,
    pixelRatio: window.devicePixelRatio || 1
  })

  // Resize on window change
  window.addEventListener('resize', resize)

  return visualizer
}

/**
 * Connect an audio source node to the visualizer.
 * @param {AudioNode} audioNode
 */
export function connectAudio(audioNode) {
  if (!visualizer) throw new Error('Engine not initialized')
  visualizer.connectAudio(audioNode)
}

/**
 * Load a preset into the visualizer with optional blend transition.
 * @param {object} preset - Butterchurn preset JSON object
 * @param {number} blendSeconds - Seconds to blend from current to new preset
 */
export function loadPreset(preset, blendSeconds = 2.7) {
  if (!visualizer) return
  visualizer.loadPreset(preset, blendSeconds)
}

/**
 * Start the requestAnimationFrame render loop.
 */
export function startRenderLoop() {
  if (isRunning) return
  isRunning = true

  function loop() {
    if (!isRunning) return
    if (visualizer) {
      visualizer.render()
    }
    animFrameId = requestAnimationFrame(loop)
  }

  loop()
}

/**
 * Stop the render loop.
 */
export function stopRenderLoop() {
  isRunning = false
  if (animFrameId) {
    cancelAnimationFrame(animFrameId)
    animFrameId = null
  }
}

/**
 * Resize canvas to fill the viewport.
 */
export function resize() {
  if (!canvas) return

  const dpr = window.devicePixelRatio || 1
  const width = window.innerWidth
  const height = window.innerHeight

  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'

  if (visualizer) {
    visualizer.setRendererSize(width * dpr, height * dpr)
  }
}

/**
 * Clean up the visualizer and stop the render loop.
 */
export function destroy() {
  stopRenderLoop()
  window.removeEventListener('resize', resize)
  visualizer = null
  canvas = null
}

/**
 * Get the raw visualizer instance (for advanced use).
 */
export function getVisualizer() {
  return visualizer
}
