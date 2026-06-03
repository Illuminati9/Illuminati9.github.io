import { useState, useEffect, useCallback, useRef } from 'react'
import { getRandomFact } from './factsData'
import { sounds } from './soundEffects'
import DidYouKnowModal from './DidYouKnowModal'
import './KonamiEasterEgg.css'

const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
]

/* Mobile swipe sequence: ↑↑↓↓ (simplified for touch) */
const MOBILE_SEQUENCE = ['up', 'up', 'down', 'down']

export default function KonamiEasterEgg({ onAchievement }) {
  const [activated, setActivated] = useState(false)
  const [showGlitch, setShowGlitch] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [fact, setFact] = useState(null)
  const [showMobilePad, setShowMobilePad] = useState(false)

  const keyBuffer = useRef([])
  const swipeBuffer = useRef([])
  const touchStart = useRef(null)

  const triggerEasterEgg = useCallback(() => {
    if (activated) return
    setActivated(true)
    sounds.secret()
    onAchievement?.('konami')

    // Glitch phase
    setShowGlitch(true)
    setTimeout(() => {
      setShowGlitch(false)
      const randomFact = getRandomFact()
      setFact(randomFact)
      setShowModal(true)
    }, 1800)
  }, [activated, onAchievement])

  // Desktop: keyboard sequence
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      keyBuffer.current.push(e.key.toLowerCase() === 'b' ? 'b' : e.key.toLowerCase() === 'a' ? 'a' : e.key)
      if (keyBuffer.current.length > KONAMI_SEQUENCE.length) {
        keyBuffer.current.shift()
      }

      const match = keyBuffer.current.length === KONAMI_SEQUENCE.length &&
        keyBuffer.current.every((k, i) => k === KONAMI_SEQUENCE[i])

      if (match) triggerEasterEgg()
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [triggerEasterEgg])

  // Mobile: swipe detection on pad
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchEnd = useCallback((e) => {
    if (!touchStart.current) return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStart.current.x
    const dy = touch.clientY - touchStart.current.y

    const minSwipe = 30
    let direction = null
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > minSwipe) {
      direction = dy < 0 ? 'up' : 'down'
    }

    if (direction) {
      swipeBuffer.current.push(direction)
      if (swipeBuffer.current.length > MOBILE_SEQUENCE.length) {
        swipeBuffer.current.shift()
      }

      const match = swipeBuffer.current.length === MOBILE_SEQUENCE.length &&
        swipeBuffer.current.every((d, i) => d === MOBILE_SEQUENCE[i])

      if (match) {
        setShowMobilePad(false)
        triggerEasterEgg()
      }
    }

    touchStart.current = null
  }, [triggerEasterEgg])

  const handleModalClose = useCallback(() => {
    setShowModal(false)
    setFact(null)
  }, [])

  return (
    <>
      {/* Glitch overlay */}
      {showGlitch && (
        <div className="konami-glitch-overlay" aria-hidden="true">
          <div className="konami-glitch-lines" />
          <div className="konami-glitch-text">
            <span className="konami-glitch-code">🎮</span>
            <span className="konami-secret-text">SECRET UNLOCKED!</span>
          </div>
        </div>
      )}

      {/* Mobile: Secret button in footer area */}
      {!activated && (
        <button
          className="konami-mobile-trigger"
          onClick={() => setShowMobilePad(p => !p)}
          aria-label="Secret code pad"
          title="🕹️"
        >
          🕹️
        </button>
      )}

      {/* Mobile swipe pad */}
      {showMobilePad && !activated && (
        <div className="konami-swipe-overlay" onClick={() => setShowMobilePad(false)}>
          <div
            className="konami-swipe-pad glass-card"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="konami-pad-title">🕹️ Secret Code</div>
            <div className="konami-pad-hint">Swipe: ↑ ↑ ↓ ↓</div>
            <div className="konami-pad-area">
              <div className="konami-pad-arrows">
                <span>↑</span>
                <span>↓</span>
              </div>
              <p className="konami-pad-instruction">Swipe up & down here</p>
            </div>
            <div className="konami-pad-progress">
              {MOBILE_SEQUENCE.map((dir, i) => (
                <span
                  key={i}
                  className={`konami-pad-dot${i < swipeBuffer.current.length ? ' konami-pad-dot-active' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Did You Know modal */}
      <DidYouKnowModal fact={showModal ? fact : null} onClose={handleModalClose} />
    </>
  )
}
