import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PAGE_METADATA } from '../src/constants.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')
const baseHtmlPath = path.join(distDir, 'index.html')

if (!fs.existsSync(baseHtmlPath)) {
  console.error('Error: dist/index.html not found. Run "vite build" first.')
  process.exit(1)
}

const baseHtml = fs.readFileSync(baseHtmlPath, 'utf8')

console.log('⚡ Generating page-specific SEO metadata for static HTML...')

for (const [route, meta] of Object.entries(PAGE_METADATA)) {
  let html = baseHtml

  // 1. Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${meta.title}</title>`)

  // 2. Meta description
  html = html.replace(
    /<meta name="description" content=".*?">/i,
    `<meta name="description" content="${meta.description}">`
  )

  // 3. Canonical link
  html = html.replace(
    /<link rel="canonical" href=".*?">/i,
    `<link rel="canonical" href="${meta.canonical}">`
  )

  // 4. OpenGraph tags
  html = html.replace(
    /<meta property="og:title" content=".*?">/i,
    `<meta property="og:title" content="${meta.title}">`
  )
  html = html.replace(
    /<meta property="og:description" content=".*?">/i,
    `<meta property="og:description" content="${meta.description}">`
  )
  html = html.replace(
    /<meta property="og:url" content=".*?">/i,
    `<meta property="og:url" content="${meta.canonical}">`
  )

  // 5. Twitter tags
  html = html.replace(
    /<meta name="twitter:title" content=".*?">/i,
    `<meta name="twitter:title" content="${meta.title}">`
  )
  html = html.replace(
    /<meta name="twitter:description" content=".*?">/i,
    `<meta name="twitter:description" content="${meta.description}">`
  )

  if (route === '/') {
    fs.writeFileSync(baseHtmlPath, html, 'utf8')
    console.log(`  ✓ Prerendered HTML: / (dist/index.html)`)
  } else {
    const routeDir = path.join(distDir, route.replace(/^\//, ''))
    fs.mkdirSync(routeDir, { recursive: true })
    const outPath = path.join(routeDir, 'index.html')
    fs.writeFileSync(outPath, html, 'utf8')
    console.log(`  ✓ Prerendered HTML: ${route} (${path.relative(path.join(__dirname, '..'), outPath)})`)
  }
}

console.log('✨ All 8 pages successfully prerendered with static SEO metadata!')

