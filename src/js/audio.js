/**
 * audio.js — Audio Capture Pipeline
 *
 * Two capture strategies:
 * 1. Tab Audio (getDisplayMedia) — Chromium only, best quality
 * 2. Microphone (getUserMedia) — Universal fallback
 *
 * Both produce a MediaStreamAudioSourceNode for Butterchurn.
 */

let audioContext = null
let mediaStream = null

/**
 * Check if tab audio capture is supported (Chromium browsers).
 */
export function isTabCaptureSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)
}

/**
 * Capture audio from a browser tab via getDisplayMedia.
 * User must select the tab in the browser prompt.
 * @returns {{ audioContext: AudioContext, audioNode: MediaStreamAudioSourceNode }}
 */
export async function captureTabAudio() {
  cleanup()

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: {
      systemAudio: 'include'
    }
  })

  // Discard video track immediately — we only need audio
  const videoTracks = stream.getVideoTracks()
  videoTracks.forEach(track => track.stop())

  // Verify we actually got an audio track
  const audioTracks = stream.getAudioTracks()
  if (audioTracks.length === 0) {
    stream.getTracks().forEach(t => t.stop())
    throw new Error('No audio track captured. Make sure "Share tab audio" is checked.')
  }

  audioContext = new (window.AudioContext || window.webkitAudioContext)()

  // Resume if suspended (autoplay policy)
  if (audioContext.state === 'suspended') {
    await audioContext.resume()
  }

  mediaStream = stream
  const audioNode = audioContext.createMediaStreamSource(stream)

  // Listen for track ending (user stops sharing)
  audioTracks[0].addEventListener('ended', () => {
    cleanup()
    window.dispatchEvent(new CustomEvent('brainblur:audio-ended'))
  })

  return { audioContext, audioNode }
}

/**
 * Capture audio from the user's microphone via getUserMedia.
 * @returns {{ audioContext: AudioContext, audioNode: MediaStreamAudioSourceNode }}
 */
export async function captureMicAudio() {
  cleanup()

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false
    }
  })

  audioContext = new (window.AudioContext || window.webkitAudioContext)()

  if (audioContext.state === 'suspended') {
    await audioContext.resume()
  }

  mediaStream = stream
  const audioNode = audioContext.createMediaStreamSource(stream)

  return { audioContext, audioNode }
}

/**
 * Stop all tracks and close the AudioContext.
 */
export function cleanup() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close().catch(() => {})
    audioContext = null
  }
}

/**
 * Get the current AudioContext (if active).
 */
export function getAudioContext() {
  return audioContext
}
