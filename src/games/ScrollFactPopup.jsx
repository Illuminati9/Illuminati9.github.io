import { useState, useEffect, useCallback } from 'react'
import { getNextFact, FACT_CATEGORIES } from './factsData'
import { sounds } from './soundEffects'
import './ScrollFactPopup.css'

const SCROLL_MILESTONES = [
  { pct: 0.25, category: 'education' },
  { pct: 0.50, category: 'cp' },
  { pct: 0.75, category: 'fun' },
]

const AUTO_DISMISS_MS = 10000

export default function ScrollFactPopup({ onAchievement }) {
  const [activeFact, setActiveFact] = useState(null)
  const [visible, setVisible] = useState(false)
  const [dismissing, setDismissing] = useState(false)
  const [shownMilestones, setShownMilestones] = useState(() => {
    try {
      const stored = sessionStorage.getItem('scroll-facts-shown')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const dismiss = useCallback(() => {
    setDismissing(true)
    setTimeout(() => {
      setActiveFact(null)
      setVisible(false)
      setDismissing(false)
    }, 400)
  }, [])

  // Auto-dismiss timer
  useEffect(() => {
    if (!activeFact) return
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [activeFact, dismiss])

  // Scroll listener
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      if (total <= 0) return

      const pct = scrolled / total

      for (const milestone of SCROLL_MILESTONES) {
        const key = `scroll-${milestone.pct}`
        if (pct >= milestone.pct && !shownMilestones.includes(key)) {
          const fact = getNextFact(milestone.category)
          setActiveFact(fact)
          setDismissing(false)
          requestAnimationFrame(() => setVisible(true))
          sounds.popup()

          const updated = [...shownMilestones, key]
          setShownMilestones(updated)
          sessionStorage.setItem('scroll-facts-shown', JSON.stringify(updated))

          // Trigger achievement if available
          onAchievement?.('scroll_fact')
          break
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [shownMilestones, onAchievement])

  if (!activeFact) return null

  const cat = FACT_CATEGORIES[activeFact.category] || FACT_CATEGORIES.fun

  return (
    <div
      className={`sfp-toast${visible ? ' sfp-visible' : ''}${dismissing ? ' sfp-dismissing' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="sfp-glow" style={{ background: `radial-gradient(circle, ${cat.color}15, transparent 70%)` }} />

      <div className="sfp-header">
        <div className="sfp-badge">
          <span>{cat.icon}</span>
          <span className="sfp-badge-text" style={{ color: cat.color }}>Did You Know?</span>
        </div>
        <button className="sfp-close" onClick={dismiss} aria-label="Dismiss">✕</button>
      </div>

      <p className="sfp-fact">{activeFact.fact}</p>

      {/* Progress bar for auto-dismiss */}
      <div className="sfp-timer-track">
        <div
          className="sfp-timer-fill"
          style={{ animationDuration: `${AUTO_DISMISS_MS}ms` }}
        />
      </div>
    </div>
  )
}
