import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Network from '../components/Network.jsx'
import Gear from '../components/Gear.jsx'
import CardGrid from '../components/CardGrid.jsx'
import { Approach, Audience, About, ContactSection } from '../components/shared.jsx'
import { SERVICES, TAGS } from '../constants.js'

export default function Home({ topic, setTopic }) {
  return (
    <>
      <section className="hero" id="top">
        <Network />
        <Gear className="gear g1" />
        <Gear className="gear g2" r={120} teeth={11} />
        <div className="wrap hero-in">
          <motion.p className="pill" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            Product design &amp; development · Hyderabad
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1, duration: .6 }}>
            Intelligent machines.<br />Connected plants.<br /><span className="grad">Engineered by Jtech.</span>
          </motion.h1>
          <motion.p className="sub" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25, duration: .6 }}>
            We design and build automation, embedded AI, remote monitoring and instrumentation systems for factories, OEMs and system integrators.
          </motion.p>
          <motion.div className="cta" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .4, duration: .6 }}>
            <Link className="btn" to="/contact">Discuss your project <ArrowRight size={18} /></Link>
            <Link className="btn ghost" to="/services">Explore solutions</Link>
          </motion.div>
        </div>
        <div className="marquee" aria-hidden="true">
          <div>{[...TAGS, ...TAGS].map((t, i) => <span key={i}>{t}</span>)}</div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: .55 }}>
            <h2>Seven areas of engineering under one roof</h2>
            <p className="lead">From a single repaired drive board to a complete monitored plant, we cover hardware, firmware and software.</p>
          </motion.div>
          <CardGrid items={SERVICES} setTopic={setTopic} />
        </div>
      </section>

      <Approach />
      <Audience />
      <About />
      <ContactSection topic={topic} setTopic={setTopic} />
    </>
  )
}

