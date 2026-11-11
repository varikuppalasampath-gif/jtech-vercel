import { motion } from 'framer-motion'
import { Mail, Phone, MapPin } from 'lucide-react'
import { STEPS, AUDIENCE, PHONE, rise, handleEmailClick } from '../constants.js'
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

const MAPS_LINK = 'https://www.google.com/maps/place/JTECH+Mechatronics+and+AI+Solutions+Pvt.Ltd./@17.4602994,78.6411545,740m/data=!3m1!1e3!4m6!3m5!1s0x3bcb9dce125c586b:0xd4c48f6eddaa4a60!8m2!3d17.4602748!4d78.642963!16s%2Fg%2F11nt_dds7s?authuser=0&entry=ttu'
const MAPS_EMBED = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d951.8!2d78.642963!3d17.4602748!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9dce125c586b%3A0xd4c48f6eddaa4a60!2sJTECH%20Mechatronics%20and%20AI%20Solutions%20Pvt.Ltd.!5e0!3m2!1sen!2sin!4v1699999999999!5m2!1sen!2sin'

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
            <a
              href="https://mail.google.com/mail/?view=cm&to=info@jtech-ai.com&su=Project%20Enquiry%20to%20Jtech"
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => handleEmailClick(e, 'Project Enquiry to Jtech')}
            >
              <Mail /><span><small>Email</small>info@jtech-ai.com</span>
            </a>
            <a href={`tel:${PHONE}`}>
              <Phone /><span><small>Phone</small>+91 77806 46425</span>
            </a>
            <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer">
              <MapPin /><span><small>Registered address</small>Plot No. 292, Srinivasa Nagar,<br />Rampally, Hyderabad – 501 301</span>
            </a>

            {/* Google Map Card placed directly below registered address */}
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="map-card"
              title="Click to open JTECH in Google Maps"
              aria-label="Open JTECH Mechatronics location in Google Maps"
            >
              <iframe
                src={MAPS_EMBED}
                title="Jtech Mechatronics and AI Solutions location on Google Maps"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="map-badge">
                <MapPin size={14} /> Open in Google Maps ↗
              </div>
            </a>
          </div>
          <Enquiry topic={topic} setTopic={setTopic} />
        </div>
      </div>
    </section>
  )
}

