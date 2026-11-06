// Vercel serverless function: POST /api/enquiry
import nodemailer from 'nodemailer'
import { z } from 'zod'

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  company: z.string().trim().max(120).optional().default(''),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(30).optional().default(''),
  topic: z.string().trim().max(80).optional().default('General'),
  message: z.string().trim().min(10).max(3000),
  website: z.string().optional(), // honeypot
})

const hits = new Map() // best-effort limit per warm instance
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' })
  const ip = String(req.headers['x-forwarded-for'] || 'x').split(',')[0]
  const recent = (hits.get(ip) || []).filter(t => Date.now() - t < 600000)
  if (recent.length >= 5) return res.status(429).json({ ok: false, error: 'Too many enquiries. Please try again later.' })
  hits.set(ip, [...recent, Date.now()])

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ ok: false, error: 'Please check the form fields.' })
  const d = parsed.data
  if (d.website) return res.json({ ok: true })

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO = 'info@jtech-ai.com' } = process.env
  if (!SMTP_HOST || !SMTP_PASS) return res.status(500).json({ ok: false, error: 'Please email info@jtech-ai.com directly.' })
  try {
    const t = nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT) || 465, secure: Number(SMTP_PORT || 465) === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } })
    await t.sendMail({
      from: `"Jtech Website" <${SMTP_USER}>`, to: MAIL_TO,
      replyTo: `"${d.name.replace(/"/g, '')}" <${d.email}>`, subject: `Website enquiry: ${d.topic}`,
      text: `Name: ${d.name}\nCompany: ${d.company}\nEmail: ${d.email}\nPhone: ${d.phone}\nInterest: ${d.topic}\n\n${d.message}\n`,
    })
    res.json({ ok: true })
  } catch (e) {
    console.error('Enquiry failed:', e.message)
    res.status(500).json({ ok: false, error: 'Could not send. Please email info@jtech-ai.com.' })
  }
}
