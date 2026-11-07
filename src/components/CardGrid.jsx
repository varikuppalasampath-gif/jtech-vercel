import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { rise } from '../constants.js'

export default function CardGrid({ items, setTopic, cta = 'Enquire' }) {
  return (
    <div className="grid">
      {items.map((s, i) => (
        <motion.div key={s.title} {...rise} transition={{ duration: .5, delay: (i % 3) * .08 }}>
          <Link to="/contact" className="card" onClick={() => setTopic(s.topic)}>
            <span className="ico"><s.icon size={26} /></span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            <span className="more">{cta} <ArrowRight size={16} /></span>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

