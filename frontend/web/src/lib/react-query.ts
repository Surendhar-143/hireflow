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
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
