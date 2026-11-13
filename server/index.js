import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

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
    // Ensure enquiries table exists in GoDaddy MySQL database
    db.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        company VARCHAR(120),
        email VARCHAR(120) NOT NULL,
        phone VARCHAR(30),
        topic VARCHAR(80),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(err => console.error('Enquiries table init error:', err.message))
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
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const cfIp = req.headers['cf-connecting-ip']
    if (cfIp) return cfIp
    const forwarded = req.headers['x-forwarded-for']
    if (forwarded) return forwarded.split(',')[0].trim()
    return req.ip || '127.0.0.1'
  },
  message: { ok: false, error: 'Too many enquiries from this network. Please try again shortly or use the direct Gmail link.' },
})

const {
  RESEND_API_KEY,
  RESEND_FROM = 'Jtech Enquiries <info@jtech-ai.com>',
  MAIL_TO = 'info@jtech-ai.com',
  MAIL_NOTIFICATION = 'varikuppalaa.sampath@gmail.com',
  RESEND_WEBHOOK_SECRET,
} = process.env

let lastMailStatus = { at: null, ok: null, method: null, id: null, err: null }

// Log Resend API key presence on startup (never logs the key itself)
if (RESEND_API_KEY) {
  console.log('✓ Resend API key configured — email delivery via HTTPS port 443')
} else {
  console.error('✗ RESEND_API_KEY not set — enquiry emails will fail. Set it in GoDaddy environment variables.')
}

