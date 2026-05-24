import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import { Toaster } from 'sonner'

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
