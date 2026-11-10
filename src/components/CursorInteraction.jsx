import { useEffect, useRef } from 'react'

export default function CursorInteraction() {
  const canvasRef = useRef(null)

  useEffect(() => {
    // Only activate on devices with a fine pointer (mouse/trackpad)
    if (typeof window === 'undefined') return
    const isPointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!isPointerFine || prefersReducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId
    let width = 0
    let height = 0
    let dpr = 1

    // Mouse tracking
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      prevX: -1000,
      prevY: -1000,
      speed: 0,
      active: false,
      glowAlpha: 0,
    }

    // Interactive ambient particles
    let particles = []
    // Particle trail
    let trail = []

    const REPEL_RADIUS = 130
    const REPEL_STRENGTH = 2.4
    const RETURN_SPEED = 0.045
    const FRICTION = 0.88

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
      // Calculate responsive count: ~1 particle per 20,000 sq px (approx 45 - 90 particles)
      const count = Math.min(95, Math.max(45, Math.floor((width * height) / 20000)))

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
          radius: Math.random() * 1.4 + 1.2,
          baseAlpha: Math.random() * 0.2 + 0.15,
          alpha: 0.2,
          driftAngle: Math.random() * Math.PI * 2,
          driftSpeed: Math.random() * 0.008 + 0.004,
          driftRadius: Math.random() * 14 + 6,
        })
      }
    }

    function addTrailParticle(x, y, vx, vy) {
      if (trail.length > 60) trail.shift()
      trail.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 0.9 - vx * 0.12,
        vy: (Math.random() - 0.5) * 0.9 - vy * 0.12,
        radius: Math.random() * 2.2 + 1.2,
        alpha: 0.75,
        decay: Math.random() * 0.025 + 0.02,
        color: Math.random() > 0.35 ? '56, 189, 248' : '186, 230, 253', // sky or cyan-light
      })
    }

    function onMouseMove(e) {
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

      // Spawn trail particles when moving
      if (dist > 3) {
        const count = Math.min(3, Math.floor(dist / 6) + 1)
        for (let i = 0; i < count; i++) {
          addTrailParticle(clientX, clientY, dx, dy)
        }
        mouse.prevX = clientX
        mouse.prevY = clientY
      }
    }

    function onMouseLeave() {
      mouse.active = false
    }

    function onMouseEnter(e) {
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
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)

    let time = 0

    function loop() {
      time += 0.016
      ctx.clearRect(0, 0, width, height)

      // Smooth mouse interpolation (lerp)
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.28
        mouse.y += (mouse.targetY - mouse.y) * 0.28
        mouse.glowAlpha += (1 - mouse.glowAlpha) * 0.1
      } else {
        mouse.glowAlpha += (0 - mouse.glowAlpha) * 0.06
      }

      // 1. Subtle glowing spotlight around mouse cursor
      if (mouse.glowAlpha > 0.01) {
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 160)
        grad.addColorStop(0, `rgba(56, 189, 248, ${0.12 * mouse.glowAlpha})`)
        grad.addColorStop(0.35, `rgba(56, 189, 248, ${0.05 * mouse.glowAlpha})`)
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)')

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, 160, 0, Math.PI * 2)
        ctx.fill()
      }

      // 2. Render & update particle trail
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i]
        p.x += p.vx
        p.y += p.vy
        p.alpha -= p.decay
        p.radius *= 0.97

        if (p.alpha <= 0 || p.radius <= 0.4) {
          trail.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.shadowBlur = 6
        ctx.shadowColor = `rgba(${p.color}, ${p.alpha * 0.8})`
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // 3. Update & render ambient reactive particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Natural idle floating drift
        const currentHomeX = p.homeX + Math.cos(p.driftAngle + time * p.driftSpeed * 60) * p.driftRadius
        const currentHomeY = p.homeY + Math.sin(p.driftAngle + time * p.driftSpeed * 60) * p.driftRadius

        // Repulsion physics from mouse
        let dist = 9999
        if (mouse.active) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          dist = Math.hypot(dx, dy)

          if (dist < REPEL_RADIUS && dist > 0.1) {
            const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH
            const angle = Math.atan2(dy, dx)
            p.vx += Math.cos(angle) * force * 1.8
            p.vy += Math.sin(angle) * force * 1.8
          }
        }

        // Spring force returning particle smoothly to idle home
        const returnDx = currentHomeX - p.x
        const returnDy = currentHomeY - p.y
        p.vx += returnDx * RETURN_SPEED
        p.vy += returnDy * RETURN_SPEED

        // Apply friction/damping
        p.vx *= FRICTION
        p.vy *= FRICTION

        p.x += p.vx
        p.y += p.vy

        // Visual reactivity: closer to cursor = brighter & slightly larger
        let targetAlpha = p.baseAlpha
        let renderRadius = p.radius
        if (dist < REPEL_RADIUS) {
          const proximity = 1 - dist / REPEL_RADIUS
          targetAlpha = Math.min(0.85, p.baseAlpha + proximity * 0.6)
          renderRadius = p.radius * (1 + proximity * 0.6)
        }
        p.alpha += (targetAlpha - p.alpha) * 0.12

        // Draw particle
        ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, renderRadius, 0, Math.PI * 2)
        ctx.fill()
      }

      // Subtle connection links between nearby perturbed particles
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]
        if (p1.alpha < 0.28) continue // only draw links if stimulated by cursor

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          if (p2.alpha < 0.28) continue

          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const d = Math.hypot(dx, dy)

          if (d < 90) {
            const linkAlpha = (1 - d / 90) * Math.min(p1.alpha, p2.alpha) * 0.55
            ctx.strokeStyle = `rgba(56, 189, 248, ${linkAlpha})`
            ctx.lineWidth = 0.8
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
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
    }
  }, [])

  return <canvas ref={canvasRef} className="cursor-interaction-canvas" aria-hidden="true" />
}

