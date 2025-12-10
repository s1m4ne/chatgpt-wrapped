import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AnalysisProvider } from './contexts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AnalysisProvider>
      <App />
    </AnalysisProvider>
  </StrictMode>
)
