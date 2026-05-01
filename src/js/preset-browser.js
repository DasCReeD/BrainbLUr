/**
 * preset-browser.js — Preset Gallery Modal
 *
 * A visual list browser for the curated Butterchurn presets.
 */

import { getPresetKeys, loadPresetByIndex, isFavorite, toggleFavorite } from './engine.js'

let modalEl = null
let isOpen = false
let activeTab = 'all'

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
      <div class="preset-tabs">
        <button class="preset-tab active" data-tab="all">All Presets</button>
        <button class="preset-tab" data-tab="favs">Favorites</button>
      </div>
      <div class="preset-list" id="preset-grid"></div>
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

  // Tabs
  modalEl.querySelectorAll('.preset-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      modalEl.querySelectorAll('.preset-tab').forEach(t => t.classList.remove('active'))
      e.target.classList.add('active')
      activeTab = e.target.dataset.tab
      filterPresets(document.getElementById('preset-search').value)
    })
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
  
  // Group keys by creator
  const groups = {}
  keys.forEach((key, index) => {
    let creator = 'Other'
    let name = key
    if (key.includes(' - ')) {
      const parts = key.split(' - ')
      creator = parts[0].trim()
      name = parts.slice(1).join(' - ').trim()
    }
    
    if (!groups[creator]) groups[creator] = []
    groups[creator].push({ key, name, index })
  })

  // Sort groups alphabetically
  const sortedCreators = Object.keys(groups).sort((a, b) => {
    if (a === 'Other') return 1
    if (b === 'Other') return -1
    return a.localeCompare(b)
  })

  // Batch rendering to prevent UI freeze with tens of thousands of items
  let creatorIdx = 0
  
  function renderBatch() {
    if (!document.getElementById('preset-grid')) return
    
    // Render 10 creators per frame
    const batchSize = 10
    for (let i = 0; i < batchSize; i++) {
      if (creatorIdx >= sortedCreators.length) return
      
      const creator = sortedCreators[creatorIdx]
      const groupEl = document.createElement('div')
      groupEl.className = 'preset-group'
      
      const header = document.createElement('div')
      header.className = 'preset-group-header'
      header.innerHTML = `<span>👤 ${creator}</span> <small>${groups[creator].length}</small>`
      groupEl.appendChild(header)
      
      const itemList = document.createElement('div')
      itemList.className = 'preset-items'
      
      groups[creator].forEach(item => {
        const card = document.createElement('div')
        card.className = 'preset-item' 
        card.dataset.name = item.key.toLowerCase()

        const isFav = isFavorite(item.key)
        card.innerHTML = `
          <span class="preset-star ${isFav ? 'is-fav' : ''}" title="Favorite">${isFav ? '⭐' : '☆'}</span>
          <span class="preset-name" title="${item.key}">${item.name}</span>
        `

        const starEl = card.querySelector('.preset-star')
        starEl.addEventListener('click', (e) => {
          e.stopPropagation()
          const nowFav = toggleFavorite(item.key)
          starEl.innerHTML = nowFav ? '⭐' : '☆'
          if (nowFav) starEl.classList.add('is-fav')
          else starEl.classList.remove('is-fav')
          window.dispatchEvent(new CustomEvent('milkdrop:favorites-updated'))
          if (activeTab === 'favs') filterPresets(document.getElementById('preset-search').value)
        })

        card.addEventListener('click', () => {
          const preset = loadPresetByIndex(item.index)
          if (preset && window.updateMilkdropPresetDisplay) {
            window.updateMilkdropPresetDisplay(preset)
          }
          document.querySelectorAll('#preset-grid .preset-item.active').forEach(c => c.classList.remove('active'))
          card.classList.add('active')
        })

        itemList.appendChild(card)
      })
      
      groupEl.appendChild(itemList)
      grid.appendChild(groupEl)
      creatorIdx++
    }
    
    // Continue next frame
    requestAnimationFrame(renderBatch)
  }
  
  renderBatch()
}

/**
 * Filter presets by search query.
 */
function filterPresets(query) {
  const q = query.toLowerCase()
  const groups = document.querySelectorAll('#preset-grid .preset-group')
  
  groups.forEach(group => {
    const items = group.querySelectorAll('.preset-item')
    let hasVisibleItem = false
    
    items.forEach(item => {
      const matchSearch = item.dataset.name.includes(q)
      const matchTab = activeTab === 'all' || item.querySelector('.preset-star').classList.contains('is-fav')
      const show = matchSearch && matchTab
      item.style.display = show ? '' : 'none'
      if (show) hasVisibleItem = true
    })
    
    group.style.display = hasVisibleItem ? '' : 'none'
  })
}

// Global listener to sync stars when changed from control bar
window.addEventListener('milkdrop:favorites-updated', () => {
  if (!isOpen || !modalEl) return
  const items = document.querySelectorAll('#preset-grid .preset-item')
  items.forEach(item => {
    const key = item.querySelector('.preset-name').title
    const starEl = item.querySelector('.preset-star')
    const fav = isFavorite(key)
    starEl.innerHTML = fav ? '⭐' : '☆'
    if (fav) starEl.classList.add('is-fav')
    else starEl.classList.remove('is-fav')
  })
  if (activeTab === 'favs') filterPresets(document.getElementById('preset-search').value)
})

// Listen for background loading completion
window.addEventListener('milkdrop:presets-loaded', () => {
  if (!modalEl) return
  const keys = getPresetKeys()
  const countEl = modalEl.querySelector('.skin-count')
  if (countEl) countEl.textContent = `${keys.length} presets`
  populateGrid(keys)
})

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
