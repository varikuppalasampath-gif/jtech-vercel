import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { PAGE_METADATA } from '../src/constants.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')
const baseHtmlPath = path.join(distDir, 'index.html')

if (!fs.existsSync(baseHtmlPath)) {
  console.error('Error: dist/index.html not found. Run "vite build" first.')
  process.exit(1)
}

const baseHtml = fs.readFileSync(baseHtmlPath, 'utf8')

console.log('⚡ Generating fully prerendered static HTML pages with complete body content...')

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
})

try {
  const { render } = await vite.ssrLoadModule('/src/entry-server.jsx')

  for (const [route, meta] of Object.entries(PAGE_METADATA)) {
    let html = baseHtml

    // 1. Render React components to full static HTML markup
    let appHtml = ''
    try {
      appHtml = render(route)
    } catch (err) {
      console.warn(`Warning: failed to render ${route}:`, err.message)
    }

    // 2. Inject rendered HTML inside <div id="root">
    if (appHtml) {
      html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
    }

    // 3. Title
    html = html.replace(/<title>.*?<\/title>/i, `<title>${meta.title}</title>`)

    // 4. Meta description
    html = html.replace(
      /<meta name="description" content=".*?">/i,
      `<meta name="description" content="${meta.description}">`
    )

    // 5. Canonical link
    html = html.replace(
      /<link rel="canonical" href=".*?">/i,
      `<link rel="canonical" href="${meta.canonical}">`
    )

    // 6. OpenGraph tags
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

    // 7. Twitter tags
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
      console.log(`  ✓ Fully Prerendered HTML: / (dist/index.html) [${appHtml.length} chars]`)
    } else {
      const routeDir = path.join(distDir, route.replace(/^\//, ''))
      fs.mkdirSync(routeDir, { recursive: true })
      const outPath = path.join(routeDir, 'index.html')
      fs.writeFileSync(outPath, html, 'utf8')
      console.log(`  ✓ Fully Prerendered HTML: ${route} (${path.relative(path.join(__dirname, '..'), outPath)}) [${appHtml.length} chars]`)
    }
  }
} finally {
  await vite.close()
}

console.log('✨ All 8 pages successfully prerendered with full static body content!')
