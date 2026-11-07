import { useState } from 'react'
import { Send, CheckCircle2, AlertCircle, Mail } from 'lucide-react'
import { SERVICES, handleEmailClick } from '../constants.js'

function InputField({ id, label, type = 'text', auto, full, value, onChange, error }) {
  return (
    <div className={'f' + (full ? ' full' : '')}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        autoComplete={auto}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
      />
      {error && <span className="err">{error}</span>}
    </div>
  )
}

export default function Enquiry({ topic, setTopic }) {
  const [v, setV] = useState({ name: '', company: '', email: '', phone: '', message: '', website: '' })
  const [err, setErr] = useState({})
  const [state, setState] = useState({ s: 'idle', m: '' })

  const set = k => e => {
    const val = e.target.value
    setV(prev => ({ ...prev, [k]: val }))
    if (err[k]) {
      setErr(prev => {
        const next = { ...prev }
        delete next[k]
        return next
      })
    }
  }

  const emailSubject = `Website enquiry: ${topic}`
  const emailBody = `Name: ${v.name || ''}\nCompany: ${v.company || ''}\nEmail: ${v.email || ''}\nPhone: ${v.phone || ''}\nInterest: ${topic}\n\nProject details:\n${v.message || ''}`
  const gmailUrl = `https://mail.google.com/mail/?view=cm&to=info@jtech-ai.com&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`

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
      const r = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, topic }),
      })
      const j = await r.json()
      if (!r.ok || !j.ok) throw new Error(j.error || 'Server could not deliver email.')
      setState({ s: 'ok', m: 'Enquiry sent. We will reply within one working day.' })
      setV({ name: '', company: '', email: '', phone: '', message: '', website: '' })
    } catch (x) {
      console.warn('Backend enquiry submission failed:', x.message)
      setState({
        s: 'bad',
        m: 'Could not send directly from website. Please click below to send via Gmail:',
      })
    }
  }

  return (
    <form onSubmit={submit} noValidate className="form">
      <InputField
        id="name"
        label="Full name"
        auto="name"
        value={v.name}
        onChange={set('name')}
        error={err.name}
      />
      <InputField
        id="company"
        label="Company"
        auto="organization"
        value={v.company}
        onChange={set('company')}
        error={err.company}
      />
      <InputField
        id="email"
        label="Email"
        type="email"
        auto="email"
        value={v.email}
        onChange={set('email')}
        error={err.email}
      />
      <InputField
        id="phone"
        label="Phone"
        type="tel"
        auto="tel"
        value={v.phone}
        onChange={set('phone')}
        error={err.phone}
      />
      <div className="f full">
        <label htmlFor="topic">I am interested in</label>
        <select id="topic" value={topic} onChange={e => setTopic(e.target.value)}>
          <option>Request a quotation</option>
          {SERVICES.map(s => <option key={s.topic}>{s.topic}</option>)}
          <option>Something else</option>
        </select>
      </div>
      <div className="f full">
        <label htmlFor="message">Project details</label>
        <textarea
          id="message"
          rows="5"
          value={v.message}
          onChange={set('message')}
          aria-invalid={!!err.message}
        />
        {err.message && <span className="err">{err.message}</span>}
      </div>
      <input className="hp" tabIndex="-1" autoComplete="off" aria-hidden="true" value={v.website} onChange={set('website')} />
      <div className="full form-actions" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
        <button className="btn" disabled={state.s === 'sending'}>
          {state.s === 'sending' ? 'Sending…' : <><Send size={18} /> Send enquiry</>}
        </button>
        <a
          href={gmailUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => handleEmailClick(e, emailSubject, emailBody)}
          className="send-gmail-alt"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', fontSize: '.9rem', color: 'var(--navy)', textDecoration: 'none', fontWeight: 500 }}
        >
          <Mail size={16} /> Or send directly via Gmail ↗
        </a>
      </div>

      {state.s === 'bad' && (
        <div className="full" style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '12px', marginTop: '.5rem' }}>
          <p role="status" aria-live="polite" className="status bad" style={{ color: '#b91c1c', margin: 0, display: 'flex', alignItems: 'center', gap: '.5rem', fontWeight: 600 }}>
            <AlertCircle size={18} />
            <span>Could not deliver through server. Click below to send directly via Gmail:</span>
          </p>
          <a
            className="btn sm"
            href={gmailUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => handleEmailClick(e, emailSubject, emailBody)}
            style={{ marginTop: '.75rem', display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: '#dc2626' }}
          >
            <Mail size={16} /> Open in Gmail with your details ↗
          </a>
        </div>
      )}

      {state.s === 'ok' && (
        <p role="status" aria-live="polite" className="status ok full" style={{ color: 'var(--ok)', display: 'flex', alignItems: 'center', gap: '.5rem', fontWeight: 600 }}>
          <CheckCircle2 size={18} />
          {state.m}
        </p>
      )}
    </form>
  )
}
