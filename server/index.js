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

const limiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false,
  message: { ok: false, error: 'Too many enquiries. Please try again later.' } })

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO = 'info@jtech-ai.com' } = process.env
const mailer = SMTP_HOST && SMTP_PASS
  ? nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT) || 465, secure: Number(SMTP_PORT || 465) === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } })
  : null

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.post('/api/enquiry', limiter, async (req, res) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ ok: false, error: 'Please check the form fields.' })
  const d = parsed.data
  if (d.website) return res.json({ ok: true }) // bot: pretend success
  const text = `Name: ${d.name}\nCompany: ${d.company}\nEmail: ${d.email}\nPhone: ${d.phone}\nInterest: ${d.topic}\n\n${d.message}\n`
  try {
    if (mailer) {
      await mailer.sendMail({ from: `"Jtech Website" <${SMTP_USER}>`, to: MAIL_TO, replyTo: `"${d.name.replace(/"/g, '')}" <${d.email}>`, subject: `Website enquiry: ${d.topic}`, text })
    } else {
      fs.appendFileSync(path.join(__dirname, 'enquiries.jsonl'), JSON.stringify({ at: new Date().toISOString(), ...d }) + '\n')
    }
    res.json({ ok: true })
  } catch (e) {
    console.error('Enquiry failed:', e.message)
    res.status(500).json({ ok: false, error: 'Could not send. Please email info@jtech-ai.com.' })
  }
})

if (fs.existsSync(dist)) {
  app.use(express.static(dist, { maxAge: '7d', index: false }))
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Jtech site running on http://localhost:${port}`))
