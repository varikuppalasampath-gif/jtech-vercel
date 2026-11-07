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

const MAPS_EMBED = 'https://maps.google.com/maps?q=17.4602748,78.642963&z=17&output=embed'
const MAPS_LINK  = 'https://www.google.com/maps/place/JTECH+Mechatronics+and+AI+Solutions+Pvt.Ltd./@17.4602748,78.642963,17z'

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
            <a href="https://mail.google.com/mail/?view=cm&to=info@jtech-ai.com" target="_blank" rel="noopener noreferrer"><Mail /><span><small>Email</small>info@jtech-ai.com</span></a>
            <a href={`tel:${PHONE}`}><Phone /><span><small>Phone</small>+91 77806 46425</span></a>
            <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer"><MapPin /><span><small>Registered address</small>Plot No. 292, Srinivasa Nagar,<br />Rampally, Hyderabad – 501 301</span></a>
          </div>
          <Enquiry topic={topic} setTopic={setTopic} />
        </div>

        {/* Google Maps embed — clicking opens the location in Google Maps */}
        <motion.div className="map-wrap" {...rise}>
          <iframe
            src={MAPS_EMBED}
            title="Jtech Mechatronics and AI Solutions — location map"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            aria-label="Map showing Jtech office location in Rampally, Hyderabad"
          />
          <a
            className="map-overlay"
            href={MAPS_LINK}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Jtech location in Google Maps"
          />
          <span className="map-badge">
            <MapPin size={14} /> Open in Google Maps ↗
          </span>
        </motion.div>
      </div>
    </section>
  )
}

