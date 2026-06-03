import { useState, useCallback } from 'react'
import { sounds } from './soundEffects'
import './GameHub.css'

const GAMES = [
  { id: 'memory', icon: '🧠', name: 'Skill Match', description: 'Match pairs of tech skills' },
  { id: 'terminal', icon: '💻', name: 'Terminal', description: 'Hack into the portfolio' },
]

export default function GameHub({ onSelectGame }) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)

  const toggle = useCallback(() => {
    if (!isOpen) {
      sounds.click()
      setIsOpen(true)
      requestAnimationFrame(() => setMenuVisible(true))
    } else {
      setMenuVisible(false)
      setTimeout(() => setIsOpen(false), 300)
    }
  }, [isOpen])

  const selectGame = useCallback((gameId) => {
    sounds.click()
    setMenuVisible(false)
    setTimeout(() => {
      setIsOpen(false)
      onSelectGame?.(gameId)
    }, 250)
  }, [onSelectGame])

  return (
    <>
      {/* Floating trigger */}
      <button
        className={`gh-trigger${isOpen ? ' gh-trigger-active' : ''}`}
        onClick={toggle}
        aria-label="Open games menu"
        title="Play games"
      >
        <span className="gh-trigger-icon">{isOpen ? '✕' : '🎮'}</span>
      </button>

      {/* Menu */}
      {isOpen && (
        <>
          <div className="gh-backdrop" onClick={toggle} />
          <div className={`gh-menu${menuVisible ? ' gh-menu-visible' : ''}`}>
            <div className="gh-menu-title">Mini Games</div>
            <div className="gh-menu-subtitle">Play & discover fun facts about Sridhar</div>
            <div className="gh-game-list">
              {GAMES.map(game => (
                <button
                  key={game.id}
                  className="gh-game-item"
                  onClick={() => selectGame(game.id)}
                >
                  <span className="gh-game-icon">{game.icon}</span>
                  <div className="gh-game-info">
                    <span className="gh-game-name">{game.name}</span>
                    <span className="gh-game-desc">{game.description}</span>
                  </div>
                  <span className="gh-game-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}
