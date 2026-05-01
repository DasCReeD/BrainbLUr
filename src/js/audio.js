/**
 * audio.js — Audio Capture Pipeline
 *
 * Captures system audio via getDisplayMedia and returns
 * a MediaStreamAudioSourceNode for Butterchurn using the provided context.
 */

let mediaStream = null

/**
 * Capture audio from a browser tab via getDisplayMedia.
 * User must select the tab in the browser prompt.
 * @param {AudioContext} context - The existing AudioContext to use
 * @returns {{ audioContext: AudioContext, audioNode: MediaStreamAudioSourceNode }}
 */
export async function captureTabAudio(context) {
  // Cleanup any existing stream first
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: {
      systemAudio: 'include'
    }
  })

  // Disable video track to save resources (do NOT stop() it, 
  // as stopping the video track terminates the entire DisplayMedia session in Chrome)
  const videoTracks = stream.getVideoTracks()
  videoTracks.forEach(track => track.enabled = false)

  // Verify we actually got an audio track
  const audioTracks = stream.getAudioTracks()
  if (audioTracks.length === 0) {
    stream.getTracks().forEach(t => t.stop())
    throw new Error('No audio track captured. Make sure "Also share system audio" is checked.')
  }

  // Resume context if suspended (autoplay policy)
  if (context.state === 'suspended') {
    await context.resume()
  }

  mediaStream = stream
  const audioNode = context.createMediaStreamSource(stream)

  // Listen for track ending (user stops sharing)
  audioTracks[0].addEventListener('ended', () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop())
      mediaStream = null
    }
    window.dispatchEvent(new CustomEvent('brainblur:audio-ended'))
  })

  return { audioContext: context, audioNode }
}
