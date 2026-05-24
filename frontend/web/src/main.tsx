import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '@/lib/firebase'
import './styles/globals.css'
import { Toaster } from 'sonner'

// Skip-to-main-content link for keyboard users (visually hidden until focused)
const skipLink = document.createElement('a')
skipLink.href = '#main-content'
skipLink.className = 'skip-to-main'
skipLink.textContent = 'Skip to main content'
document.body.insertBefore(skipLink, document.body.firstChild)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: 'bg-popover border border-border text-popover-foreground shadow-lg',
          title: 'text-sm font-medium',
          description: 'text-xs text-muted-foreground',
        },
      }}
    />
  </React.StrictMode>
)

