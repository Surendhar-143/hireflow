import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, CheckCircle2, Clock, XCircle, Trophy, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SkeletonJobCard } from '@/components/ui/skeleton'
import { Stagger, StaggerItem, FadeIn } from '@/components/motion'
import { useJobs } from '@/hooks/useQueries'
import { cn, formatRelativeTime } from '@/lib/utils'

// ─── Mock application data ────────────────────────────────────────────────────
const APPLICATIONS = [
  {
    id: 'a1', jobId: 'j1', status: 'interview' as const,
    appliedAt: '2024-05-20', updatedAt: '2024-05-22',
    timeline: [
      { status: 'applied', date: '2024-05-20', note: 'Application submitted' },
      { status: 'screening', date: '2024-05-21', note: 'Profile reviewed by recruiter' },
      { status: 'interview', date: '2024-05-22', note: 'Interview scheduled for May 27th' },
    ],
  },
  {
    id: 'a2', jobId: 'j2', status: 'review' as const,
    appliedAt: '2024-05-18', updatedAt: '2024-05-19',
    timeline: [
      { status: 'applied', date: '2024-05-18', note: 'Application submitted' },
      { status: 'review', date: '2024-05-19', note: 'Under review' },
    ],
  },
  {
    id: 'a3', jobId: 'j5', status: 'applied' as const,
    appliedAt: '2024-05-15', updatedAt: '2024-05-15',
    timeline: [
      { status: 'applied', date: '2024-05-15', note: 'Application submitted' },
    ],
  },
  {
    id: 'a4', jobId: 'j3', status: 'rejected' as const,
    appliedAt: '2024-05-10', updatedAt: '2024-05-14',
    timeline: [
      { status: 'applied', date: '2024-05-10', note: 'Application submitted' },
      { status: 'screening', date: '2024-05-12', note: 'Reviewed' },
      { status: 'rejected', date: '2024-05-14', note: 'Position filled' },
    ],
  },
]

type AppStatus = 'applied' | 'review' | 'screening' | 'interview' | 'offer' | 'rejected'

const STATUS_CONFIG: Record<AppStatus, { label: string; icon: React.ElementType; color: string; badge: 'secondary' | 'success' | 'warning' | 'destructive' | 'info' | 'outline' }> = {
  applied:   { label: 'Applied',    icon: FileText,    color: 'text-muted-foreground', badge: 'outline' },
  screening: { label: 'Screening',  icon: Eye,         color: 'text-info',             badge: 'info' },
  review:    { label: 'Under Review',icon: Clock,      color: 'text-warning',          badge: 'warning' },
  interview: { label: 'Interview',  icon: CheckCircle2,color: 'text-success',          badge: 'success' },
  offer:     { label: 'Offer',      icon: Trophy,      color: 'text-brand-400',        badge: 'secondary' },
  rejected:  { label: 'Rejected',   icon: XCircle,     color: 'text-destructive',      badge: 'destructive' },
}

const FILTER_TABS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Interview', value: 'interview' },
  { label: 'Rejected', value: 'rejected' },
]

export default function Applications() {
  const [activeTab, setActiveTab] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  
  const { data, isLoading } = useJobs()
  const allJobs = data?.data || []

  const filtered = APPLICATIONS.filter((a) => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return !['rejected', 'withdrawn'].includes(a.status)
    return a.status === activeTab
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <FadeIn>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="size-6 text-info" /> My Applications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {APPLICATIONS.length} applications · Track your pipeline
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', count: APPLICATIONS.length, color: 'text-foreground' },
            { label: 'In Progress', count: APPLICATIONS.filter(a => !['rejected', 'withdrawn'].includes(a.status)).length, color: 'text-info' },
            { label: 'Interview', count: APPLICATIONS.filter(a => a.status === 'interview').length, color: 'text-success' },
            { label: 'Rejected', count: APPLICATIONS.filter(a => a.status === 'rejected').length, color: 'text-destructive' },
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
        ) : filtered.map((app) => {
          const job = allJobs.find(j => j.id === app.jobId)
          if (!job) return null
          const cfg = STATUS_CONFIG[app.status as AppStatus] ?? STATUS_CONFIG.applied
          const isExpanded = expanded === app.id

          return (
            <StaggerItem key={app.id}>
              <div
                className={cn(
                  'bg-card border border-border rounded-2xl overflow-hidden',
                  'transition-all duration-base hover:border-ring/30'
                )}
              >
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
                    <p className="text-xs text-muted-foreground">{job.company.name} · Applied {formatRelativeTime(app.appliedAt)}</p>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={cfg.badge} className="text-[10px]">
                      <cfg.icon className="size-3" /> {cfg.label}
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
                    className="border-t border-border px-5 pb-5 pt-4"
                  >
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Timeline</p>
                    <div className="space-y-3">
                      {[...app.timeline].reverse().map((event, i) => {
                        const eCfg = STATUS_CONFIG[event.status as AppStatus] ?? STATUS_CONFIG.applied
                        return (
                          <div key={i} className="flex items-start gap-3">
                            <div className={cn('size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5', eCfg.color.replace('text-', 'bg-').replace('muted-foreground', 'muted'), 'bg-opacity-15')}>
                              <eCfg.icon className={cn('size-3', eCfg.color)} />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-foreground">{eCfg.label}</p>
                              <p className="text-[11px] text-muted-foreground">{event.note}</p>
                              <p className="text-[10px] text-muted-foreground/60 mt-0.5">{formatRelativeTime(event.date)}</p>
                            </div>
                          </div>
                        )
                      })}
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
