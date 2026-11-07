import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { BrowserRouter, Routes, Route, NavLink, Link, useLocation } from 'react-router-dom'
import { Workflow, LayoutPanelLeft, Cpu, Wifi, Gauge, ScanSearch, CircuitBoard, Phone, Mail, MapPin, ArrowRight, Menu, X, MessageCircle, Send, CheckCircle2, AlertCircle } from 'lucide-react'

const PHONE = '+917780646425'
const SERVICES = [
  { icon: Workflow, title: 'PLC / SCADA & Robotic Solutions', text: 'Industrial control, operator interfaces, supervisory monitoring and robotic integration.', topic: 'PLC / SCADA & Robotics' },
  { icon: LayoutPanelLeft, title: 'Industrial Automation & Electrical Panels', text: 'Automation engineering, control systems, and electrical panel design and build.', topic: 'Automation & Electrical Panels' },
  { icon: Cpu, title: 'AI Applications & Embedded Systems', text: 'Custom embedded hardware and software, and AI-enabled applications for monitoring, automation and intelligent devices.', topic: 'AI & Embedded Systems' },
  { icon: Wifi, title: 'Remote IoT Solutions', text: 'Connected sensors, gateways, remote monitoring, alerts and dashboards.', topic: 'Remote IoT' },
  { icon: Gauge, title: 'Explosives Instrumentation', text: 'Instrumentation solutions for explosives-related industrial applications. Contact us to discuss scope.', topic: 'Explosives Instrumentation' },
  { icon: ScanSearch, title: 'NDT & Process Applications', text: 'Non-destructive testing solutions and industrial process applications.', topic: 'NDT & Process' },
  { icon: CircuitBoard, title: 'VFD & PLC PCB Chip-Level Services', text: 'Inspection, troubleshooting, repair and maintenance of VFD and PLC electronic boards.', topic: 'VFD / PLC Board Repair' },
]
const STEPS = [
  ['Discuss', 'Tell us the problem. We ask about the process, the site and your constraints.'],
  ['Design', 'We propose the architecture, hardware and scope, with a written quotation.'],
  ['Build and test', 'Panels, boards and software are built and tested before they reach your site.'],
  ['Commission and support', 'We install, hand over and stay available for service and troubleshooting.'],
]
const AUDIENCE = [
  ['Plant and factory managers', 'Automation, monitoring and process improvement.'],
  ['Electrical and instrumentation engineers', 'PLC, SCADA, VFD, panels and instruments.'],
  ['Procurement teams', 'Clear specifications and written quotations.'],
  ['OEMs and system integrators', 'Embedded design, PCB, IoT and integration.'],
  ['Maintenance teams', 'Troubleshooting, repair and support.'],
  ['Business owners and consultants', 'Capability and project discussions.'],
]
const TAGS = ['PLC', 'SCADA', 'VFD', 'HMI', 'Embedded AI', 'IoT', 'Robotics', 'NDT', 'Instrumentation', 'Electrical panels', 'PCB repair']

function Network() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current, x = c.getContext('2d')
    const rm = matchMedia('(prefers-reduced-motion: reduce)').matches
    let w, h, nodes, raf
    const fit = () => {
      const d = devicePixelRatio || 1
      w = c.offsetWidth; h = c.offsetHeight; c.width = w * d; c.height = h * d; x.setTransform(d, 0, 0, d, 0, 0)
      const n = Math.min(70, Math.floor((w * h) / 16000))
      nodes = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 }))
    }
    const draw = () => {
      x.clearRect(0, 0, w, h)
      for (const a of nodes) {
        if (!rm) { a.x += a.vx; a.y += a.vy; if (a.x < 0 || a.x > w) a.vx *= -1; if (a.y < 0 || a.y > h) a.vy *= -1 }
        for (const b of nodes) {
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 140) { x.strokeStyle = `rgba(56,189,248,${(1 - d / 140) * .35})`; x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke() }
        }
        x.fillStyle = 'rgba(125,211,252,.9)'; x.beginPath(); x.arc(a.x, a.y, 2, 0, 7); x.fill()
      }
      if (!rm) raf = requestAnimationFrame(draw)
    }
    fit(); draw(); addEventListener('resize', fit)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', fit) }
  }, [])
  return <canvas ref={ref} className="net" aria-hidden="true" />
}

