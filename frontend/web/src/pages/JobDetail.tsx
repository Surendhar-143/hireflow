import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, MapPin, Clock, Users, ExternalLink, Bookmark, BookmarkCheck,
  Building2, Globe, CheckCircle2, Banknote, Briefcase, GraduationCap,
  Upload, X, Loader2, FileText, Check, AlertCircle
} from 'lucide-react'
import { cn, formatRelativeTime, formatSalary } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useSearchStore } from '@/store/search-store'
import { JobCard } from '@/features/jobs/JobCard'
import { AIMatchAnalysis } from '@/features/ai/AIMatchAnalysis'
import { useJob, useRelatedJobs, useMe, useCandidateApplications, useSubmitApplicationMutation } from '@/hooks/useQueries'
import { useSEO } from '@/hooks/useSEO'
import { Skeleton, SkeletonText, SkeletonCircle } from '@/components/ui/skeleton'
import { uploadApi } from '@/api/upload.api'
import { toast } from 'sonner'

const workModeLabel = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' }
const levelLabel = { entry: 'Entry Level', mid: 'Mid Level', senior: 'Senior', lead: 'Lead / Staff', executive: 'Executive' }

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toggleSaveJob, isJobSaved } = useSearchStore()
  
  const { data: job, isLoading } = useJob(id)

  // Auth & Profile queries
  const { data: me } = useMe()
  const candidateProfileId = me?.candidateProfile?.id
  const { data: applications = [] } = useCandidateApplications(candidateProfileId)

  // Check if already applied
  const hasApplied = applications.some((app) => app.jobId === job?.id)
  const userApplication = applications.find((app) => app.jobId === job?.id)

  // Dedicated related-jobs query — fetches by company + skills, not all jobs
  const { data: related = [] } = useRelatedJobs(
    job?.id,
    job?.company?.id,
    job?.skills
  )

  // Modal & Upload states
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [resumeName, setResumeName] = useState('')
  const [useProfileResume, setUseProfileResume] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const submitApplicationMutation = useSubmitApplicationMutation()

  useSEO({
    title: job ? `${job.title} at ${job.company.name}` : 'Job Details',
    description: job?.description?.slice(0, 160) || 'View job details on HireFlow.',
  })

  // Pre-fill profile resume if available
  useEffect(() => {
    if (me?.candidateProfile?.resumeUrl) {
      setResumeUrl(me.candidateProfile.resumeUrl)
      setResumeName('profile_resume.pdf')
      setUseProfileResume(true)
    }
  }, [me])

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

  const handleApplyClick = () => {
    if (!me) {
      toast.error('Authentication is required to apply')
      return
    }

    if (!me.onboardingCompleted) {
      toast.warning('Please complete candidate onboarding first')
      navigate('/app/onboarding')
      return
    }

    if (me.role !== 'candidate') {
      toast.error('Only candidates can submit job applications')
      return
    }

    setIsApplyModalOpen(true)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF format resumes are accepted')
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)
      const url = await uploadApi.uploadFile(file, 'resumes', (p) => {
        setUploadProgress(p)
      })
      setResumeUrl(url)
      setResumeName(file.name)
      setUseProfileResume(false)
      toast.success('Resume uploaded successfully!')
    } catch (err: any) {
      toast.error(err.message || 'File upload failed. Please try again.')
      setUploadProgress(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveResume = () => {
    setResumeUrl('')
    setResumeName('')
    setUseProfileResume(false)
    setUploadProgress(null)
  }

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!resumeUrl) {
      toast.error('Please upload or select a resume to continue')
      return
    }

    try {
      await submitApplicationMutation.mutateAsync({
        jobId: job.id,
        coverLetter: coverLetter.trim() || undefined,
        resumeUrl,
      })
      toast.success('Application submitted successfully!')
      setIsApplyModalOpen(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit application. Please try again.')
    }
  }

  // Get dynamic application CTA text
  const getCtaText = () => {
    if (me?.role === 'recruiter') return 'Recruiter View'
    if (hasApplied) {
      const statusLabel = userApplication?.status
        ? userApplication.status.charAt(0).toUpperCase() + userApplication.status.slice(1)
        : 'Applied'
      return `Applied (${statusLabel})`
    }
    return 'Apply Now'
  }

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
                <Button
                  variant={hasApplied ? 'outline' : 'premium'}
                  size="lg"
                  className="flex-1 sm:flex-none font-bold rounded-xl"
                  onClick={handleApplyClick}
                  disabled={hasApplied || me?.role === 'recruiter'}
                >
                  {hasApplied ? <Check className="size-4 mr-1.5" /> : null}
                  {getCtaText()}
                </Button>
                <Button
                  variant={saved ? 'secondary' : 'outline'}
                  size="lg"
                  className="rounded-xl"
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
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
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

      {/* Apply Modal */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsApplyModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden"
            >
              {/* Top border decoration */}
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-brand-600 via-brand-400 to-indigo-500" />
              
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="absolute right-5 top-5 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
              >
                <X className="size-4" />
              </button>

              <div className="space-y-1 mb-6 pr-6">
                <h2 className="text-xl font-bold text-foreground">Apply to {job.title}</h2>
                <p className="text-xs text-muted-foreground">at {job.company.name} · Direct SaaS matching</p>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-5">
                {/* Resume section */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Resume Document <span className="text-destructive">*</span>
                  </label>

                  {resumeUrl ? (
                    <div className="flex items-center justify-between gap-3 p-3 bg-brand-500/5 border border-brand-500/20 rounded-xl">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-9 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
                          <FileText className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{resumeName}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {useProfileResume ? 'Using Profile Resume' : 'Uploaded Resume (PDF)'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveResume}
                        className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors shrink-0"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative group flex flex-col items-center justify-center border border-dashed border-border/80 hover:border-brand-500/50 hover:bg-brand-500/[0.01] rounded-2xl p-6 text-center cursor-pointer transition-all duration-base">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="size-10 rounded-full bg-accent/40 text-muted-foreground group-hover:text-brand-400 group-hover:bg-brand-500/10 flex items-center justify-center transition-colors">
                        {isUploading ? (
                          <Loader2 className="size-5 animate-spin text-brand-400" />
                        ) : (
                          <Upload className="size-5" />
                        )}
                      </div>
                      <div className="mt-3">
                        <p className="text-xs font-bold text-foreground">
                          {isUploading ? 'Uploading your resume...' : 'Upload PDF resume'}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Drag and drop or click to browse (Max 5MB)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Progress bar */}
                  {isUploading && uploadProgress !== null && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 transition-all duration-fast"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Cover letter section */}
                <div className="space-y-1.5">
                  <label htmlFor="coverLetter" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Cover Letter <span className="text-muted-foreground/50">(Optional)</span>
                  </label>
                  <textarea
                    id="coverLetter"
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Briefly pitch why you are a great fit for this position..."
                    className="w-full bg-accent/40 border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-ring/40 outline-none transition-colors resize-none"
                  />
                </div>

                {/* Info Alert */}
                <div className="flex gap-2 p-3 bg-accent/20 border border-border/50 rounded-xl text-[11px] text-muted-foreground">
                  <AlertCircle className="size-4 text-brand-400 shrink-0 mt-0.5" />
                  <span>
                    Submitting automatically shares your core tech stack, location, and experiences with {job.company.name}.
                  </span>
                </div>

                {/* Footer buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border mt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="rounded-xl text-xs px-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="premium"
                    disabled={submitApplicationMutation.isPending || isUploading || !resumeUrl}
                    className="rounded-xl font-bold text-xs px-5 py-2 flex items-center gap-1.5"
                  >
                    {submitApplicationMutation.isPending ? (
                      <>
                        Submitting... <Loader2 className="size-3.5 animate-spin" />
                      </>
                    ) : (
                      <>
                        Submit Application <Check className="size-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

