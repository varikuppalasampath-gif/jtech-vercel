import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Link, useLocation } from 'react-router-dom'
import { Menu, X, MessageCircle, Users } from 'lucide-react'

import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Products from './pages/Products.jsx'
import Services from './pages/Services.jsx'
import Industries from './pages/Industries.jsx'
import Projects from './pages/Projects.jsx'
import Careers from './pages/Careers.jsx'
import Contact from './pages/Contact.jsx'
import PageHead from './components/PageHead.jsx'
import GoogleAnalytics from './components/GoogleAnalytics.jsx'
import CursorInteraction from './components/CursorInteraction.jsx'
import VisitorDashboard from './components/VisitorDashboard.jsx'

import { PHONE, NAV, PAGE_METADATA } from './constants.js'

function getOrCreateVisitorId() {
  try {
    let id = localStorage.getItem('jtech_visitor_id')
    if (!id || id.length !== 64 || !/^[a-f0-9]{64}$/i.test(id)) {
      const bytes = new Uint8Array(32)
      crypto.getRandomValues(bytes)
      id = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
      localStorage.setItem('jtech_visitor_id', id)
    }
    return id
  } catch (_) {
    return '0000000000000000000000000000000000000000000000000000000000000000'
  }
}

export function Shell() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [topic, setTopic] = useState('Request a quotation')
  const [visitorStats, setVisitorStats] = useState(() => {
    try {
      const cached = localStorage.getItem('jtech_visitor_stats')
      return cached ? JSON.parse(cached) : null
    } catch (_) {
      return null
    }
  })
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState(null)
  const [dashboardOpen, setDashboardOpen] = useState(false)
  const lastTrackedRef = useRef('')
  const { pathname } = useLocation()

  const fetchStats = async (record = false, path = pathname) => {
    setStatsLoading(true)
    setStatsError(null)
    try {
      const vid = getOrCreateVisitorId()
      const url = '/api/visitors'
      const options = record
        ? {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitor_id: vid, page_path: path }),
          }
        : { method: 'GET' }

      const res = await fetch(url, options)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data && data.ok) {
        setVisitorStats(data)
        try {
          localStorage.setItem('jtech_visitor_stats', JSON.stringify(data))
        } catch (_) { }
      } else {
        throw new Error(data?.error || 'Failed to fetch visitor statistics')
      }
    } catch (err) {
      console.warn('Visitor stats error:', err.message)
      setStatsError(err.message)
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    setOpen(false)
    scrollTo(0, 0)
    const meta = PAGE_METADATA[pathname] || PAGE_METADATA['/']
    document.title = meta.title

    // Update meta tags dynamically on client-side route navigation
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) metaDesc.setAttribute('content', meta.description)

    const canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) canonical.setAttribute('href', meta.canonical)

    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', meta.title)

    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', meta.description)

    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) ogUrl.setAttribute('content', meta.canonical)

    // Deduplicate tracking calls (prevents double counting in React Strict Mode)
    if (lastTrackedRef.current !== pathname) {
      lastTrackedRef.current = pathname
      fetchStats(true, pathname)
    }
  }, [pathname])

  useEffect(() => {
    const f = () => setScrolled(scrollY > 20)
    f()
    addEventListener('scroll', f, { passive: true })
    return () => removeEventListener('scroll', f)
  }, [])

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <CursorInteraction />

      <header className={scrolled ? 'hdr on' : 'hdr'}>
        <div className="wrap nav">
          <Link to="/" className="brand" aria-label="Jtech home">
            <img src="/logo.png" alt="Jtech Mechatronics and AI Solutions" width="280" height="62" />
          </Link>
          <button className="burger" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
          <nav className={open ? 'open' : ''}>
            {NAV.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>
            ))}
            <NavLink to="/contact" className="btn sm">Contact Us</NavLink>
          </nav>
        </div>
      </header>

      <main id="main">
        <Routes>
          <Route path="/" element={<Home topic={topic} setTopic={setTopic} />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products setTopic={setTopic} />} />
          <Route path="/services" element={<Services setTopic={setTopic} />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact topic={topic} setTopic={setTopic} />} />
          <Route path="*" element={
            <>
              <PageHead title="Page not found" text="That page does not exist." />
              <section className="sec"><div className="wrap"><Link className="btn sm" to="/">Back to Home</Link></div></section>
            </>
          } />
        </Routes>
      </main>

      <footer>
        <div className="wrap foot">
          <img src="/logo.png" alt="Jtech" width="200" height="45" />
          <span>© {new Date().getFullYear()} Jtech Mechatronics and AI Solutions Pvt. Ltd. All rights reserved.</span>
          <button
            type="button"
            className="visitor-badge"
            onClick={() => setDashboardOpen(true)}
            title="Click to view Visitor Analytics Dashboard"
            aria-label="View Visitor Analytics Dashboard"
          >
            <span className="live-dot" aria-hidden="true" />
            <Users size={14} />
            <span>
              Visitors:{' '}
              <strong>
                {visitorStats?.total_visitors != null
                  ? visitorStats.total_visitors.toLocaleString()
                  : statsLoading
                    ? '...'
                    : '1'}
              </strong>
            </span>
          </button>
        </div>
      </footer>

      <VisitorDashboard
        isOpen={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
        stats={visitorStats}
        loading={statsLoading}
        error={statsError}
        onRefresh={() => fetchStats(false)}
      />

      <a
        className="wa"
        href={`https://wa.me/${PHONE.slice(1)}?text=Hello%20Jtech%2C%20I%20would%20like%20to%20discuss%20a%20project.`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={26} />
      </a>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <GoogleAnalytics />
      <Shell />
    </BrowserRouter>
  )
}
