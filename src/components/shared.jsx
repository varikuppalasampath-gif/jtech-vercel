import { motion } from 'framer-motion'
import { Mail, Phone, MapPin } from 'lucide-react'
import { STEPS, AUDIENCE, PHONE, rise } from '../constants.js'
import Enquiry from './Enquiry.jsx'

export function Approach() {
  return (
    <section className="sec dark">
      <div className="wrap split">
        <motion.div {...rise}>
          <h2>From first call to working system</h2>
          <p className="lead">A short, clear process so you always know what happens next.</p>
        </motion.div>
        <ol className="steps">
          {STEPS.map(([t, d], i) => (
            <motion.li key={t} {...rise} transition={{ duration: .5, delay: i * .1 }}>
              <div><h3>{t}</h3><p>{d}</p></div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function Audience({ title = 'Built for the people who run plants', items = AUDIENCE }) {
  return (
    <section className="sec">
      <div className="wrap">
        <motion.h2 {...rise}>{title}</motion.h2>
        <div className="aud">
          {items.map(([t, d]) => (
            <motion.div key={t} className="aud-i" {...rise}>
              <b>{t}</b><span>{d}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function About() {
  return (
    <section className="sec alt">
      <div className="wrap split">
        <motion.h2 {...rise}>An engineering partner, not just a supplier</motion.h2>
        <motion.div {...rise}>
          <p className="lead first">Jtech Mechatronics and AI Solutions Pvt. Ltd. is led by Managing Director Pejjai Janardhan Reddy and based in Hyderabad. We combine electronics, control engineering and software so one team can take a product or plant system from idea to commissioning.</p>
          <p className="lead">Every project starts with a conversation about your actual requirement.</p>
        </motion.div>
      </div>
    </section>
  )
}

export function ContactSection({ topic, setTopic }) {
  return (
    <section className="sec contact">
      <div className="wrap">
        <motion.div {...rise}>
          <h2>Tell us what you need</h2>
          <p className="lead">Send a quotation request or technical enquiry. We reply by email or phone.</p>
        </motion.div>
        <div className="cgrid">
          <div className="cinfo">
            <a href="mailto:info@jtech-ai.com"><Mail /><span><small>Email</small>info@jtech-ai.com</span></a>
            <a href={`tel:${PHONE}`}><Phone /><span><small>Phone</small>+91 77806 46425</span></a>
            <div><MapPin /><span><small>Registered address</small>Plot No. 292, Srinivasa Nagar,<br />Rampally, Hyderabad – 501 301</span></div>
          </div>
          <Enquiry topic={topic} setTopic={setTopic} />
        </div>
      </div>
    </section>
  )
}

