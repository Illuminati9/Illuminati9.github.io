import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react'
import { getRandomFact } from './factsData'
import { sounds } from './soundEffects'
import DidYouKnowModal from './DidYouKnowModal'
import './AchievementSystem.css'

/* ── Achievement Definitions ──────────────────── */
const ACHIEVEMENTS = [
  { id: 'first_visit', icon: '🏠', name: 'First Visitor', description: 'Welcome to the portfolio!', auto: true },
  { id: 'scroll_master', icon: '📜', name: 'Scroll Master', description: 'Scrolled to the bottom of the page' },
  { id: 'theme_switch', icon: '🌓', name: 'Theme Switcher', description: 'Toggled dark/light mode' },
  { id: 'keyboard_ninja', icon: '⌨️', name: 'Keyboard Ninja', description: 'Used a keyboard shortcut' },
  { id: 'game_master', icon: '🎮', name: 'Game Master', description: 'Completed any mini-game' },
  { id: 'explorer', icon: '🔍', name: 'Explorer', description: 'Visited all 7 sections' },
  { id: 'konami', icon: '🕹️', name: 'Secret Agent', description: 'Discovered the Konami Code' },
  { id: 'terminal_pro', icon: '💻', name: 'Terminal Pro', description: 'Executed 5 terminal commands' },
  { id: 'memory_champ', icon: '🧠', name: 'Memory Champion', description: 'Completed memory game under 60s' },
  { id: 'connector', icon: '📧', name: 'Connector', description: 'Opened the contact form' },
  { id: 'night_owl', icon: '⏰', name: 'Night Owl', description: 'Visited between 10PM-6AM' },
  { id: 'data_nerd', icon: '📊', name: 'Data Nerd', description: 'Explored the CF rating chart' },
]

/* ── Achievement Context ──────────────────────── */
const AchievementContext = createContext(null)

export function useAchievements() {
  return useContext(AchievementContext)
}

/* ── Provider ─────────────────────────────────── */
export function AchievementProvider({ children }) {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      const stored = localStorage.getItem('portfolio-achievements')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const [toast, setToast] = useState(null)
  const [showPanel, setShowPanel] = useState(false)
  const [dykFact, setDykFact] = useState(null)
  const toastTimer = useRef(null)

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('portfolio-achievements', JSON.stringify(unlocked))
  }, [unlocked])

  // Auto achievements
  useEffect(() => {
    // First visit
    if (!unlocked.includes('first_visit')) {
      setTimeout(() => unlock('first_visit'), 2000)
    }

    // Night owl
    const hour = new Date().getHours()
    if ((hour >= 22 || hour < 6) && !unlocked.includes('night_owl')) {
      setTimeout(() => unlock('night_owl'), 4000)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll master - detect 95%+ scroll
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const pct = el.scrollTop / (el.scrollHeight - el.clientHeight)
      if (pct >= 0.95 && !unlocked.includes('scroll_master')) {
        unlock('scroll_master')
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [unlocked]) // eslint-disable-line react-hooks/exhaustive-deps

  const unlock = useCallback((id) => {
    setUnlocked(prev => {
      if (prev.includes(id)) return prev
      const achievement = ACHIEVEMENTS.find(a => a.id === id)
      if (!achievement) return prev

      sounds.badge()

      // Show toast
      setToast(achievement)
      if (toastTimer.current) clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setToast(null), 4000)

      return [...prev, id]
    })
  }, [])

  const value = {
    unlocked,
    total: ACHIEVEMENTS.length,
    achievements: ACHIEVEMENTS,
    unlock,
    showPanel,
    setShowPanel,
  }

  return (
    <AchievementContext.Provider value={value}>
      {children}

      {/* Badge Counter in fixed position */}
      <button
        className="ach-counter"
        onClick={() => setShowPanel(true)}
        aria-label={`Achievements: ${unlocked.length} of ${ACHIEVEMENTS.length}`}
        title="View achievements"
      >
        <span className="ach-counter-icon">🏅</span>
        <span className="ach-counter-text">{unlocked.length}/{ACHIEVEMENTS.length}</span>
      </button>

      {/* Toast notification */}
      {toast && (
        <div className="ach-toast" key={toast.id}>
          <div className="ach-toast-icon">{toast.icon}</div>
          <div className="ach-toast-content">
            <div className="ach-toast-label">Achievement Unlocked!</div>
            <div className="ach-toast-name">{toast.name}</div>
          </div>
        </div>
      )}

      {/* Achievement Panel */}
      {showPanel && (
        <div className="ach-panel-overlay" onClick={() => setShowPanel(false)}>
          <div className="ach-panel glass-card" onClick={e => e.stopPropagation()}>
            <div className="ach-panel-header">
              <h3 className="ach-panel-title">🏅 Achievements</h3>
              <div className="ach-panel-progress">
                <span>{unlocked.length} / {ACHIEVEMENTS.length}</span>
                <div className="ach-progress-bar">
                  <div
                    className="ach-progress-fill"
                    style={{ width: `${(unlocked.length / ACHIEVEMENTS.length) * 100}%` }}
                  />
                </div>
              </div>
              <button className="ach-panel-close" onClick={() => setShowPanel(false)} aria-label="Close">✕</button>
            </div>

            <div className="ach-grid">
              {ACHIEVEMENTS.map(a => {
                const isUnlocked = unlocked.includes(a.id)
                return (
                  <button
                    key={a.id}
                    className={`ach-badge-card${isUnlocked ? ' ach-unlocked' : ' ach-locked'}`}
                    onClick={() => {
                      if (isUnlocked) {
                        const fact = getRandomFact()
                        setDykFact(fact)
                        sounds.click()
                      }
                    }}
                    aria-label={`${a.name}: ${isUnlocked ? 'Unlocked' : 'Locked'}`}
                  >
                    <div className="ach-badge-icon">{isUnlocked ? a.icon : '🔒'}</div>
                    <div className="ach-badge-name">{isUnlocked ? a.name : '???'}</div>
                    <div className="ach-badge-desc">{isUnlocked ? a.description : 'Keep exploring!'}</div>
                  </button>
                )
              })}
            </div>

            <p className="ach-panel-hint">💡 Tip: Click unlocked badges for a fun fact!</p>
          </div>
        </div>
      )}

      {/* Did You Know modal from badge click */}
      <DidYouKnowModal fact={dykFact} onClose={() => setDykFact(null)} />
    </AchievementContext.Provider>
  )
}
