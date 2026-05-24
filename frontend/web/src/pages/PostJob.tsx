import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, MapPin, Briefcase, Plus, X, ArrowRight, ArrowLeft,
  CheckCircle2, AlertCircle, Banknote, ListPlus, GraduationCap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useCreateJobMutation, useMe } from '@/hooks/useQueries'
import { useSEO } from '@/hooks/useSEO'
import { JobSchema } from '@hireflow/schemas'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function PostJob() {
  const navigate = useNavigate()
  const { data: me } = useMe()
  const createJobMutation = useCreateJobMutation()

  const [step, setStep] = useState(0)
  const [skillInput, setSkillInput] = useState('')
  const [reqInput, setReqInput] = useState('')
  const [benefitInput, setBenefitInput] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    workMode: 'remote' as 'remote' | 'hybrid' | 'onsite',
    type: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance',
    experienceLevel: 'mid' as 'entry' | 'mid' | 'senior' | 'lead' | 'executive',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    description: '',
    skills: [] as string[],
    requirements: [] as string[],
    benefits: [] as string[],
    status: 'active' as 'active' | 'draft' | 'closed',
  })

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  useSEO({
    title: 'Publish a Job Role — HireFlow Recruiter Portal',
    description: 'Post a new job opening and search for matched candidates.',
  })

  const steps = [
    { title: 'Job Specification', desc: 'Define basic role characteristics' },
    { title: 'Skills & Requirements', desc: 'Outline skills and requirements' },
  ]

  // Slug generator helper
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  // Handle skill entries
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    const item = skillInput.trim()
    if (!item) return
    if (formData.skills.includes(item)) {
      toast.error(`${item} is already listed`)
      return
    }
    setFormData({ ...formData, skills: [...formData.skills, item] })
    setSkillInput('')
  }

  const handleRemoveSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) })
  }

  // Handle requirements list
  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault()
    const item = reqInput.trim()
    if (!item) return
    if (formData.requirements.includes(item)) return
    setFormData({ ...formData, requirements: [...formData.requirements, item] })
    setReqInput('')
  }

  const handleRemoveRequirement = (index: number) => {
    setFormData({ ...formData, requirements: formData.requirements.filter((_, i) => i !== index) })
  }

  // Handle benefits list
  const handleAddBenefit = (e: React.FormEvent) => {
    e.preventDefault()
    const item = benefitInput.trim()
    if (!item) return
    if (formData.benefits.includes(item)) return
    setFormData({ ...formData, benefits: [...formData.benefits, item] })
    setBenefitInput('')
  }

  const handleRemoveBenefit = (index: number) => {
    setFormData({ ...formData, benefits: formData.benefits.filter((_, i) => i !== index) })
  }

  const handleNext = () => {
    if (step === 0) {
      // Validate Step 1 locally
      const validationErrors: Record<string, string> = {}
      if (formData.title.trim().length < 3) {
        validationErrors.title = 'Title must be at least 3 characters'
      }
      if (!formData.location.trim()) {
        validationErrors.location = 'Location is required (e.g. Remote or SF)'
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        toast.error('Please complete all job specifications correctly')
        return
      }

      setErrors({})
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    const companyId = me?.recruiterProfile?.companyId
    if (!companyId) {
      toast.error('Recruiter company profile could not be loaded.')
      return
    }

    // Assemble payload matching schemas
    const salary = formData.salaryMin
      ? {
          min: parseInt(formData.salaryMin),
          max: formData.salaryMax ? parseInt(formData.salaryMax) : parseInt(formData.salaryMin),
          currency: formData.salaryCurrency,
        }
      : undefined

    const payload = {
      title: formData.title.trim(),
      slug: `${generateSlug(formData.title.trim())}-${Date.now()}`,
      companyId,
      description: formData.description.trim(),
      requirements: formData.requirements,
      benefits: formData.benefits,
      skills: formData.skills,
      type: formData.type,
      workMode: formData.workMode,
      experienceLevel: formData.experienceLevel,
      location: formData.location.trim(),
      status: formData.status,
      salary,
    }

    // Validate using backend Zod Schema
    const validation = JobSchema.safeParse(payload)
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {}
      validation.error.issues.forEach(issue => {
        const path = issue.path.join('.')
        fieldErrors[path] = issue.message
      })
      setErrors(fieldErrors)
      toast.error(validation.error.issues[0]?.message || 'Schema validation failed. Check fields.')
      return
    }

    try {
      await createJobMutation.mutateAsync(payload)
      toast.success('Job published successfully!')
      navigate('/app/recruiter')
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish job. Please try again.')
    }
  }

  if (me && me.role !== 'recruiter') {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <EmptyState
          icon={<AlertCircle className="size-8 text-destructive" />}
          title="Forbidden"
          description="Only recruiters are authorized to publish new job listings."
          action={{ label: 'Back to Dashboard', onClick: () => navigate('/app/dashboard') }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col justify-center min-h-[calc(100vh-56px)]">
      {/* Header Stepper */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">
            Step {step + 1} of {steps.length}
          </span>
          <span className="text-xs text-muted-foreground">
            {steps[step].title}
          </span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden flex">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-full flex-1 transition-colors duration-medium border-r border-background last:border-0 ${
                index <= step ? 'bg-gradient-to-r from-brand-600 to-brand-400' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Form Body */}
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-0 rounded-3xl pointer-events-none ring-1 ring-brand-500/10 bg-brand-500/[0.01]" />

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Briefcase className="size-5 text-brand-400" /> Job Specification
                </h1>
                <p className="text-xs text-muted-foreground">{steps[0].desc}</p>
              </div>

              <div className="space-y-3.5">
                {/* Title */}
                <div className="space-y-1">
                  <label htmlFor="title" className="text-xs font-semibold text-muted-foreground">
                    Job Title <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    placeholder="e.g. Senior Frontend Engineer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={cn(
                      "w-full bg-accent/40 border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-ring/40 outline-none transition-colors",
                      errors.title ? 'border-destructive/50' : 'border-border'
                    )}
                  />
                  {errors.title && <span className="text-[10px] text-destructive">{errors.title}</span>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Location */}
                  <div className="space-y-1">
                    <label htmlFor="location" className="text-xs font-semibold text-muted-foreground">
                      Location <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <input
                        id="location"
                        type="text"
                        placeholder="e.g. San Francisco, CA"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className={cn(
                          "w-full bg-accent/40 border rounded-xl pl-9 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-ring/40 outline-none transition-colors",
                          errors.location ? 'border-destructive/50' : 'border-border'
                        )}
                      />
                    </div>
                    {errors.location && <span className="text-[10px] text-destructive">{errors.location}</span>}
                  </div>

                  {/* Work Mode */}
                  <div className="space-y-1">
                    <label htmlFor="workMode" className="text-xs font-semibold text-muted-foreground">
                      Work Mode <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="workMode"
                      value={formData.workMode}
                      onChange={(e) => setFormData({ ...formData, workMode: e.target.value as any })}
                      className="w-full bg-accent/40 border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:border-ring/40 outline-none transition-colors"
                    >
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Job Type */}
                  <div className="space-y-1">
                    <label htmlFor="type" className="text-xs font-semibold text-muted-foreground">
                      Job Type <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full bg-accent/40 border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:border-ring/40 outline-none transition-colors"
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>

                  {/* Experience Level */}
                  <div className="space-y-1">
                    <label htmlFor="experienceLevel" className="text-xs font-semibold text-muted-foreground">
                      Experience Level <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as any })}
                      className="w-full bg-accent/40 border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:border-ring/40 outline-none transition-colors"
                    >
                      <option value="entry">Entry Level</option>
                      <option value="mid">Mid Level</option>
                      <option value="senior">Senior</option>
                      <option value="lead">Lead / Staff</option>
                      <option value="executive">Executive</option>
                    </select>
                  </div>
                </div>

                {/* Salary Range */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Banknote className="size-3.5" /> Salary Range <span className="text-muted-foreground/50">(Optional)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="number"
                      placeholder="Min (e.g. 80000)"
                      value={formData.salaryMin}
                      onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                      className="w-full bg-accent/40 border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:border-ring/40 outline-none transition-colors"
                    />
                    <input
                      type="number"
                      placeholder="Max (e.g. 120000)"
                      value={formData.salaryMax}
                      onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                      className="w-full bg-accent/40 border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:border-ring/40 outline-none transition-colors"
                    />
                    <select
                      value={formData.salaryCurrency}
                      onChange={(e) => setFormData({ ...formData, salaryCurrency: e.target.value })}
                      className="w-full bg-accent/40 border border-border rounded-xl px-2 py-2.5 text-xs text-foreground focus:border-ring/40 outline-none transition-colors"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                  {errors['salary.min'] && <span className="text-[10px] text-destructive">{errors['salary.min']}</span>}
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="size-5 text-brand-400" /> Skills & Requirements
                </h2>
                <p className="text-xs text-muted-foreground">{steps[1].desc}</p>
              </div>

              <div className="space-y-3.5">
                {/* Description */}
                <div className="space-y-1">
                  <label htmlFor="description" className="text-xs font-semibold text-muted-foreground">
                    Job Description <span className="text-destructive">*</span> <span className="text-[10px] text-muted-foreground/60">(Min 50 chars)</span>
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    placeholder="Provide a comprehensive job description detailing daily operations, product scope, and ideal profile..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={cn(
                      "w-full bg-accent/40 border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-ring/40 outline-none transition-colors resize-none",
                      errors.description ? 'border-destructive/50' : 'border-border'
                    )}
                  />
                  {errors.description && <span className="text-[10px] text-destructive">{errors.description}</span>}
                </div>

                {/* Skills Chips */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <ListPlus className="size-3.5 text-brand-400" /> Target Technical Skills <span className="text-destructive">*</span>
                  </label>
                  <form onSubmit={handleAddSkill} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. React (Hit Enter to add)"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      className="flex-1 bg-accent/40 border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none"
                    />
                    <Button type="submit" variant="outline" className="px-3 shrink-0 rounded-xl h-8 text-xs">
                      Add
                    </Button>
                  </form>
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-border/40 bg-accent/20 min-h-[50px] mt-1.5">
                    {formData.skills.length === 0 ? (
                      <span className="text-[10px] text-muted-foreground/50 m-auto">No skills added yet.</span>
                    ) : (
                      formData.skills.map((s) => (
                        <span key={s} className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-lg text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                          {s}
                          <button type="button" onClick={() => handleRemoveSkill(s)} className="hover:bg-brand-500/20 rounded p-0.5"><X className="size-2.5" /></button>
                        </span>
                      ))
                    )}
                  </div>
                  {errors.skills && <span className="text-[10px] text-destructive block mt-1">{errors.skills}</span>}
                </div>

                {/* Requirements Bullet List */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <GraduationCap className="size-3.5 text-muted-foreground" /> Requirements / Qualifications <span className="text-destructive">*</span>
                  </label>
                  <form onSubmit={handleAddRequirement} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 5+ years of production experience"
                      value={reqInput}
                      onChange={(e) => setReqInput(e.target.value)}
                      className="flex-1 bg-accent/40 border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none"
                    />
                    <Button type="submit" variant="outline" className="px-3 shrink-0 rounded-xl h-8 text-xs">
                      Add
                    </Button>
                  </form>
                  <div className="space-y-1.5 max-h-[100px] overflow-y-auto mt-1.5 scrollbar-none">
                    {formData.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-card border border-border rounded-lg text-[11px]">
                        <span className="text-muted-foreground truncate flex-1">{req}</span>
                        <button type="button" onClick={() => handleRemoveRequirement(idx)} className="text-destructive hover:bg-destructive/10 p-0.5 rounded"><X className="size-3" /></button>
                      </div>
                    ))}
                  </div>
                  {errors.requirements && <span className="text-[10px] text-destructive block mt-1">{errors.requirements}</span>}
                </div>

                {/* Perks / Benefits */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Benefits & Perks <span className="text-muted-foreground/50">(Optional)</span></label>
                  <form onSubmit={handleAddBenefit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Premium medical & dental coverage"
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      className="flex-1 bg-accent/40 border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none"
                    />
                    <Button type="submit" variant="outline" className="px-3 shrink-0 rounded-xl h-8 text-xs">
                      Add
                    </Button>
                  </form>
                  <div className="space-y-1.5 max-h-[100px] overflow-y-auto mt-1.5 scrollbar-none">
                    {formData.benefits.map((b, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-card border border-border rounded-lg text-[11px]">
                        <span className="text-muted-foreground truncate flex-1">{b}</span>
                        <button type="button" onClick={() => handleRemoveBenefit(idx)} className="text-destructive hover:bg-destructive/10 p-0.5 rounded"><X className="size-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            className={`rounded-xl flex items-center gap-1 text-xs shrink-0 ${
              step === 0 && 'opacity-0 pointer-events-none'
            }`}
          >
            <ArrowLeft className="size-4" /> Back
          </Button>

          {step < steps.length - 1 ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              className="rounded-xl flex items-center gap-1.5 text-xs font-semibold px-4 py-2"
            >
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="premium"
              onClick={handleSubmit}
              disabled={createJobMutation.isPending}
              className="rounded-xl flex items-center gap-1.5 text-xs font-bold px-5 py-2"
            >
              {createJobMutation.isPending ? (
                'Publishing...'
              ) : (
                <>
                  Publish Job <CheckCircle2 className="size-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
