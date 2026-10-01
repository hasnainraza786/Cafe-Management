import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import '@renderer/shared/styles/index.css'
import '@renderer/shared/ui/Button.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
