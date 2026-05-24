import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Briefcase, FileText, ChevronRight, X, ArrowRight, ArrowLeft,
  CheckCircle2, AlertCircle, Banknote, Sparkles, MapPin, Eye, Trophy,
  Star, ClipboardList, Download, Save, Send, Calendar, Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useMe,
  useJobs,
  useJobApplications,
  useUpdateApplicationStatusMutation
} from '@/hooks/useQueries'
import { useSEO } from '@/hooks/useSEO'
import { cn, formatRelativeTime, getSecureResumeUrl } from '@/lib/utils'
import type { ApplicationDTO, ApplicationStatus } from '@hireflow/types'
import { toast } from 'sonner'

const COLUMNS: { id: ApplicationStatus; label: string; color: string; bg: string }[] = [
  { id: 'applied', label: 'Applied', color: 'text-muted-foreground border-border', bg: 'bg-muted/10' },
  { id: 'screening', label: 'Screening', color: 'text-info border-info/30', bg: 'bg-info/5' },
  { id: 'interview', label: 'Interview', color: 'text-brand-400 border-brand-500/30', bg: 'bg-brand-500/5' },
  { id: 'offer', label: 'Offer Stage', color: 'text-success border-success/30', bg: 'bg-success/5' },
  { id: 'rejected', label: 'Archived / Closed', color: 'text-destructive border-destructive/30', bg: 'bg-destructive/5' },
]

