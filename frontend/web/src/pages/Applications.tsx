import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, CheckCircle2, Clock, XCircle, Trophy, Eye, ArrowRightLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SkeletonJobCard } from '@/components/ui/skeleton'
import { Stagger, StaggerItem, FadeIn } from '@/components/motion'
import { useMe, useCandidateApplications } from '@/hooks/useQueries'
import { Timeline } from '@/components/shared/Timeline'
import { EmptyState } from '@/components/feedback/EmptyState'
import { cn, formatRelativeTime, getSecureResumeUrl } from '@/lib/utils'
import type { ApplicationStatus } from '@hireflow/types'

type AppStatus = ApplicationStatus

const STATUS_CONFIG: Record<AppStatus, { label: string; icon: React.ElementType; color: string; badge: 'secondary' | 'success' | 'warning' | 'destructive' | 'info' | 'outline' }> = {
  applied:   { label: 'Applied',    icon: FileText,    color: 'text-muted-foreground', badge: 'outline' },
  screening: { label: 'Screening',  icon: Eye,         color: 'text-info',             badge: 'info' },
  interview: { label: 'Interview',  icon: CheckCircle2,color: 'text-success',          badge: 'success' },
  offer:     { label: 'Offer',      icon: Trophy,      color: 'text-brand-400',        badge: 'secondary' },
  rejected:  { label: 'Rejected',   icon: XCircle,     color: 'text-destructive',      badge: 'destructive' },
  withdrawn: { label: 'Withdrawn',  icon: ArrowRightLeft, color: 'text-muted-foreground', badge: 'outline' },
}

const FILTER_TABS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Interview', value: 'interview' },
  { label: 'Rejected', value: 'rejected' },
]

export default function Applications() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  
  // Auth & applications hooks
  const { data: me, isLoading: meLoading } = useMe()
  const candidateId = me?.candidateProfile?.id
  const { data: applications = [], isLoading: isLoadingApps } = useCandidateApplications(candidateId)

  const handleViewResume = async (e: React.MouseEvent<HTMLAnchorElement>, rawUrl: string) => {
    e.preventDefault()
    try {
      const secureUrl = await getSecureResumeUrl(rawUrl)
      window.open(secureUrl, '_blank')
    } catch (err) {
      console.error('Failed to resolve secure resume path', err)
    }
  }

  const filtered = applications.filter((a) => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return !['rejected', 'withdrawn'].includes(a.status)
    return a.status === activeTab
  })

  const isLoading = meLoading || isLoadingApps

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <FadeIn>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="size-6 text-info" /> My Applications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {applications.length} applications · Track your pipeline
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', count: applications.length, color: 'text-foreground' },
            { label: 'In Progress', count: applications.filter(a => !['rejected', 'withdrawn'].includes(a.status)).length, color: 'text-info' },
            { label: 'Interview', count: applications.filter(a => a.status === 'interview').length, color: 'text-success' },
            { label: 'Rejected', count: applications.filter(a => a.status === 'rejected').length, color: 'text-destructive' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-3 text-center">
              <p className={cn('text-xl font-bold', stat.color)}>{stat.count}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-muted/40 rounded-lg p-1 w-fit mb-5">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-fast',
                activeTab === tab.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Application cards */}
      <Stagger className="space-y-3">
        {isLoading ? (
          <>
            <SkeletonJobCard />
            <SkeletonJobCard />
            <SkeletonJobCard />
          </>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="size-8 text-muted-foreground/60" />}
            title={activeTab === 'all' ? 'No applications submitted' : 'No matching applications'}
            description={
              activeTab === 'all'
                ? "You haven't applied to any jobs yet. Browse our active listings and find your next role."
                : `There are no applications currently marked as "${activeTab}".`
            }
            action={
              activeTab === 'all'
                ? { label: 'Explore active jobs', onClick: () => navigate('/jobs') }
                : undefined
            }
          />
        ) : filtered.map((app) => {
          const job = app.job
          if (!job) return null
          const cfg = STATUS_CONFIG[app.status as AppStatus] ?? STATUS_CONFIG.applied
          const isExpanded = expanded === app.id

          return (
            <StaggerItem key={app.id}>
              <div
                className={cn(
                  'bg-card border border-border rounded-2xl overflow-hidden',
                  'transition-all duration-base hover:border-ring/30 shadow-sm relative'
                )}
              >
                {/* Highlight active/interview cards */}
                {app.status === 'interview' && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-brand-600 to-brand-400" />
                )}

                {/* Card header */}
                <div
                  className="flex items-center gap-4 p-5 cursor-pointer"
                  onClick={() => setExpanded(isExpanded ? null : app.id)}
                >
                  {/* Company logo */}
                  <div className="size-10 rounded-lg bg-muted border border-border overflow-hidden shrink-0">
                    {job.company.logo ? (
                      <img src={job.company.logo} alt={job.company.name} className="size-full object-cover" loading="lazy" />
                    ) : (
                      <div className="size-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {job.company.name[0]}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.company.name} · Applied {formatRelativeTime(app.createdAt)}</p>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={cfg.badge} className="text-[10px]">
                      <cfg.icon className="size-3 mr-1 shrink-0" /> {cfg.label}
                    </Badge>
                    <span className={cn('transition-transform duration-fast', isExpanded ? 'rotate-180' : '')}>
                      <svg className="size-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Expanded timeline */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-border px-5 pb-5 pt-4 bg-accent/10"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Left: application detail / metadata */}
                      <div className="md:col-span-1 space-y-4 text-xs">
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Documents</p>
                          {app.resumeUrl ? (
                            <a
                              href={app.resumeUrl}
                              onClick={(e) => handleViewResume(e, app.resumeUrl!)}
                              className="inline-flex items-center gap-1.5 p-2 rounded-lg bg-card border border-border text-foreground hover:text-brand-400 transition-colors"
                            >
                              <FileText className="size-3.5" /> View Submitted Resume
                            </a>
                          ) : (
                            <span className="text-muted-foreground">No resume attached</span>
                          )}
                        </div>

                        {app.coverLetter && (
                          <div>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Cover Letter</p>
                            <div className="p-3 bg-card border border-border rounded-xl text-muted-foreground leading-relaxed italic max-h-[140px] overflow-y-auto">
                              &quot;{app.coverLetter}&quot;
                            </div>
                          </div>
                        )}

                        {app.aiScore !== undefined && (
                          <div className="p-3 rounded-xl border border-brand-500/10 bg-brand-500/5 flex items-center justify-between gap-2">
                            <div>
                              <p className="font-bold text-foreground flex items-center gap-1">
                                <Trophy className="size-3.5 text-brand-400" /> AI Score
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Semantic compatibility match</p>
                            </div>
                            <span className="text-lg font-extrabold text-brand-400">
                              {Math.round(app.aiScore * 100)}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right: Timeline tracing */}
                      <div className="md:col-span-2">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Application Pipeline Status</p>
                        <Timeline events={app.timeline} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </StaggerItem>
          )
        })}
      </Stagger>
    </div>
  )
}
