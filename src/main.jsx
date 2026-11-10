import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

const container = document.getElementById('root')
if (container && container.hasChildNodes()) {
  hydrateRoot(container, <App />)
} else if (container) {
  createRoot(container).render(<App />)
}
