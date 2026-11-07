import { useState } from 'react'
import { Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { SERVICES } from '../constants.js'

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
      <div className="full">
        <button className="btn" disabled={state.s === 'sending'}>
          {state.s === 'sending' ? 'Sending…' : <><Send size={18} /> Send enquiry</>}
        </button>
      </div>
      <p role="status" aria-live="polite" className={'status ' + state.s}>
        {state.s === 'ok' && <CheckCircle2 size={18} />}
        {state.s === 'bad' && <AlertCircle size={18} />}
        {state.m}
      </p>
    </form>
  )
}
