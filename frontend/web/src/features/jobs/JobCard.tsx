import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Clock, Bookmark, BookmarkCheck, ExternalLink, Building2 } from 'lucide-react'
import { cn, formatRelativeTime, formatSalary } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useSearchStore } from '@/store/search-store'
import { useSaveJobMutation } from '@/hooks/useQueries'
import type { Job } from '@hireflow/types'

// ─── Match Score Ring ─────────────────────────────────────────────────────────
function MatchScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'
  const r = 16
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  return (
    <div className="flex flex-col items-center gap-0.5" title={`${score}% match`}>
      <div className="relative size-10 flex items-center justify-center">
        <svg className="absolute inset-0 size-10 -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r={r} fill="none" strokeWidth="2.5" className="stroke-muted" />
          <circle
            cx="20" cy="20" r={r} fill="none" strokeWidth="2.5"
            stroke={color} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <span className="text-[10px] font-semibold" style={{ color }}>{score}</span>
      </div>
      <span className="text-[9px] text-muted-foreground uppercase tracking-wider">match</span>
    </div>
  )
}

// ─── Work Mode Badge ──────────────────────────────────────────────────────────
const workModeLabelMap = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' }
const workModeVariantMap = {
  remote: 'success' as const,
  hybrid: 'info' as const,
  onsite: 'secondary' as const,
}
const typeLabelMap = {
  'full-time': 'Full-time', 'part-time': 'Part-time',
  contract: 'Contract', internship: 'Internship', freelance: 'Freelance',
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
interface JobCardProps {
  job: Job
  layout?: 'list' | 'grid'
  index?: number
}

export const JobCard = React.memo(function JobCard({ job, layout = 'list', index = 0 }: JobCardProps) {
  const toggleSaveJob = useSearchStore((state) => state.toggleSaveJob)
  const saved = useSearchStore((state) => state.savedJobs.includes(job.id))
  
  const { save, unsave } = useSaveJobMutation()

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleSaveJob(job.id) // Optimistic UI update
    if (saved) {
      unsave.mutate(job.id)
    } else {
      save.mutate(job.id)
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: [0, 0, 0.2, 1] }}
      className={cn(
        'group relative bg-card border border-border rounded-xl',
        'transition-all duration-base hover:border-ring/40 hover:shadow-card-hover hover:-translate-y-0.5',
        layout === 'list' ? 'p-5' : 'p-5 flex flex-col h-full'
      )}
    >
      {/* Featured glow */}
      {job.featured && (
        <div className="absolute inset-0 rounded-xl pointer-events-none ring-1 ring-brand-500/20 bg-brand-500/[0.02]" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Company logo */}
          <div className="shrink-0 size-10 rounded-lg bg-muted border border-border overflow-hidden">
            {job.company.logo ? (
              <img src={job.company.logo} alt={job.company.name} width={40} height={40} className="size-full object-cover" loading="lazy" />
            ) : (
              <div className="size-full flex items-center justify-center">
                <Building2 className="size-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <Link
              to={`/jobs/${job.id}`}
              className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 leading-snug"
            >
              {job.title}
            </Link>
            <Link
              to={`/companies/${job.company.slug}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mt-0.5"
            >
              {job.company.name}
              {job.company.verified && (
                <span className="text-info text-[10px]">✓</span>
              )}
            </Link>
          </div>
        </div>

        {/* Right side: match score + save */}
        <div className="flex items-center gap-2 shrink-0">
          {job.aiMatchScore && <MatchScoreRing score={job.aiMatchScore} />}
          <button
            onClick={handleToggleSave}
            className={cn(
              'flex items-center justify-center size-8 rounded-lg border transition-all duration-fast',
              saved
                ? 'border-brand-500/40 bg-brand-500/10 text-brand-400 hover:bg-brand-500/20'
                : 'border-border bg-transparent text-muted-foreground hover:border-ring/40 hover:text-foreground'
            )}
            aria-label={saved ? 'Unsave job' : 'Save job'}
          >
            {saved ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="size-3 shrink-0" />
          {job.location}
        </span>
        <Badge variant={workModeVariantMap[job.workMode]} dot className="text-[10px]">
          {workModeLabelMap[job.workMode]}
        </Badge>
        <Badge variant="outline" className="text-[10px]">
          {typeLabelMap[job.type]}
        </Badge>
        {job.salary && (
          <span className="font-medium text-foreground">
            {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
          </span>
        )}
      </div>

      {/* Skills */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.skills.slice(0, 5).map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-accent/60 text-accent-foreground border border-border/50"
          >
            {skill}
          </span>
        ))}
        {job.skills.length > 5 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] text-muted-foreground bg-muted/50">
            +{job.skills.length - 5}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3 shrink-0" />
          <span>{formatRelativeTime(job.createdAt)}</span>
          <span className="text-muted-foreground/40">·</span>
          <span>{job.applicantCount} applicants</span>
        </div>
        <Link
          to={`/jobs/${job.id}`}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium',
            'bg-primary/10 text-primary border border-primary/20',
            'hover:bg-primary/20 transition-colors duration-fast',
            'opacity-0 group-hover:opacity-100 transition-opacity'
          )}
        >
          View role <ExternalLink className="size-3" />
        </Link>
      </div>
    </motion.article>
  )
})
