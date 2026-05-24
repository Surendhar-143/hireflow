import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Zap, ArrowRight, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { JobCard } from '@/features/jobs/JobCard'
import { SkeletonJobCard } from '@/components/ui/skeleton'
import { FadeIn } from '@/components/motion'
import { useJobs } from '@/hooks/useQueries'
import { cn } from '@/lib/utils'

export default function AIMatches() {
  const { data, isLoading } = useJobs()
  
  const topMatches = (data?.data || [])
    .filter(j => (j.aiMatchScore ?? 0) >= 50)
    .sort((a, b) => (b.aiMatchScore ?? 0) - (a.aiMatchScore ?? 0))
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900/80 to-brand-600/40 border border-brand-500/20 p-6 mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <Badge variant="premium" className="mb-3">
            <Sparkles className="size-3" /> AI-Powered
          </Badge>
          <h1 className="text-2xl font-bold text-foreground">Your AI Matches</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Our AI analyzed your profile, skills, and preferences to surface the roles most likely to be a great fit.
          </p>
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <TrendingUp className="size-4 text-brand-400" />
              <span className="font-semibold">{topMatches.length} matches found</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="size-4 text-warning" />
              <span>Updated daily</span>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Match quality breakdown */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Strong Match', range: '80–100%', count: topMatches.filter(j => (j.aiMatchScore ?? 0) >= 80).length, color: 'text-success', bg: 'bg-success/10' },
            { label: 'Good Match', range: '60–79%', count: topMatches.filter(j => (j.aiMatchScore ?? 0) >= 60 && (j.aiMatchScore ?? 0) < 80).length, color: 'text-warning', bg: 'bg-warning/10' },
            { label: 'Possible', range: '< 60%', count: topMatches.filter(j => (j.aiMatchScore ?? 0) < 60).length, color: 'text-muted-foreground', bg: 'bg-muted/30' },
          ].map((tier) => (
            <div key={tier.label} className={cn('rounded-xl border border-border p-3 text-center', tier.bg)}>
              <p className={cn('text-xl font-bold', tier.color)}>{tier.count}</p>
              <p className="text-xs font-medium text-foreground mt-0.5">{tier.label}</p>
              <p className="text-[11px] text-muted-foreground">{tier.range}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Matched jobs */}
      <div className="space-y-3">
        {isLoading ? (
          <>
            <SkeletonJobCard />
            <SkeletonJobCard />
            <SkeletonJobCard />
          </>
        ) : (
          topMatches.map((job, i) => (
            <JobCard key={job.id} job={job} index={i} />
          ))
        )}
      </div>
    </div>
  )
}
