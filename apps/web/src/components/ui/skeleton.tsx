import * as React from 'react'
import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('shimmer rounded-md bg-muted', className)} {...props} />
}

/* ─── Semantic Skeleton Shapes ───────────────────────────────────────────────*/

function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full')} />
      ))}
    </div>
  )
}

function SkeletonCircle({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const s = { sm: 'size-8', md: 'size-10', lg: 'size-12', xl: 'size-16' }[size]
  return <Skeleton className={cn('rounded-full shrink-0', s, className)} />
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-6 space-y-4', className)}>
      <div className="flex items-start gap-3">
        <SkeletonCircle size="md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </div>
  )
}

function SkeletonJobCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Skeleton className="size-10 rounded-lg shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <Skeleton className="size-8 rounded-md shrink-0" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <div className="flex gap-2 flex-wrap">
        {[60, 80, 70, 50].map((w, i) => (
          <Skeleton key={i} className={`h-6 rounded-full`} style={{ width: `${w}px` }} />
        ))}
      </div>
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
    </div>
  )
}

export { Skeleton, SkeletonText, SkeletonCircle, SkeletonCard, SkeletonJobCard }
