import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dist = path.join(__dirname, '..', 'dist')
const app = express()
app.set('trust proxy', 1)
app.use(helmet({
  contentSecurityPolicy: { directives: {
    defaultSrc: ["'self'"], scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    imgSrc: ["'self'", 'data:'], connectSrc: ["'self'"],
  } },
}))
app.use(express.json({ limit: '20kb' }))

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  company: z.string().trim().max(120).optional().default(''),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(30).optional().default(''),
  topic: z.string().trim().max(80).optional().default('General'),
  message: z.string().trim().min(10).max(3000),
  website: z.string().optional(), // honeypot
})

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many enquiries. Please try again later.' },
})

const {
  SMTP_HOST = 'smtp.hostinger.com',
  SMTP_PORT = 465,
  SMTP_USER = 'info@jtech-ai.com',
  SMTP_PASS = 'Jtech@1981',
  MAIL_TO = 'info@jtech-ai.com',
} = process.env

const mailer = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT) || 465,
  secure: Number(SMTP_PORT || 465) === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))

const visitorsFile = path.join(__dirname, 'visitors.json')
let visitorData = { total_visitors: 125, today_visitors: 12, today_date: new Date().toISOString().slice(0, 10), unique_ids: [] }
try {
  if (fs.existsSync(visitorsFile)) {
    visitorData = JSON.parse(fs.readFileSync(visitorsFile, 'utf8'))
  }
} catch (_) {}

app.all('/api/visitors', (req, res) => {
  const today = new Date().toISOString().slice(0, 10)
  if (visitorData.today_date !== today) {
    visitorData.today_date = today
    visitorData.today_visitors = 0
    visitorData.unique_ids = []
  }
  const vid = (req.body && req.body.visitor_id) || req.query.visitor_id
  if (req.method === 'POST' && vid) {
    if (!visitorData.unique_ids.includes(vid)) {
      visitorData.unique_ids.push(vid)
      visitorData.total_visitors = (visitorData.total_visitors || 0) + 1
      visitorData.today_visitors = (visitorData.today_visitors || 0) + 1
      try {
        fs.writeFileSync(visitorsFile, JSON.stringify(visitorData))
      } catch (_) {}
    }
  }
  res.json({
    ok: true,
    total_visitors: visitorData.total_visitors,
    today_visitors: visitorData.today_visitors,
    total_views: (visitorData.total_visitors || 1) * 3,
  })
})

app.post('/api/enquiry', limiter, async (req, res) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ ok: false, error: 'Please check the form fields.' })
  const d = parsed.data
  if (d.website) return res.json({ ok: true }) // bot: pretend success
  const text = `Name: ${d.name}\nCompany: ${d.company}\nEmail: ${d.email}\nPhone: ${d.phone}\nInterest: ${d.topic}\n\n${d.message}\n`

  try {
    await mailer.sendMail({
      from: `"Jtech Website Enquiry" <${SMTP_USER}>`,
      to: MAIL_TO,
      replyTo: `"${d.name.replace(/"/g, '')}" <${d.email}>`,
      subject: `Website enquiry: ${d.topic}`,
      text,
    })
    // also save backup to disk
    try {
      fs.appendFileSync(path.join(__dirname, 'enquiries.jsonl'), JSON.stringify({ at: new Date().toISOString(), ...d }) + '\n')
    } catch (_) {}

    res.json({ ok: true })
  } catch (e) {
    console.error('Enquiry failed:', e.message)
    // fallback save to disk if mail fails
    try {
      fs.appendFileSync(path.join(__dirname, 'enquiries.jsonl'), JSON.stringify({ at: new Date().toISOString(), ...d, error: e.message }) + '\n')
    } catch (_) {}
    res.status(500).json({ ok: false, error: 'Could not send. Please email info@jtech-ai.com.' })
  }
})

if (fs.existsSync(dist)) {
  app.use(express.static(dist, { maxAge: '7d', index: false }))
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Jtech site running on http://localhost:${port}`))
