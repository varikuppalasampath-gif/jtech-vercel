export default function Gear({ r = 150, teeth = 14, className }) {
  const pts = []
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2, o = [1, 1, 1.16, 1.16][i % 4]
    pts.push(`${(Math.cos(a) * r * o).toFixed(1)},${(Math.sin(a) * r * o).toFixed(1)}`)
  }
  return (
    <svg className={className} viewBox="-200 -200 400 400" aria-hidden="true">
      <polygon points={pts.join(' ')} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <circle r={r * .55} fill="none" stroke="currentColor" strokeWidth="3" />
      <circle r={r * .18} fill="currentColor" />
    </svg>
  )
}

