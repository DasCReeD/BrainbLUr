/**
 * preset-browser.js — Preset Gallery Modal
 *
 * A visual list browser for the curated Butterchurn presets.
 */

import { getPresetKeys, loadPresetByIndex } from './engine.js'

let modalEl = null
let isOpen = false

/**
 * Initialize the preset browser.
 */
export function init() {
  createModal()
}

/**
 * Create the preset browser modal DOM.
 */
function createModal() {
  modalEl = document.createElement('div')
  modalEl.id = 'preset-browser-modal'
  // Using the shared CSS styles defined for skin-browser (gallery-modal is aliased in CSS if needed, but skin-modal already works)
  modalEl.className = 'skin-modal hidden' 
  
  const keys = getPresetKeys()
  
  modalEl.innerHTML = `
    <div class="skin-modal-backdrop"></div>
    <div class="skin-modal-content">
      <div class="skin-modal-header">
        <h2>🌌 Preset Browser</h2>
        <span class="skin-count">${keys.length} presets</span>
        <input type="text" id="preset-search" placeholder="Search presets..." autocomplete="off" />
        <button class="skin-close-btn" id="preset-close">✕</button>
      </div>
      <div class="skin-grid" id="preset-grid"></div>
    </div>
  `
  document.body.appendChild(modalEl)

  // Close handlers
  modalEl.querySelector('.skin-modal-backdrop').addEventListener('click', close)
  document.getElementById('preset-close').addEventListener('click', close)

  // Search
  document.getElementById('preset-search').addEventListener('input', (e) => {
    filterPresets(e.target.value)
  })

  // Populate grid
  populateGrid(keys)
}

/**
 * Populate the grid with preset cards.
 */
function populateGrid(keys) {
  const grid = document.getElementById('preset-grid')
  grid.innerHTML = ''

  keys.forEach((key, index) => {
    const card = document.createElement('div')
    card.className = 'skin-card' // Reusing skin-card CSS
    card.dataset.name = key.toLowerCase()

    card.innerHTML = `
      <div class="skin-preview-placeholder" style="font-size: 1.5rem;">🌌</div>
      <span class="skin-label" title="${key}">${key}</span>
    `

    card.addEventListener('click', () => {
      loadPresetByIndex(index)
      // Highlight active
      document.querySelectorAll('#preset-grid .skin-card.active').forEach(c => c.classList.remove('active'))
      card.classList.add('active')
    })

    grid.appendChild(card)
  })
}

/**
 * Filter presets by search query.
 */
function filterPresets(query) {
  const q = query.toLowerCase()
  const cards = document.querySelectorAll('#preset-grid .skin-card')
  cards.forEach(card => {
    const match = card.dataset.name.includes(q)
    card.style.display = match ? '' : 'none'
  })
}

/**
 * Toggle the modal open/closed.
 */
export function toggle() {
  if (isOpen) close()
  else open()
}

function open() {
  if (!modalEl) return
  modalEl.classList.remove('hidden')
  isOpen = true
  setTimeout(() => document.getElementById('preset-search')?.focus(), 100)
}

function close() {
  if (!modalEl) return
  modalEl.classList.add('hidden')
  isOpen = false
}
