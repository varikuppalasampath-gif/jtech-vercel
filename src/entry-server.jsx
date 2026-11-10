import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { Shell } from './App.jsx'

export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <Shell />
    </StaticRouter>
  )
}