function Gear({ r = 150, teeth = 14, className }) {
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

const rise = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: .55 } }

function Enquiry({ topic, setTopic }) {
  const [v, setV] = useState({ name: '', company: '', email: '', phone: '', message: '', website: '' })
  const [err, setErr] = useState({})
  const [state, setState] = useState({ s: 'idle', m: '' })
  const set = k => e => setV({ ...v, [k]: e.target.value })
  async function submit(e) {
    e.preventDefault()
    const er = {}
    if (v.name.trim().length < 2) er.name = 'Enter your name.'
    if (!/^\S+@\S+\.\S+$/.test(v.email)) er.email = 'Enter a valid email address.'
    if (v.message.trim().length < 10) er.message = 'Describe your requirement in at least 10 characters.'
    setErr(er)
    if (Object.keys(er).length) return
    setState({ s: 'sending', m: '' })
    try {
      const r = await fetch('/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...v, topic }) })
      const j = await r.json()
      if (!r.ok || !j.ok) throw new Error(j.error)
      setState({ s: 'ok', m: 'Enquiry sent. We will reply within one working day.' })
      setV({ name: '', company: '', email: '', phone: '', message: '', website: '' })
    } catch (x) {
      setState({ s: 'bad', m: x.message || 'Could not send. Please email info@jtech-ai.com or call +91 77806 46425.' })
    }
  }
  const F = ({ k, label, type = 'text', auto, full }) => (
    <div className={'f' + (full ? ' full' : '')}>
      <label htmlFor={k}>{label}</label>
      <input id={k} type={type} autoComplete={auto} value={v[k]} onChange={set(k)} aria-invalid={!!err[k]} />
      {err[k] && <span className="err">{err[k]}</span>}
    </div>
  )
  return (
    <form onSubmit={submit} noValidate className="form">
      <F k="name" label="Full name" auto="name" />
      <F k="company" label="Company" auto="organization" />
      <F k="email" label="Email" type="email" auto="email" />
      <F k="phone" label="Phone" type="tel" auto="tel" />
      <div className="f full"><label htmlFor="topic">I am interested in</label>
        <select id="topic" value={topic} onChange={e => setTopic(e.target.value)}>
          <option>Request a quotation</option>{SERVICES.map(s => <option key={s.topic}>{s.topic}</option>)}<option>Something else</option>
        </select></div>
      <div className="f full"><label htmlFor="message">Project details</label>
        <textarea id="message" rows="5" value={v.message} onChange={set('message')} aria-invalid={!!err.message} />
        {err.message && <span className="err">{err.message}</span>}</div>
      <input className="hp" tabIndex="-1" autoComplete="off" aria-hidden="true" value={v.website} onChange={set('website')} />
      <div className="full"><button className="btn" disabled={state.s === 'sending'}>{state.s === 'sending' ? 'Sending…' : <>Send enquiry <Send size={18} /></>}</button></div>
      <p role="status" aria-live="polite" className={'status ' + state.s}>{state.s === 'ok' && <CheckCircle2 size={18} />}{state.s === 'bad' && <AlertCircle size={18} />}{state.m}</p>
    </form>
  )
}


const PRODUCTS = [
  { icon: LayoutPanelLeft, title: 'Electrical & control panels', text: 'Custom-built control panels for machines, process lines and plant automation.', topic: 'Automation & Electrical Panels' },
  { icon: Workflow, title: 'PLC / SCADA control systems', text: 'Control and supervisory systems with operator interfaces for your process.', topic: 'PLC / SCADA & Robotics' },
  { icon: Cpu, title: 'Embedded AI devices', text: 'Purpose-built embedded hardware and software for monitoring and intelligent control.', topic: 'AI & Embedded Systems' },
  { icon: Wifi, title: 'IoT sensor nodes & gateways', text: 'Connected devices for remote monitoring, alerts and dashboards.', topic: 'Remote IoT' },
  { icon: Gauge, title: 'Instrumentation systems', text: 'Instrumentation for industrial applications, including explosives-related use.', topic: 'Explosives Instrumentation' },
]
const SERVICE_LIST = [
  { icon: Workflow, title: 'Automation engineering', text: 'Control system design, PLC / SCADA integration and robotic solutions.', topic: 'PLC / SCADA & Robotics' },
  { icon: Cpu, title: 'Product design & development', text: 'From concept to working prototype: electronics, firmware, AI and software.', topic: 'AI & Embedded Systems' },
  { icon: Wifi, title: 'Remote monitoring & IoT', text: 'Sensors, gateways, alerts and dashboards for unattended assets.', topic: 'Remote IoT' },
  { icon: ScanSearch, title: 'NDT & process applications', text: 'Non-destructive testing solutions and industrial process applications.', topic: 'NDT & Process' },
  { icon: CircuitBoard, title: 'VFD & PLC board repair', text: 'Chip-level inspection, troubleshooting, repair and maintenance.', topic: 'VFD / PLC Board Repair' },
  { icon: LayoutPanelLeft, title: 'Support & troubleshooting', text: 'Help for maintenance teams when a line or panel stops.', topic: 'Request a quotation' },
]
const INDUSTRIES = [
  ['Manufacturing plants', 'Automation, monitoring and process improvement for factories.'],
  ['Process industries', 'Control systems, instrumentation and process applications.'],
  ['Explosives-related industry', 'Instrumentation solutions for specialised applications.'],
  ['Inspection and testing', 'NDT solutions and related process applications.'],
  ['OEMs and system integrators', 'Embedded design, PCB, IoT and integration.'],
  ['Remote and unattended sites', 'Connected sensors and alerts for assets you cannot visit daily.'],
]
const ROLES = ['Automation, PLC and SCADA engineers', 'Embedded and firmware engineers', 'IoT and AI application developers', 'Electronics repair technicians']
const TITLES = { '/': 'Jtech Mechatronics and AI Solutions | Automation, Embedded AI, IoT – Hyderabad', '/about': 'About Us | Jtech', '/products': 'Products | Jtech', '/services': 'Services | Jtech', '/industries': 'Industries | Jtech', '/projects': 'Projects / Gallery | Jtech', '/careers': 'Careers | Jtech', '/contact': 'Contact Us | Jtech' }
const NAV = [['/', 'Home'], ['/about', 'About Us'], ['/products', 'Products'], ['/services', 'Services'], ['/industries', 'Industries'], ['/projects', 'Projects / Gallery'], ['/careers', 'Careers']]

function PageHead({ title, text }) {
  return (
    <section className="hero phead"><Network /><Gear className="gear g1" />
      <div className="wrap hero-in">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>{title}</motion.h1>
        <motion.p className="sub" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }}>{text}</motion.p>
      </div>
    </section>
  )
}
const CardGrid = ({ items, setTopic, cta = 'Enquire' }) => (
  <div className="grid">
    {items.map((s, i) => (
      <motion.div key={s.title} {...rise} transition={{ duration: .5, delay: (i % 3) * .08 }}>
        <Link to="/contact" className="card" onClick={() => setTopic(s.topic)}>
          <span className="ico"><s.icon size={26} /></span><h3>{s.title}</h3><p>{s.text}</p>
          <span className="more">{cta} <ArrowRight size={16} /></span>
        </Link>
      </motion.div>
    ))}
  </div>
)
const Approach = () => (
  <section className="sec dark"><div className="wrap split">
    <motion.div {...rise}><h2>From first call to working system</h2><p className="lead">A short, clear process so you always know what happens next.</p></motion.div>
    <ol className="steps">{STEPS.map(([t, d], i) => <motion.li key={t} {...rise} transition={{ duration: .5, delay: i * .1 }}><div><h3>{t}</h3><p>{d}</p></div></motion.li>)}</ol>
  </div></section>
)
const Audience = ({ title = 'Built for the people who run plants', items = AUDIENCE }) => (
  <section className="sec"><div className="wrap">
    <motion.h2 {...rise}>{title}</motion.h2>
    <div className="aud">{items.map(([t, d]) => <motion.div key={t} className="aud-i" {...rise}><b>{t}</b><span>{d}</span></motion.div>)}</div>
  </div></section>
)
const About = () => (
  <section className="sec alt"><div className="wrap split">
    <motion.h2 {...rise}>An engineering partner, not just a supplier</motion.h2>
    <motion.div {...rise}><p className="lead first">Jtech Mechatronics and AI Solutions Pvt. Ltd. is led by Managing Director Pejjai Janardhan Reddy and based in Hyderabad. We combine electronics, control engineering and software so one team can take a product or plant system from idea to commissioning.</p>
      <p className="lead">Every project starts with a conversation about your actual requirement.</p></motion.div>
  </div></section>
)
const ContactSection = ({ topic, setTopic }) => (
  <section className="sec contact"><div className="wrap">
    <motion.div {...rise}><h2>Tell us what you need</h2><p className="lead">Send a quotation request or technical enquiry. We reply by email or phone.</p></motion.div>
    <div className="cgrid">
      <div className="cinfo">
        <a href="mailto:info@jtech-ai.com"><Mail /><span><small>Email</small>info@jtech-ai.com</span></a>
        <a href={`tel:${PHONE}`}><Phone /><span><small>Phone</small>+91 77806 46425</span></a>
        <div><MapPin /><span><small>Registered address</small>Plot No. 292, Srinivasa Nagar,<br />Rampally, Hyderabad – 501 301</span></div>
      </div>
      <Enquiry topic={topic} setTopic={setTopic} />
    </div>
  </div></section>
)

