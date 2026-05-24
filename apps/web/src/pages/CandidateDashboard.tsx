import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Briefcase, Bookmark, FileText, Sparkles, TrendingUp,
  ArrowRight, Bell, ChevronRight, CheckCircle2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SkeletonJobCard, Skeleton, SkeletonCircle } from '@/components/ui/skeleton'
import { Stagger, StaggerItem, FadeIn } from '@/components/motion'
import { JobCard } from '@/features/jobs/JobCard'
import { useSearchStore } from '@/store/search-store'
import { useCandidateDashboard, useJobs } from '@/hooks/useQueries'
import { cn } from '@/lib/utils'

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, sub, trend, color = 'brand',
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  trend?: string
  color?: 'brand' | 'success' | 'info' | 'warning'
}) {
  const colorMap = {
    brand: 'text-brand-400 bg-brand-500/10',
    success: 'text-success bg-success/10',
    info: 'text-info bg-info/10',
    warning: 'text-warning bg-warning/10',
  }
  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:border-ring/40 transition-colors duration-base">
      <div className="flex items-start justify-between gap-2">
        <div className={cn('flex items-center justify-center size-9 rounded-xl', colorMap[color])}>
          <Icon className="size-5" />
        </div>
        {trend && (
          <span className="flex items-center gap-0.5 text-[11px] font-medium text-success">
            <TrendingUp className="size-3" /> {trend}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
        {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Application status row ───────────────────────────────────────────────────
const MOCK_APPLICATIONS = [
  { id: '1', title: 'Senior Frontend Engineer', company: 'Vercel', status: 'interview', statusLabel: 'Interview Scheduled', date: '2024-05-20' },
  { id: '2', title: 'Product Designer', company: 'Linear', status: 'review', statusLabel: 'Under Review', date: '2024-05-18' },
  { id: '3', title: 'Design Engineer', company: 'Figma', status: 'applied', statusLabel: 'Applied', date: '2024-05-15' },
]

const statusColor = {
  interview: 'text-success bg-success/10 border-success/30',
  review: 'text-warning bg-warning/10 border-warning/30',
  applied: 'text-muted-foreground bg-muted border-border',
  rejected: 'text-destructive bg-destructive/10 border-destructive/30',
  offer: 'text-brand-400 bg-brand-500/10 border-brand-500/30',
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function CandidateDashboard() {
  const { savedJobs } = useSearchStore()
  
  const { data: stats, isLoading: statsLoading } = useCandidateDashboard()
  const { data: jobsData, isLoading: jobsLoading } = useJobs()
  
  const allJobs = jobsData?.data || []
  const savedJobObjects = allJobs.filter((j) => savedJobs.includes(j.id))
  
  const aiMatches = stats?.aiMatches || []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome */}
      <FadeIn>
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Good evening, Alex 👋
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              You have <span className="text-foreground font-medium">3 new AI matches</span> and{' '}
              <span className="text-foreground font-medium">1 interview</span> this week.
            </p>
          </div>
          <Link to="/jobs">
            <Button variant="premium" size="sm">
              <Sparkles className="size-3.5" /> Find More Roles
            </Button>
          </Link>
        </div>
      </FadeIn>

      {/* Stats */}
      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StaggerItem>
          {statsLoading ? <Skeleton className="h-[104px] rounded-2xl" /> : (
            <StatCard icon={Sparkles} label="AI Matches" value={stats?.aiMatches.length || 0} sub="3 new this week" trend="+3" color="brand" />
          )}
        </StaggerItem>
        <StaggerItem>
          {statsLoading ? <Skeleton className="h-[104px] rounded-2xl" /> : (
            <StatCard icon={FileText} label="Applications" value={stats?.applicationsCount || 0} sub="2 in review" color="info" />
          )}
        </StaggerItem>
        <StaggerItem>
          {statsLoading ? <Skeleton className="h-[104px] rounded-2xl" /> : (
            <StatCard icon={Bookmark} label="Saved Jobs" value={savedJobs.length} color="warning" />
          )}
        </StaggerItem>
        <StaggerItem>
          {statsLoading ? <Skeleton className="h-[104px] rounded-2xl" /> : (
            <StatCard icon={Briefcase} label="Profile Views" value={stats?.profileViews || 0} sub="Last 30 days" trend="+12%" color="success" />
          )}
        </StaggerItem>
      </Stagger>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Top AI matches */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Matches */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="size-4 text-brand-400" /> Top AI Matches
              </h2>
              <Link to="/jobs" className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                View all <ArrowRight className="size-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {statsLoading ? (
                <>
                  <SkeletonJobCard />
                  <SkeletonJobCard />
                </>
              ) : (
                aiMatches.slice(0, 3).map((job, i) => <JobCard key={job.id} job={job} index={i} />)
              )}
            </div>
          </section>

          {/* Saved Jobs preview */}
          {savedJobObjects.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Bookmark className="size-4 text-warning" /> Saved Jobs
                </h2>
                <Link to="/app/saved" className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                  View all <ArrowRight className="size-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {jobsLoading ? (
                  <>
                    <SkeletonJobCard />
                  </>
                ) : (
                  savedJobObjects.slice(0, 2).map((job, i) => <JobCard key={job.id} job={job} index={i} />)
                )}
              </div>
            </section>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Application status */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" /> Applications
              </h3>
              <Link to="/app/applications" className="text-xs text-primary hover:text-primary/80 transition-colors">
                View all
              </Link>
            </div>
            <div className="space-y-2.5">
              {MOCK_APPLICATIONS.map((app) => (
                <div key={app.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="size-8 rounded-lg bg-muted border border-border flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                    {app.company[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{app.title}</p>
                    <p className="text-[11px] text-muted-foreground">{app.company}</p>
                  </div>
                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0', statusColor[app.status as keyof typeof statusColor])}>
                    {app.statusLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Profile completion */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Profile Strength</h3>
            <p className="text-xs text-muted-foreground mb-3">Complete your profile for better matches</p>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '72%' }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0, 0, 0.2, 1] }}
                />
              </div>
              <span className="text-xs font-semibold text-foreground shrink-0">72%</span>
            </div>
            <div className="space-y-1.5">
              {[
                { done: true, label: 'Basic info' },
                { done: true, label: 'Work experience' },
                { done: false, label: 'Add skills' },
                { done: false, label: 'Upload resume' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className={cn('size-3.5 shrink-0', item.done ? 'text-success' : 'text-muted-foreground/40')} />
                  <span className={item.done ? 'text-muted-foreground line-through' : 'text-foreground'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Bell className="size-4 text-muted-foreground" /> Recent Activity
            </h3>
            <div className="space-y-3 text-xs text-muted-foreground">
              {[
                { text: 'Vercel viewed your profile', time: '2h ago' },
                { text: 'New AI match: Figma Design Engineer', time: '5h ago' },
                { text: 'Application updated: Linear', time: '1d ago' },
              ].map((notif, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <p className="text-foreground text-xs leading-snug">{notif.text}</p>
                  <span className="text-muted-foreground/60 shrink-0 text-[11px]">{notif.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
