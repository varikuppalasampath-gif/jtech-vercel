import { motion } from 'framer-motion'
import Network from './Network.jsx'
import Gear from './Gear.jsx'

export default function PageHead({ title, text }) {
  return (
    <section className="hero phead">
      <Network />
      <Gear className="gear g1" />
      <div className="wrap hero-in">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>{title}</motion.h1>
        <motion.p className="sub" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }}>{text}</motion.p>
      </div>
    </section>
  )
}

