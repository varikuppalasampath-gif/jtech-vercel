import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { LayoutPanelLeft } from 'lucide-react'
import PageHead from '../components/PageHead.jsx'
import { rise } from '../constants.js'

export default function Projects() {
  return (
    <>
      <PageHead title="Projects / Gallery" text="Panels, prototypes and installations." />
      <section className="sec">
        <div className="wrap split">
          <motion.div {...rise}>
            <h2>Our project gallery is being prepared</h2>
            <p className="lead">We are collecting photographs of panels, prototypes and installations from real Jtech projects, so everything shown here will be genuine work.</p>
          </motion.div>
          <motion.div className="card" {...rise}>
            <span className="ico"><LayoutPanelLeft size={26} /></span>
            <h3>Want to see relevant work?</h3>
            <p>Tell us your application and we will share examples of similar work directly.</p>
            <Link className="btn sm" to="/contact" style={{ alignSelf: 'flex-start' }}>Contact Us</Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}

