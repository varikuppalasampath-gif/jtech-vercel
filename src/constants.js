import { Workflow, LayoutPanelLeft, Cpu, Wifi, Gauge, ScanSearch, CircuitBoard } from 'lucide-react'

export const PHONE = '+917780646425'

export const SERVICES = [
  { icon: Workflow,       title: 'PLC / SCADA & Robotic Solutions',              text: 'Industrial control, operator interfaces, supervisory monitoring and robotic integration.',                                          topic: 'PLC / SCADA & Robotics' },
  { icon: LayoutPanelLeft,title: 'Industrial Automation & Electrical Panels',    text: 'Automation engineering, control systems, and electrical panel design and build.',                                                   topic: 'Automation & Electrical Panels' },
  { icon: Cpu,            title: 'AI Applications & Embedded Systems',           text: 'Custom embedded hardware and software, and AI-enabled applications for monitoring, automation and intelligent devices.',            topic: 'AI & Embedded Systems' },
  { icon: Wifi,           title: 'Remote IoT Solutions',                         text: 'Connected sensors, gateways, remote monitoring, alerts and dashboards.',                                                            topic: 'Remote IoT' },
  { icon: Gauge,          title: 'Explosives Instrumentation',                   text: 'Instrumentation solutions for explosives-related industrial applications. Contact us to discuss scope.',                            topic: 'Explosives Instrumentation' },
  { icon: ScanSearch,     title: 'NDT & Process Applications',                   text: 'Non-destructive testing solutions and industrial process applications.',                                                            topic: 'NDT & Process' },
  { icon: CircuitBoard,   title: 'VFD & PLC PCB Chip-Level Services',            text: 'Inspection, troubleshooting, repair and maintenance of VFD and PLC electronic boards.',                                           topic: 'VFD / PLC Board Repair' },
]

export const STEPS = [
  ['Discuss',              'Tell us the problem. We ask about the process, the site and your constraints.'],
  ['Design',               'We propose the architecture, hardware and scope, with a written quotation.'],
  ['Build and test',       'Panels, boards and software are built and tested before they reach your site.'],
  ['Commission and support','We install, hand over and stay available for service and troubleshooting.'],
]

export const AUDIENCE = [
  ['Plant and factory managers',              'Automation, monitoring and process improvement.'],
  ['Electrical and instrumentation engineers','PLC, SCADA, VFD, panels and instruments.'],
  ['Procurement teams',                       'Clear specifications and written quotations.'],
  ['OEMs and system integrators',             'Embedded design, PCB, IoT and integration.'],
  ['Maintenance teams',                       'Troubleshooting, repair and support.'],
  ['Business owners and consultants',         'Capability and project discussions.'],
]

export const TAGS = ['PLC', 'SCADA', 'VFD', 'HMI', 'Embedded AI', 'IoT', 'Robotics', 'NDT', 'Instrumentation', 'Electrical panels', 'PCB repair']

// Products page — includes Explosives Instrumentation as its own card
export const PRODUCTS = [
  { icon: LayoutPanelLeft, title: 'Electrical & control panels',   text: 'Custom-built control panels for machines, process lines and plant automation.',                              topic: 'Automation & Electrical Panels' },
  { icon: Workflow,        title: 'PLC / SCADA control systems',   text: 'Control and supervisory systems with operator interfaces for your process.',                                 topic: 'PLC / SCADA & Robotics' },
  { icon: Cpu,             title: 'Embedded AI devices',           text: 'Purpose-built embedded hardware and software for monitoring and intelligent control.',                        topic: 'AI & Embedded Systems' },
  { icon: Wifi,            title: 'IoT sensor nodes & gateways',   text: 'Connected devices for remote monitoring, alerts and dashboards.',                                            topic: 'Remote IoT' },
  { icon: Gauge,           title: 'Explosives Instrumentation',    text: 'Specialised instrumentation systems designed for explosives-related industrial applications.',               topic: 'Explosives Instrumentation' },
  { icon: ScanSearch,      title: 'NDT & process instruments',     text: 'Instruments and systems for non-destructive testing and industrial process applications.',                   topic: 'NDT & Process' },
]

export const SERVICE_LIST = [
  { icon: Workflow,        title: 'Automation engineering',        text: 'Control system design, PLC / SCADA integration and robotic solutions.',                topic: 'PLC / SCADA & Robotics' },
  { icon: Cpu,             title: 'Product design & development',  text: 'From concept to working prototype: electronics, firmware, AI and software.',           topic: 'AI & Embedded Systems' },
  { icon: Wifi,            title: 'Remote monitoring & IoT',       text: 'Sensors, gateways, alerts and dashboards for unattended assets.',                      topic: 'Remote IoT' },
  { icon: ScanSearch,      title: 'NDT & process applications',    text: 'Non-destructive testing solutions and industrial process applications.',                topic: 'NDT & Process' },
  { icon: CircuitBoard,    title: 'VFD & PLC board repair',        text: 'Chip-level inspection, troubleshooting, repair and maintenance.',                      topic: 'VFD / PLC Board Repair' },
  { icon: LayoutPanelLeft, title: 'Support & troubleshooting',     text: 'Help for maintenance teams when a line or panel stops.',                               topic: 'Request a quotation' },
]

