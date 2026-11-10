import { useEffect, useRef } from 'react'

export default function CursorInteraction() {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId
    let width = window.innerWidth
    let height = window.innerHeight
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    // Mouse coordinates & state
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      prevX: -1000,
      prevY: -1000,
      active: false,
      alpha: 0,
      speed: 0,
    }

    // Ambient floating particles that repel from mouse
    let particles = []
    // Glowing stardust trail particles
    let trail = []

    const REPEL_RADIUS = 140
    const REPEL_FORCE = 3.2
    const RETURN_SPEED = 0.04
    const DAMPING = 0.88

    function resize() {
      if (!canvas) return
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      initParticles()
    }

    function initParticles() {
      particles = []
      // Responsive count: ~1 particle per 18,000 px, clamped between 50 and 95
      const count = Math.min(95, Math.max(50, Math.floor((width * height) / 18000)))

      for (let i = 0; i < count; i++) {
        const homeX = Math.random() * width
        const homeY = Math.random() * height
        particles.push({
          homeX,
          homeY,
          x: homeX,
          y: homeY,
          vx: 0,
          vy: 0,
          size: Math.random() * 1.5 + 1.2,
          baseAlpha: Math.random() * 0.25 + 0.25,
          alpha: 0.3,
          driftAngle: Math.random() * Math.PI * 2,
          driftSpeed: Math.random() * 0.006 + 0.003,
          driftRadius: Math.random() * 16 + 8,
        })
      }
    }

    function addTrailParticle(x, y, dx, dy) {
      if (trail.length > 55) trail.shift()
      trail.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 1.2 - dx * 0.12,
        vy: (Math.random() - 0.5) * 1.2 - dy * 0.12,
        size: Math.random() * 2.8 + 1.5,
        alpha: 0.85,
        decay: Math.random() * 0.025 + 0.02,
        color: Math.random() > 0.4 ? '56, 189, 248' : '125, 211, 252',
      })
    }

    function onPointerMove(e) {
      // Gracefully ignore touch gestures so mobile performance stays 60fps
      if (e.pointerType === 'touch') {
        mouse.active = false
        return
      }

      const clientX = e.clientX
      const clientY = e.clientY

      if (!mouse.active) {
        mouse.x = clientX
        mouse.y = clientY
        mouse.targetX = clientX
        mouse.targetY = clientY
        mouse.prevX = clientX
        mouse.prevY = clientY
      }

      mouse.active = true
      mouse.targetX = clientX
      mouse.targetY = clientY

      const dx = clientX - mouse.prevX
      const dy = clientY - mouse.prevY
      const dist = Math.hypot(dx, dy)
      mouse.speed = dist

      // Spawn glowing trail particles along the cursor path
      if (dist > 3) {
        const count = Math.min(3, Math.floor(dist / 5) + 1)
        for (let i = 0; i < count; i++) {
          addTrailParticle(clientX, clientY, dx, dy)
        }
        mouse.prevX = clientX
        mouse.prevY = clientY
      }
    }

    function onPointerLeave() {
      mouse.active = false
    }

    function onPointerEnter(e) {
      if (e.pointerType === 'touch') return
      mouse.active = true
      mouse.targetX = e.clientX
      mouse.targetY = e.clientY
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.prevX = e.clientX
      mouse.prevY = e.clientY
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('mousemove', onPointerMove, { passive: true })
    document.addEventListener('pointerleave', onPointerLeave)
    document.addEventListener('mouseleave', onPointerLeave)
    document.addEventListener('pointerenter', onPointerEnter)
    document.addEventListener('mouseenter', onPointerEnter)

    let time = 0

    function loop() {
      time += 0.016
      ctx.clearRect(0, 0, width, height)

      // Smooth cursor position interpolation
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.35
        mouse.y += (mouse.targetY - mouse.y) * 0.35
        mouse.alpha += (1 - mouse.alpha) * 0.12
      } else {
        mouse.alpha += (0 - mouse.alpha) * 0.08
      }

      // 1. Subtle glowing light spotlight around cursor
      if (mouse.alpha > 0.01) {
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 170)
        grad.addColorStop(0, `rgba(56, 189, 248, ${0.18 * mouse.alpha})`)
        grad.addColorStop(0.35, `rgba(56, 189, 248, ${0.07 * mouse.alpha})`)
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)')

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, 170, 0, Math.PI * 2)
        ctx.fill()

        // Sleek glowing inner ring around pointer
        ctx.save()
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.45 * mouse.alpha})`
        ctx.lineWidth = 1.5
        ctx.shadowBlur = 8
        ctx.shadowColor = `rgba(56, 189, 248, ${0.6 * mouse.alpha})`
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, 14, 0, Math.PI * 2)
        ctx.stroke()

        // Subtle center dot
        ctx.fillStyle = `rgba(186, 230, 253, ${0.75 * mouse.alpha})`
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, 2.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // 2. Render and update glowing particle trail
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i]
        p.x += p.vx
        p.y += p.vy
        p.alpha -= p.decay
        p.size *= 0.97

        if (p.alpha <= 0 || p.size <= 0.4) {
          trail.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.shadowBlur = 8
        ctx.shadowColor = `rgba(${p.color}, ${p.alpha * 0.9})`
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // 3. Update & render ambient reactive particles with dynamic repulsion
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Idle harmonic drift
        const targetHomeX = p.homeX + Math.cos(p.driftAngle + time * p.driftSpeed * 60) * p.driftRadius
        const targetHomeY = p.homeY + Math.sin(p.driftAngle + time * p.driftSpeed * 60) * p.driftRadius

        // Repulsion physics from mouse
        let dist = 9999
        if (mouse.active) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          dist = Math.hypot(dx, dy)

          if (dist < REPEL_RADIUS && dist > 0.1) {
            const force = (1 - dist / REPEL_RADIUS) * REPEL_FORCE
            const angle = Math.atan2(dy, dx)
            p.vx += Math.cos(angle) * force * 2.2
            p.vy += Math.sin(angle) * force * 2.2
          }
        }

        // Spring force returning particle smoothly to idle home
        const returnDx = targetHomeX - p.x
        const returnDy = targetHomeY - p.y
        p.vx += returnDx * RETURN_SPEED
        p.vy += returnDy * RETURN_SPEED

        // Friction damping
        p.vx *= DAMPING
        p.vy *= DAMPING

        p.x += p.vx
        p.y += p.vy

        // Visual reactivity: closer to cursor = brighter & slightly larger
        let targetAlpha = p.baseAlpha
        let renderSize = p.size
        if (dist < REPEL_RADIUS) {
          const proximity = 1 - dist / REPEL_RADIUS
          targetAlpha = Math.min(0.95, p.baseAlpha + proximity * 0.65)
          renderSize = p.size * (1 + proximity * 0.75)
        }
        p.alpha += (targetAlpha - p.alpha) * 0.15

        // Draw particle (uses vibrant sky blue visible on dark and light backgrounds)
        ctx.fillStyle = `rgba(2, 132, 199, ${p.alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, renderSize, 0, Math.PI * 2)
        ctx.fill()
      }

      // 4. Subtle connection links between nearby stimulated particles
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]
        if (p1.alpha < 0.35) continue

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          if (p2.alpha < 0.35) continue

          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const d = Math.hypot(dx, dy)

          if (d < 95) {
            const linkAlpha = (1 - d / 95) * Math.min(p1.alpha, p2.alpha) * 0.65
            ctx.strokeStyle = `rgba(56, 189, 248, ${linkAlpha})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(loop)
    }

    animationFrameId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('mousemove', onPointerMove)
      document.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('mouseleave', onPointerLeave)
      document.removeEventListener('pointerenter', onPointerEnter)
      document.removeEventListener('mouseenter', onPointerEnter)
    }
  }, [])

  return <canvas ref={canvasRef} className="cursor-interaction-canvas" aria-hidden="true" />
}
