import { useState, useEffect, useCallback, useRef } from 'react'
import { getRandomFact } from './factsData'
import { sounds } from './soundEffects'
import DidYouKnowModal from './DidYouKnowModal'
import ConfettiEffect from './ConfettiEffect'
import './MemoryGame.css'

const SKILL_CARDS = [
  { id: 'cpp', icon: '⚡', name: 'C++', color: '#00599C' },
  { id: 'java', icon: '☕', name: 'Java', color: '#f89820' },
  { id: 'python', icon: '🐍', name: 'Python', color: '#3776AB' },
  { id: 'react', icon: '⚛️', name: 'React', color: '#61DAFB' },
  { id: 'aws', icon: '☁️', name: 'AWS', color: '#FF9900' },
  { id: 'mongodb', icon: '🍃', name: 'MongoDB', color: '#47A248' },
  { id: 'spring', icon: '🌱', name: 'Spring', color: '#6DB33F' },
  { id: 'fastapi', icon: '🚀', name: 'FastAPI', color: '#009688' },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return mobile
}

export default function MemoryGame({ isOpen, onClose, onAchievement }) {
  const isMobile = useIsMobile()
  const pairCount = isMobile ? 6 : 8
  const cols = isMobile ? 3 : 4

  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [gameState, setGameState] = useState('idle') // idle | playing | won
  const [showConfetti, setShowConfetti] = useState(false)
  const [dykFact, setDykFact] = useState(null)

  const timerRef = useRef(null)
  const lockRef = useRef(false)

  // Initialize cards
  const startGame = useCallback(() => {
    const selected = shuffle(SKILL_CARDS).slice(0, pairCount)
    const pairs = shuffle([...selected, ...selected].map((card, i) => ({
      ...card,
      uid: `${card.id}-${i}`,
    })))
    setCards(pairs)
    setFlipped([])
    setMatched([])
    setMoves(0)
    setTime(0)
    setGameState('playing')
    setShowConfetti(false)
    lockRef.current = false
  }, [pairCount])

  // Start game when opened
  useEffect(() => {
    if (isOpen && gameState === 'idle') startGame()
  }, [isOpen, gameState, startGame])

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => setTime(t => t + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [gameState])

  // Check win
  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0 && gameState === 'playing') {
      setGameState('won')
      sounds.win()
      setShowConfetti(true)

      onAchievement?.('game_master')
      if (time < 60) onAchievement?.('memory_champ')

      setTimeout(() => {
        const fact = getRandomFact('technical')
        setDykFact(fact)
      }, 1500)
    }
  }, [matched, cards, gameState, time, onAchievement])

  const handleFlip = useCallback((uid) => {
    if (lockRef.current) return
    if (flipped.includes(uid) || matched.includes(uid)) return

    sounds.flip()
    const newFlipped = [...flipped, uid]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      lockRef.current = true

      const [first, second] = newFlipped
      const card1 = cards.find(c => c.uid === first)
      const card2 = cards.find(c => c.uid === second)

      if (card1.id === card2.id) {
        // Match!
        setTimeout(() => {
          sounds.match()
          setMatched(prev => [...prev, first, second])
          setFlipped([])
          lockRef.current = false
        }, 400)
      } else {
        // No match
        setTimeout(() => {
          sounds.mismatch()
          setFlipped([])
          lockRef.current = false
        }, 800)
      }
    }
  }, [flipped, matched, cards])

  const handleClose = useCallback(() => {
    setGameState('idle')
    setShowConfetti(false)
    onClose?.()
  }, [onClose])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <>
      <div className="mg-overlay" onClick={handleClose}>
        <div className="mg-container glass-card" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="mg-header">
            <div className="mg-title-row">
              <h3 className="mg-title">🧠 Skill Match</h3>
              <button className="mg-close" onClick={handleClose} aria-label="Close">✕</button>
            </div>
            <p className="mg-subtitle">Match pairs of tech skills to win!</p>

            {/* Stats */}
            <div className="mg-stats">
              <div className="mg-stat">
                <span className="mg-stat-label">Moves</span>
                <span className="mg-stat-value">{moves}</span>
              </div>
              <div className="mg-stat">
                <span className="mg-stat-label">Time</span>
                <span className="mg-stat-value">{formatTime(time)}</span>
              </div>
              <div className="mg-stat">
                <span className="mg-stat-label">Pairs</span>
                <span className="mg-stat-value">{matched.length / 2}/{pairCount}</span>
              </div>
            </div>
          </div>

          {/* Game Grid */}
          <div
            className="mg-grid"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {cards.map(card => {
              const isFlipped = flipped.includes(card.uid) || matched.includes(card.uid)
              const isMatched = matched.includes(card.uid)
              return (
                <button
                  key={card.uid}
                  className={`mg-card${isFlipped ? ' mg-card-flipped' : ''}${isMatched ? ' mg-card-matched' : ''}`}
                  onClick={() => handleFlip(card.uid)}
                  disabled={isMatched}
                  aria-label={isFlipped ? card.name : 'Hidden card'}
                >
                  <div className="mg-card-inner">
                    <div className="mg-card-front">
                      <span className="mg-card-q">?</span>
                    </div>
                    <div className="mg-card-back" style={{ '--card-color': card.color }}>
                      <span className="mg-card-icon">{card.icon}</span>
                      <span className="mg-card-name">{card.name}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Win State */}
          {gameState === 'won' && (
            <div className="mg-win">
              <div className="mg-win-text">🎉 You matched all skills!</div>
              <div className="mg-win-stats">
                {moves} moves · {formatTime(time)}
                {time < 60 && <span className="mg-win-badge"> 🏆 Speed Champion!</span>}
              </div>
              <button className="mg-play-again" onClick={startGame}>
                Play Again 🔄
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfettiEffect active={showConfetti} onComplete={() => setShowConfetti(false)} />
      <DidYouKnowModal fact={dykFact} onClose={() => setDykFact(null)} />
    </>
  )
}
