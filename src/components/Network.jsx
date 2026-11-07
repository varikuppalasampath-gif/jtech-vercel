import { useEffect, useRef } from 'react'

export default function Network() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current, x = c.getContext('2d')
    const rm = matchMedia('(prefers-reduced-motion: reduce)').matches
    let w, h, nodes, raf
    const fit = () => {
      const d = devicePixelRatio || 1
      w = c.offsetWidth; h = c.offsetHeight
      c.width = w * d; c.height = h * d
      x.setTransform(d, 0, 0, d, 0, 0)
      const n = Math.min(70, Math.floor((w * h) / 16000))
      nodes = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
      }))
    }
    const draw = () => {
      x.clearRect(0, 0, w, h)
      for (const a of nodes) {
        if (!rm) {
          a.x += a.vx; a.y += a.vy
          if (a.x < 0 || a.x > w) a.vx *= -1
          if (a.y < 0 || a.y > h) a.vy *= -1
        }
        for (const b of nodes) {
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 140) {
            x.strokeStyle = `rgba(56,189,248,${(1 - d / 140) * .35})`
            x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke()
          }
        }
        x.fillStyle = 'rgba(125,211,252,.9)'
        x.beginPath(); x.arc(a.x, a.y, 2, 0, 7); x.fill()
      }
      if (!rm) raf = requestAnimationFrame(draw)
    }
    fit(); draw()
    addEventListener('resize', fit)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', fit) }
  }, [])
  return <canvas ref={ref} className="net" aria-hidden="true" />
}