function Home({ setTopic, topic }) {
  return (
    <>
      <section className="hero" id="top">
        <Network /><Gear className="gear g1" /><Gear className="gear g2" r={120} teeth={11} />
        <div className="wrap hero-in">
          <motion.p className="pill" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>Product design & development · Hyderabad</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1, duration: .6 }}>Intelligent machines.<br />Connected plants.<br /><span className="grad">Engineered by Jtech.</span></motion.h1>
          <motion.p className="sub" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25, duration: .6 }}>We design and build automation, embedded AI, remote monitoring and instrumentation systems for factories, OEMs and system integrators.</motion.p>
          <motion.div className="cta" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .4, duration: .6 }}>
            <Link className="btn" to="/contact">Discuss your project <ArrowRight size={18} /></Link>
            <Link className="btn ghost" to="/services">Explore solutions</Link>
          </motion.div>
        </div>
        <div className="marquee" aria-hidden="true"><div>{[...TAGS, ...TAGS].map((t, i) => <span key={i}>{t}</span>)}</div></div>
      </section>
      <section className="sec"><div className="wrap">
        <motion.div {...rise}><h2>Seven areas of engineering under one roof</h2><p className="lead">From a single repaired drive board to a complete monitored plant, we cover hardware, firmware and software.</p></motion.div>
        <CardGrid items={SERVICES} setTopic={setTopic} />
      </div></section>
      <Approach /><Audience /><About /><ContactSection topic={topic} setTopic={setTopic} />
    </>
  )
}