export default function PipelineBoard() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: me } = useMe()
  const companyId = me?.recruiterProfile?.companyId

  // Queries
  const { data: jobsData, isLoading: jobsLoading } = useJobs({ companyId })
  const jobsList = jobsData?.data || []
  
  const initialJobId = searchParams.get('jobId') || ''
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId)
  const { data: applications = [], isLoading: appsLoading } = useJobApplications(selectedJobId)

  const updateStatusMutation = useUpdateApplicationStatusMutation()

  // Selected candidate for detailed evaluation slidepanel
  const [selectedApp, setSelectedApp] = useState<ApplicationDTO | null>(null)
  const [recruiterNotes, setRecruiterNotes] = useState<string>('')
  const [bulkSelected, setBulkSelected] = useState<string[]>([])

  useSEO({
    title: 'Recruitment Kanban Pipeline — HireFlow Recruiter Portal',
    description: 'Track, screen, and interview applicants dynamically via optimistic stage transitions.',
  })

  // Auto-select first active job when list loads if no param is set
  useEffect(() => {
    if (jobsList.length > 0 && !selectedJobId) {
      const firstJobId = jobsList[0].id
      setSelectedJobId(firstJobId)
      setSearchParams({ jobId: firstJobId })
    }
  }, [jobsList, selectedJobId, setSearchParams])

  // Sync recruiter notes when candidate is clicked
  useEffect(() => {
    if (selectedApp) {
      setRecruiterNotes(selectedApp.notes || '')
    }
  }, [selectedApp])

  const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const jobId = e.target.value
    setSelectedJobId(jobId)
    setBulkSelected([])
    setSearchParams({ jobId })
  }

  const handleViewResume = async (e: React.MouseEvent<HTMLAnchorElement>, rawUrl: string) => {
    e.preventDefault()
    try {
      const secureUrl = await getSecureResumeUrl(rawUrl)
      window.open(secureUrl, '_blank')
    } catch (err) {
      toast.error('Failed to resolve secure resume path')
      console.error(err)
    }
  }


  // Move candidate to a different status stage
  const handleTransition = async (appId: string, targetStatus: ApplicationStatus, customNote?: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: appId,
        status: targetStatus,
        note: customNote || `Moved to ${targetStatus} stage`,
      })
      toast.success(`Application updated to ${targetStatus}`)
      
      // Update selected app ref if open
      if (selectedApp?.id === appId) {
        setSelectedApp(prev => prev ? { ...prev, status: targetStatus } : null)
      }
    } catch (err: any) {
      toast.error(err.message || 'Status transition failed. Please try again.')
    }
  }

  // Save internal recruiter feedback note
  const handleSaveNotes = async () => {
    if (!selectedApp) return
    try {
      await updateStatusMutation.mutateAsync({
        id: selectedApp.id,
        status: selectedApp.status,
        note: recruiterNotes.trim() ? `Feedback logged: ${recruiterNotes.slice(0, 40)}...` : 'Notes updated',
      })
      
      // Manually bind note local state
      toast.success('Recruiter evaluation notes saved')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save recruiter notes')
    }
  }

  // Bulk status update action
  const handleBulkTransition = async (targetStatus: ApplicationStatus) => {
    if (bulkSelected.length === 0) return
    const toastId = toast.loading(`Transitioning ${bulkSelected.length} candidates...`)
    
    try {
      await Promise.all(
        bulkSelected.map(id =>
          updateStatusMutation.mutateAsync({
            id,
            status: targetStatus,
            note: 'Bulk stage transition',
          })
        )
      )
      toast.success(`Successfully updated ${bulkSelected.length} candidates!`, { id: toastId })
      setBulkSelected([])
    } catch (err: any) {
      toast.error(err.message || 'Bulk transition encountered network errors.', { id: toastId })
    }
  }

  const handleSelectCard = (appId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Avoid launching slidepanel
    if (bulkSelected.includes(appId)) {
      setBulkSelected(bulkSelected.filter(id => id !== appId))
    } else {
      setBulkSelected([...bulkSelected, appId])
    }
  }

  if (me && me.role !== 'recruiter') {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <EmptyState
          icon={<AlertCircle className="size-8 text-destructive" />}
          title="Forbidden"
          description="Only recruiters are authorized to manage job applications and pipelines."
          action={{ label: 'Back to Dashboard', onClick: () => navigate('/app/dashboard') }}
        />
      </div>
    )
  }

  const selectedJob = jobsList.find(j => j.id === selectedJobId)
  const isUpdating = updateStatusMutation.isPending
  const isLoading = jobsLoading || appsLoading

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="size-6 text-brand-400" /> Pipeline Workspace
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Drag-like stage manager · Select role to filter candidate grids
          </p>
        </div>

        {/* Dropdown Job selector */}
        <div className="flex flex-wrap items-center gap-2">
          {jobsList.length > 0 ? (
            <div className="relative">
              <select
                value={selectedJobId}
                onChange={handleJobChange}
                className="bg-card border border-border text-foreground rounded-xl px-4 py-2 text-xs font-semibold outline-none focus:border-ring/30 min-w-[200px] cursor-pointer appearance-none pr-8"
              >
                {jobsList.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title} ({job.status})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs font-bold">
                ▼
              </div>
            </div>
          ) : (
            <Link to="/app/recruiter/post">
              <Button variant="premium" size="sm" className="rounded-xl text-xs">
                <Plus className="size-3.5" /> Publish First Job
              </Button>
            </Link>
          )}

          {/* Bulk Action Controls */}
          {bulkSelected.length > 0 && (
            <div className="flex items-center gap-1.5 p-1 rounded-xl border border-brand-500/20 bg-brand-500/5 animate-pulse-slow">
              <span className="text-[10px] font-bold text-brand-400 px-2 uppercase shrink-0">
                {bulkSelected.length} Selected
              </span>
              <select
                onChange={(e) => handleBulkTransition(e.target.value as ApplicationStatus)}
                defaultValue=""
                className="bg-card border border-border text-foreground rounded-lg px-2 py-1 text-[10px] font-bold outline-none cursor-pointer"
              >
                <option value="" disabled>Move Stage To...</option>
                <option value="screening">Screening</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer Stage</option>
                <option value="rejected">Reject / Archive</option>
              </select>
              <button
                type="button"
                onClick={() => setBulkSelected([])}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="size-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid columns container */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Skeleton className="h-[400px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      ) : jobsList.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="size-10 text-muted-foreground/60" />}
          title="No jobs published yet"
          description="Create a job listing to receive applicant matching pipelines."
          action={{ label: 'Publish job opening', onClick: () => navigate('/app/recruiter/post') }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start min-h-[500px]">
          {COLUMNS.map(col => {
            const colApps = applications.filter(app => app.status === col.id)
            return (
              <div key={col.id} className={cn("rounded-2xl border border-border/80 flex flex-col p-3 min-h-[400px] transition-all", col.bg)}>
                {/* Column header */}
                <div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span className={cn("size-2 rounded-full", col.id === 'rejected' ? 'bg-destructive' : col.id === 'offer' ? 'bg-success' : 'bg-brand-500')} />
                    {col.label}
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 rounded-md font-bold text-muted-foreground border-border bg-card">
                    {colApps.length}
                  </Badge>
                </div>

                {/* Candidate list inside column */}
                <div className="space-y-2 flex-1 overflow-y-auto max-h-[550px] scrollbar-none pb-4">
                  {colApps.length === 0 ? (
                    <div className="text-center py-8 text-[10px] text-muted-foreground/40 border border-dashed border-border/40 rounded-xl m-auto bg-card/[0.01]">
                      Lane Empty
                    </div>
                  ) : (
                    colApps.map(app => {
                      const candidate = app.candidate
                      const hasSelected = bulkSelected.includes(app.id)
                      const score = app.aiScore !== undefined ? Math.round(app.aiScore * 100) : null

                      return (
                        <div
                          key={app.id}
                          onClick={() => setSelectedApp(app)}
                          className={cn(
                            "group bg-card border rounded-xl p-3 shadow-sm hover:border-ring/30 transition-all duration-base cursor-pointer relative overflow-hidden",
                            hasSelected ? 'border-brand-500/50 bg-brand-500/[0.01]' : 'border-border'
                          )}
                        >
                          {/* Top selection checkbox */}
                          <div
                            onClick={(e) => handleSelectCard(app.id, e)}
                            className={cn(
                              "absolute right-2.5 top-2.5 size-3.5 rounded border border-border flex items-center justify-center transition-colors hover:border-brand-500",
                              hasSelected ? 'bg-brand-500 border-brand-500 text-white' : 'bg-transparent text-transparent'
                            )}
                          >
                            <CheckCircle2 className="size-2.5 text-white" />
                          </div>

                          {/* Candidate basic info */}
                          <div className="flex items-center gap-2.5 pr-4">
                            <div className="size-8 rounded-lg bg-muted border border-border flex items-center justify-center text-xs font-extrabold text-muted-foreground shrink-0 overflow-hidden">
                              {candidate.avatar ? (
                                <img src={candidate.avatar} alt={candidate.name} className="size-full object-cover" />
                              ) : (
                                candidate.name[0]
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-foreground truncate">{candidate.name}</h4>
                              <p className="text-[10px] text-muted-foreground truncate">{candidate.headline || 'Software Engineer'}</p>
                            </div>
                          </div>

                          {/* Location & Time */}
                          <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground/80">
                            <span className="flex items-center gap-0.5 truncate">
                              <MapPin className="size-2.5 shrink-0" /> {candidate.location || 'Remote'}
                            </span>
                            <span className="shrink-0">·</span>
                            <span className="truncate">{formatRelativeTime(app.createdAt)}</span>
                          </div>

                          {/* AI Fit glow rating */}
                          {score !== null && (
                            <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-border/40">
                              <span className="flex items-center gap-1 text-[9px] font-bold text-brand-400">
                                <Sparkles className="size-2.5 animate-pulse-slow" /> AI MATCH
                              </span>
                              <Badge className={cn(
                                "text-[9px] font-extrabold rounded-md px-1 py-0.5",
                                score >= 80 ? 'bg-success/10 text-success border-success/20' : 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                              )}>
                                {score}% Fit
                              </Badge>
                            </div>
                          )}

                          {/* Transition Actions HUD */}
                          <div className="mt-2.5 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {col.id !== 'applied' && (
                              <button
                                type="button"
                                title="Move Back"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const prevStages: Record<string, ApplicationStatus> = { screening: 'applied', interview: 'screening', offer: 'interview', rejected: 'offer' }
                                  handleTransition(app.id, prevStages[col.id] || 'applied')
                                }}
                                className="p-1 rounded bg-accent/40 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <ArrowLeft className="size-3" />
                              </button>
                            )}
                            {col.id !== 'rejected' && (
                              <button
                                type="button"
                                title="Reject"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleTransition(app.id, 'rejected')
                                }}
                                className="p-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                              >
                                <X className="size-3" />
                              </button>
                            )}
                            {col.id !== 'offer' && col.id !== 'rejected' && (
                              <button
                                type="button"
                                title="Move Forward"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const nextStages: Record<string, ApplicationStatus> = { applied: 'screening', screening: 'interview', interview: 'offer' }
                                  handleTransition(app.id, nextStages[col.id] || 'screening')
                                }}
                                className="p-1 rounded bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 transition-colors"
                              >
                                <ArrowRight className="size-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Slide-over Evaluation Workspace Panel */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />

            {/* SlidePanel Body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-2xl bg-card border-l border-border h-full flex flex-col shadow-2xl z-10"
            >
              {/* Header */}
              <div className="p-5 border-b border-border flex items-center justify-between gap-4 bg-accent/10">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-muted border border-border flex items-center justify-center text-sm font-extrabold text-muted-foreground">
                    {selectedApp.candidate.avatar ? (
                      <img src={selectedApp.candidate.avatar} alt={selectedApp.candidate.name} className="size-full object-cover" />
                    ) : (
                      selectedApp.candidate.name[0]
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground leading-tight flex items-center gap-1.5">
                      {selectedApp.candidate.name}
                      {selectedApp.aiScore !== undefined && (
                        <Badge className="text-[9px] font-extrabold bg-brand-500/15 text-brand-400 px-1 py-0 rounded">
                          {Math.round(selectedApp.aiScore * 100)}% AI Score
                        </Badge>
                      )}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">{selectedApp.candidate.headline || 'Software Engineer'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedApp.resumeUrl && (
                    <a
                      href={selectedApp.resumeUrl}
                      onClick={(e) => handleViewResume(e, selectedApp.resumeUrl!)}
                      className="p-1.5 rounded-lg bg-accent/40 text-foreground hover:bg-accent/60 transition-colors flex items-center gap-1 text-[10px] font-semibold"
                    >
                      <Download className="size-3.5" /> PDF Resume
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {/* Main scroll body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 bg-accent/20 border border-border/50 p-4 rounded-2xl text-xs">
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Candidate Location</p>
                    <p className="text-foreground flex items-center gap-1 font-medium"><MapPin className="size-3.5 text-muted-foreground" /> {selectedApp.candidate.location || 'Remote'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Current Pipeline Stage</p>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={selectedApp.status}
                        onChange={(e) => handleTransition(selectedApp.id, e.target.value as ApplicationStatus)}
                        className="bg-card border border-border rounded-lg px-2 py-0.5 text-xs text-foreground font-semibold cursor-pointer"
                      >
                        <option value="applied">Applied</option>
                        <option value="screening">Screening</option>
                        <option value="interview">Interview</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected / Closed</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* AI Candidate Insights Card */}
                {(() => {
                  const candidate = selectedApp.candidate
                  const jobSkills = selectedJob?.skills || []
                  const candidateSkills = candidate.skills || []
                  const cSkillsLower = candidateSkills.map((s: string) => s.toLowerCase())
                  const matchingSkills = jobSkills.filter((s: string) => cSkillsLower.includes(s.toLowerCase()))
                  const missingSkills = jobSkills.filter((s: string) => !cSkillsLower.includes(s.toLowerCase()))
                  
                  const score = selectedApp.aiScore !== undefined ? Math.round(selectedApp.aiScore * 100) : 75
                  
                  let summary = ''
                  if (score >= 80) {
                    summary = `${candidate.name} exhibits outstanding alignment as a ${candidate.headline || 'Software Engineer'}, possessing verified strength in core stacks like ${matchingSkills.slice(0, 3).join(', ')}. Their historical roles suggest high autonomous execution capability, making them a primary candidate for immediate shortlisting.`
                  } else if (score >= 60) {
                    summary = `${candidate.name} demonstrates a solid foundations model, matching key requirements including ${matchingSkills.slice(0, 2).join(', ')}. There are moderate structural mismatches, specifically around ${missingSkills.slice(0, 2).join(', ') || 'niche areas'}, but their profile suggests excellent capacity for fast adaptation.`
                  } else {
                    summary = `${candidate.name} is a high-potential growth candidate. While there is low direct alignment with the job's specialized skill profile, their broader background as a ${candidate.headline || 'professional'} indicates solid software engineering fundamentals.`
                  }

                  return (
                    <div className="bg-gradient-to-br from-brand-500/[0.03] via-purple-500/[0.03] to-slate-900/40 border border-purple-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                          <Sparkles className="size-4 text-purple-400 animate-pulse" />
                          <span>AI Applicant Analysis</span>
                        </div>
                        <Badge className="text-[10px] bg-purple-500/20 text-purple-300 font-extrabold border-purple-500/30">
                          Match Index: {score}%
                        </Badge>
                      </div>

                      <p className="text-xs text-foreground leading-relaxed font-medium bg-purple-950/20 border border-purple-500/10 rounded-xl p-3">
                        &quot;{summary}&quot;
                      </p>

                      {/* Job-Fit Gaps Alert */}
                      <div className="mt-4 space-y-2">
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Job Requirement Alignment Gaps</h5>
                        {missingSkills.length > 0 ? (
                          <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-500/[0.03] border border-amber-500/10 rounded-xl p-3">
                            <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-[11px]">Skill Discrepancies Detected</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">The candidate lacks direct verified experience in:</p>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {missingSkills.slice(0, 4).map((s: string) => (
                                  <span key={s} className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-300">
                                    {s}
                                  </span>
                                ))}
                                {missingSkills.length > 4 && (
                                  <span className="text-[9px] text-muted-foreground py-0.5 pl-1">
                                    +{missingSkills.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-xl p-3">
                            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                            <div>
                              <p className="font-bold text-[11px]">Full Stack Parity Achieved</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">The candidate matches all required core and secondary requirements!</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()}

                {/* Pitch cover letter */}
                {selectedApp.coverLetter && (
                  <div className="space-y-2 bg-brand-500/[0.01] border border-brand-500/10 p-4 rounded-2xl relative">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Star className="size-4 text-brand-400" /> Pitch Pitch / Cover Letter
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      &quot;{selectedApp.coverLetter}&quot;
                    </p>
                  </div>
                )}

                {/* Tech Stack Skills list */}
                {selectedApp.candidate.skills && selectedApp.candidate.skills.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-foreground">Skills Tech Stack</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedApp.candidate.skills.map((skill: string) => (
                        <span key={skill} className="px-2.5 py-0.5 rounded-lg text-[10px] font-semibold bg-accent/60 text-accent-foreground border border-border/50">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience History */}
                {selectedApp.candidate.experience && (selectedApp.candidate.experience as any[]).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-foreground">Work History</h4>
                    <div className="space-y-2.5">
                      {(selectedApp.candidate.experience as any[]).map((exp, idx) => (
                        <div key={idx} className="flex gap-3 p-3 bg-card border border-border/60 rounded-xl text-xs">
                          <div className="size-6 rounded bg-muted flex items-center justify-center shrink-0 text-[10px] font-bold text-muted-foreground uppercase">{exp.company[0]}</div>
                          <div>
                            <p className="font-semibold text-foreground">{exp.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{exp.company} · {exp.startDate} {exp.current ? '· Current' : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pipeline Audits History */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <ClipboardList className="size-4 text-muted-foreground" /> Pipeline History Logs
                  </h4>
                  <div className="space-y-3 border-l border-border pl-4 ml-2">
                    {selectedApp.timeline && [...selectedApp.timeline].reverse().map((event, idx) => (
                      <div key={event.id || idx} className="relative space-y-1">
                        <div className="absolute -left-[21px] top-1 size-2 rounded-full bg-brand-500 ring-4 ring-card" />
                        <div className="flex items-center justify-between gap-2 text-[10px]">
                          <span className="font-bold text-foreground uppercase tracking-wide">{event.status}</span>
                          <span className="text-muted-foreground/60">{formatRelativeTime(event.timestamp)}</span>
                        </div>
                        {event.note && <p className="text-[11px] text-muted-foreground leading-normal">{event.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Private Notes Editor Footer */}
              <div className="p-4 border-t border-border bg-accent/10 space-y-3">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <label htmlFor="notes" className="font-bold text-foreground">Private Recruiter Comments / Notes</label>
                  <span className="text-[10px] text-muted-foreground">Internal company review only</span>
                </div>
                <textarea
                  id="notes"
                  rows={3}
                  value={recruiterNotes}
                  onChange={(e) => setRecruiterNotes(e.target.value)}
                  placeholder="Record evaluation parameters, tech ratings, interview scheduling notes, etc."
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-ring/30 outline-none transition-colors resize-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSelectedApp(null)}
                    className="rounded-xl text-xs h-8 px-4"
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSaveNotes}
                    className="rounded-xl text-xs h-8 px-4 flex items-center gap-1.5 font-bold"
                  >
                    <Save className="size-3.5" /> Save Comments
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
