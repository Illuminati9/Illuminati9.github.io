import { useState, useEffect, useCallback, useRef } from 'react'
import { getRandomFact, didYouKnowFacts, FACT_CATEGORIES } from './factsData'
import { sounds } from './soundEffects'
import DidYouKnowModal from './DidYouKnowModal'
import './TerminalGame.css'

/* ── Command data ─────────────────────────────── */
const PORTFOLIO_DATA = {
  skills: {
    expert: ['C++ (95%)', 'Algorithms & DSA (95%)', 'System Design (90%)'],
    proficient: ['Java / Spring Boot (82%)', 'Python / FastAPI (80%)', 'React.js (78%)'],
    intermediate: ['AWS (60%)', 'MongoDB (55%)'],
  },
  experience: [
    { company: 'Morgan Stanley', role: 'Technology Spring Analyst', period: 'Jan 2026 – Present', highlight: 'Log retention system across 60+ apps' },
    { company: 'Amazon', role: 'SDE Intern', period: 'Jul 2025 – Dec 2025', highlight: 'Infra stack handling 50K TPS' },
    { company: 'Morgan Stanley', role: 'Technology Summer Analyst', period: 'May 2025 – Jul 2025', highlight: 'PII document detection for 1000+ docs' },
  ],
  cp: {
    leetcode: { rating: 2164, rank: 'Guardian' },
    codeforces: { rating: 1695, rank: 'Expert' },
    codechef: { rating: 1970, rank: '4★' },
    atcoder: { rating: 1083, rank: '5 Kyu' },
  },
}

const HELP_TEXT = `
Available commands:
  HELP                    Show this help message
  QUERY skills            View technical skills
  QUERY experience        View work experience
  QUERY cp                View competitive programming stats
  DECRYPT                 Unlock a secret "Did You Know?" fact
  SCAN achievements       View CP achievements
  HACK matrix             Trigger Matrix rain animation
  WHOAMI                  Who is Sridhar?
  CLEAR                   Clear the terminal
  EXIT                    Close the terminal
`

const WELCOME = [
  { type: 'system', text: '╔══════════════════════════════════════╗' },
  { type: 'system', text: '║   SRIDHAR SUTHAPALLI TERMINAL v2.0  ║' },
  { type: 'system', text: '║   Type HELP for available commands   ║' },
  { type: 'system', text: '╚══════════════════════════════════════╝' },
  { type: 'info', text: '[SYSTEM] Connection established. Access granted.' },
  { type: 'blank', text: '' },
]

let secretCounter = 0
let commandCount = 0

