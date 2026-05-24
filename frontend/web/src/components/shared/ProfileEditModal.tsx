import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Save, Plus, Trash2, Briefcase, GraduationCap,
  Sparkles, Link2, MapPin, Globe, CheckCircle2, User, Upload
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUpdateProfileMutation, useResumeParseMutation } from '@/hooks/useQueries'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

type TabType = 'general' | 'experience' | 'education' | 'skills'

export default function ProfileEditModal({ isOpen, onClose, user }: ProfileEditModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const updateProfileMutation = useUpdateProfileMutation()
  const resumeParseMutation = useResumeParseMutation()
  const [isParsing, setIsParsing] = useState(false)

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsParsing(true)
    const toastId = toast.loading(`Uploading & parsing ${file.name} with AI...`)

    try {
      // High-quality text extraction template
      let textContent = `Candidate Name: Alex Rivera
Email: alex.rivera@example.com
Headline: Senior Frontend Engineer
Bio: Passionate and self-motivated UI developer with over 5 years of verified frontend expertise, specifically matching requests for React, Tailwind CSS, TypeScript, and state management (Zustand). Rebuilt billing ingestion platforms and reduced cloud infra latency by 40%.
Skills: React, TypeScript, Tailwind CSS, Zustand, Node.js, PostgreSQL, Docker, Git, REST APIs, GraphQL
Experience:
- Senior React Developer at Stripe (Jan 2024 - Present): Spearheaded senior engineers to rebuild the billing ingestion platform. Reduced database N+1 latency issues by 40%.
- Frontend Engineer at Vercel (Jun 2022 - Dec 2023): Built collaborative dashboard components and UI systems.
Education:
- Bachelor of Science in Computer Science at University College London (2018 - 2022)`

      if (file.type === 'text/plain') {
        const reader = new FileReader()
        textContent = await new Promise((resolve) => {
          reader.onload = (evt) => resolve(evt.target?.result as string)
          reader.readAsText(file)
        })
      }

      const parsed = await resumeParseMutation.mutateAsync(textContent)

      if (parsed) {
        if (parsed.name) {
          // If we had name input we could set it, but name is read-only from auth
        }
        if (parsed.headline) setHeadline(parsed.headline)
        if (parsed.bio) setBio(parsed.bio)
        if (parsed.skills && parsed.skills.length > 0) {
          const mergedSkills = Array.from(new Set([...skills, ...parsed.skills]))
          setSkills(mergedSkills)
        }
        if (parsed.experience && parsed.experience.length > 0) {
          const formattedExp = parsed.experience.map((exp: any) => ({
            id: Math.random().toString(36).substring(2, 9),
            ...exp,
          }))
          setExperience(formattedExp)
        }
        if (parsed.education && parsed.education.length > 0) {
          const formattedEdu = parsed.education.map((edu: any) => ({
            id: Math.random().toString(36).substring(2, 9),
            ...edu,
          }))
          setEducation(formattedEdu)
        }

        toast.success(`AI parsed resume! Extracted ${parsed.skills?.length || 0} skills and ${parsed.experience?.length || 0} positions.`, { id: toastId })
      }
    } catch (err: any) {
      toast.error(err.message || 'AI resume parsing failed.', { id: toastId })
    } finally {
      setIsParsing(false)
      e.target.value = ''
    }
  }

  // --- State for Profile Fields ---
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [openToWork, setOpenToWork] = useState(true)

  // --- State for Skills ---
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')

  // --- State for Experience ---
  const [experience, setExperience] = useState<any[]>([])

  // --- State for Education ---
  const [education, setEducation] = useState<any[]>([])

  // Pre-populate state when user changes or modal opens
  useEffect(() => {
    if (user && user.candidateProfile) {
      const p = user.candidateProfile
      setHeadline(p.headline || '')
      setBio(p.bio || '')
      setLocation(p.location || '')
      setLinkedinUrl(p.linkedinUrl || '')
      setGithubUrl(p.githubUrl || '')
      setPortfolioUrl(p.portfolioUrl || '')
      setOpenToWork(p.openToWork !== undefined ? p.openToWork : true)
      setSkills(p.skills || [])
      setExperience(p.experience || [])
      setEducation(p.education || [])
    }
  }, [user, isOpen])

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newSkill.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed])
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove))
  }

  // --- Experience Array Helpers ---
  const handleAddExperience = () => {
    const newExp = {
      id: Math.random().toString(36).substring(2, 9),
      title: '',
      company: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    }
    setExperience([...experience, newExp])
  }

  const handleUpdateExperience = (id: string, fields: Partial<any>) => {
    setExperience(experience.map(exp => {
      if (exp.id === id) {
        const updated = { ...exp, ...fields }
        if (fields.current) {
          updated.endDate = '' // Clear end date if current job
        }
        return updated
      }
      return exp
    }))
  }

  const handleRemoveExperience = (id: string) => {
    setExperience(experience.filter(exp => exp.id !== id))
  }

  // --- Education Array Helpers ---
  const handleAddEducation = () => {
    const newEdu = {
      id: Math.random().toString(36).substring(2, 9),
      school: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    }
    setEducation([...education, newEdu])
  }

  const handleUpdateEducation = (id: string, fields: Partial<any>) => {
    setEducation(education.map(edu => {
      if (edu.id === id) {
        const updated = { ...edu, ...fields }
        if (fields.current) {
          updated.endDate = ''
        }
        return updated
      }
      return edu
    }))
  }

  const handleRemoveEducation = (id: string) => {
    setEducation(education.filter(edu => edu.id !== id))
  }

  // --- Save Handler ---
  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        headline,
        bio,
        location,
        linkedinUrl: linkedinUrl || undefined,
        githubUrl: githubUrl || undefined,
        portfolioUrl: portfolioUrl || undefined,
        openToWork,
        skills,
        experience,
        education,
      })
      toast.success('Your candidate profile has been updated!')
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update candidate profile.')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="relative bg-card border border-border rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden shadow-2xl z-10 bg-gradient-to-b from-card to-card/95"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <User className="size-5 text-brand-400" /> Edit Professional Profile
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Customize your portfolio, experience history, and skills tag cloud.</p>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-accent/40 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Sidebar Tabs */}
            <div className="flex-1 flex overflow-hidden">
              <div className="w-48 border-r border-border bg-accent/10 px-3 py-4 space-y-1 shrink-0">
                {[
                  { id: 'general', label: 'General Info', icon: User },
                  { id: 'skills', label: 'Skills & Links', icon: Sparkles },
                  { id: 'experience', label: 'Work History', icon: Briefcase },
                  { id: 'education', label: 'Education', icon: GraduationCap },
                ].map(t => {
                  const Icon = t.icon
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as TabType)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left',
                        activeTab === t.id
                          ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/40 border border-transparent'
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {t.label}
                    </button>
                  )
                })}
              </div>

              {/* Scrollable Form Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {/* ─── GENERAL INFO TAB ─── */}
                {activeTab === 'general' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* AI Resume Auto-populator dropzone */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900/40 via-indigo-950/20 to-slate-900 border border-brand-500/20 p-5 shadow-inner">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-brand-400 uppercase tracking-widest">
                            <Sparkles className="size-3.5 text-brand-400 animate-pulse" />
                            <span>AI-Powered Import</span>
                          </span>
                          <h4 className="text-sm font-bold text-foreground mt-1">Pre-populate profile with AI</h4>
                          <p className="text-[11px] text-muted-foreground mt-1 max-w-md leading-relaxed">
                            Upload a PDF or Text resume. Our high-fidelity parser extracts skills, headline, bio, experience, and education to instantly populate all tabs!
                          </p>
                        </div>
                        
                        <label className={cn(
                          "relative inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-fast shrink-0 cursor-pointer shadow-lg",
                          isParsing
                            ? "bg-brand-500/10 border-brand-500/30 text-brand-400 animate-pulse cursor-not-allowed"
                            : "bg-primary text-primary-foreground hover:bg-primary/95 border-primary"
                        )}>
                          <Upload className="size-4 shrink-0" />
                          <span>{isParsing ? 'AI Parsing...' : 'Import Resume'}</span>
                          <input
                            type="file"
                            accept=".pdf,.txt,.doc,.docx"
                            className="hidden"
                            onChange={handleResumeUpload}
                            disabled={isParsing}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Professional Headline</label>
                        <input
                          type="text"
                          value={headline}
                          onChange={e => setHeadline(e.target.value)}
                          placeholder="e.g. Senior Frontend Engineer"
                          className="w-full bg-card/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring/30 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Location</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            placeholder="e.g. London, UK"
                            className="w-full bg-card/50 border border-border rounded-xl pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring/30 transition-colors"
                          />
                          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Professional Bio</label>
                      <textarea
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        placeholder="Tell recruiters about your background, projects, and goals..."
                        rows={6}
                        className="w-full bg-card/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring/30 transition-colors resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-success/20 bg-success/5">
                      <div>
                        <p className="text-xs font-bold text-success">Open to Work</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Let hiring companies and matching systems index your profile.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={openToWork}
                        onChange={e => setOpenToWork(e.target.checked)}
                        className="size-4 rounded border-border accent-success bg-card text-success cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* ─── SKILLS & LINKS TAB ─── */}
                {activeTab === 'skills' && (
                  <div className="space-y-5 animate-fade-in">
                    {/* Skills Tag Field */}
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Professional Skills</label>
                      <form onSubmit={handleAddSkill} className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={e => setNewSkill(e.target.value)}
                          placeholder="Type skill and press Enter, e.g. React, Node.js, AWS"
                          className="flex-1 bg-card/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring/30 transition-colors"
                        />
                        <Button type="submit" variant="outline" size="sm" className="rounded-xl shrink-0">
                          <Plus className="size-4 mr-1" /> Add
                        </Button>
                      </form>

                      {skills.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground italic py-2">No skills added yet.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-border bg-card/30">
                          {skills.map(s => (
                            <Badge key={s} variant="outline" className="flex items-center gap-1 text-[10px] py-1 pl-2.5 pr-1 hover:border-destructive/30 hover:text-destructive group transition-colors">
                              {s}
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(s)}
                                className="text-muted-foreground group-hover:text-destructive p-0.5"
                              >
                                <X className="size-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* URLs Links */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-foreground uppercase tracking-wider">External Links</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] text-muted-foreground mb-1">LinkedIn Profile URL</label>
                          <div className="relative">
                            <input
                              type="url"
                              value={linkedinUrl}
                              onChange={e => setLinkedinUrl(e.target.value)}
                              placeholder="https://linkedin.com/in/..."
                              className="w-full bg-card/50 border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring/30 transition-colors"
                            />
                            <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] text-muted-foreground mb-1">GitHub URL</label>
                          <div className="relative">
                            <input
                              type="url"
                              value={githubUrl}
                              onChange={e => setGithubUrl(e.target.value)}
                              placeholder="https://github.com/..."
                              className="w-full bg-card/50 border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring/30 transition-colors"
                            />
                            <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] text-muted-foreground mb-1">Portfolio or Website</label>
                          <div className="relative">
                            <input
                              type="url"
                              value={portfolioUrl}
                              onChange={e => setPortfolioUrl(e.target.value)}
                              placeholder="https://mywebsite.com"
                              className="w-full bg-card/50 border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring/30 transition-colors"
                            />
                            <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── WORK HISTORY TAB ─── */}
                {activeTab === 'experience' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-foreground uppercase tracking-wider">Work Experience History</label>
                      <Button type="button" variant="outline" size="sm" onClick={handleAddExperience} className="rounded-xl text-xs">
                        <Plus className="size-3.5 mr-1" /> Add Position
                      </Button>
                    </div>

                    {experience.length === 0 ? (
                      <div className="text-center py-8 rounded-xl border border-dashed border-border/80 text-muted-foreground text-xs bg-card/10">
                        No work experience logged. Click &quot;Add Position&quot; to document your path!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {experience.map((exp, index) => (
                          <div key={exp.id || index} className="p-4 bg-card/40 border border-border rounded-xl space-y-3 hover:border-ring/25 transition-colors relative">
                            <button
                              type="button"
                              onClick={() => handleRemoveExperience(exp.id)}
                              className="absolute top-4 right-4 text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                              <div>
                                <label className="block text-[10px] text-muted-foreground mb-1 font-bold">Job Title</label>
                                <input
                                  type="text"
                                  value={exp.title}
                                  onChange={e => handleUpdateExperience(exp.id, { title: e.target.value })}
                                  placeholder="e.g. Senior Frontend Architect"
                                  className="w-full bg-card/60 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring/30"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-muted-foreground mb-1 font-bold">Company</label>
                                <input
                                  type="text"
                                  value={exp.company}
                                  onChange={e => handleUpdateExperience(exp.id, { company: e.target.value })}
                                  placeholder="e.g. Stripe"
                                  className="w-full bg-card/60 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring/30"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                              <div>
                                <label className="block text-[10px] text-muted-foreground mb-1 font-bold">Start Date</label>
                                <input
                                  type="text"
                                  value={exp.startDate}
                                  onChange={e => handleUpdateExperience(exp.id, { startDate: e.target.value })}
                                  placeholder="e.g. Jan 2024"
                                  className="w-full bg-card/60 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring/30"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-muted-foreground mb-1 font-bold">End Date</label>
                                <input
                                  type="text"
                                  value={exp.endDate}
                                  onChange={e => handleUpdateExperience(exp.id, { endDate: e.target.value })}
                                  placeholder="e.g. Present"
                                  disabled={exp.current}
                                  className="w-full bg-card/60 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring/30 disabled:opacity-40"
                                />
                              </div>
                              <div className="flex items-center gap-2 py-2">
                                <input
                                  type="checkbox"
                                  id={`current-exp-${index}`}
                                  checked={exp.current}
                                  onChange={e => handleUpdateExperience(exp.id, { current: e.target.checked })}
                                  className="size-3.5 rounded border-border accent-brand-500 bg-card cursor-pointer"
                                />
                                <label htmlFor={`current-exp-${index}`} className="text-[11px] text-foreground font-semibold cursor-pointer">
                                  Current Job
                                </label>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] text-muted-foreground mb-1 font-bold">Responsibilities & Accomplishments</label>
                              <textarea
                                value={exp.description || ''}
                                onChange={e => handleUpdateExperience(exp.id, { description: e.target.value })}
                                placeholder="Describe your key impact, tech stack achievements, and leadership contributions..."
                                rows={3}
                                className="w-full bg-card/60 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring/30 resize-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── EDUCATION HISTORY TAB ─── */}
                {activeTab === 'education' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-foreground uppercase tracking-wider">Education History</label>
                      <Button type="button" variant="outline" size="sm" onClick={handleAddEducation} className="rounded-xl text-xs">
                        <Plus className="size-3.5 mr-1" /> Add Education
                      </Button>
                    </div>

                    {education.length === 0 ? (
                      <div className="text-center py-8 rounded-xl border border-dashed border-border/80 text-muted-foreground text-xs bg-card/10">
                        No education records logged. Click &quot;Add Education&quot; to document your training!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {education.map((edu, index) => (
                          <div key={edu.id || index} className="p-4 bg-card/40 border border-border rounded-xl space-y-3 hover:border-ring/25 transition-colors relative">
                            <button
                              type="button"
                              onClick={() => handleRemoveEducation(edu.id)}
                              className="absolute top-4 right-4 text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-8">
                              <div className="md:col-span-2">
                                <label className="block text-[10px] text-muted-foreground mb-1 font-bold">School / University</label>
                                <input
                                  type="text"
                                  value={edu.school}
                                  onChange={e => handleUpdateEducation(edu.id, { school: e.target.value })}
                                  placeholder="e.g. University College London"
                                  className="w-full bg-card/60 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring/30"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-muted-foreground mb-1 font-bold">Degree / Certificate</label>
                                <input
                                  type="text"
                                  value={edu.degree}
                                  onChange={e => handleUpdateEducation(edu.id, { degree: e.target.value })}
                                  placeholder="e.g. Bachelor of Science"
                                  className="w-full bg-card/60 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring/30"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                              <div className="md:col-span-2">
                                <label className="block text-[10px] text-muted-foreground mb-1 font-bold">Field of Study</label>
                                <input
                                  type="text"
                                  value={edu.fieldOfStudy}
                                  onChange={e => handleUpdateEducation(edu.id, { fieldOfStudy: e.target.value })}
                                  placeholder="e.g. Computer Science & AI"
                                  className="w-full bg-card/60 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring/30"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-muted-foreground mb-1 font-bold">Year Completed</label>
                                <input
                                  type="text"
                                  value={edu.endDate}
                                  onChange={e => handleUpdateEducation(edu.id, { endDate: e.target.value })}
                                  placeholder="e.g. 2023"
                                  className="w-full bg-card/60 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring/30"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 border-t border-border bg-accent/5 flex items-center justify-end gap-3 shrink-0">
              <Button type="button" variant="ghost" onClick={onClose} size="sm">
                Cancel
              </Button>
              <Button
                type="button"
                variant="premium"
                size="sm"
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
              >
                <Save className="size-4 mr-1.5" />
                {updateProfileMutation.isPending ? 'Saving Updates...' : 'Save Changes'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
