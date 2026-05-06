import { useMemo, useState } from 'react'

function parseHexToRgb(hex) {
  const h = hex.replace('#', '')
  const value = h.length === 3
    ? h.split('').map((c) => c + c).join('')
    : h
  const num = Number.parseInt(value, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

function rgba(hex, alpha) {
  const { r, g, b } = parseHexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function BorderGlow({
  children,
  className = '',
  edgeSensitivity = 30,
  backgroundColor = '#060010',
  borderRadius = 28,
  glowRadius = 36,
  glowIntensity = 1,
  coneSpread = 25,
  colors = ['#c084fc', '#f472b6', '#38bdf8'],
}) {
  const [hovered, setHovered] = useState(false)
  const [angle, setAngle] = useState(45)
  const [edgeProximity, setEdgeProximity] = useState(0)

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const dx = x - cx
    const dy = y - cy

    const maxDistance = Math.hypot(cx, cy)
    const currentDistance = Math.hypot(dx, dy)
    setEdgeProximity(Math.min(1, currentDistance / maxDistance))

    let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90
    if (deg < 0) deg += 360
    setAngle(deg)
  }

  const visibility = hovered
    ? Math.max(0, (edgeProximity * 100 - edgeSensitivity) / (100 - edgeSensitivity))
    : 0

  const gradient = useMemo(() => `linear-gradient(135deg, ${colors.join(', ')})`, [colors])

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={`relative isolate ${className}`}
      style={{
        borderRadius: `${borderRadius}px`,
        background: backgroundColor,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          padding: '1px',
          background: gradient,
          opacity: visibility,
          transition: hovered ? 'opacity 0.2s ease-out' : 'opacity 0.6s ease-in-out',
          WebkitMaskImage: `conic-gradient(from ${angle}deg at center, black ${coneSpread}%, transparent ${coneSpread + 15}%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`,
          maskImage: `conic-gradient(from ${angle}deg at center, black ${coneSpread}%, transparent ${coneSpread + 15}%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`,
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute rounded-[inherit]"
        style={{
          inset: `-${glowRadius}px`,
          opacity: visibility,
          transition: hovered ? 'opacity 0.2s ease-out' : 'opacity 0.6s ease-in-out',
          boxShadow: `
            0 0 30px ${rgba(colors[0], 0.16 * glowIntensity)},
            0 0 40px ${rgba(colors[1] || colors[0], 0.14 * glowIntensity)},
            0 0 55px ${rgba(colors[2] || colors[0], 0.12 * glowIntensity)}
          `,
          WebkitMaskImage: `conic-gradient(from ${angle}deg at center, black 5%, transparent 14%, transparent 86%, black 95%)`,
          maskImage: `conic-gradient(from ${angle}deg at center, black 5%, transparent 14%, transparent 86%, black 95%)`,
        }}
      />

      <div className="relative z-10 rounded-[inherit]">
        {children}
      </div>
    </div>
  )
}
