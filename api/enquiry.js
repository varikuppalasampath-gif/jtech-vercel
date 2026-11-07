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

  // Force Hostinger if old GoDaddy host or empty
  let host = process.env.SMTP_HOST || 'smtp.hostinger.com'
  if (host.includes('secureserver') || !host) {
    host = 'smtp.hostinger.com'
  }
  const port = Number(process.env.SMTP_PORT) || 465
  const user = process.env.SMTP_USER || 'info@jtech-ai.com'
  const pass = process.env.SMTP_PASS || 'Jtech@1981'
  const mailTo = process.env.MAIL_TO || 'info@jtech-ai.com'

  const bodyText = `New Enquiry from Jtech Website\n\n` +
    `Name: ${d.name}\n` +
    `Company: ${d.company || 'Not specified'}\n` +
    `Email: ${d.email}\n` +
    `Phone: ${d.phone || 'Not specified'}\n` +
    `Topic: ${d.topic}\n\n` +
    `Project Details:\n${d.message}\n`

  try {
    const t = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    })

    await t.sendMail({
      from: `"Jtech Website" <${user}>`,
      to: mailTo,
      replyTo: `"${d.name.replace(/"/g, '')}" <${d.email}>`,
      subject: `Website enquiry: ${d.topic} - ${d.name}`,
      text: bodyText,
    })

    return res.json({ ok: true })
  } catch (e) {
    console.error('Enquiry SMTP failed:', e.message)
    return res.status(500).json({
      ok: false,
      error: 'Could not send enquiry through server.',
      detail: e.message,
    })
  }
}
