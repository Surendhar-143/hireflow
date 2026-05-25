import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Zap, TrendingUp, ChevronDown, ChevronUp, Briefcase, Cpu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { JobCard } from '@/features/jobs/JobCard'
import { SkeletonJobCard } from '@/components/ui/skeleton'
import { FadeIn } from '@/components/motion'
import { useCandidateDashboard, useMe, useAIMatchRecommendations } from '@/hooks/useQueries'
import { AIMatchExplanation } from '@/components/feedback/AIMatchExplanation'
import { AIMatchIndicator } from '@/components/feedback/AIMatchIndicator'
import { cn } from '@/lib/utils'

export default function AIMatches() {
  const { data: stats, isLoading: statsLoading } = useCandidateDashboard()
  const { data: me, isLoading: meLoading } = useMe()
  const { data: aiMatchesData, isLoading: aiLoading } = useAIMatchRecommendations(me?.candidateProfile?.id, !!me?.candidateProfile?.id)
  
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)

  const topMatches = aiMatchesData || []
  const candidateSkills = me?.candidateProfile?.skills || ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS']

  const toggleExpand = (jobId: string) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId)
  }

  const isLoading = statsLoading || meLoading || aiLoading

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900/60 via-indigo-950/40 to-slate-900 border border-brand-500/20 p-6 mb-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <Badge variant="premium" className="mb-3">
            <Sparkles className="size-3" /> AI-Powered Analysis
          </Badge>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            Your Premium AI Matches
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-lg leading-relaxed">
            Our high-fidelity machine learning pipeline processes your raw profile metrics, skills matrix, and target preferences to align perfect-fit opportunities in real-time.
          </p>
          
          <div className="mt-5 flex flex-wrap items-center gap-6 text-xs">
            <div className="flex items-center gap-2 text-foreground font-semibold bg-brand-500/10 px-3 py-1.5 rounded-lg border border-brand-500/20">
              <Cpu className="size-4 text-brand-400" />
              <span>{topMatches.length} AI matches matched</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="size-4 text-amber-400 animate-pulse" />
              <span>Context refreshed live</span>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Match quality breakdown */}
      {!isLoading && topMatches.length > 0 && (
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Exemplary Match', range: '80–100%', count: topMatches.filter(j => (j.aiMatchScore ?? 0) >= 80).length, color: 'text-emerald-400', bg: 'bg-emerald-500/[0.03] border-emerald-500/10' },
              { label: 'Strong Fit', range: '60–79%', count: topMatches.filter(j => (j.aiMatchScore ?? 0) >= 60 && (j.aiMatchScore ?? 0) < 80).length, color: 'text-amber-400', bg: 'bg-amber-500/[0.03] border-amber-500/10' },
              { label: 'Potential Gap', range: '< 60%', count: topMatches.filter(j => (j.aiMatchScore ?? 0) < 60).length, color: 'text-muted-foreground', bg: 'bg-muted/10 border-border/40' },
            ].map((tier) => (
              <div key={tier.label} className={cn('rounded-xl border p-3.5 text-center transition-all duration-300 shadow-sm hover:scale-[1.01]', tier.bg)}>
                <p className={cn('text-2xl font-black', tier.color)}>{tier.count}</p>
                <p className="text-xs font-bold text-foreground mt-0.5">{tier.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{tier.range}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      )}

      {/* Matched jobs list with nested collapsibles */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <SkeletonJobCard />
            <SkeletonJobCard />
            <SkeletonJobCard />
          </div>
        ) : topMatches.length > 0 ? (
          topMatches.map((job, i) => {
            const isExpanded = expandedJobId === job.id
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-ring/30 transition-all duration-300 shadow-md"
              >
                {/* Embedded Job Card */}
                <div className="p-1">
                  <JobCard job={job} index={0} />
                </div>

                {/* AI Fit Explainer Bar */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-muted/30 border-t border-border/40 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Match Confidence Index:</span>
                    <AIMatchIndicator score={job.aiMatchScore ?? 75} showSparkles={false} />
                  </div>

                  <button
                    onClick={() => toggleExpand(job.id)}
                    className={cn(
                      'flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-lg border transition-all duration-fast',
                      isExpanded
                        ? 'border-brand-500/30 bg-brand-500/10 text-brand-400'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-ring/40'
                    )}
                  >
                    <span>{isExpanded ? 'Hide Fit Insights' : 'Explain Fit Insights'}</span>
                    {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                  </button>
                </div>

                {/* Collapsible Explainer Pane */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="border-t border-border/40 bg-muted/20"
                    >
                      <div className="p-4">
                        <AIMatchExplanation
                          jobTitle={job.title}
                          jobSkills={job.skills}
                          candidateSkills={candidateSkills}
                          overallScore={job.aiMatchScore ?? 75}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        ) : (
          <FadeIn>
            <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-muted/10 p-6">
              <Briefcase className="size-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground">No AI Matches Found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Expand your skills tags list or update your work experience profile in the Dashboard to allow the matching pipeline to find overlaps.
              </p>
              <Link
                to="/app/candidate/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/95 transition-all"
              >
                Go to Profile Setup
              </Link>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  )
}
