import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import PageHead from '../components/PageHead.jsx'
import { ROLES, rise, handleEmailClick } from '../constants.js'

export default function Careers() {
  return (
    <>
      <PageHead title="Careers" text="Join a team that builds machines, panels and intelligent devices." />
      <section className="sec">
        <div className="wrap split">
          <motion.div {...rise}>
            <h2>Build industrial technology with us</h2>
            <p className="lead">We welcome applications from engineers and technicians who like solving real plant problems.</p>
          </motion.div>
          <motion.div {...rise}>
            <div className="aud" style={{ marginTop: 0 }}>
              {ROLES.map(r => <div key={r} className="aud-i"><b>{r}</b></div>)}
            </div>
            <p className="lead">Send your CV and a short note about your experience.</p>
            <a
              className="btn sm"
              style={{ marginTop: '1.25rem' }}
              href="https://mail.google.com/mail/?view=cm&to=info@jtech-ai.com&su=Career%20application"
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => handleEmailClick(e, 'Career application')}
            >
              <Mail size={18} /> info@jtech-ai.com
            </a>
          </motion.div>
        </div>
      </section>
    </>
  )
}
