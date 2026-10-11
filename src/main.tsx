import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MotionConfig } from 'motion/react'
import { MotionFoundation } from './components/MotionFoundation'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user" transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}>
      <MotionFoundation />
      <App />
    </MotionConfig>
  </StrictMode>,
)