const Projects = () => (
  <section className="sec"><div className="wrap split">
    <motion.div {...rise}><h2>Our project gallery is being prepared</h2><p className="lead">We are collecting photographs of panels, prototypes and installations from real Jtech projects, so everything shown here will be genuine work.</p></motion.div>
    <motion.div className="card" {...rise}><span className="ico"><LayoutPanelLeft size={26} /></span><h3>Want to see relevant work?</h3><p>Tell us your application and we will share examples of similar work directly.</p><Link className="btn sm" to="/contact" style={{ alignSelf: 'flex-start' }}>Contact Us</Link></motion.div>
  </div></section>
)
const Careers = () => (
  <section className="sec"><div className="wrap split">
    <motion.div {...rise}><h2>Build industrial technology with us</h2><p className="lead">We welcome applications from engineers and technicians who like solving real plant problems.</p></motion.div>
    <motion.div {...rise}>
      <div className="aud" style={{ marginTop: 0 }}>{ROLES.map(r => <div key={r} className="aud-i"><b>{r}</b></div>)}</div>
      <p className="lead">Send your CV and a short note about your experience.</p>
      <a className="btn sm" style={{ marginTop: '1.25rem' }} href="mailto:info@jtech-ai.com?subject=Career%20application"><Mail size={18} /> info@jtech-ai.com</a>
    </motion.div>
  </div></section>
)

