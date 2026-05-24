/**
 * Skeleton Components
 * ─────────────────────────────────────────────────────────────────────────────
 * Content-shaped skeletons that mirror real layout so there's zero layout
 * shift when content loads. Never show blank screens or blocking spinners.
 *
 * All skeletons use the `.shimmer` CSS class (wave animation) rather than
 * `animate-pulse` for a more premium, directional loading feel.
 */

import React from 'react'
import { cn } from '@/lib/utils'

// ─── Base Shimmer ─────────────────────────────────────────────────────────────

function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn('shimmer rounded-md', className)}
      style={style}
      aria-hidden="true"
    />
  )
}

// ─── Job Card Skeleton ────────────────────────────────────────────────────────

export function JobCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4" aria-hidden="true">
      {/* Header: logo + company */}
      <div className="flex items-center gap-3">
        <Shimmer className="h-10 w-10 rounded-xl flex-shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Shimmer className="h-3.5 w-24" />
          <Shimmer className="h-3 w-16" />
        </div>
        <Shimmer className="h-6 w-16 rounded-full" />
      </div>
      {/* Title */}
      <div className="space-y-2">
        <Shimmer className="h-5 w-3/4" />
        <Shimmer className="h-4 w-1/2" />
      </div>
      {/* Tags */}
      <div className="flex gap-2">
        <Shimmer className="h-6 w-16 rounded-full" />
        <Shimmer className="h-6 w-20 rounded-full" />
        <Shimmer className="h-6 w-14 rounded-full" />
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Shimmer className="h-4 w-20" />
        <Shimmer className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  )
}

export function JobFeedSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading jobs…">
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  )
}

// ─── Job Detail Skeleton ──────────────────────────────────────────────────────

export function JobDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8" role="status" aria-label="Loading job details…">
      {/* Hero */}
      <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
        <div className="flex items-start gap-4">
          <Shimmer className="h-16 w-16 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <Shimmer className="h-7 w-2/3" />
            <Shimmer className="h-4 w-1/3" />
            <div className="flex gap-2 flex-wrap">
              {[80, 96, 72, 88].map((w, i) => (
                <Shimmer key={i} className="h-6 rounded-full" style={{ width: w }} />
              ))}
            </div>
          </div>
          <Shimmer className="h-10 w-32 rounded-xl flex-shrink-0" />
        </div>
        {/* Salary + meta */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <Shimmer className="h-3 w-16" />
              <Shimmer className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="space-y-4">
        <Shimmer className="h-5 w-32" />
        {[100, 90, 95, 85, 100, 92].map((_, i) => (
          <Shimmer key={i} className="h-4 w-full" style={{ opacity: 1 - i * 0.07 }} />
        ))}
      </div>
    </div>
  )
}

// ─── Company Card Skeleton ────────────────────────────────────────────────────

export function CompanyCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4" aria-hidden="true">
      <div className="flex items-center gap-3">
        <Shimmer className="h-12 w-12 rounded-xl" />
        <div className="space-y-1.5 flex-1">
          <Shimmer className="h-4 w-28" />
          <Shimmer className="h-3 w-20" />
        </div>
      </div>
      <Shimmer className="h-12 w-full rounded-lg" />
      <div className="flex items-center justify-between">
        <Shimmer className="h-4 w-24" />
        <Shimmer className="h-6 w-16 rounded-full" />
      </div>
    </div>
  )
}

export function CompanyListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="status" aria-label="Loading companies…">
      {Array.from({ length: count }).map((_, i) => (
        <CompanyCardSkeleton key={i} />
      ))}
    </div>
  )
}

// ─── Company Detail Skeleton ──────────────────────────────────────────────────

export function CompanyDetailSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading company…">
      {/* Cover */}
      <Shimmer className="h-48 w-full rounded-2xl" />
      {/* Header */}
      <div className="flex items-end gap-6 -mt-16 px-8">
        <Shimmer className="h-24 w-24 rounded-2xl border-4 border-background" />
        <div className="flex-1 space-y-2 pb-2">
          <Shimmer className="h-6 w-48" />
          <Shimmer className="h-4 w-32" />
        </div>
        <Shimmer className="h-10 w-28 rounded-xl" />
      </div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 px-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-6 w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Dashboard Stats Skeleton ─────────────────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-3" aria-hidden="true">
      <div className="flex items-center justify-between">
        <Shimmer className="h-4 w-28" />
        <Shimmer className="h-8 w-8 rounded-lg" />
      </div>
      <Shimmer className="h-8 w-20" />
      <Shimmer className="h-3 w-32" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading dashboard…">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
      </div>
      <JobFeedSkeleton count={3} />
    </div>
  )
}

// ─── Pipeline (Kanban) Skeleton ───────────────────────────────────────────────

function PipelineColumnSkeleton() {
  return (
    <div className="flex flex-col gap-3 min-w-[280px]" aria-hidden="true">
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <Shimmer className="h-5 w-24" />
        <Shimmer className="h-5 w-8 rounded-full" />
      </div>
      {/* Cards */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2.5">
            <Shimmer className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="space-y-1 flex-1">
              <Shimmer className="h-3.5 w-28" />
              <Shimmer className="h-3 w-20" />
            </div>
          </div>
          <Shimmer className="h-3 w-full" />
          <div className="flex gap-1.5">
            <Shimmer className="h-5 w-14 rounded-full" />
            <Shimmer className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function PipelineSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div
      className="flex gap-4 overflow-x-auto pb-4 scrollbar-none"
      role="status"
      aria-label="Loading pipeline…"
    >
      {Array.from({ length: columns }).map((_, i) => (
        <PipelineColumnSkeleton key={i} />
      ))}
    </div>
  )
}

// ─── Applications Skeleton ────────────────────────────────────────────────────

function ApplicationRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card" aria-hidden="true">
      <Shimmer className="h-10 w-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Shimmer className="h-4 w-40" />
        <Shimmer className="h-3 w-28" />
      </div>
      <Shimmer className="h-6 w-20 rounded-full flex-shrink-0" />
      <Shimmer className="h-4 w-16 flex-shrink-0" />
    </div>
  )
}

export function ApplicationsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading applications…">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Shimmer className="h-7 w-40" />
        <Shimmer className="h-9 w-28 rounded-lg" />
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <ApplicationRowSkeleton key={i} />
      ))}
    </div>
  )
}

// ─── Inline text skeleton ─────────────────────────────────────────────────────

export function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer
          key={i}
          className="h-4"
          style={{ width: `${100 - (i % 3) * 12}%` }}
        />
      ))}
    </div>
  )
}