export default function TerminalGame({ isOpen, onClose, onAchievement }) {
  const [history, setHistory] = useState(WELCOME)
  const [input, setInput] = useState('')
  const [matrixMode, setMatrixMode] = useState(false)
  const [dykFact, setDykFact] = useState(null)

  const inputRef = useRef(null)
  const scrollRef = useRef(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const addLines = useCallback((lines) => {
    setHistory(prev => [...prev, ...lines])
  }, [])

  const typeLines = useCallback((lines, delay = 50) => {
    lines.forEach((line, i) => {
      setTimeout(() => {
        setHistory(prev => [...prev, line])
      }, i * delay)
    })
  }, [])

  const processCommand = useCallback((cmd) => {
    const trimmed = cmd.trim()
    const upper = trimmed.toUpperCase()
    const parts = upper.split(/\s+/)

    commandCount++
    if (commandCount >= 5) {
      onAchievement?.('terminal_pro')
    }

    // Echo command
    addLines([{ type: 'command', text: `> ${trimmed}` }])

    if (upper === 'HELP') {
      sounds.execute()
      addLines(HELP_TEXT.split('\n').map(t => ({ type: 'info', text: t })))
    }
    else if (upper === 'CLEAR') {
      setHistory(WELCOME)
    }
    else if (upper === 'EXIT') {
      sounds.click()
      addLines([{ type: 'system', text: '[SESSION TERMINATED]' }])
      setTimeout(() => onClose?.(), 600)
    }
    else if (parts[0] === 'QUERY' && parts[1] === 'SKILLS') {
      sounds.execute()
      addLines([
        { type: 'success', text: '[QUERY] Fetching skills database...' },
        { type: 'blank', text: '' },
        { type: 'info', text: '  ★ Expert:' },
        ...PORTFOLIO_DATA.skills.expert.map(s => ({ type: 'data', text: `    → ${s}` })),
        { type: 'blank', text: '' },
        { type: 'info', text: '  ◆ Proficient:' },
        ...PORTFOLIO_DATA.skills.proficient.map(s => ({ type: 'data', text: `    → ${s}` })),
        { type: 'blank', text: '' },
        { type: 'info', text: '  ● Intermediate:' },
        ...PORTFOLIO_DATA.skills.intermediate.map(s => ({ type: 'data', text: `    → ${s}` })),
        { type: 'blank', text: '' },
      ])
    }
    else if (parts[0] === 'QUERY' && parts[1] === 'EXPERIENCE') {
      sounds.execute()
      const lines = [{ type: 'success', text: '[QUERY] Accessing experience records...' }, { type: 'blank', text: '' }]
      PORTFOLIO_DATA.experience.forEach(exp => {
        lines.push({ type: 'info', text: `  ┌─ ${exp.company}` })
        lines.push({ type: 'data', text: `  │  ${exp.role}` })
        lines.push({ type: 'data', text: `  │  ${exp.period}` })
        lines.push({ type: 'highlight', text: `  └─ "${exp.highlight}"` })
        lines.push({ type: 'blank', text: '' })
      })
      addLines(lines)
    }
    else if (parts[0] === 'QUERY' && parts[1] === 'CP') {
      sounds.execute()
      const lines = [{ type: 'success', text: '[QUERY] Loading competitive programming data...' }, { type: 'blank', text: '' }]
      Object.entries(PORTFOLIO_DATA.cp).forEach(([platform, data]) => {
        lines.push({ type: 'data', text: `  ${platform.toUpperCase().padEnd(12)} Rating: ${data.rating}  Rank: ${data.rank}` })
      })
      lines.push({ type: 'blank', text: '' })
      lines.push({ type: 'highlight', text: '  Total Problems Solved: 1,500+' })
      lines.push({ type: 'blank', text: '' })
      addLines(lines)
    }
    else if (upper === 'DECRYPT' || upper.startsWith('DECRYPT ')) {
      sounds.execute()
      secretCounter++
      const fact = getRandomFact()
      addLines([
        { type: 'warning', text: '[DECRYPTING...] ████████████████ 100%' },
        { type: 'blank', text: '' },
      ])
      setTimeout(() => {
        sounds.popup()
        const cat = FACT_CATEGORIES[fact.category]
        addLines([
          { type: 'secret', text: `🔓 ${cat.icon} DID YOU KNOW?` },
          { type: 'fact', text: `   ${fact.fact}` },
          { type: 'blank', text: '' },
        ])
        setDykFact(fact)
      }, 800)
    }
    else if (parts[0] === 'SCAN' && parts[1] === 'ACHIEVEMENTS') {
      sounds.execute()
      addLines([
        { type: 'success', text: '[SCAN] Loading achievement data...' },
        { type: 'blank', text: '' },
        { type: 'highlight', text: '  🏆 Global Rank 173 — Codeforces Round 997' },
        { type: 'highlight', text: '  🥇 Global Rank 27 — CodeChef Starters 157' },
        { type: 'highlight', text: '  🏅 Runner-up — Hack-O-Fiesta V4.0' },
        { type: 'highlight', text: '  📖 1,500+ algorithmic problems solved' },
        { type: 'highlight', text: '  🎓 Co-Ordinator, App Dev Wing (Axios, IIITL)' },
        { type: 'blank', text: '' },
      ])
    }
    else if (parts[0] === 'HACK' && parts[1] === 'MATRIX') {
      sounds.secret()
      addLines([{ type: 'warning', text: '[HACK] Initiating Matrix protocol...' }])
      setMatrixMode(true)
      setTimeout(() => {
        setMatrixMode(false)
        addLines([
          { type: 'success', text: '[HACK] Matrix protocol complete.' },
          { type: 'blank', text: '' },
        ])
      }, 4000)
    }
    else if (upper === 'WHOAMI') {
      sounds.execute()
      addLines([
        { type: 'success', text: '[IDENTITY]' },
        { type: 'blank', text: '' },
        { type: 'data', text: '  Name:     Sridhar Suthapalli' },
        { type: 'data', text: '  Role:     Technology Spring Analyst @ Morgan Stanley' },
        { type: 'data', text: '  College:  IIIT Lucknow (B.Tech CSE, 2022-2026)' },
        { type: 'data', text: '  CGPA:     9.01 / 10' },
        { type: 'data', text: '  Hobby:    Jogs 3km + 1hr gym daily 💪' },
        { type: 'data', text: '  Reading:  "Amma Diary Lo Konni Pagelu" 📖' },
        { type: 'blank', text: '' },
      ])
    }
    else if (trimmed === '') {
      // empty command, do nothing
    }
    else {
      sounds.error()
      addLines([
        { type: 'error', text: `[ERROR] Unknown command: "${trimmed}"` },
        { type: 'info', text: '  Type HELP for available commands.' },
        { type: 'blank', text: '' },
      ])
    }
  }, [addLines, onClose, onAchievement])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    processCommand(input)
    setInput('')
  }

  const handleKeyDown = (e) => {
    sounds.keypress()
  }

  // Suggested commands for mobile
  const suggestions = ['HELP', 'QUERY skills', 'DECRYPT', 'WHOAMI', 'HACK matrix']

  if (!isOpen) return null

  return (
    <>
      <div className="term-overlay" onClick={onClose}>
        <div className="term-window" onClick={e => e.stopPropagation()}>
          {/* Matrix rain */}
          {matrixMode && (
            <div className="term-matrix" aria-hidden="true">
              {Array.from({ length: 30 }, (_, i) => (
                <div
                  key={i}
                  className="term-matrix-col"
                  style={{
                    left: `${(i / 30) * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                  }}
                >
                  {Array.from({ length: 20 }, (_, j) => (
                    <span key={j} style={{ opacity: 0.3 + Math.random() * 0.7 }}>
                      {String.fromCharCode(0x30A0 + Math.random() * 96)}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Title bar */}
          <div className="term-titlebar">
            <div className="term-dots">
              <button className="term-dot term-dot-red" onClick={onClose} aria-label="Close terminal" />
              <span className="term-dot term-dot-yellow" />
              <span className="term-dot term-dot-green" />
            </div>
            <span className="term-titlebar-text">sridhar@portfolio ~ %</span>
            <div className="term-titlebar-spacer" />
          </div>

          {/* Output area */}
          <div className="term-output" ref={scrollRef}>
            {history.map((line, i) => (
              <div key={i} className={`term-line term-line-${line.type}`}>
                {line.text}
              </div>
            ))}
          </div>

          {/* Mobile command suggestions */}
          <div className="term-suggestions">
            {suggestions.map(cmd => (
              <button
                key={cmd}
                className="term-suggestion-chip"
                onClick={() => {
                  processCommand(cmd)
                  inputRef.current?.focus()
                }}
              >
                {cmd}
              </button>
            ))}
          </div>

          {/* Input */}
          <form className="term-input-row" onSubmit={handleSubmit}>
            <span className="term-prompt">{'>'}</span>
            <input
              ref={inputRef}
              className="term-input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </form>
        </div>
      </div>

      <DidYouKnowModal fact={dykFact} onClose={() => setDykFact(null)} />
    </>
  )
}
