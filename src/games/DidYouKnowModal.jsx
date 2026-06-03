import { useState, useEffect, useCallback } from 'react'
import { FACT_CATEGORIES } from './factsData'
import { sounds } from './soundEffects'
import './DidYouKnowModal.css'

export default function DidYouKnowModal({ fact, onClose }) {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (fact) {
      sounds.popup()
      // Small delay for entrance animation
      requestAnimationFrame(() => setVisible(true))
    }
  }, [fact])

  const handleClose = useCallback(() => {
    setClosing(true)
    sounds.click()
    setTimeout(() => {
      setVisible(false)
      setClosing(false)
      onClose?.()
    }, 350)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    if (!fact) return
    const handler = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [fact, handleClose])

  if (!fact) return null

  const cat = FACT_CATEGORIES[fact.category] || FACT_CATEGORIES.fun

  return (
    <div
      className={`dyk-overlay${visible ? ' dyk-visible' : ''}${closing ? ' dyk-closing' : ''}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Did You Know?"
    >
      <div className="dyk-modal" onClick={(e) => e.stopPropagation()}>
        {/* Top glow */}
        <div className="dyk-glow" style={{ background: `radial-gradient(circle at top, ${cat.color}22, transparent 70%)` }} />

        {/* Header */}
        <div className="dyk-header">
          <div className="dyk-badge" style={{ background: `${cat.color}18`, borderColor: `${cat.color}40` }}>
            <span className="dyk-badge-icon">{cat.icon}</span>
            <span className="dyk-badge-label" style={{ color: cat.color }}>{cat.label}</span>
          </div>
          <button className="dyk-close" onClick={handleClose} aria-label="Close">✕</button>
        </div>

        {/* Title */}
        <div className="dyk-title-row">
          <span className="dyk-bulb">💡</span>
          <h3 className="dyk-title">Did You Know?</h3>
        </div>

        {/* Fact */}
        <p className="dyk-fact">{fact.fact}</p>

        {/* Footer */}
        <div className="dyk-footer">
          <button className="dyk-cta" onClick={handleClose}>
            Cool! Got it ✨
          </button>
        </div>
      </div>
    </div>
  )
}
