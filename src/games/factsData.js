/* ──────────────────────────────────────────────────────
   "Did You Know?" Facts Data
   Shared across all gamification components
   ────────────────────────────────────────────────────── */

export const FACT_CATEGORIES = {
  career: { icon: '💼', label: 'Career', color: '#007aff' },
  cp: { icon: '🏆', label: 'Competitive Programming', color: '#ffa116' },
  education: { icon: '🎓', label: 'Education', color: '#30d158' },
  technical: { icon: '⚙️', label: 'Technical', color: '#8b5cf6' },
  fun: { icon: '🎯', label: 'Fun Fact', color: '#ff6b6b' },
}

export const didYouKnowFacts = [
  // Career & Work
  {
    id: 'career-1',
    category: 'career',
    fact: "The infra stack Sridhar built at Amazon handles more TPS than the population of a small city — 50,000 transactions every second!",
  },
  {
    id: 'career-2',
    category: 'career',
    fact: "The log retention system Sridhar built at Morgan Stanley tracks events across 60+ internal applications — that's more apps than most people have on their phone!",
  },
  {
    id: 'career-3',
    category: 'career',
    fact: "Sridhar rewrote Amazon's regression testing framework for the infra stack and jumped API coverage from 45% to 99% — catching bugs before they could reach millions of customers.",
  },

  // Competitive Programming
  {
    id: 'cp-1',
    category: 'cp',
    fact: "Sridhar has solved over 1,500 algorithmic problems — that's roughly 1 problem every single day since he started college!",
  },
  {
    id: 'cp-2',
    category: 'cp',
    fact: "With a LeetCode rating of 2164 (Guardian tier), Sridhar is in the top fraction of competitive programmers globally.",
  },
  {
    id: 'cp-3',
    category: 'cp',
    fact: "Sridhar achieved Global Rank 173 in Codeforces Round 997 — out of thousands of participants worldwide!",
  },
  {
    id: 'cp-4',
    category: 'cp',
    fact: "Sridhar holds a 4★ rating on CodeChef and once ranked Global #27 in a Starters contest.",
  },

  // Education
  {
    id: 'edu-1',
    category: 'education',
    fact: "Sridhar maintains a 9.01 CGPA at IIIT Lucknow with a peak SGPA of 9.5 — excelling in both academics and competitive coding simultaneously.",
  },
  {
    id: 'edu-2',
    category: 'education',
    fact: "Sridhar was the Co-Ordinator of the App Dev Wing at Axios, IIIT Lucknow's technical club.",
  },

  // Technical
  {
    id: 'tech-1',
    category: 'technical',
    fact: "This portfolio is built with React 19 and Vite 8 — no CSS frameworks, just pure vanilla CSS with 3000+ lines of custom styling!",
  },
  {
    id: 'tech-2',
    category: 'technical',
    fact: "Sridhar designed a Cell-based Architecture for Amazon's infra stack that partitions global traffic across 4 region-specific isolated fleets.",
  },

  // Fun / Personal
  {
    id: 'fun-1',
    category: 'fun',
    fact: "Sridhar was runner-up at Hack-O-Fiesta V4.0, IIIT Lucknow's flagship hackathon!",
  },
  {
    id: 'fun-2',
    category: 'fun',
    fact: "Sridhar's first competitive programming language was C++ — and it's still his weapon of choice with a 95% proficiency rating.",
  },
  {
    id: 'fun-3',
    category: 'fun',
    fact: "Sridhar jogs 3km every day and follows it up with a 1-hour gym session — a routine he started recently and hasn't missed since!",
  },
  {
    id: 'fun-4',
    category: 'fun',
    fact: "Sridhar is currently reading a Telugu book called 'Amma Diary Lo Konni Pagelu' — balancing code with culture!",
  },
]

/**
 * Returns a random fact, optionally filtered by category.
 * Tracks shown facts to avoid repeats within a session.
 */
const shownFacts = new Set()

export function getRandomFact(category = null) {
  let pool = category
    ? didYouKnowFacts.filter(f => f.category === category)
    : didYouKnowFacts

  // Filter out already-shown facts
  const unseen = pool.filter(f => !shownFacts.has(f.id))

  // If all facts have been shown, reset
  if (unseen.length === 0) {
    shownFacts.clear()
    return getRandomFact(category)
  }

  const fact = unseen[Math.floor(Math.random() * unseen.length)]
  shownFacts.add(fact.id)
  return fact
}

/**
 * Returns a fact by specific category, cycling through them.
 */
const categoryIndex = {}
export function getNextFact(category) {
  const pool = didYouKnowFacts.filter(f => f.category === category)
  if (pool.length === 0) return getRandomFact()
  const idx = (categoryIndex[category] || 0) % pool.length
  categoryIndex[category] = idx + 1
  return pool[idx]
}