export const INDUSTRIES = [
  ['Manufacturing plants',          'Automation, monitoring and process improvement for factories.'],
  ['Process industries',            'Control systems, instrumentation and process applications.'],
  ['Explosives-related industry',   'Instrumentation solutions for specialised applications.'],
  ['Inspection and testing',        'NDT solutions and related process applications.'],
  ['OEMs and system integrators',   'Embedded design, PCB, IoT and integration.'],
  ['Remote and unattended sites',   'Connected sensors and alerts for assets you cannot visit daily.'],
]

export const ROLES = [
  'Automation, PLC and SCADA engineers',
  'Embedded and firmware engineers',
  'IoT and AI application developers',
  'Electronics repair technicians',
]

export const PAGE_METADATA = {
  '/': {
    title: 'Jtech Mechatronics & AI Solutions Pvt. Ltd.',
    description: 'Jtech Mechatronics and AI Solutions Pvt. Ltd. delivers innovative artificial intelligence, software development, mechatronics, automation and digital technology solutions.',
    canonical: 'https://www.jtech-ai.com/',
  },
  '/about': {
    title: 'About Us – Jtech Mechatronics | Jtech Mechatronics & AI Solutions',
    description: 'Learn about Jtech Mechatronics and AI Solutions Pvt. Ltd., our mission, technology expertise and commitment to innovation.',
    canonical: 'https://www.jtech-ai.com/about',
  },
  '/products': {
    title: 'Our Products – Jtech AI Solutions | Jtech Mechatronics & AI Solutions',
    description: 'Control panels, PLC/SCADA systems, embedded AI devices, remote IoT nodes and instrumentation engineered by Jtech.',
    canonical: 'https://www.jtech-ai.com/products',
  },
  '/services': {
    title: 'AI & Software Development Services | Jtech Mechatronics & AI Solutions',
    description: 'Automation engineering, product design, IoT monitoring, NDT solutions and VFD/PLC PCB repair services from Jtech.',
    canonical: 'https://www.jtech-ai.com/services',
  },
  '/industries': {
    title: 'Industries We Serve – Jtech | Jtech Mechatronics & AI Solutions',
    description: 'Manufacturing plants, process industries, explosives instrumentation, testing and OEM integration solutions.',
    canonical: 'https://www.jtech-ai.com/industries',
  },
  '/projects': {
    title: 'Our Projects – Jtech AI Solutions | Jtech Mechatronics & AI Solutions',
    description: 'Explore panels, prototypes and installations from real Jtech engineering projects.',
    canonical: 'https://www.jtech-ai.com/projects',
  },
  '/careers': {
    title: 'Careers – Join Jtech | Jtech Mechatronics & AI Solutions',
    description: 'Join our team of automation, embedded, firmware, IoT and AI developers in Hyderabad.',
    canonical: 'https://www.jtech-ai.com/careers',
  },
  '/contact': {
    title: 'Contact Jtech Mechatronics | Jtech Mechatronics & AI Solutions',
    description: 'Get in touch with Jtech for quotations, consultations, and technical inquiries.',
    canonical: 'https://www.jtech-ai.com/contact',
  },
}

export const TITLES = {
  '/':           PAGE_METADATA['/'].title,
  '/about':      PAGE_METADATA['/about'].title,
  '/products':   PAGE_METADATA['/products'].title,
  '/services':   PAGE_METADATA['/services'].title,
  '/industries': PAGE_METADATA['/industries'].title,
  '/projects':   PAGE_METADATA['/projects'].title,
  '/careers':    PAGE_METADATA['/careers'].title,
  '/contact':    PAGE_METADATA['/contact'].title,
}

export const NAV = [
  ['/',           'Home'],
  ['/about',      'About Us'],
  ['/products',   'Products'],
  ['/services',   'Services'],
  ['/industries', 'Industries'],
  ['/projects',   'Projects / Gallery'],
  ['/careers',    'Careers'],
]

/** Shared Framer Motion scroll-reveal preset */
export const rise = {
  initial:    { opacity: 0, y: 24 },
  whileInView:{ opacity: 1, y: 0 },
  viewport:   { once: true, margin: '-60px' },
  transition: { duration: 0.55 },
}

/**
 * Smart email handler:
 * - On Mobile (Android/iOS): triggers mailto: to launch the native Gmail / Mail app directly.
 * - On Desktop: lets the default href (https://mail.google.com/...) open Gmail web in a new tab.
 */
export function handleEmailClick(e, subject = 'Project Enquiry to Jtech', body = '') {
  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  if (isMobile) {
    if (e && e.preventDefault) e.preventDefault()
    const url = `mailto:info@jtech-ai.com?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`
    window.location.href = url
  }
}

