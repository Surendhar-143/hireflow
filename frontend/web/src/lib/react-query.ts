import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { telemetry } from '@/lib/observability'

export const queryClient = new QueryClient({
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
      staleTime: 1000 * 60 * 15, // 15 minutes (Aggressive caching)
      gcTime: 1000 * 60 * 60 * 2, // 2 hours
      retry: (failureCount, error: any) => {
        if (error?.status === 401 || error?.status === 404) return false
        return failureCount < 2
      },
      refetchOnWindowFocus: false, // Prevent request storms on alt-tab
      refetchOnReconnect: true,
      refetchOnMount: false, // Serve from cache instantly
    },
  },
})
