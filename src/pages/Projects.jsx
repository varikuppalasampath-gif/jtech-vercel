import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Cpu, Workflow, LayoutPanelLeft, Wifi, Gauge, CircuitBoard } from 'lucide-react'
import PageHead from '../components/PageHead.jsx'
import { rise } from '../constants.js'

const CATEGORIES = ['All', 'Automation & Panels', 'IoT & Embedded AI', 'Instrumentation & PCB']

const PROJECTS = [
  {
    title: 'Automated Multi-Tank Chemical Batching & Recipe SCADA',
    category: 'Automation & Panels',
    icon: Workflow,
    topic: 'PLC / SCADA & Robotics',
    desc: 'Turnkey automation for chemical batch processing with automated ingredient dosing, safety level interlocks, pump sequencing, and real-time supervisory recipe control.',
    tags: ['Siemens S7-1200', 'WinCC SCADA', 'Modbus RTU', 'HMI Interface', 'Batch Automation'],
    highlight: 'Automated 4 production lines with zero manual dosing errors',
  },
  {
    title: 'Custom Motor Control Center (MCC) & Automation Panels',
    category: 'Automation & Panels',
    icon: LayoutPanelLeft,
    topic: 'Automation & Electrical Panels',
    desc: 'Design, busbar engineering, wiring, and factory acceptance testing (FAT) of IP65 heavy-duty MCC panels integrated with Schneider switchgear and VFD drive banks.',
    tags: ['Electrical Panels', 'Schneider Switchgear', 'VFD Integration', 'IP65 Enclosure', 'FAT Tested'],
    highlight: 'Certified for 24/7 continuous industrial plant uptime',
  },
  {
    title: 'Remote Industrial IoT Telemetry Gateway & Cloud Dashboard',
    category: 'IoT & Embedded AI',
    icon: Wifi,
    topic: 'Remote IoT',
    desc: 'Connected industrial telemetry gateway polling vibration, line pressure, and temperature from remote pumping stations with 4G LTE cellular uplink and automated email/SMS alerts.',
    tags: ['IoT Sensor Nodes', '4G LTE Gateway', 'MQTT Protocol', 'Cloud Dashboard', 'Remote Alerts'],
    highlight: '24/7 telemetry on unattended remote infrastructure',
  },
  {
    title: 'Edge AI Vision Defect Inspection & High-Speed Sorting',
    category: 'IoT & Embedded AI',
    icon: Cpu,
    topic: 'AI & Embedded Systems',
    desc: 'Purpose-built edge computing camera system running real-time neural network vision models to spot surface defects and dimension deviations with pneumatic rejection.',
    tags: ['Embedded AI', 'Computer Vision', 'Edge Computing', 'Pneumatic Sorting', 'Quality Inspection'],
    highlight: 'Replaced manual sorting with 99.4% defect detection accuracy',
  },
  {
    title: 'Explosives Process Telemetry & High-Speed Transient Logger',
    category: 'Instrumentation & PCB',
    icon: Gauge,
    topic: 'Explosives Instrumentation',
    desc: 'Intrinsically safe instrumentation system with sub-millisecond pressure transient recording, galvanic isolation, and remote telemetry for hazardous compound synthesis lines.',
    tags: ['Explosives Instrumentation', 'Transient Logging', 'Galvanic Isolation', 'Hazardous Area', 'Precision Sensors'],
    highlight: 'Sub-millisecond high-speed transient logging in hazardous zones',
  },
  {
    title: 'Component-Level VFD Inverter & PLC PCB Electronic Repair',
    category: 'Instrumentation & PCB',
    icon: CircuitBoard,
    topic: 'VFD / PLC Board Repair',
    desc: 'Oscilloscope diagnostics, thermal profiling, IGBT power module replacement, and gate driver trace rebuild for halted automotive and manufacturing lines.',
    tags: ['PCB Chip-Level', 'VFD Repair', 'IGBT Diagnostics', 'Gate Drivers', 'Full Load Bench Tested'],
    highlight: 'Restored halted line in 48 hours, saving 70% vs board replacement',
  },
]

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filteredProjects = activeCategory === 'All'
    ? PROJECTS
    : PROJECTS.filter(p => p.category === activeCategory)

  return (
    <>
      <PageHead
        title="Projects & Engineering Showcase"
        text="A look at our automation control systems, embedded AI devices, IoT gateways, and board repairs."
      />

      <section className="sec">
        <div className="wrap">
          {/* Category Filter Buttons */}
          <div className="proj-filters" role="tablist" aria-label="Project categories">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                className={`proj-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Project Grid */}
          <div className="grid">
            {filteredProjects.map((p, i) => (
              <motion.div
                key={p.title}
                {...rise}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
              >
                <div className="proj-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.5rem' }}>
                    <span className="proj-badge">{p.category}</span>
                    <span className="ico" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px' }}>
                      <p.icon size={18} />
                    </span>
                  </div>

                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>

                  <div className="proj-hl">
                    <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                    <span>{p.highlight}</span>
                  </div>

                  <div className="proj-tags">
                    {p.tags.map(t => (
                      <span key={t} className="proj-tag">{t}</span>
                    ))}
                  </div>

                  <Link
                    to="/contact"
                    className="more"
                    style={{ marginTop: '.5rem' }}
                  >
                    Discuss similar requirement <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom Consultation Banner */}
          <div className="card" style={{ marginTop: '3.5rem', background: 'linear-gradient(135deg, var(--mist), #fff)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--deep)' }}>Have a specific project or plant problem?</h3>
                <p style={{ marginTop: '.4rem' }}>
                  We engineer tailor-made solutions across electronics, firmware, and software. Share your constraints and requirements.
                </p>
              </div>
              <Link className="btn" to="/contact">
                Consult with our engineers <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
