import { useEffect, useRef } from 'react'
import './ConfettiEffect.css'

const COLORS = ['#007aff', '#06b6d4', '#8b5cf6', '#ff6b6b', '#ffa116', '#30d158', '#ff2d55', '#5856d6']
const PARTICLE_COUNT = 60

export default function ConfettiEffect({ active, duration = 3000, onComplete }) {
  const containerRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!active || !containerRef.current) return

    const container = containerRef.current
    container.innerHTML = ''

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle = document.createElement('div')
      particle.className = 'confetti-particle'

      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const x = Math.random() * 100
      const delay = Math.random() * 0.6
      const rotation = Math.random() * 360
      const scale = 0.5 + Math.random() * 0.8
      const drift = (Math.random() - 0.5) * 200
      const fallDuration = 1.5 + Math.random() * 2

      // Randomly choose shape
      const shapes = ['confetti-rect', 'confetti-circle', 'confetti-strip']
      particle.classList.add(shapes[Math.floor(Math.random() * shapes.length)])

      particle.style.cssText = `
        left: ${x}%;
        background: ${color};
        animation-delay: ${delay}s;
        animation-duration: ${fallDuration}s;
        --rotation: ${rotation}deg;
        --drift: ${drift}px;
        --scale: ${scale};
      `

      container.appendChild(particle)
    }

    timerRef.current = setTimeout(() => {
      container.innerHTML = ''
      onComplete?.()
    }, duration)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [active, duration, onComplete])

  if (!active) return null

  return <div ref={containerRef} className="confetti-container" aria-hidden="true" />
}
