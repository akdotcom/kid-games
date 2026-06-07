import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.tsx'
import { registerSW } from './registerSW'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* HashRouter keeps deep links and refreshes working on GitHub Pages
        without any server-side rewrite configuration. */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)

registerSW()