function Shell() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [topic, setTopic] = useState('Request a quotation')
  const { pathname } = useLocation()
  useEffect(() => { setOpen(false); scrollTo(0, 0); document.title = TITLES[pathname] || TITLES['/'] }, [pathname])
  useEffect(() => { const f = () => setScrolled(scrollY > 20); f(); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f) }, [])
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className={scrolled ? 'hdr on' : 'hdr'}>
        <div className="wrap nav">
          <Link to="/" className="brand" aria-label="Jtech home"><img src="/logo.png" alt="Jtech Mechatronics and AI Solutions" width="280" height="62" /></Link>
          <button className="burger" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
          <nav className={open ? 'open' : ''}>
            {NAV.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}
            <NavLink to="/contact" className="btn sm">Contact Us</NavLink>
          </nav>
        </div>
      </header>
      <main id="main">
        <Routes>
          <Route path="/" element={<Home topic={topic} setTopic={setTopic} />} />
          <Route path="/about" element={<><PageHead title="About Us" text="An engineering team combining electronics, control and software." /><About /><Approach /><Audience /></>} />
          <Route path="/products" element={<><PageHead title="Products" text="Control, monitoring and embedded hardware designed and built by Jtech." /><section className="sec"><div className="wrap"><CardGrid items={PRODUCTS} setTopic={setTopic} cta="Request specifications" /><p className="lead">Models and detailed specifications are shared on request.</p></div></section></>} />
          <Route path="/services" element={<><PageHead title="Services" text="Engineering, integration, repair and support, from one team." /><section className="sec"><div className="wrap"><CardGrid items={SERVICE_LIST} setTopic={setTopic} /></div></section><Approach /></>} />
          <Route path="/industries" element={<><PageHead title="Industries" text="Where Jtech systems are applied." /><Audience title="Industries we work with" items={INDUSTRIES} /><Audience title="People we work with" /></>} />
          <Route path="/projects" element={<><PageHead title="Projects / Gallery" text="Panels, prototypes and installations." /><Projects /></>} />
          <Route path="/careers" element={<><PageHead title="Careers" text="Join a team that builds machines, panels and intelligent devices." /><Careers /></>} />
          <Route path="/contact" element={<><PageHead title="Contact Us" text="Request a quotation, a consultation or a technical discussion." /><ContactSection topic={topic} setTopic={setTopic} /></>} />
          <Route path="*" element={<><PageHead title="Page not found" text="That page does not exist." /><section className="sec"><div className="wrap"><Link className="btn sm" to="/">Back to Home</Link></div></section></>} />
        </Routes>
      </main>
      <footer><div className="wrap foot"><img src="/logo.png" alt="Jtech" width="200" height="45" /><span>© {new Date().getFullYear()} Jtech Mechatronics and AI Solutions Pvt. Ltd. All rights reserved.</span></div></footer>
      <a className="wa" href={`https://wa.me/${PHONE.slice(1)}?text=Hello%20Jtech%2C%20I%20would%20like%20to%20discuss%20a%20project.`} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"><MessageCircle size={26} /></a>
    </>
  )
}
export default function App() { return <BrowserRouter><Shell /></BrowserRouter> }
