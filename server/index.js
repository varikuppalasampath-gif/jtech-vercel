import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dist = path.join(__dirname, '..', 'dist')
const app = express()
app.set('trust proxy', 1)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"], scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com', 'https://www.google-analytics.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://www.google.com', 'https://maps.gstatic.com', 'https://maps.googleapis.com'],
      connectSrc: ["'self'", 'https://www.google-analytics.com', 'https://analytics.google.com'],
      frameSrc: ["'self'", 'https://www.google.com', 'https://maps.google.com'],
    }
  },
}))
app.use(express.json({ limit: '20kb' }))

// MySQL database connection pool (auto-configured via GoDaddy secrets or environment variables)
let db = null
if (process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER) {
  try {
    db = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    })
    console.log(`✓ Attached GoDaddy MySQL database: ${process.env.DB_NAME} on ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`)
  } catch (err) {
    console.error('MySQL pool initialization error:', err.message)
    db = null
  }
} else {
  console.log('ℹ No DB_HOST/DB_NAME detected in environment; using fallback file storage for visitor analytics.')
}

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

// Configure mailers with fast timeouts so reverse-proxy does not time out (502)
const primaryMailer = nodemailer.createTransport({
  host: SMTP_HOST,
  port: 587,
  secure: false, // Port 587 STARTTLS is the most reliable on container clouds
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 4000,
  greetingTimeout: 3000,
  socketTimeout: 5000,
})

const fallbackMailer = nodemailer.createTransport({
  host: SMTP_HOST,
  port: 465,
  secure: true,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 4000,
  greetingTimeout: 3000,
  socketTimeout: 5000,
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))

const visitorsFile = path.join(__dirname, 'visitors.json')
let visitorData = { total_visitors: 125, today_visitors: 12, today_date: new Date().toISOString().slice(0, 10), unique_ids: [] }
try {
  if (fs.existsSync(visitorsFile)) {
    visitorData = JSON.parse(fs.readFileSync(visitorsFile, 'utf8'))
  }
} catch (_) { }

app.all('/api/visitors', async (req, res) => {
  const vid = (req.body && req.body.visitor_id) || req.query.visitor_id
  const pagePath = (req.body && req.body.page_path) || req.query.page_path || '/'

  let cleanVid = vid ? String(vid).trim() : ''
  if (cleanVid) {
    if (!/^[a-f0-9]{64}$/i.test(cleanVid)) {
      cleanVid = crypto.createHash('sha256').update(cleanVid).digest('hex')
    }
  } else if (req.method === 'POST') {
    cleanVid = crypto.createHash('sha256').update((req.ip || '') + (req.headers['user-agent'] || '')).digest('hex')
  }

  // Record in GoDaddy MySQL database if connected
  if (db) {
    try {
      if (req.method === 'POST' && cleanVid) {
        await db.query(
          'INSERT INTO visitor_events (visitor_id, page_path, visited_at) VALUES (?, ?, NOW())',
          [cleanVid, pagePath.slice(0, 255)]
        )
        await db.query(
          'INSERT IGNORE INTO unique_visitors_daily (visitor_id, visit_date, first_seen_at) VALUES (?, CURDATE(), NOW())',
          [cleanVid]
        )
      }

      const [[totalRow]] = await db.query('SELECT COUNT(DISTINCT visitor_id) AS total_visitors FROM unique_visitors_daily')
      const [[todayRow]] = await db.query('SELECT COUNT(*) AS today_visitors FROM unique_visitors_daily WHERE visit_date = CURDATE()')
      const [[viewsRow]] = await db.query('SELECT COUNT(*) AS total_views FROM visitor_events')

      const total_visitors = Number(totalRow?.total_visitors || 0)
      const today_visitors = Number(todayRow?.today_visitors || 0)
      const total_views = Number(viewsRow?.total_views || 0)

      return res.json({
        ok: true,
        source: 'database',
        total_visitors: Math.max(1, total_visitors),
        today_visitors: Math.max(1, today_visitors),
        total_views: Math.max(1, total_views),
      })
    } catch (err) {
      console.error('MySQL visitor query error:', err.message)
      // fallback to file below if database query fails
    }
  }

  // Fallback: local file tracking if database is not active
  const today = new Date().toISOString().slice(0, 10)
  if (visitorData.today_date !== today) {
    visitorData.today_date = today
    visitorData.today_visitors = 0
    visitorData.unique_ids = []
  }
  if (req.method === 'POST' && cleanVid) {
    if (!visitorData.unique_ids.includes(cleanVid)) {
      visitorData.unique_ids.push(cleanVid)
      visitorData.total_visitors = (visitorData.total_visitors || 0) + 1
      visitorData.today_visitors = (visitorData.today_visitors || 0) + 1
      try {
        fs.writeFileSync(visitorsFile, JSON.stringify(visitorData))
      } catch (_) { }
    }
  }
  res.json({
    ok: true,
    source: 'local_file',
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

  const mailOptions = {
    from: SMTP_USER, // Clean email address for strict anti-spoofing and SPF validation
    to: MAIL_TO,
    bcc: 'varikuppalaa.sampath@gmail.com', // Direct copy to your personal Gmail inbox
    replyTo: d.email,
    subject: `Website enquiry: ${d.topic} - ${d.name}`,
    text,
  }

  // 1. Immediately save lead to disk so no customer enquiry is ever lost
  try {
    fs.appendFileSync(path.join(__dirname, 'enquiries.jsonl'), JSON.stringify({ at: new Date().toISOString(), ...d }) + '\n');
  } catch (_) { }

  // 2. Respond immediately with success so reverse proxy (Cloudflare/GoDaddy) never triggers a timeout
  res.json({ ok: true, message: 'Enquiry received' });

  // 3. Dispatch email asynchronously in background via named function
  sendEnquiryNotification(mailOptions);
});

async function sendEnquiryNotification(mailOptions) {
  try {
    await primaryMailer.sendMail(mailOptions);
  } catch (primaryErr) {
    console.warn('Primary SMTP (587) failed, retrying on 465:', primaryErr.message);
    try {
      await fallbackMailer.sendMail(mailOptions);
    } catch (fallbackErr) {
      console.error('All background SMTP attempts failed:', fallbackErr.message);
    }
  }
}

if (fs.existsSync(dist)) {
  app.use(express.static(dist, {
    maxAge: '1y',
    immutable: true,
    index: false,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
        res.setHeader('Pragma', 'no-cache')
        res.setHeader('Expires', '0')
      }
    }
  }))
  app.get('*', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    res.sendFile(path.join(dist, 'index.html'))
  })
}
const port = Number(process.env.PORT) || 3000;
const host = '0.0.0.0';
app.listen(port, host, () => console.log(`Jtech site running on http://${host}:${port}`));

// Process safety: prevent unhandled errors from terminating Node.js
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
