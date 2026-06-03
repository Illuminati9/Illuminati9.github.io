/* ──────────────────────────────────────────────────────
   Sound Effects — Web Audio API
   No external files needed, generates sounds procedurally
   ────────────────────────────────────────────────────── */

let audioCtx = null

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioCtx
}

function playTone(frequency, duration, type = 'sine', volume = 0.15) {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch {
    // Silently fail — audio is a nice-to-have
  }
}

export const sounds = {
  /** Soft click — for card flips, button presses */
  click() {
    playTone(800, 0.08, 'sine', 0.1)
  },

  /** Card flip sound — slightly richer */
  flip() {
    playTone(600, 0.06, 'sine', 0.08)
    setTimeout(() => playTone(900, 0.06, 'sine', 0.08), 40)
  },

  /** Match found — ascending two-note chime */
  match() {
    playTone(523, 0.12, 'sine', 0.12)
    setTimeout(() => playTone(659, 0.15, 'sine', 0.12), 100)
  },

  /** Mismatch — low buzz */
  mismatch() {
    playTone(200, 0.15, 'square', 0.06)
  },

  /** Win / Achievement unlocked — triumphant arpeggio */
  win() {
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'sine', 0.1), i * 100)
    })
  },

  /** Badge unlocked — single bright ping */
  badge() {
    playTone(1047, 0.15, 'sine', 0.12)
    setTimeout(() => playTone(1319, 0.2, 'sine', 0.1), 80)
  },

  /** Terminal keypress — mechanical key sound */
  keypress() {
    playTone(1200, 0.03, 'square', 0.04)
  },

  /** Terminal command execute */
  execute() {
    playTone(400, 0.08, 'sawtooth', 0.06)
    setTimeout(() => playTone(600, 0.1, 'sawtooth', 0.06), 60)
  },

  /** Secret / Easter egg discovered */
  secret() {
    const notes = [392, 523, 659, 784, 1047, 784, 659, 523]
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.12, 'sine', 0.08), i * 70)
    })
  },

  /** Pop-in notification sound */
  popup() {
    playTone(880, 0.06, 'sine', 0.08)
    setTimeout(() => playTone(1100, 0.08, 'sine', 0.06), 50)
  },

  /** Error / denied */
  error() {
    playTone(150, 0.2, 'square', 0.08)
  },
}