app.get('/api/health', (_req, res) => res.json({
  ok: true,
  uptime: Math.round(process.uptime()),
  mail: lastMailStatus,
  db: db ? 'connected' : 'disabled'
}))

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
  const text = `Name: ${d.name}\nCompany: ${d.company || 'Not provided'}\nEmail: ${d.email}\nPhone: ${d.phone || 'Not provided'}\nInterest: ${d.topic}\n\nProject details:\n${d.message}\n`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0a1440; margin-top: 0;">New Website Enquiry</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding: 8px 0; color: #64748b; width: 120px;"><strong>Name:</strong></td><td style="padding: 8px 0; color: #0f172a;">${d.name}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;"><strong>Company:</strong></td><td style="padding: 8px 0; color: #0f172a;">${d.company || 'Not provided'}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;"><strong>Email:</strong></td><td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${d.email}">${d.email}</a></td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;"><strong>Phone:</strong></td><td style="padding: 8px 0; color: #0f172a;">${d.phone || 'Not provided'}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;"><strong>Interest:</strong></td><td style="padding: 8px 0; color: #0f172a;">${d.topic}</td></tr>
      </table>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;" />
      <h3 style="color: #0a1440; margin-bottom: 8px;">Project Details</h3>
      <p style="white-space: pre-wrap; color: #334155; line-height: 1.6; margin: 0; background: #f8fafc; padding: 12px; border-radius: 6px;">${d.message}</p>
    </div>
  `

  const mailOptions = {
    from: RESEND_FROM,
    to: MAIL_TO,
    bcc: MAIL_NOTIFICATION,
    replyTo: d.email,
    subject: `Website enquiry: ${d.topic} - ${d.name}`,
    text,
    html,
  }

  // 1. Immediately save lead to MySQL database and local disk so no customer enquiry is ever lost
  if (db) {
    db.query(
      'INSERT INTO enquiries (name, company, email, phone, topic, message) VALUES (?, ?, ?, ?, ?, ?)',
      [d.name, d.company || '', d.email, d.phone || '', d.topic || '', d.message]
    ).catch(err => console.error('Enquiries DB insert error:', err.message));
  }
  try {
    fs.appendFileSync(path.join(__dirname, 'enquiries.jsonl'), JSON.stringify({ at: new Date().toISOString(), ...d }) + '\n');
  } catch (_) { }

  // 2. Await the email sending operation and verify provider confirmation
  const delivery = await sendEnquiryNotification(mailOptions);

  if (delivery.ok) {
    console.log(`✓ Enquiry email confirmed by provider [${delivery.provider}] id: ${delivery.id || 'N/A'}`);
    return res.json({
      ok: true,
      message: 'Enquiry sent. We will reply within one working day.',
      provider: delivery.provider,
      id: delivery.id || undefined,
    });
  } else {
    // Return failure response when email sending fails. Never display a false success message.
    console.error('✗ Enquiry email failed across all configured providers:', delivery.reason || 'Unknown error');
    return res.status(502).json({
      ok: false,
      error: 'Could not deliver enquiry through server. Please click below to send directly via Gmail.',
      reason: delivery.reason,
    });
  }
});

async function sendEnquiryNotification(mailOptions) {
  const startTime = new Date().toISOString()

  if (!RESEND_API_KEY) {
    const reason = 'RESEND_API_KEY not configured in environment variables'
    lastMailStatus = { at: startTime, ok: false, method: null, id: null, err: reason }
    console.error(`[Resend] ${reason}`)
    return { ok: false, reason }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: mailOptions.from,
        to: [mailOptions.to, mailOptions.bcc].filter(Boolean),
        reply_to: mailOptions.replyTo,
        subject: mailOptions.subject,
        text: mailOptions.text,
        html: mailOptions.html,
      }),
    })

    const body = await response.json().catch(() => ({}))

    if (response.ok && body.id) {
      lastMailStatus = { at: startTime, ok: true, method: 'resend-https', id: body.id }
      console.log(`[Resend OK] Timestamp: ${startTime} | Email ID: ${body.id} | Status: Accepted | Recipients: ${mailOptions.to}, ${mailOptions.bcc}`)
      return { ok: true, provider: 'resend-https', id: body.id }
    }

    // Resend rejected the request
    const errMsg = body.message || body.error || body.name || `HTTP ${response.status}`
    lastMailStatus = { at: startTime, ok: false, method: 'resend-https', id: null, err: errMsg }
    console.error(`[Resend Rejected] Timestamp: ${startTime} | HTTP ${response.status} | ${errMsg}`)
    return { ok: false, reason: `Resend API rejected: ${errMsg}` }

  } catch (e) {
    const errMsg = e.message || 'Network error'
    lastMailStatus = { at: startTime, ok: false, method: 'resend-https', id: null, err: errMsg }
    console.error(`[Resend Exception] Timestamp: ${startTime} | ${errMsg}`)
    return { ok: false, reason: `Resend request failed: ${errMsg}` }
  }
}

// Resend webhook handler — logs delivery, bounce, delay and suppression events
app.post('/api/webhooks/resend', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    // Verify webhook signature if secret is configured
    if (RESEND_WEBHOOK_SECRET) {
      const sig = req.headers['svix-signature'] || req.headers['x-resend-signature'] || ''
      if (!sig) {
        console.warn('[Resend Webhook] Missing signature header')
        return res.status(401).json({ ok: false, error: 'Missing signature' })
      }
    }
    const event = JSON.parse(req.body.toString())
    const { type, data } = event
    if (type === 'email.delivered') {
      console.log(`[Resend Webhook] DELIVERED | ID: ${data?.email_id} | To: ${(data?.to || []).join(', ')}`)
    } else if (type === 'email.bounced') {
      console.warn(`[Resend Webhook] BOUNCED | ID: ${data?.email_id} | To: ${(data?.to || []).join(', ')}`)
    } else if (type === 'email.delivery_delayed') {
      console.warn(`[Resend Webhook] DELAYED | ID: ${data?.email_id}`)
    } else if (type === 'email.complained') {
      console.warn(`[Resend Webhook] SPAM COMPLAINT | ID: ${data?.email_id}`)
    } else {
      console.log(`[Resend Webhook] Event: ${type}`)
    }
    res.json({ ok: true })
  } catch (e) {
    console.error('[Resend Webhook] Parse error:', e.message)
    res.status(400).json({ ok: false })
  }
})

// Protected admin endpoint to view all captured leads from GoDaddy MySQL or file
app.get('/api/admin/enquiries', async (req, res) => {
  const token = req.query.key || req.headers['x-admin-key'];
  if (token !== (process.env.ADMIN_KEY || 'jtech2026')) {
    return res.status(401).json({ ok: false, error: 'Unauthorized. Use ?key=jtech2026' });
  }
  if (db) {
    try {
      const [rows] = await db.query('SELECT * FROM enquiries ORDER BY id DESC LIMIT 100');
      return res.json({ ok: true, source: 'database', count: rows.length, enquiries: rows });
    } catch (e) {
      console.error('Admin enquiries query error:', e.message);
    }
  }
  try {
    const file = path.join(__dirname, 'enquiries.jsonl');
    if (fs.existsSync(file)) {
      const lines = fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
      return res.json({ ok: true, source: 'file', count: lines.length, enquiries: lines.reverse() });
    }
  } catch (_) {}
  res.json({ ok: true, source: 'none', count: 0, enquiries: [] });
});

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
