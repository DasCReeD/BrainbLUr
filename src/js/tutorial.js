/**
 * tutorial.js — First-Load Instructional Modal
 * 
 * Displays a guide on how to capture system audio via Chrome's screen share dialog.
 * Persists the "seen" state in localStorage.
 */

export function initTutorial() {
  const HAS_SEEN = localStorage.getItem('milkdrop_tutorial_seen')
  if (HAS_SEEN === 'true') return

  createTutorialModal()
}

function createTutorialModal() {
  const overlay = document.createElement('div')
  overlay.className = 'tutorial-overlay'
  
  overlay.innerHTML = `
    <div class="tutorial-modal">
      <div class="tutorial-header">
        <h2>🔊 How to Capture System Audio</h2>
      </div>
      
      <div class="tutorial-body">
        <p>Want to visualize YouTube, Spotify, or your whole PC? Follow these 3 steps:</p>
        
        <div class="tutorial-step">
          <div class="step-num">1</div>
          <div class="step-text">Click the <strong>🎤 Capture</strong> button on the bottom control bar.</div>
        </div>
        
        <div class="tutorial-step">
          <div class="step-num">2</div>
          <div class="step-text">When the browser prompts you, select the <strong>Entire Screen</strong> or <strong>Tab</strong> option.</div>
        </div>
        
        <div class="tutorial-step highlight-step">
          <div class="step-num">3</div>
          <div class="step-text">
            <strong>⚠️ CRITICAL STEP ⚠️</strong><br/>
            Make sure to toggle <strong>"Also share system audio"</strong> to ON before clicking Share!
          </div>
        </div>
      </div>
      
      <div class="tutorial-footer">
        <button class="tutorial-btn" id="btn-tutorial-dismiss">Got it! Let's Go 🚀</button>
      </div>
    </div>
  `
  
  document.body.appendChild(overlay)

  // Bind close event
  document.getElementById('btn-tutorial-dismiss').addEventListener('click', () => {
    localStorage.setItem('milkdrop_tutorial_seen', 'true')
    overlay.classList.add('fade-out')
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
    }, 300)
  })
}
