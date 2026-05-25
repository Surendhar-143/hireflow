import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import { AuthProvider } from '@/components/auth/AuthContext'
import { NetworkStatus } from '@/components/feedback/NetworkStatus'
import { telemetry } from '@/lib/observability'
import { router } from './router'
import { useUIStore } from './store/ui-store'

import { queryClient } from '@/lib/react-query'

function ThemeInitializer() {
  const { theme } = useUIStore()
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  return null
}

// Lazy-load DevTools so they are fully tree-shaken in production builds
const DevTools = React.lazy(() =>
  import('@tanstack/react-query-devtools').then((m) => ({
    default: m.ReactQueryDevtools,
  }))
)

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeInitializer />
        <NetworkStatus />
        <RouterProvider router={router} />
        {/* DevTools only in development — fully stripped from production bundle */}
        {import.meta.env.DEV && (
          <React.Suspense fallback={null}>
            <DevTools initialIsOpen={false} />
          </React.Suspense>
        )}
      </AuthProvider>
    </QueryClientProvider>
  )
}
