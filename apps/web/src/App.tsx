import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { router } from './router'
import { useUIStore } from './store/ui-store'
import { NetworkStatus } from '@/components/feedback/NetworkStatus'
import { telemetry } from '@/lib/observability'

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      telemetry.captureApiError(query.queryKey.join('/'), error)
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      telemetry.captureApiError(mutation.options.mutationKey?.join('/') || 'mutation', error)
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function ThemeInitializer() {
  const { theme } = useUIStore()
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer />
      <NetworkStatus />
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
