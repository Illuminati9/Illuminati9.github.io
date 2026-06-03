import { useState, useEffect, useRef, useCallback } from 'react'
import { AchievementProvider, useAchievements } from './games/AchievementSystem'
import GameHub from './games/GameHub'
import MemoryGame from './games/MemoryGame'
import TerminalGame from './games/TerminalGame'
import KonamiEasterEgg from './games/KonamiEasterEgg'
import ScrollFactPopup from './games/ScrollFactPopup'

const NAV_OFFSET = 84
const RESUME_URL = 'https://drive.google.com/file/d/1XahEoVfOsteb7ixsu8gVbq_H5o0-DF2k/view?usp=sharing'
const GITHUB_URL = 'https://github.com/Illuminati9'

function scrollToSection(id, offset = NAV_OFFSET) {
  const el = document.getElementById(id)
  if (!el) return
  const targetTop = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top: Math.max(targetTop, 0), behavior: 'smooth' })
}

/* ── Active Section Hook ───────────────────────────── */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const observers = ids.map(id => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id) },
        { rootMargin: '-40% 0px -55% 0px' }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(o => o?.disconnect())
  }, [])
  return [active, setActive]
}

/* ── useInView Hook ────────────────────────────────── */
function useInView(threshold = 0.12) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.unobserve(el) } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}

/* ── Count-Up Hook ─────────────────────────────────── */
function useCountUp(target, duration = 1800, inView = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const step = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, target, duration])
  return value
}

/* ── Theme Hook ────────────────────────────────────── */
function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('portfolio-theme') || 'dark'
    }
    return 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('portfolio-theme', theme)
  }, [theme])

  const toggle = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }, [])

  return [theme, toggle]
}

/* ── Loader ────────────────────────────────────────── */
function Loader({ onFinish }) {
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const shown = sessionStorage.getItem('loader-shown')
    if (shown) { onFinish(); return }

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          return 100
        }
        return p + 2
      })
    }, 30)

    return () => clearInterval(interval)
  }, [onFinish])

  useEffect(() => {
    if (progress >= 100) {
      const fadeTimeout = setTimeout(() => setFadeOut(true), 300)
      const finishTimeout = setTimeout(() => {
        sessionStorage.setItem('loader-shown', '1')
        onFinish()
      }, 1100)

      return () => {
        clearTimeout(fadeTimeout)
        clearTimeout(finishTimeout)
      }
    }
  }, [progress, onFinish])

  return (
    <div className={`loader-overlay${fadeOut ? ' loader-fade-out' : ''}`}>
      <div className="loader-content">
        <div className="loader-logos">
          <div className="loader-logo-tile">
            <img src="/company/morgan-stanley.png" alt="Morgan Stanley" className="loader-logo-img" />
          </div>
          <div className="loader-logo-divider">×</div>
          <div className="loader-logo-tile">
            <img src="/company/amazon.svg" alt="Amazon" className="loader-logo-img" />
          </div>
        </div>
        <div className="loader-name">Sridhar Suthapalli</div>
        <div className="loader-tagline">Software Engineer</div>
        <div className="loader-bar-track">
          <div className="loader-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}

/* ── Navbar ────────────────────────────────────────── */
function Navbar({ theme, toggleTheme }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const sectionIds = ['home', 'about', 'experience', 'projects', 'skills', 'cp', 'contact']
  const [active, setActive] = useActiveSection(sectionIds)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const scrollTo = (id) => {
    setMenuOpen(false)
    setActive(id)
    scrollToSection(id)
  }

  const links = [
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'cp', label: 'CP' },
    { id: 'contact', label: 'Contact' },
  ]

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar-inner">
        <button className="navbar-logo" type="button" onClick={() => scrollTo('home')}>
          Sridhar S.
        </button>

        <ul id="mobile-navigation" className={`navbar-links${menuOpen ? ' open' : ''}`}>
          {links.map(l => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                className={active === l.id ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); scrollTo(l.id) }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="navbar-cta">
          <a
            href="https://github.com/Illuminati9/Illuminati9.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="theme-toggle"
            aria-label="View source on GitHub"
            title="View source on GitHub"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <button
            className="theme-toggle"
            onClick={() => { toggleTheme(); if (window.__unlockAchievement) window.__unlockAchievement('theme_switch') }}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <a
            href={RESUME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-resume"
          >
            Resume ↗
          </a>
          <button
            className="navbar-hamburger"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(o => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
      {menuOpen && <button className="menu-backdrop" type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
    </nav>
  )
}

/* ── Animated Background ───────────────────────────── */
function Background() {
  return (
    <>
      <div className="bg-canvas">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        <div className="bg-orb bg-orb-4" />
      </div>
      <div className="bg-grid" />
    </>
  )
}

/* ── Typewriter Hook ───────────────────────────────── */
function useTypewriter(phrases, speed = 60, pause = 2200) {
  const [text, setText] = useState('')
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = phrases[phraseIdx]
    let timeout

    if (!deleting && text === current) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && text === '') {
      setDeleting(false)
      setPhraseIdx(i => (i + 1) % phrases.length)
    } else {
      timeout = setTimeout(() => {
        setText(deleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1))
      }, deleting ? speed / 2 : speed)
    }

    return () => clearTimeout(timeout)
  }, [text, deleting, phraseIdx, phrases, speed, pause])

  return text
}

/* ── Scroll Fade-In Hook ───────────────────────────── */
function useFadeIn() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el) } },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

