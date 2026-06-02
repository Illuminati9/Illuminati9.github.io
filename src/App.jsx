import { useState, useEffect, useRef, useCallback } from 'react'

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

/* ── Navbar ────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const sectionIds = ['home', 'about', 'experience', 'projects', 'skills', 'cp', 'contact']
  const [active, setActive] = useActiveSection(sectionIds)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    setMenuOpen(false)
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
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
        <span className="navbar-logo" onClick={() => scrollTo('home')}>
          Sridhar S.
        </span>

        <ul className={`navbar-links${menuOpen ? ' open' : ''}`}>
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
            href="https://drive.google.com/file/d/1XahEoVfOsteb7ixsu8gVbq_H5o0-DF2k/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-resume"
          >
            Resume
          </a>
          <button
            className="navbar-hamburger"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(o => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
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

/* ── Hero Section ──────────────────────────────────── */
function Hero() {
  const phrases = [
    'Software Engineer @ Morgan Stanley',
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
          <img src="/avatar.png" alt="Sridhar Suthapalli" className="hero-avatar" />
          <div className="hero-status-badge">
            <span className="status-dot" />
            Available for Opportunities
          </div>
        </div>

        {/* Name */}
        <p className="hero-eyebrow">Portfolio — 2026</p>
        <h1 className="hero-name">Sridhar Suthapalli</h1>

        {/* Typewriter */}
        <div className="hero-typewriter">
          <span>{typed}</span>
          <span className="cursor-blink" />
        </div>

        {/* CTA Buttons */}
        <div className="hero-actions">
          <a href="#projects" className="btn-primary" onClick={e => { e.preventDefault(); document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }) }}>
            View Projects ↗
          </a>
          <a href="https://drive.google.com/file/d/1XahEoVfOsteb7ixsu8gVbq_H5o0-DF2k/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="btn-secondary">
            Resume
          </a>
        </div>

        {/* Social Links */}
        <div className="hero-socials">
          <a href="https://linkedin.com/in/sridharsuthapalli" target="_blank" rel="noopener noreferrer" className="social-link" id="hero-linkedin">
            <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            LinkedIn
          </a>
          <a href="https://github.com/Illuminati9" target="_blank" rel="noopener noreferrer" className="social-link" id="hero-github">
            <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </a>
          <a href="https://codeforces.com/profile/Illuminati9" target="_blank" rel="noopener noreferrer" className="social-link" id="hero-cf">
            <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.672 21 0 20.328 0 19.5V9c0-.828.672-1.5 1.5-1.5h3zm9-4.5c.828 0 1.5.672 1.5 1.5V19.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V4.5C9 3.672 9.672 3 10.5 3h3zm9 7.5c.828 0 1.5.672 1.5 1.5v9c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5v-9c0-.828.672-1.5 1.5-1.5h3z"/></svg>
            Codeforces
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
  const statsRef = useFadeIn()

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
            I build systems that scale — from log retention platforms handling 6,000+ daily events to delivery planning services processing 40,000–50,000 TPS at Amazon.
          </p>
          <p className="about-text">
            I thrive at the intersection of <strong>competitive problem-solving</strong> and <strong>engineering pragmatism</strong> — 
            where algorithmic thinking meets real-world architecture decisions.
          </p>

          <div className="about-education">
            <div className="edu-item">
              <div className="edu-icon">🎓</div>
              <div className="edu-info">
                <h4>Indian Institute of Information Technology, Lucknow</h4>
                <p>B.Tech — Computer Science Engineering · Nov 2022 – Jun 2026</p>
                <span className="cgpa">CGPA: 9.01 / 10 · SGPA: 9.5 / 10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid fade-in" ref={statsRef}>
          {[
            { number: '40K+', label: 'TPS Handled\nat Amazon' },
            { number: '9.01', label: 'CGPA at\nIIIT Lucknow' },
            { number: '1500+', label: 'Problems\nSolved' },
            { number: '3+', label: 'Internships\nat Top Firms' },
          ].map((s, i) => (
            <div className="glass-card stat-card" key={i}>
              <div className="stat-number gradient-text-blue">{s.number}</div>
              <div className="stat-label" style={{ whiteSpace: 'pre-line' }}>{s.label}</div>
            </div>
          ))}
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
      location: 'Bangalore, India',
      period: 'Jan 2026 – Present',
      current: true,
      dotClass: 'exp-dot-ms',
      icon: '🏦',
      bullets: [
        'Engineered a centralized log retention system from scratch using React.js and FastAPI to track change management events across 60+ internal applications.',
        'Implemented cron job ingestion of ~6,000 daily logs (~500 API requests/day) into MongoDB, bypassing Splunk\'s 90-day retention limit for enterprise analytics.',
      ],
    },
    {
      role: 'Software Dev Engineer Intern',
      company: 'Amazon',
      location: 'Hyderabad, India',
      period: 'Jul 2025 – Dec 2025',
      current: false,
      dotClass: 'exp-dot-amz',
      icon: '📦',
      bullets: [
        'Built a Tier-1 delivery planning service architecture from scratch handling 40,000–50,000 TPS of global order traffic.',
        'Designed a deployment stack using Cell-based Architecture, partitioning incoming global traffic by input data to route requests across 4 region-specific isolated fleets.',
        'Rewrote the regression testing framework to increase API traffic coverage from 45% to 99%, preventing production outages.',
      ],
    },
    {
      role: 'Technology Summer Analyst',
      company: 'Morgan Stanley',
      location: 'Bangalore, India',
      period: 'May 2025 – Jul 2025',
      current: false,
      dotClass: 'exp-dot-ms',
      icon: '🏦',
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
            <div className="glass-card exp-card fade-in" key={i} ref={ref}>
              <div className={`exp-dot ${exp.dotClass}`}>{exp.icon}</div>
              <div className="exp-body">
                <div className="exp-header">
                  <div>
                    <div className="exp-company">{exp.company}</div>
                    <div className="exp-role">{exp.role}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {exp.current && <span className="badge-current">● Current</span>}
                    <span className="exp-period">{exp.period}</span>
                  </div>
                </div>
                <div className="exp-location">📍 {exp.location}</div>
                <ul className="exp-bullets">
                  {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
                </ul>
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
        {/* Guardian Vision */}
        <div className="glass-card project-card">
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
              href="https://github.com/Illuminati9"
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

        {/* Delivery Planning Service */}
        <div className="glass-card project-card">
          <div className="project-glow" style={{ background: 'radial-gradient(circle, rgba(255,153,0,0.12), transparent 70%)' }} />
          <div className="project-icon" style={{ background: 'rgba(255,153,0,0.1)', borderColor: 'rgba(255,153,0,0.2)' }}>🚀</div>
          <h3 className="project-title">Delivery Planning Service</h3>

          <div className="project-stat-badges">
            <span className="project-stat-badge">⚡ 50K TPS</span>
            <span className="project-stat-badge">🎯 99% Coverage</span>
          </div>

          <p className="project-desc">
            Tier-1 service architecture at Amazon handling 40K–50K TPS of global order traffic. 
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

/* ── Skills Section ────────────────────────────────── */
function Skills() {
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

      <div className="skills-container">
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
    </Section>
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
      link: 'https://codeforces.com/profile/Illuminati9',
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
            </a>
          )
        })}
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

  const handleSubmit = (e) => {
    e.preventDefault()
    setSending(true)
    // Build a mailto: link from form fields — opens native email client, works with no backend
    const subject = encodeURIComponent(`Portfolio Contact from ${form.name}`)
    const body = encodeURIComponent(
      `Hi Sridhar,\n\n${form.message}\n\nFrom: ${form.name}\nEmail: ${form.email}`
    )
    window.open(`mailto:sridharsuthapalli49@gmail.com?subject=${subject}&body=${body}`, '_blank')
    setSent(true)
    setForm({ name: '', email: '', message: '' })
    setSending(false)
  }

  const contactLinks = [
    { icon: '✉️', label: 'Email', value: 'sridharsuthapalli49@gmail.com', href: 'mailto:sridharsuthapalli49@gmail.com' },
    { icon: '💼', label: 'LinkedIn', value: 'linkedin.com/in/sridharsuthapalli', href: 'https://linkedin.com/in/sridharsuthapalli' },
    { icon: '🐙', label: 'GitHub', value: 'github.com/Illuminati9', href: 'https://github.com/Illuminati9' },
    { icon: '🏆', label: 'Codeforces', value: 'codeforces.com/profile/Illuminati9', href: 'https://codeforces.com/profile/Illuminati9' },
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
              {sending ? 'Opening email…' : 'Send via Email →'}
            </button>
            {sent && (
              <div className="form-success">
                ✅ Your email client opened! Send the message from there.
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
      style={{
        position: 'fixed', bottom: '32px', right: '32px', zIndex: 1000,
        width: '44px', height: '44px', borderRadius: '50%',
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.15)',
        color: '#f5f5f7', fontSize: '1.1rem', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.85)',
        transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34,1.5,0.64,1)',
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

/* ── Footer ────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-copy">© 2026 Sridhar Suthapalli. Built with React + Vite.</p>
        <div className="footer-links">
          <a href="https://github.com/Illuminati9" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
          <a href="https://linkedin.com/in/sridharsuthapalli" target="_blank" rel="noopener noreferrer" className="footer-link">LinkedIn</a>
          <a href="https://drive.google.com/file/d/1XahEoVfOsteb7ixsu8gVbq_H5o0-DF2k/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="footer-link">Resume</a>
        </div>
      </div>
    </footer>
  )
}

/* ── App Root ───────────────────────────────────────── */
export default function App() {
  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <Background />
      <Navbar />
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
      <BackToTop />
    </>
  )
}
