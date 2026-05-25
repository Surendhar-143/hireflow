import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProfileEditModal from '@/components/shared/ProfileEditModal'
import {
  Briefcase, Bookmark, FileText, Sparkles, TrendingUp,
  ArrowRight, Bell, ChevronRight, CheckCircle2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SkeletonJobCard, Skeleton, SkeletonCircle } from '@/components/ui/skeleton'
import { Stagger, StaggerItem, FadeIn } from '@/components/motion'
import { JobCard } from '@/features/jobs/JobCard'
import { useCandidateDashboard, useJobs, useMe, useCandidateApplications, useSavedJobs, useAIMatchRecommendations } from '@/hooks/useQueries'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { JobDTO, ApplicationStatus } from '@hireflow/types'

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

const statusColor: Record<ApplicationStatus, string> = {
  interview: 'text-success bg-success/10 border-success/30',
  screening: 'text-info bg-info/10 border-info/30',
  applied: 'text-muted-foreground bg-muted border-border',
  rejected: 'text-destructive bg-destructive/10 border-destructive/30',
  offer: 'text-brand-400 bg-brand-500/10 border-brand-500/30',
  withdrawn: 'text-muted-foreground bg-muted border-border',
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function CandidateDashboard() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  // Real User Context
  const { data: me } = useMe()
  const candidateProfileId = me?.candidateProfile?.id

  const { data: stats, isLoading: statsLoading } = useCandidateDashboard()
  const { data: savedJobRelations = [] } = useSavedJobs()
  const { data: applications = [] } = useCandidateApplications(candidateProfileId)
  const { data: aiMatchesData, isLoading: aiLoading } = useAIMatchRecommendations(candidateProfileId, !!candidateProfileId)
  
  const savedJobObjects = savedJobRelations.map((sr) => sr.job)
  const aiMatches = aiMatchesData || []


  // Dynamic Profile Completion Score calculation
  const hasBasicInfo = !!me?.onboardingCompleted
  const hasExperience = me?.candidateProfile?.experience && (me.candidateProfile.experience as any[]).length > 0
  const hasSkills = me?.candidateProfile?.skills && me.candidateProfile.skills.length > 0
  const hasResume = !!me?.candidateProfile?.resumeUrl

  const profileSteps = [
    { done: hasBasicInfo, label: 'Basic profile setup' },
    { done: hasExperience, label: 'Work experience history' },
    { done: hasSkills, label: 'Add skills list' },
    { done: hasResume, label: 'Upload PDF resume' },
  ]

  const completionPercentage = Math.round(
    (profileSteps.filter(s => s.done).length / profileSteps.length) * 100
  )

  const activeApplications = applications.filter(a => !['rejected', 'withdrawn'].includes(a.status))

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome */}
      <FadeIn>
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {me?.name?.split(' ')[0] || 'Candidate'} 👋
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {aiMatches.length > 0 ? (
                <>
                  You have <span className="text-foreground font-medium">{aiMatches.length} AI matched roles</span> customized to your tech stack.
                </>
              ) : (
                'Discover roles that match your skills and experience perfectly.'
              )}
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
          {statsLoading || aiLoading ? <Skeleton className="h-[104px] rounded-2xl" /> : (
            <StatCard icon={Sparkles} label="AI Matches" value={aiMatches.length} sub={`${aiMatches.slice(0, 3).length} recommended`} trend={aiMatches.length > 0 ? `+${aiMatches.length}` : undefined} color="brand" />
          )}
        </StaggerItem>
        <StaggerItem>
          {statsLoading ? <Skeleton className="h-[104px] rounded-2xl" /> : (
            <StatCard icon={FileText} label="Applications" value={applications.length} sub={`${activeApplications.length} active`} color="info" />
          )}
        </StaggerItem>
        <StaggerItem>
          {statsLoading ? <Skeleton className="h-[104px] rounded-2xl" /> : (
            <StatCard icon={Bookmark} label="Saved Jobs" value={savedJobObjects.length} color="warning" />
          )}
        </StaggerItem>
        <StaggerItem>
          {statsLoading ? <Skeleton className="h-[104px] rounded-2xl" /> : (
            <StatCard icon={Briefcase} label="Profile Strength" value={`${completionPercentage}%`} sub={completionPercentage === 100 ? 'Fully Optimized' : 'Needs Updates'} color="success" />
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
              {statsLoading || aiLoading ? (
                <>
                  <SkeletonJobCard />
                  <SkeletonJobCard />
                </>
              ) : aiMatches.length === 0 ? (
                <div className="text-center py-8 rounded-2xl border border-dashed border-border/80 text-muted-foreground text-xs bg-card">
                  No direct AI match analysis loaded. Complete your profile onboarding to generate matches!
                </div>
              ) : (
                aiMatches.slice(0, 3).map((job: JobDTO, i: number) => <JobCard key={job.id} job={job} index={i} />)
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
                {statsLoading ? (
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
              {applications.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No active applications. Let&apos;s find a job!
                </div>
              ) : (
                applications.slice(0, 3).map((app) => {
                  const job = app.job
                  if (!job) return null
                  const statusLabel = app.status.charAt(0).toUpperCase() + app.status.slice(1)
                  return (
                    <Link
                      key={app.id}
                      to="/app/applications"
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors cursor-pointer block"
                    >
                      <div className="size-8 rounded-lg bg-muted border border-border flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0 overflow-hidden">
                        {job.company.logo ? (
                          <img src={job.company.logo} alt={job.company.name} className="size-full object-cover" />
                        ) : (
                          job.company.name[0]
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{job.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{job.company.name}</p>
                      </div>
                      <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0', statusColor[app.status])}>
                        {statusLabel}
                      </span>
                    </Link>
                  )
                })
              )}
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
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0, 0, 0.2, 1] }}
                />
              </div>
              <span className="text-xs font-semibold text-foreground shrink-0">{completionPercentage}%</span>
            </div>
            <div className="space-y-1.5">
              {profileSteps.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className={cn('size-3.5 shrink-0', item.done ? 'text-success' : 'text-muted-foreground/40')} />
                  <span className={item.done ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4 text-[11px] font-bold rounded-xl hover:border-brand-500/30 hover:bg-brand-500/5 transition-colors"
              onClick={() => setIsProfileModalOpen(true)}
            >
              Update Profile Details
            </Button>

          </div>

          {/* Notifications */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Bell className="size-4 text-muted-foreground" /> Recent Activity
            </h3>
            <div className="space-y-3 text-xs text-muted-foreground">
              {applications.length > 0 ? (
                applications.slice(0, 3).map((app, index) => (
                  <div key={index} className="flex items-start justify-between gap-2">
                    <p className="text-foreground text-xs leading-snug">
                      Your application status for <span className="font-semibold">{app.job.title}</span> is <span className="font-semibold">{app.status}</span>.
                    </p>
                    <span className="text-muted-foreground/60 shrink-0 text-[11px]">
                      {formatRelativeTime(app.updatedAt)}
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-foreground text-xs leading-snug">Welcome to HireFlow! Start searching for positions.</p>
                    <span className="text-muted-foreground/60 shrink-0 text-[11px]">Now</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={me}
      />
    </div>
  )
}

