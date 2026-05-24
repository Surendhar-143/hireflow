import React from 'react'
import { Link } from 'react-router-dom'
import {
  PlusCircle, Users, BarChart3, Briefcase, TrendingUp,
  Eye, Clock, CheckCircle2, XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Stagger, StaggerItem, FadeIn } from '@/components/motion'
import { useRecruiterDashboard } from '@/hooks/useQueries'
import { cn } from '@/lib/utils'

// Mock recruiter stats
const RECRUITER_STATS = [
  { icon: Briefcase, label: 'Active Jobs', value: '3', color: 'text-brand-400 bg-brand-500/10' },
  { icon: Users, label: 'Total Applicants', value: '342', trend: '+12%', color: 'text-info bg-info/10' },
  { icon: Eye, label: 'Profile Views', value: '1.4K', trend: '+8%', color: 'text-warning bg-warning/10' },
  { icon: CheckCircle2, label: 'Hired', value: '7', trend: '+2', color: 'text-success bg-success/10' },
]

const APP_PIPELINE = [
  { stage: 'Applied', count: 142, color: 'bg-muted' },
  { stage: 'Screening', count: 38, color: 'bg-info/60' },
  { stage: 'Interview', count: 14, color: 'bg-brand-500/60' },
  { stage: 'Offer', count: 3, color: 'bg-success/60' },
]
const totalPipeline = APP_PIPELINE.reduce((sum, s) => sum + s.count, 0)

export default function RecruiterDashboard() {
  const { data: stats, isLoading } = useRecruiterDashboard('c3')
  const postedJobs = stats?.activeJobs.slice(0, 3) || []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <FadeIn>
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Recruiter Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">Stripe · 3 active postings</p>
          </div>
          <Button variant="premium" size="sm">
            <PlusCircle className="size-4" /> Post a Job
          </Button>
        </div>
      </FadeIn>

      {/* Stats */}
      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {RECRUITER_STATS.map((s, i) => (
          <StaggerItem key={s.label}>
            {isLoading ? (
              <Skeleton className="h-[104px] rounded-2xl" />
            ) : (
              <div className="bg-card border border-border rounded-2xl p-5 hover:border-ring/40 transition-colors">
                <div className={cn('flex items-center justify-center size-9 rounded-xl mb-3', s.color)}>
                  <s.icon className="size-4" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {i === 0 ? stats?.activeJobs.length : i === 1 ? stats?.totalApplicants : s.value}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  {s.trend && <span className="text-[11px] text-success font-medium flex items-center gap-0.5"><TrendingUp className="size-3" />{s.trend}</span>}
                </div>
              </div>
            )}
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Posted jobs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Active Job Postings</h2>
            <Button variant="ghost" size="sm">View all</Button>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-[104px] rounded-2xl" />
                <Skeleton className="h-[104px] rounded-2xl" />
                <Skeleton className="h-[104px] rounded-2xl" />
              </>
            ) : (
              postedJobs.map((job) => (
                <div key={job.id} className="bg-card border border-border rounded-2xl p-4 hover:border-ring/30 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{job.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                        <span>{job.applicantCount} applicants</span>
                        <span className="text-muted-foreground/40">·</span>
                        <span>{job.viewCount.toLocaleString()} views</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="success" dot className="text-[10px]">Active</Badge>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </div>
                  {/* Mini pipeline bar */}
                  <div className="mt-3 flex gap-1 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-muted flex-[5] rounded-full" title="Applied" />
                    <div className="bg-info/60 flex-[2] rounded-full" title="Screening" />
                    <div className="bg-brand-500/70 flex-[1] rounded-full" title="Interview" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Applicant pipeline */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="size-4 text-muted-foreground" /> Applicant Pipeline
            </h3>
            <div className="space-y-3">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                APP_PIPELINE.map((stage) => {
                  const pct = Math.round((stage.count / totalPipeline) * 100)
                  return (
                    <div key={stage.stage}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{stage.stage}</span>
                        <span className="font-medium text-foreground">{stage.count}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', stage.color)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-foreground mb-2">Quick Actions</h3>
            {[
              { label: 'Review 14 new applications', icon: Users, urgent: true },
              { label: '2 interviews scheduled today', icon: CheckCircle2, urgent: true },
              { label: 'Update job descriptions', icon: Briefcase, urgent: false },
            ].map((action) => (
              <button key={action.label} className="w-full flex items-center gap-2.5 text-left px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors group">
                <action.icon className={cn('size-4 shrink-0', action.urgent ? 'text-brand-400' : 'text-muted-foreground')} />
                <span className="text-xs text-foreground group-hover:text-foreground">{action.label}</span>
                {action.urgent && <span className="ml-auto size-1.5 rounded-full bg-brand-500 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
