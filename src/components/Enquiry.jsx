import { useState } from 'react'
import { Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { SERVICES } from '../constants.js'

export default function Enquiry({ topic, setTopic }) {
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
        <textarea id="message" rows="5" value={v.message} onChange={set('message')} aria-invalid={!!err.message} />
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

