/**
 * QueryBoundary — Unified loading + error wrapper for TanStack Query states
 * ─────────────────────────────────────────────────────────────────────────────
 * Eliminates the pattern of `if (isLoading) ... if (isError) ...` in every page.
 * 
 * Usage:
 *   <QueryBoundary query={useJob(id)} skeleton={<JobDetailSkeleton />}>
 *     {(job) => <JobDetailContent job={job} />}
 *   </QueryBoundary>
 */

import React from 'react'
import { UseQueryResult } from '@tanstack/react-query'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QueryBoundaryProps<T> {
  query: UseQueryResult<T, Error>
  skeleton: React.ReactNode
  children: (data: NonNullable<T>) => React.ReactNode
  errorFallback?: React.ReactNode
  className?: string
}

export function QueryBoundary<T>({
  query,
  skeleton,
  children,
  errorFallback,
  className,
}: QueryBoundaryProps<T>) {
  const { data, isLoading, isFetching, isError, error, refetch } = query

  // Show skeleton on initial load only (not background refetches)
  if (isLoading) {
    return <>{skeleton}</>
  }

  // Error state
  if (isError) {
    if (errorFallback) return <>{errorFallback}</>

    return (
      <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center gap-4', className)}>
        <div className="flex items-center justify-center size-14 rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h3 className="font-semibold text-foreground">Something went wrong</h3>
          <p className="text-sm text-muted-foreground">
            {(error as Error)?.message ?? 'Failed to load data. Please try again.'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-2"
        >
          <RefreshCw className="size-3.5" />
          Try again
        </Button>
      </div>
    )
  }

  // No data (should be rare — API always returns arrays)
  if (data == null) {
    return null
  }

  return (
    <div className={cn('relative', className)}>
      {/* Subtle refetch indicator — not a blocker */}
      {isFetching && !isLoading && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/30 rounded-full overflow-hidden z-10">
          <div className="h-full bg-primary animate-[slide_1.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
        </div>
      )}
      {children(data as NonNullable<T>)}
    </div>
  )
}

/**
 * InlineError — lightweight error display for secondary queries
 */
export function InlineError({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/20 text-sm text-destructive">
      <AlertTriangle className="size-4 shrink-0" />
      <span className="flex-1">{message ?? 'Failed to load'}</span>
      {onRetry && (
        <button onClick={onRetry} className="underline underline-offset-2 text-xs hover:no-underline">
          Retry
        </button>
      )}
    </div>
  )
}

/**
 * RefetchIndicator — top-of-page progress bar when background refetching
 */
export function RefetchIndicator({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 z-50 bg-primary/20 overflow-hidden">
      <div
        className="h-full bg-primary rounded-full"
        style={{
          animation: 'progress-bar 1.8s ease-in-out infinite',
          width: '60%',
        }}
      />
    </div>
  )
}
