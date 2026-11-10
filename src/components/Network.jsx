import { useEffect, useRef } from 'react'

export default function Network() {
  const ref = useRef(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const x = c.getContext('2d')
    if (!x) return

    let w = 0, h = 0, nodes = [], raf
    const mouse = { x: -1000, y: -1000, radius: 150 }

    const fit = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2)
      w = c.offsetWidth
      h = c.offsetHeight
      c.width = Math.floor(w * d)
      c.height = Math.floor(h * d)
      x.setTransform(d, 0, 0, d, 0, 0)

      const n = Math.min(80, Math.max(35, Math.floor((w * h) / 14000)))
      nodes = Array.from({ length: n }, () => {
        const ox = Math.random() * w
        const oy = Math.random() * h
        return {
          originX: ox,
          originY: oy,
          x: ox,
          y: oy,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 1.5 + 1.5,
        }
      })
    }

    const onMove = e => {
      const rect = c.getBoundingClientRect()
      // Only track if mouse is within or near the hero element
      if (
        e.clientY >= rect.top - 50 &&
        e.clientY <= rect.bottom + 50 &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right
      ) {
        mouse.x = e.clientX - rect.left
        mouse.y = e.clientY - rect.top
      } else {
        mouse.x = -1000
        mouse.y = -1000
      }
    }

    const onLeave = () => {
      mouse.x = -1000
      mouse.y = -1000
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)

    const draw = () => {
      x.clearRect(0, 0, w, h)

      // Subtle glowing light spotlight around cursor
      if (mouse.x > -200 && mouse.y > -200) {
        const g = x.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius)
        g.addColorStop(0, 'rgba(56, 189, 248, 0.22)')
        g.addColorStop(0.4, 'rgba(56, 189, 248, 0.08)')
        g.addColorStop(1, 'rgba(56, 189, 248, 0)')
        x.fillStyle = g
        x.beginPath()
        x.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2)
        x.fill()
      }

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]

        // Ambient drift
        a.x += a.vx
        a.y += a.vy
        if (a.x < 0 || a.x > w) a.vx *= -1
        if (a.y < 0 || a.y > h) a.vy *= -1

        // Mouse repulsion physics
        const dx = a.x - mouse.x
        const dy = a.y - mouse.y
        const dist = Math.hypot(dx, dy)

        if (dist < mouse.radius && dist > 0.1) {
          const force = (1 - dist / mouse.radius) * 4.5
          const angle = Math.atan2(dy, dx)
          a.x += Math.cos(angle) * force
          a.y += Math.sin(angle) * force
        }

        // Draw connections between nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 130) {
            x.strokeStyle = `rgba(56, 189, 248, ${(1 - d / 130) * 0.35})`
            x.lineWidth = 1
            x.beginPath()
            x.moveTo(a.x, a.y)
            x.lineTo(b.x, b.y)
            x.stroke()
          }
        }

        // Interactive connection line directly to cursor
        if (dist < mouse.radius) {
          x.strokeStyle = `rgba(125, 211, 252, ${(1 - dist / mouse.radius) * 0.75})`
          x.lineWidth = 1.4
          x.beginPath()
          x.moveTo(a.x, a.y)
          x.lineTo(mouse.x, mouse.y)
          x.stroke()
        }

        // Node circle rendering
        const isNear = dist < mouse.radius
        x.fillStyle = isNear ? '#ffffff' : 'rgba(125, 211, 252, 0.9)'
        if (isNear) {
          x.shadowBlur = 8
          x.shadowColor = '#38bdf8'
        }
        x.beginPath()
        x.arc(a.x, a.y, isNear ? a.size * 1.4 : a.size, 0, Math.PI * 2)
        x.fill()
        x.shadowBlur = 0
      }

      raf = requestAnimationFrame(draw)
    }

    fit()
    draw()
    window.addEventListener('resize', fit, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', fit)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={ref} className="net" aria-hidden="true" />
}
