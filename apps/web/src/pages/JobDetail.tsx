import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MapPin, Clock, Users, ExternalLink, Bookmark, BookmarkCheck,
  Building2, Globe, CheckCircle2, Banknote, Briefcase, GraduationCap,
} from 'lucide-react'
import { cn, formatRelativeTime, formatSalary } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useSearchStore } from '@/store/search-store'
import { JobCard } from '@/features/jobs/JobCard'
import { AIMatchAnalysis } from '@/features/ai/AIMatchAnalysis'
import { useJob, useJobs } from '@/hooks/useQueries'
import { useSEO } from '@/hooks/useSEO'
import { Skeleton, SkeletonText, SkeletonCircle } from '@/components/ui/skeleton'

const workModeLabel = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' }
const levelLabel = { entry: 'Entry Level', mid: 'Mid Level', senior: 'Senior', lead: 'Lead / Staff', executive: 'Executive' }

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toggleSaveJob, isJobSaved } = useSearchStore()
  
  const { data: job, isLoading } = useJob(id)
  
  // Fetch related jobs
  const { data: allJobsData } = useJobs()
  const related = allJobsData?.data.filter((j) => j.id !== id && j.companyId === job?.companyId).slice(0, 2) || []

  useSEO({
    title: job ? `${job.title} at ${job.company.name}` : 'Job Details',
    description: job?.description?.slice(0, 160) || 'View job details on HireFlow.',
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-8 w-24 mb-5" />
          <div className="flex gap-6 items-start">
            <div className="flex-1 space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex gap-4 items-start">
                  <SkeletonCircle size="xl" className="rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
                <div className="mt-5 flex gap-4">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <SkeletonText lines={4} />
              </div>
            </div>
            <div className="hidden lg:block w-64 shrink-0 space-y-4">
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Briefcase className="size-7" />}
          title="Job not found"
          description="This role may have been removed or the link is incorrect."
          action={{ label: 'Browse jobs', onClick: () => navigate('/jobs') }}
        />
      </div>
    )
  }

  const saved = isJobSaved(job.id)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Back */}
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-5 -ml-2">
            <ArrowLeft className="size-4" /> Back to jobs
          </Button>
        </motion.div>

        <div className="flex gap-6 items-start">
          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 min-w-0 space-y-6"
          >
            {/* Header card */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="size-14 rounded-xl border border-border overflow-hidden shrink-0 bg-muted">
                  {job.company.logo ? (
                    <img src={job.company.logo} alt={job.company.name} width={56} height={56} className="size-full object-cover" loading="lazy" />
                  ) : (
                    <div className="size-full flex items-center justify-center">
                      <Building2 className="size-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-foreground leading-tight">{job.title}</h1>
                  <Link
                    to={`/companies/${job.company.slug}`}
                    className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 mt-1"
                  >
                    {job.company.name}
                    {job.company.verified && <CheckCircle2 className="size-3.5 text-info" />}
                  </Link>
                </div>
              </div>

              {/* Meta row */}
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 shrink-0" /> {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5 shrink-0" /> Posted {formatRelativeTime(job.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5 shrink-0" /> {job.applicantCount} applicants
                </span>
                {job.salary && (
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Banknote className="size-3.5 shrink-0" />
                    {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                  </span>
                )}
              </div>

              {/* Badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary">{workModeLabel[job.workMode]}</Badge>
                <Badge variant="outline">{job.type}</Badge>
                <Badge variant="outline">{levelLabel[job.experienceLevel]}</Badge>
                {job.featured && <Badge variant="premium">Featured</Badge>}
              </div>

              {/* Skills */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {job.skills.map((skill) => (
                  <span key={skill} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-accent/70 text-accent-foreground border border-border/50">
                    {skill}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-5 flex gap-2">
                <Button variant="premium" size="lg" className="flex-1 sm:flex-none">
                  Apply Now
                </Button>
                <Button
                  variant={saved ? 'secondary' : 'outline'}
                  size="lg"
                  onClick={() => toggleSaveJob(job.id)}
                >
                  {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
                  {saved ? 'Saved' : 'Save'}
                </Button>
              </div>
            </div>

            {/* AI Match Analysis */}
            <AIMatchAnalysis job={job} />

            {/* Description */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">About this role</h2>
              <p className="text-muted-foreground leading-relaxed">{job.description}</p>
            </div>

            {/* Requirements */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <GraduationCap className="size-5 text-muted-foreground" /> Requirements
              </h2>
              <ul className="space-y-2.5">
                {job.requirements.map((req) => (
                  <li key={req} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            {job.benefits.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Benefits & Perks</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {job.benefits.map((b) => (
                    <div key={b} className="flex items-center gap-2 text-sm text-muted-foreground p-2.5 rounded-lg bg-accent/30 border border-border/50">
                      <span className="text-success shrink-0">✓</span> {b}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related jobs */}
            {related.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-foreground mb-3">More from {job.company.name}</h2>
                <div className="space-y-3">
                  {related.map((j, i) => <JobCard key={j.id} job={j} index={i} />)}
                </div>
              </div>
            )}
          </motion.div>

          {/* Sticky sidebar (desktop) */}
          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="hidden lg:block w-64 shrink-0 sticky top-[calc(56px+24px)] space-y-4"
          >
            {/* Company card */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">About the company</h3>
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-lg border border-border overflow-hidden bg-muted shrink-0">
                  {job.company.logo && <img src={job.company.logo} alt={job.company.name} className="size-full object-cover" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{job.company.name}</p>
                  <p className="text-xs text-muted-foreground">{job.company.industry}</p>
                </div>
              </div>
              <Link
                to={`/companies/${job.company.slug}`}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <Globe className="size-3" /> View company profile
              </Link>
            </div>

            {/* Share/Report */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
                <ExternalLink className="size-3.5" /> Share this job
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
                Report listing
              </Button>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  )
}