/* ── Section Wrapper ───────────────────────────────── */
function Section({ id, children, className = '' }) {
  const ref = useFadeIn()
  return (
    <section id={id} className={`section fade-in ${className}`} ref={ref}>
      <div className="container">{children}</div>
    </section>
  )
}

/* ── Hero Timeline ─────────────────────────────────── */
function HeroTimeline() {
  const [drawn, setDrawn] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 600)
    return () => clearTimeout(t)
  }, [])

  const nodes = [
    { label: 'IIIT-L', period: 'Nov \'22', color: '#007aff' },
    { label: 'MS Summer', period: 'May \'25', color: '#00a1e0' },
    { label: 'Amazon', period: 'Jul \'25', color: '#ff9900' },
    { label: 'MS Spring', period: 'Jan \'26 → Now', color: '#00a1e0', current: true },
  ]

  return (
    <div className="hero-timeline" aria-label="Career timeline">
      <div className={`timeline-line${drawn ? ' timeline-drawn' : ''}`} />
      <div className="timeline-nodes">
        {nodes.map((n, i) => (
          <button
            key={i}
            className={`timeline-node${n.current ? ' timeline-node-current' : ''}`}
            onClick={() => scrollToSection('experience')}
            style={{ '--node-color': n.color }}
            aria-label={`${n.label} — ${n.period}`}
          >
            <div className="timeline-dot" />
            <div className="timeline-node-label">{n.label}</div>
            <div className="timeline-node-period">{n.period}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Hero Section ──────────────────────────────────── */
function Hero() {
  const phrases = [
    'Software Engineer @ Morgan Stanley',
    'DevOps Enthusiast',
    'Full-Stack Developer',
    'Competitive Programming Enthusiast',
    'B.Tech CSE — IIIT Lucknow',
  ]
  const typed = useTypewriter(phrases)

  return (
    <section id="home" className="hero">
      <div className="hero-content">
        {/* Avatar */}
        <div className="hero-avatar-wrap">
          <img
            src="/avatar.png"
            alt="Sridhar Suthapalli"
            className="hero-avatar"
            width="120"
            height="120"
            fetchPriority="high"
            decoding="async"
          />
          <div className="hero-status-badge hero-status-highlight">
            <span className="status-dot" />
            <span>Available for <strong>2026 Grad</strong> Opportunities</span>
          </div>
        </div>

        {/* Name */}
        <h1 className="hero-name">Sridhar Suthapalli</h1>

        {/* Typewriter */}
        <div className="hero-typewriter">
          <span>{typed}</span>
          <span className="cursor-blink" />
        </div>

        <div className="hero-company-strip" aria-label="Companies worked at">
          <span className="hero-company-label">Experience at</span>
          <div className="hero-company-logos">
            <span className="hero-company-logo-wrap">
              <img src="/company/morgan-stanley.png" alt="Morgan Stanley logo" className="hero-company-logo hero-company-logo-ms" />
            </span>
            <span className="hero-company-logo-wrap">
              <img src="/company/amazon.svg" alt="Amazon logo" className="hero-company-logo hero-company-logo-amz" />
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="hero-actions">
          <a href="#projects" className="btn-primary" onClick={e => { e.preventDefault(); scrollToSection('projects') }}>
            View Projects ↗
          </a>
          <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            Resume ↗
          </a>
        </div>

        {/* Timeline */}
        <HeroTimeline />

        {/* Social Links */}
        <div className="hero-socials">
          <a href="https://linkedin.com/in/sridharsuthapalli" target="_blank" rel="noopener noreferrer" className="social-link" id="hero-linkedin">
            <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            LinkedIn <span className="social-arrow">↗</span>
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="social-link" id="hero-github">
            <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            GitHub <span className="social-arrow">↗</span>
          </a>
          <a href="https://codeforces.com/profile/SridharSuthapalli" target="_blank" rel="noopener noreferrer" className="social-link" id="hero-cf">
            <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.672 21 0 20.328 0 19.5V9c0-.828.672-1.5 1.5-1.5h3zm9-4.5c.828 0 1.5.672 1.5 1.5V19.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V4.5C9 3.672 9.672 3 10.5 3h3zm9 7.5c.828 0 1.5.672 1.5 1.5v9c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5v-9c0-.828.672-1.5 1.5-1.5h3z"/></svg>
            Codeforces <span className="social-arrow">↗</span>
          </a>
          <a href="https://leetcode.com/u/Illuminati9" target="_blank" rel="noopener noreferrer" className="social-link" id="hero-leetcode">
            <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.396c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.396a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/></svg>
            LeetCode <span className="social-arrow">↗</span>
          </a>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="scroll-indicator">
        <span>Scroll</span>
        <svg className="scroll-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </div>
    </section>
  )
}

/* ── About Section ─────────────────────────────────── */
function About() {
  const ref = useFadeIn()
  const sideRef = useFadeIn()
  const [statsInViewRef, statsInView] = useInView(0.3)

  // Combined ref: attaches both useFadeIn and useInView to the same element
  const statsRef = useCallback(node => {
    sideRef.current = node
    statsInViewRef.current = node
    // Trigger useFadeIn observer manually
    if (node) {
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { node.classList.add('visible'); obs.unobserve(node) } },
        { threshold: 0.12 }
      )
      obs.observe(node)
    }
  }, [])

  const tps = useCountUp(40, 1800, statsInView)
  const cgpa = useCountUp(901, 1800, statsInView) // will format as 9.01
  const problems = useCountUp(1500, 2000, statsInView)
  const internships = useCountUp(3, 1200, statsInView)

  return (
    <Section id="about">
      <p className="section-label">About Me</p>
      <h2 className="section-title">Building things that matter.</h2>
      <p className="section-subtitle" style={{ marginBottom: '48px' }}>
        From competitive programming arenas to production systems at Fortune 500 companies.
      </p>

      <div className="about-grid">
        {/* Bio Card */}
        <div className="glass-card about-card fade-in" ref={ref}>
          <p className="about-text">
            I'm a <strong>software engineer</strong> currently working as a Technology Spring Analyst at <strong>Morgan Stanley, Bangalore</strong>. 
            I build systems that scale, from log retention platforms handling 6,000+ daily events to delivery planning service infrastructure processing 40,000–50,000 TPS at Amazon.
          </p>
          <p className="about-text">
            I thrive at the intersection of <strong>competitive problem-solving</strong> and <strong>engineering pragmatism</strong>,  
            where algorithmic thinking meets real-world architecture decisions.
          </p>
        </div>

        <div className="about-side fade-in" ref={statsRef}>
          <div className="glass-card about-education-card">
            <div className="edu-item">
              <div className="edu-icon" style={{ padding: '6px', background: 'transparent', border: 'none' }}>
                <img src="/college/iiitl.png" alt="IIIT-L logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div className="edu-info">
                <h4>Indian Institute of Information Technology, Lucknow</h4>
                <p>B.Tech · Computer Science · Nov 2022 – Jun 2026</p>
                <div className="edu-metrics">
                  <span className="cgpa">CGPA: 9.01 / 10</span>
                  <span className="cgpa">SGPA: 9.5 / 10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid with Count-Up */}
          <div className="stats-grid">
            {[
              { value: tps, suffix: 'K+', label: 'TPS Handled\nat Amazon' },
              { value: cgpa, suffix: '', label: 'CGPA at\nIIIT Lucknow', format: v => (v / 100).toFixed(2) },
              { value: problems, suffix: '+', label: 'Problems\nSolved' },
              { value: internships, suffix: '+', label: 'Internships\nat Top Firms' },
            ].map((s, i) => (
              <div className="glass-card stat-card" key={i}>
                <div className="stat-number gradient-text-blue">
                  {s.format ? s.format(s.value) : s.value}{s.suffix}
                </div>
                <div className="stat-label" style={{ whiteSpace: 'pre-line' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ── Experience Section ────────────────────────────── */
function Experience() {
  const experiences = [
    {
      role: 'Technology Spring Analyst',
      company: 'Morgan Stanley',
      companyLogo: '/company/morgan-stanley.png',
      companyLogoAlt: 'Morgan Stanley logo',
      location: 'Bangalore, India',
      period: 'Jan 2026 – Present',
      current: true,
      dotClass: 'exp-dot-ms',
      highlights: ['60+ Apps', '6K Logs/Day', 'React + FastAPI'],
      tech: ['React.js', 'FastAPI', 'MongoDB', 'Python', 'Cron Jobs'],
      bullets: [
        'Engineered a centralized log retention system from scratch using React.js and FastAPI to track change management events across 60+ internal applications.',
        'Implemented cron job ingestion of ~6,000 daily logs (~500 API requests/day) into MongoDB, bypassing Splunk\'s 90-day retention limit for enterprise analytics.',
      ],
    },
    {
      role: 'Software Dev Engineer Intern',
      company: 'Amazon',
      companyLogo: '/company/amazon.svg',
      companyLogoAlt: 'Amazon logo',
      location: 'Hyderabad, India',
      period: 'Jul 2025 – Dec 2025',
      current: false,
      dotClass: 'exp-dot-amz',
      highlights: ['50K TPS', '99% API Coverage', '4 Regional Fleets'],
      tech: ['Java', 'Spring Boot', 'AWS', 'Cell Architecture', 'Testing'],
      bullets: [
        'Built a Tier-1 delivery planning service infrastructure from scratch handling 40,000–50,000 TPS of global order traffic.',
        'Designed a deployment stack using Cell-based Architecture, partitioning incoming global traffic by input data to route requests across 4 region-specific isolated fleets.',
        'Rewrote the regression testing framework to increase API traffic coverage from 45% to 99%, preventing production outages.',
      ],
    },
    {
      role: 'Technology Summer Analyst',
      company: 'Morgan Stanley',
      companyLogo: '/company/morgan-stanley.png',
      companyLogoAlt: 'Morgan Stanley logo',
      location: 'Bangalore, India',
      period: 'May 2025 – Jul 2025',
      current: false,
      dotClass: 'exp-dot-ms',
      highlights: ['1000+ PII Docs', 'Real-Time Remediation', 'Flask + React'],
      tech: ['Flask', 'React.js', 'Data Security', 'API Integration'],
      bullets: [
        'Contributed to the internal data security platform by implementing a Flask-based API service to identify 1000+ sensitive PII documents.',
        'Integrated an endpoint with existing React.js dashboard, facilitating real-time permission remediation for security teams across the firm.',
      ],
    },
  ]

  return (
    <Section id="experience">
      <p className="section-label">Experience</p>
      <h2 className="section-title">Where I've worked.</h2>
      <p className="section-subtitle" style={{ marginBottom: '48px' }}>
        Internships and roles at industry-leading companies, shipping production systems at scale.
      </p>

      <div className="experience-list">
        {experiences.map((exp, i) => {
          const ref = useFadeIn()
          return (
            <div className={`glass-card exp-card fade-in${exp.current ? ' exp-card-current' : ''}`} key={i} ref={ref}>
              <div className="exp-body">
                <div className="exp-header">
                  <div className="exp-header-main">
                    <div className="exp-company-row">
                      <div className={`exp-company-logo-wrap ${exp.dotClass}`}>
                        <img src={exp.companyLogo} alt={exp.companyLogoAlt} className="exp-company-logo-large" loading="lazy" decoding="async" />
                      </div>
                    </div>
                    <div className="exp-role">{exp.role}</div>
                  </div>
                  <div className="exp-meta">
                    {exp.current && <span className="badge-current">● Current</span>}
                    <span className="exp-period">{exp.period}</span>
                    <span className="exp-location">📍 {exp.location}</span>
                  </div>
                </div>
                <div className="exp-highlights">
                  {exp.highlights.map((h, idx) => (
                    <span key={idx} className="exp-highlight-chip">{h}</span>
                  ))}
                </div>
                <ul className="exp-bullets">
                  {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
                </ul>
                <div className="exp-tech-tags">
                  {exp.tech.map((t, idx) => (
                    <span key={idx} className="exp-tech-tag">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

/* ── Projects Section ──────────────────────────────── */
function Projects() {
  const ref = useFadeIn()
  return (
    <Section id="projects">
      <p className="section-label">Projects</p>
      <h2 className="section-title">Things I've built.</h2>
      <p className="section-subtitle" style={{ marginBottom: '48px' }}>
        Personal and academic projects that push the boundaries of what I know.
      </p>

      <div className="projects-grid fade-in" ref={ref}>
        {/* Guardian Vision — Featured */}
        <div className="glass-card project-card project-card-featured">
          <div className="project-featured-badge">★ Featured</div>
          <div className="project-glow" />
          <div className="project-icon">🛡️</div>
          <h3 className="project-title">Guardian Vision</h3>

          <div className="project-stat-badges">
            <span className="project-stat-badge">⚡ 92% Accuracy</span>
            <span className="project-stat-badge">🎯 Real-Time</span>
          </div>

          <p className="project-desc">
            An ML-powered weapon and violence detection system built with YOLO V8 and OpenCV. 
            Tackles real-time inference challenges with asynchronous processing for email alerts, 
            preventing main-thread blocking during video analysis.
          </p>

          <div className="project-tags">
            {['HTML', 'CSS', 'JavaScript', 'OpenCV', 'YOLO V8', 'Python'].map(t => (
              <span className="project-tag" key={t}>{t}</span>
            ))}
          </div>

          <div className="project-link-row">
            <a
              href="https://github.com/Illuminati9/guardian-vision"
              target="_blank"
              rel="noopener noreferrer"
              className="project-link"
              id="guardian-vision-github"
            >
              View on GitHub →
            </a>
          </div>
        </div>

        {/* Log Retention System */}
        <div className="glass-card project-card">
          <div className="project-glow" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)' }} />
          <div className="project-icon" style={{ background: 'rgba(139,92,246,0.1)', borderColor: 'rgba(139,92,246,0.2)' }}>📊</div>
          <h3 className="project-title">Log Retention Platform</h3>

          <div className="project-stat-badges">
            <span className="project-stat-badge">⚡ 60+ Apps</span>
            <span className="project-stat-badge">🎯 6K Logs/Day</span>
          </div>

          <p className="project-desc">
            Centralized log retention system built at Morgan Stanley — tracks change management events 
            across 60+ internal applications with cron-based ingestion of ~6,000 daily logs into MongoDB, 
            bypassing Splunk's 90-day limit.
          </p>

          <div className="project-tags">
            {['React.js', 'FastAPI', 'MongoDB', 'Python', 'Cron Jobs'].map(t => (
              <span className="project-tag" key={t}>{t}</span>
            ))}
          </div>

          <div className="project-link-row">
            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>🔒 Internal — Morgan Stanley</span>
          </div>
        </div>

        {/* Delivery Planning Service Infrastructure */}
        <div className="glass-card project-card">
          <div className="project-glow" style={{ background: 'radial-gradient(circle, rgba(255,153,0,0.12), transparent 70%)' }} />
          <div className="project-icon" style={{ background: 'rgba(255,153,0,0.1)', borderColor: 'rgba(255,153,0,0.2)' }}>🚀</div>
          <h3 className="project-title">Delivery Planning Service Infrastructure</h3>

          <div className="project-stat-badges">
            <span className="project-stat-badge">⚡ 50K TPS</span>
            <span className="project-stat-badge">🎯 99% Coverage</span>
          </div>

          <p className="project-desc">
            Tier-1 service infrastructure at Amazon handling 40K–50K TPS of global order traffic. 
            Cell-based deployment across 4 isolated regional fleets. Regression framework rewrite 
            boosted API coverage from 45% to 99%.
          </p>

          <div className="project-tags">
            {['Java', 'Spring Boot', 'AWS', 'Cell Architecture', 'Testing'].map(t => (
              <span className="project-tag" key={t}>{t}</span>
            ))}
          </div>

          <div className="project-link-row">
            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>🔒 Internal — Amazon</span>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ── Skills Section (with Proficiency Bars) ────────── */
function Skills() {
  const [barsRef, barsInView] = useInView(0.2)

  const featured = [
    { name: 'C++', level: 'Expert', pct: 95 },
    { name: 'System Design', level: 'Expert', pct: 90 },
    { name: 'Java / Spring Boot', level: 'Proficient', pct: 82 },
    { name: 'Algorithms & DSA', level: 'Expert', pct: 95 },
    { name: 'Python / FastAPI', level: 'Proficient', pct: 80 },
    { name: 'React.js', level: 'Proficient', pct: 78 },
    { name: 'AWS', level: 'Intermediate', pct: 60 },
    { name: 'MongoDB', level: 'Intermediate', pct: 55 },
  ]

  const groups = [
    {
      icon: '💻',
      title: 'Languages',
      color: 'rgba(0,122,255,0.1)',
      tags: ['C++', 'Java', 'Python', 'JavaScript', 'SQL', 'HTML', 'CSS'],
    },
    {
      icon: '⚛️',
      title: 'Frameworks & Libraries',
      color: 'rgba(139,92,246,0.1)',
      tags: ['React.js', 'FastAPI', 'Spring Boot', 'Node.js', 'Express.js', 'Flutter', 'Flask'],
    },
    {
      icon: '🗄️',
      title: 'Databases',
      color: 'rgba(6,182,212,0.1)',
      tags: ['MySQL', 'PostgreSQL', 'MongoDB', 'Firebase'],
    },
    {
      icon: '☁️',
      title: 'Infrastructure & Tools',
      color: 'rgba(255,153,0,0.1)',
      tags: ['AWS', 'Git', 'GitHub', 'Linux', 'Splunk'],
    },
    {
      icon: '📚',
      title: 'Core CS',
      color: 'rgba(48,209,88,0.1)',
      tags: ['Data Structures', 'Algorithms', 'OOP', 'OS', 'CN', 'DBMS', 'Software Engineering'],
    },
  ]

  return (
    <Section id="skills">
      <p className="section-label">Technical Skills</p>
      <h2 className="section-title">My toolkit.</h2>
      <p className="section-subtitle" style={{ marginBottom: '48px' }}>
        Languages, frameworks, databases and tools I work with every day.
      </p>

      <div className="skills-layout">
        {/* Left — Proficiency Bars */}
        <div className="skills-proficiency" ref={barsRef}>
          <h3 className="skills-proficiency-title">Core Proficiencies</h3>
          {featured.map((s, i) => (
            <div className="skill-bar-row" key={i}>
              <div className="skill-bar-info">
                <span className="skill-bar-name">{s.name}</span>
                <span className={`skill-bar-level skill-level-${s.level.toLowerCase()}`}>{s.level}</span>
              </div>
              <div className="skill-bar-track">
                <div
                  className="skill-bar-fill"
                  style={{
                    width: barsInView ? `${s.pct}%` : '0%',
                    transitionDelay: `${i * 80}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Right — Tag Groups */}
        <div className="skills-tags-side">
          {groups.map((g, i) => {
            const ref = useFadeIn()
            return (
              <div className="glass-card skill-group fade-in" key={i} ref={ref}>
                <div className="skill-group-header">
                  <div className="skill-group-icon" style={{ background: g.color }}>{g.icon}</div>
                  <span className="skill-group-title">{g.title}</span>
                </div>
                <div className="skill-tags">
                  {g.tags.map(t => <span className="skill-tag" key={t}>{t}</span>)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

/* ── CF Rating Chart ───────────────────────────────── */
function CFRatingChart() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tooltip, setTooltip] = useState(null)
  const svgRef = useRef(null)

  useEffect(() => {
    fetch('https://codeforces.com/api/user.rating?handle=sridharsuthapalli')
      .then(r => r.json())
      .then(d => {
        if (d.status === 'OK') setData(d.result)
        else setError('Failed to load')
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="cf-chart-skeleton">
        <div className="cf-chart-skeleton-bar" />
        <div className="cf-chart-skeleton-bar short" />
        <div className="cf-chart-skeleton-bar" />
      </div>
    )
  }

  if (error || !data || data.length === 0) {
    return <div className="cf-chart-error">Unable to load Codeforces rating history.</div>
  }

  // Chart dimensions
  const W = 700, H = 280, PAD = { top: 30, right: 20, bottom: 40, left: 50 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const ratings = data.map(d => d.newRating)
  const minR = Math.min(...ratings) - 50
  const maxR = Math.max(...ratings) + 50
  const minT = data[0].ratingUpdateTimeSeconds
  const maxT = data[data.length - 1].ratingUpdateTimeSeconds

  const x = (t) => PAD.left + ((t - minT) / (maxT - minT)) * chartW
  const y = (r) => PAD.top + chartH - ((r - minR) / (maxR - minR)) * chartH

  // Rating bands (Codeforces-like)
  const bands = [
    { min: 0, max: 1200, color: 'rgba(128,128,128,0.08)', label: 'Newbie' },
    { min: 1200, max: 1400, color: 'rgba(0,128,0,0.06)', label: 'Pupil' },
    { min: 1400, max: 1600, color: 'rgba(3,168,158,0.06)', label: 'Specialist' },
    { min: 1600, max: 1900, color: 'rgba(0,0,255,0.06)', label: 'Expert' },
    { min: 1900, max: 2100, color: 'rgba(170,0,170,0.06)', label: 'CM' },
    { min: 2100, max: 2400, color: 'rgba(255,140,0,0.06)', label: 'Master' },
  ]

  const pathD = data.map((d, i) => {
    const px = x(d.ratingUpdateTimeSeconds)
    const py = y(d.newRating)
    return `${i === 0 ? 'M' : 'L'}${px},${py}`
  }).join(' ')

  // Y-axis ticks
  const yTicks = []
  for (let r = Math.ceil(minR / 200) * 200; r <= maxR; r += 200) {
    yTicks.push(r)
  }

  const handleMouseMove = (e) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const mx = (e.clientX - rect.left) * (W / rect.width)
    // find closest point
    let closest = 0, minDist = Infinity
    data.forEach((d, i) => {
      const dist = Math.abs(x(d.ratingUpdateTimeSeconds) - mx)
      if (dist < minDist) { minDist = dist; closest = i }
    })
    const d = data[closest]
    const delta = d.newRating - d.oldRating
    setTooltip({
      x: x(d.ratingUpdateTimeSeconds),
      y: y(d.newRating),
      name: d.contestName,
      rating: d.newRating,
      delta,
      date: new Date(d.ratingUpdateTimeSeconds * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    })
  }

  return (
    <div className="cf-chart-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="cf-chart-svg"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Rating bands */}
        {bands.map((b, i) => {
          const bandTop = Math.max(b.min, minR)
          const bandBot = Math.min(b.max, maxR)
          if (bandTop >= maxR || bandBot <= minR) return null
          return (
            <rect
              key={i}
              x={PAD.left}
              y={y(bandBot)}
              width={chartW}
              height={y(bandTop) - y(bandBot)}
              fill={b.color}
            />
          )
        })}

        {/* Y axis ticks */}
        {yTicks.map(r => (
          <g key={r}>
            <line x1={PAD.left} y1={y(r)} x2={PAD.left + chartW} y2={y(r)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={PAD.left - 8} y={y(r) + 4} fill="var(--text-tertiary)" fontSize="10" textAnchor="end" fontFamily="var(--font-system)">{r}</text>
          </g>
        ))}

        {/* Line */}
        <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={x(d.ratingUpdateTimeSeconds)}
            cy={y(d.newRating)}
            r="3"
            fill="var(--accent)"
            stroke="var(--bg-primary)"
            strokeWidth="1.5"
          />
        ))}

        {/* Tooltip crosshair */}
        {tooltip && (
          <>
            <line x1={tooltip.x} y1={PAD.top} x2={tooltip.x} y2={PAD.top + chartH} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4,4" />
            <circle cx={tooltip.x} cy={tooltip.y} r="5" fill="var(--accent)" stroke="#fff" strokeWidth="2" />
          </>
        )}
      </svg>

      {/* Tooltip popup */}
      {tooltip && (
        <div
          className="cf-chart-tooltip"
          style={{
            left: `${(tooltip.x / W) * 100}%`,
            top: `${(tooltip.y / H) * 100 - 14}%`,
          }}
        >
          <div className="cf-tooltip-name">{tooltip.name}</div>
          <div className="cf-tooltip-rating">
            Rating: {tooltip.rating}
            <span className={tooltip.delta >= 0 ? 'cf-tooltip-up' : 'cf-tooltip-down'}>
              {tooltip.delta >= 0 ? '+' : ''}{tooltip.delta}
            </span>
          </div>
          <div className="cf-tooltip-date">{tooltip.date}</div>
        </div>
      )}
    </div>
  )
}

/* ── Competitive Programming Section ───────────────── */
function CompetitiveProgramming() {
  const platforms = [
    {
      name: 'LeetCode',
      rating: '2164',
      rank: 'Guardian',
      detail: 'Top competitive tier',
      color: '#ffa116',
      glow: 'rgba(255,161,22,0.2)',
      link: 'https://leetcode.com/Illuminati9',
    },
    {
      name: 'Codeforces',
      rating: '1695',
      rank: 'Expert',
      detail: 'Global Rank 173 in Round 997',
      color: '#1ba9f5',
      glow: 'rgba(27,169,245,0.2)',
      link: 'https://codeforces.com/profile/SridharSuthapalli',
    },
    {
      name: 'CodeChef',
      rating: '1970',
      rank: '4★ Coder',
      detail: 'Global Rank 27 in Starters 157',
      color: '#5b4638',
      glow: 'rgba(91,70,56,0.3)',
      link: 'https://codechef.com/users/Illuminati9',
    },
    {
      name: 'AtCoder',
      rating: '1083',
      rank: '5 Kyu',
      detail: 'Active competitor',
      color: '#888888',
      glow: 'rgba(136,136,136,0.2)',
      link: 'https://atcoder.jp/users/Illuminati9',
    },
  ]

  const achievements = [
    { trophy: '🏆', text: 'Global Rank 173 in Codeforces Round 997' },
    { trophy: '🥇', text: 'Global Rank 27 in CodeChef Starters 157' },
    { trophy: '🏅', text: 'Runner-up at Hack-O-Fiesta V4.0 — IIIT Lucknow Hackathon' },
    { trophy: '📖', text: '1,500+ algorithmic problems solved across all platforms' },
    { trophy: '🎓', text: 'Former Co-Ordinator, App Dev Wing (Axios, IIITL Technical Club)' },
  ]

  const headerRef = useFadeIn()
  const achieveRef = useFadeIn()
  const chartRef = useFadeIn()

  return (
    <Section id="cp" className="cp-section">
      <div className="cp-header-row fade-in" ref={headerRef}>
        <div>
          <p className="section-label">Competitive Programming</p>
          <h2 className="section-title">Ranked among the best.</h2>
          <p className="section-subtitle">
            Consistent top-tier ratings across every major competitive programming platform.
          </p>
        </div>
        <div className="cp-total-badge">
          <div>
            <div className="cp-total-number">1,500+</div>
            <div className="cp-total-label">Problems<br/>Solved</div>
          </div>
        </div>
      </div>

      <div className="cp-platforms">
        {platforms.map((p, i) => {
          const ref = useFadeIn()
          return (
            <a
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card cp-platform-card fade-in"
              key={i}
              ref={ref}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div className="cp-platform-glow" style={{ background: `radial-gradient(circle at top right, ${p.glow}, transparent 70%)` }} />
              <div className="cp-platform-name">{p.name}</div>
              <div className="cp-platform-rating" style={{ color: p.color }}>{p.rating}</div>
              <div className="cp-platform-rank" style={{ color: p.color }}>{p.rank}</div>
              <div className="cp-platform-detail">{p.detail}</div>
              <div className="cp-visit-profile">
                Visit Profile <span className="cp-visit-arrow">↗</span>
              </div>
            </a>
          )
        })}
      </div>

      {/* CF Rating Chart */}
      <div className="glass-card cp-chart-card fade-in" ref={chartRef}>
        <div className="cp-chart-title">Codeforces Rating History</div>
        <CFRatingChart />
      </div>

      <div className="glass-card cp-achievements fade-in" ref={achieveRef}>
        <div className="cp-achievement-title">Highlights & Achievements</div>
        <div className="cp-achievement-list">
          {achievements.map((a, i) => (
            <div className="cp-achievement-item" key={i}>
              <span className="trophy">{a.trophy}</span>
              <span>{a.text}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ── Contact Section ───────────────────────────────── */
function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    if (window.__unlockAchievement) window.__unlockAchievement('connector')
    const targetEmail = 'sridharsuthapalli49@gmail.com'
    const subjectRaw = `Portfolio Contact from ${form.name}`
    const bodyRaw = `Hi Sridhar,\n\n${form.message}\n\nFrom: ${form.name}\nEmail: ${form.email}`
    const gmailUrl =
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetEmail)}` +
      `&su=${encodeURIComponent(subjectRaw)}&body=${encodeURIComponent(bodyRaw)}`

    try {
      await navigator.clipboard.writeText(targetEmail)
      setCopied(true)
    } catch {
      setCopied(false)
    }

    const popup = window.open(gmailUrl, '_blank', 'noopener,noreferrer')
    if (!popup) {
      const mailto =
        `mailto:${targetEmail}?subject=${encodeURIComponent(subjectRaw)}&body=${encodeURIComponent(bodyRaw)}`
      window.location.href = mailto
    }

    setSent(true)
    setForm({ name: '', email: '', message: '' })
    setSending(false)
  }

  const contactLinks = [
    { icon: '✉️', label: 'Email', value: 'sridharsuthapalli49@gmail.com', href: 'mailto:sridharsuthapalli49@gmail.com' },
    { icon: '💼', label: 'LinkedIn', value: 'linkedin.com/in/sridharsuthapalli', href: 'https://linkedin.com/in/sridharsuthapalli' },
    { icon: '🐙', label: 'GitHub', value: 'github.com/Illuminati9', href: 'https://github.com/Illuminati9' },
    { icon: '🏆', label: 'Codeforces', value: 'codeforces.com/profile/SridharSuthapalli', href: 'https://codeforces.com/profile/SridharSuthapalli' },
  ]

  const infoRef = useFadeIn()
  const formRef = useFadeIn()

  return (
    <Section id="contact">
      <p className="section-label">Contact</p>
      <h2 className="section-title">Let's connect.</h2>
      <p className="section-subtitle" style={{ marginBottom: '48px' }}>
        Open to full-time roles, collaborations, and interesting conversations.
      </p>

      <div className="contact-grid">
        <div className="glass-card contact-info-card fade-in" ref={infoRef}>
          <h3 className="contact-info-title">Get in touch</h3>
          <p className="contact-info-sub">
            Whether it's a job opportunity, a collaboration, or just a chat about competitive programming — 
            I'd love to hear from you.
          </p>
          <div className="contact-links">
            {contactLinks.map((l, i) => (
              <a key={i} href={l.href} target="_blank" rel="noopener noreferrer" className="contact-link-item" id={`contact-${l.label.toLowerCase()}`}>
                <div className="contact-link-icon">{l.icon}</div>
                <div className="contact-link-text">
                  <div className="contact-link-label">{l.label}</div>
                  <div className="contact-link-value">{l.value}</div>
                </div>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>→</span>
              </a>
            ))}
          </div>
        </div>

        <div className="glass-card contact-form-card fade-in" ref={formRef}>
          <h3 className="form-title">Send a message</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                className="form-input"
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                className="form-input"
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                className="form-textarea"
                placeholder="What's on your mind?"
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-submit"
              id="contact-submit"
              disabled={sending}
            >
              {sending ? 'Opening compose…' : 'Open Compose Window →'}
            </button>
            {sent && (
              <div className="form-success">
                ✅ Compose opened in a new tab. {copied ? 'Email copied to clipboard as backup.' : 'If it did not open, use the email shown on the left.'}
              </div>
            )}
          </form>
        </div>
      </div>
    </Section>
  )
}

/* ── Scroll Progress Bar ───────────────────────────── */
function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 0 ? (scrolled / total) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, zIndex: 2000,
      height: '2px', width: `${progress}%`,
      background: 'linear-gradient(90deg, #007aff, #06b6d4)',
      transition: 'width 0.1s linear',
      pointerEvents: 'none',
      boxShadow: '0 0 8px rgba(0,122,255,0.6)',
    }} />
  )
}

/* ── Back to Top Button ────────────────────────────── */
function BackToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <button
      id="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="back-to-top-btn"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.85)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      ↑
    </button>
  )
}

/* ── Cursor Glow ───────────────────────────────────── */
function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 })
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const move = (e) => { setPos({ x: e.clientX, y: e.clientY }); setVisible(true) }
    const leave = () => setVisible(false)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseleave', leave)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseleave', leave) }
  }, [])
  return (
    <div style={{
      position: 'fixed', zIndex: 0, pointerEvents: 'none',
      left: pos.x, top: pos.y,
      width: '400px', height: '400px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(0,122,255,0.06) 0%, transparent 70%)',
      transform: 'translate(-50%, -50%)',
      opacity: visible ? 1 : 0,
      transition: 'left 0.08s linear, top 0.08s linear, opacity 0.4s ease',
    }} />
  )
}

/* ── Open to Work Banner ───────────────────────────── */
function OpenToWorkBanner() {
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('otw-dismissed') === '1'
  })

  if (dismissed) return null

  return (
    <div className="otw-banner" id="open-to-work-banner">
      <span className="otw-dot" />
      <span className="otw-text">🎓 <strong>2026 Graduate</strong> — Actively seeking SDE New Grad roles · Available Jul 2026</span>
      <button
        className="otw-close"
        aria-label="Dismiss banner"
        onClick={() => {
          setDismissed(true)
          sessionStorage.setItem('otw-dismissed', '1')
        }}
      >
        ✕
      </button>
    </div>
  )
}

/* ── Keyboard Navigation ───────────────────────────── */
function KeyboardNav({ setMenuOpen }) {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return

      let used = false
      switch (e.key) {
        case '?': setShowModal(s => !s); used = true; break
        case 'Escape':
          setShowModal(false)
          if (setMenuOpen) setMenuOpen(false)
          break
        case 'g': case 'G':
          if (!e.ctrlKey && !e.metaKey) { window.open(GITHUB_URL, '_blank'); used = true }
          break
        case 'r': case 'R':
          if (!e.ctrlKey && !e.metaKey) { window.open(RESUME_URL, '_blank'); used = true }
          break
        case '1': scrollToSection('about'); used = true; break
        case '2': scrollToSection('experience'); used = true; break
        case '3': scrollToSection('projects'); used = true; break
        case '4': scrollToSection('skills'); used = true; break
        case '5': scrollToSection('cp'); used = true; break
        case '6': scrollToSection('contact'); used = true; break
        default: break
      }
      if (used && window.__unlockAchievement) window.__unlockAchievement('keyboard_ninja')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setMenuOpen])

  const shortcuts = [
    { key: 'G', action: 'Open GitHub' },
    { key: 'R', action: 'Open Resume' },
    { key: '1', action: 'Jump to About' },
    { key: '2', action: 'Jump to Experience' },
    { key: '3', action: 'Jump to Projects' },
    { key: '4', action: 'Jump to Skills' },
    { key: '5', action: 'Jump to CP' },
    { key: '6', action: 'Jump to Contact' },
    { key: '?', action: 'Toggle this help' },
    { key: 'Esc', action: 'Close modal / menu' },
  ]

  return (
    <>
      <button
        className="kb-hint-btn"
        onClick={() => setShowModal(true)}
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (?)"
      >
        ?
      </button>

      {showModal && (
        <div className="kb-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="kb-modal glass-card" onClick={e => e.stopPropagation()}>
            <div className="kb-modal-header">
              <h3>Keyboard Shortcuts</h3>
              <button className="kb-modal-close" onClick={() => setShowModal(false)} aria-label="Close">✕</button>
            </div>
            <div className="kb-modal-list">
              {shortcuts.map((s, i) => (
                <div className="kb-shortcut-row" key={i}>
                  <kbd className="kb-key">{s.key}</kbd>
                  <span className="kb-action">{s.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ── Footer ────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-copy">© 2026 Sridhar Suthapalli. Built with React + Vite.</p>
        <div className="footer-links">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
          <a href="https://linkedin.com/in/sridharsuthapalli" target="_blank" rel="noopener noreferrer" className="footer-link">LinkedIn</a>
          <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className="footer-link">Resume</a>
        </div>
      </div>
    </footer>
  )
}

/* ── App Inner (needs achievement context) ─────────── */
function AppInner({ theme, toggleTheme }) {
  const [memoryOpen, setMemoryOpen] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const achievements = useAchievements()

  // Expose unlock globally for simple integrations
  useEffect(() => {
    window.__unlockAchievement = achievements?.unlock
    return () => { delete window.__unlockAchievement }
  }, [achievements])

  const handleSelectGame = useCallback((gameId) => {
    if (gameId === 'memory') setMemoryOpen(true)
    else if (gameId === 'terminal') setTerminalOpen(true)
  }, [])

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <Background />
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <KeyboardNav />
      <a href="#home" className="skip-link" onClick={(e) => { e.preventDefault(); scrollToSection('home', 0) }}>
        Skip to content
      </a>
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <CompetitiveProgramming />
        <Contact />
      </main>
      <Footer />
      <OpenToWorkBanner />
      <BackToTop />

      {/* Gamification Layer */}
      <GameHub onSelectGame={handleSelectGame} />
      <MemoryGame
        isOpen={memoryOpen}
        onClose={() => setMemoryOpen(false)}
        onAchievement={achievements?.unlock}
      />
      <TerminalGame
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        onAchievement={achievements?.unlock}
      />
      <KonamiEasterEgg onAchievement={achievements?.unlock} />
      <ScrollFactPopup onAchievement={achievements?.unlock} />
    </>
  )
}

/* ── App Root ───────────────────────────────────────── */
export default function App() {
  const [loaded, setLoaded] = useState(() => {
    return sessionStorage.getItem('loader-shown') === '1'
  })
  const [theme, toggleTheme] = useTheme()

  if (!loaded) {
    return <Loader onFinish={() => setLoaded(true)} />
  }

  return (
    <AchievementProvider>
      <AppInner theme={theme} toggleTheme={toggleTheme} />
    </AchievementProvider>
  )
}
