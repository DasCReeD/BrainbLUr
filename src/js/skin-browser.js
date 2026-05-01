/**
 * skin-browser.js — Skin Gallery Modal
 *
 * A visual grid browser for the 9,960+ Winamp skins.
 * Shows PNG previews, supports search/filter, and applies
 * skins via the Webamp API.
 */

import { setSkin } from './webamp-init.js'

const BASE_URL = import.meta.env.BASE_URL || '/BrainbLUr/'
let manifest = null
let modalEl = null
let isOpen = false

/**
 * Initialize the skin browser.
 */
export async function init() {
  // Load manifest
  try {
    const res = await fetch(`${BASE_URL}skins/manifest.json`)
    manifest = await res.json()
    console.log(`[SkinBrowser] ${manifest.starter.length} starter skins available (${manifest.totalAvailable} total indexed)`)
  } catch (err) {
    console.warn('[SkinBrowser] Could not load skin manifest')
    return
  }

  // Create the modal
  createModal()

  // Wire up the toggle button
  const btn = document.getElementById('btn-skins')
  if (btn) btn.addEventListener('click', toggle)

  // Keyboard shortcut: S to toggle
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return
    if (e.key === 's' || e.key === 'S') {
      e.preventDefault()
      toggle()
    }
  })
}

/**
 * Create the skin browser modal DOM.
 */
function createModal() {
  modalEl = document.createElement('div')
  modalEl.id = 'skin-browser-modal'
  modalEl.className = 'skin-modal hidden'
  modalEl.innerHTML = `
    <div class="skin-modal-backdrop"></div>
    <div class="skin-modal-content">
      <div class="skin-modal-header">
        <h2>🎨 Skin Browser</h2>
        <span class="skin-count">${manifest.starter.length} skins</span>
        <input type="text" id="skin-search" placeholder="Search skins..." autocomplete="off" />
        <button class="skin-close-btn" id="skin-close">✕</button>
      </div>
      <div class="skin-grid" id="skin-grid"></div>
    </div>
  `
  document.body.appendChild(modalEl)

  // Close handlers
  modalEl.querySelector('.skin-modal-backdrop').addEventListener('click', close)
  document.getElementById('skin-close').addEventListener('click', close)

  // Search
  document.getElementById('skin-search').addEventListener('input', (e) => {
    filterSkins(e.target.value)
  })

  // Populate grid
  populateGrid(manifest.starter)
}

/**
 * Populate the skin grid with skin cards.
 */
function populateGrid(skins) {
  const grid = document.getElementById('skin-grid')
  grid.innerHTML = ''

  for (const skin of skins) {
    const card = document.createElement('div')
    card.className = 'skin-card'
    card.dataset.name = skin.name.toLowerCase()

    const previewSrc = skin.preview
      ? `${BASE_URL}skins/${skin.preview}`
      : ''

    card.innerHTML = `
      ${previewSrc ? `<img class="skin-preview" src="${previewSrc}" alt="${skin.name}" loading="lazy" />` : '<div class="skin-preview-placeholder">🎵</div>'}
      <span class="skin-label">${skin.name}</span>
    `

    card.addEventListener('click', () => {
      const url = `${BASE_URL}skins/${skin.file}`
      setSkin(url)
      // Highlight active
      document.querySelectorAll('.skin-card.active').forEach(c => c.classList.remove('active'))
      card.classList.add('active')
    })

    grid.appendChild(card)
  }
}

/**
 * Filter skins by search query.
 */
function filterSkins(query) {
  const q = query.toLowerCase()
  const cards = document.querySelectorAll('.skin-card')
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
  // Focus search
  setTimeout(() => document.getElementById('skin-search')?.focus(), 100)
}

function close() {
  if (!modalEl) return
  modalEl.classList.add('hidden')
  isOpen = false
}
