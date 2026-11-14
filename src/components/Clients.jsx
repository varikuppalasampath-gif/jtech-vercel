import { motion } from 'framer-motion'
import { rise } from '../constants.js'

const CLIENTS = [
  {
    name: 'Premier Explosives Limited',
    shortName: 'Premier Explosives',
    logo: '/images/clients/premier-explosives.png',
    alt: 'Premier Explosives Limited corporate logo',
    url: 'https://www.pelgel.com',
  },
  {
    name: 'Salvo Industries Pvt. Ltd.',
    shortName: 'Salvo Explosives',
    subtitle: 'Formerly Salvo Explosives',
    logo: '/images/clients/salvo-explosives.png',
    alt: 'Salvo Industries / Salvo Explosives corporate logo',
    url: 'https://www.salvoindustries.com',
  },
  {
    name: 'Special Blasts Limited (SBL)',
    shortName: 'SBL',
    logo: '/images/clients/sbl.png',
    alt: 'Special Blasts Limited (SBL) corporate logo',
    url: 'https://www.specialblasts.com',
  },
  {
    name: 'HBL Power Systems Ltd',
    shortName: 'HBL',
    logo: '/images/clients/hbl.png',
    alt: 'HBL Power Systems corporate logo',
    url: 'https://www.hbl.in',
  },
  {
    name: 'Regenesis Industries Pvt. Ltd.',
    shortName: 'Regenesis Industries',
    logo: '/images/clients/regensis-industries.png',
    alt: 'Regenesis Industries corporate logo',
    url: 'http://www.regenesis.co.in',
  },
]

export default function Clients() {
  return (
    <section className="sec clients-sec" id="clients">
      <div className="wrap">
        <motion.div
          className="clients-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55 }}
        >
          <span className="clients-pill">Industrial &amp; Defence Partnerships</span>
          <h2>Our Trusted Clients</h2>
          <p className="lead">
            Building trusted partnerships through technology, engineering and innovation.
          </p>
        </motion.div>

        <div className="clients-grid">
          {CLIENTS.map((client, idx) => (
            <motion.a
              key={client.name}
              href={client.url}
              target="_blank"
              rel="noopener noreferrer"
              className="client-card"
              title={`Visit ${client.name} official website`}
              aria-label={`${client.name} official website`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
            >
              <div className="client-logo-wrapper">
                <img
                  src={client.logo}
                  alt={client.alt}
                  loading="lazy"
                  className={`client-logo client-logo-${idx + 1}`}
                />
              </div>
              <div className="client-info">
                <span className="client-name">{client.shortName}</span>
                {client.subtitle && <span className="client-sub">{client.subtitle}</span>}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
