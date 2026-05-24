import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, MapPin, Briefcase, Plus, X, ArrowRight, ArrowLeft, CheckCircle2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCandidateStore } from '@/store/candidate-store'
import { useOnboardMutation } from '@/hooks/useQueries'
import { useSEO } from '@/hooks/useSEO'
import { toast } from 'sonner'

export default function CandidateOnboarding() {
  const navigate = useNavigate()
  const { onboardingStep, setOnboardingStep, onboardingData, updateOnboardingData } = useCandidateStore()
  const onboardMutation = useOnboardMutation()

  const [skillInput, setSkillInput] = useState('')
  const [expForm, setExpForm] = useState({
    title: '',
    company: '',
    startDate: '',
    current: true,
  })

  useSEO({
    title: 'Candidate Onboarding — Welcome to HireFlow',
    description: 'Complete your profile to unlock custom semantic job recommendations.',
  })

  const steps = [
    { title: 'Personal Details', desc: 'Tell companies about yourself' },
    { title: 'Skills & Tech Stack', desc: 'Highlight what you build best' },
    { title: 'Experience History', desc: 'Detail your past achievements' },
  ]

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    const newSkill = skillInput.trim()
    if (!newSkill) return

    if (onboardingData.skills.includes(newSkill)) {
      toast.error(`${newSkill} is already added`)
      return
    }

    updateOnboardingData({
      skills: [...onboardingData.skills, newSkill],
    })
    setSkillInput('')
  }

  const handleRemoveSkill = (skill: string) => {
    updateOnboardingData({
      skills: onboardingData.skills.filter((s) => s !== skill),
    })
  }

  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault()
    if (!expForm.title.trim() || !expForm.company.trim() || !expForm.startDate) {
      toast.error('Please complete all experience details')
      return
    }

    updateOnboardingData({
      experience: [
        ...onboardingData.experience,
        {
          title: expForm.title.trim(),
          company: expForm.company.trim(),
          startDate: expForm.startDate,
          current: expForm.current,
        },
      ],
    })

    setExpForm({
      title: '',
      company: '',
      startDate: '',
      current: true,
    })
    toast.success('Experience block added successfully')
  }

  const handleRemoveExperience = (index: number) => {
    updateOnboardingData({
      experience: onboardingData.experience.filter((_, i) => i !== index),
    })
  }

  const handleNext = () => {
    if (onboardingStep === 0) {
      if (!onboardingData.headline.trim() || !onboardingData.bio.trim() || !onboardingData.location.trim()) {
        toast.error('Please fill in all personal details')
        return
      }
    } else if (onboardingStep === 1) {
      if (onboardingData.skills.length === 0) {
        toast.error('Please add at least one core skill')
        return
      }
    }
    setOnboardingStep(onboardingStep + 1)
  }

  const handleBack = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(onboardingStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      await onboardMutation.mutateAsync({
        role: 'candidate',
        headline: onboardingData.headline,
        bio: onboardingData.bio,
        location: onboardingData.location,
        skills: onboardingData.skills,
        experience: onboardingData.experience,
        openToWork: onboardingData.openToWork,
      })
      toast.success('Profile onboarded successfully!')
      navigate('/app/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Onboarding registration failed. Please try again.')
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 flex flex-col justify-center min-h-[calc(100vh-56px)]">
      {/* Header Stepper */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">
            Step {onboardingStep + 1} of {steps.length}
          </span>
          <span className="text-xs text-muted-foreground">
            {steps[onboardingStep].title}
          </span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden flex">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-full flex-1 transition-colors duration-medium border-r border-background last:border-0 ${
                index <= onboardingStep ? 'bg-gradient-to-r from-brand-600 to-brand-400' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Center card body with transitions */}
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-0 rounded-3xl pointer-events-none ring-1 ring-brand-500/10 bg-brand-500/[0.01]" />

        <AnimatePresence mode="wait">
          {onboardingStep === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <User className="size-5 text-brand-400" /> Personal Details
                </h2>
                <p className="text-xs text-muted-foreground">{steps[0].desc}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="headline" className="text-xs font-semibold text-muted-foreground">
                    Headline
                  </label>
                  <input
                    id="headline"
                    type="text"
                    placeholder="e.g. Senior Full-Stack Engineer"
                    value={onboardingData.headline}
                    onChange={(e) => updateOnboardingData({ headline: e.target.value })}
                    className="w-full bg-accent/40 border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-ring/40 outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="bio" className="text-xs font-semibold text-muted-foreground">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={4}
                    placeholder="Brief professional overview detailing what tools you build and projects you manage..."
                    value={onboardingData.bio}
                    onChange={(e) => updateOnboardingData({ bio: e.target.value })}
                    className="w-full bg-accent/40 border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-ring/40 outline-none transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="location" className="text-xs font-semibold text-muted-foreground">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <input
                      id="location"
                      type="text"
                      placeholder="e.g. San Francisco, CA or Remote"
                      value={onboardingData.location}
                      onChange={(e) => updateOnboardingData({ location: e.target.value })}
                      className="w-full bg-accent/40 border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-ring/40 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {onboardingStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="size-5 text-brand-400" /> Core Skills
                </h2>
                <p className="text-xs text-muted-foreground">{steps[1].desc}</p>
              </div>

              <form onSubmit={handleAddSkill} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. TypeScript (Hit Enter to add)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="flex-1 bg-accent/40 border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-ring/40 outline-none transition-colors"
                />
                <Button type="submit" variant="outline" className="px-3 shrink-0 rounded-xl">
                  <Plus className="size-4" /> Add
                </Button>
              </form>

              {/* Skills chip list */}
              <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl border border-border/40 bg-accent/20 min-h-[80px]">
                {onboardingData.skills.length === 0 ? (
                  <span className="text-xs text-muted-foreground/50 m-auto">
                    No skills added yet. Add tools or tech stacks above.
                  </span>
                ) : (
                  onboardingData.skills.map((skill) => (
                    <motion.span
                      layout
                      key={skill}
                      className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:bg-brand-500/20 rounded-md p-0.5 transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </motion.span>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {onboardingStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Briefcase className="size-5 text-brand-400" /> Experience History
                </h2>
                <p className="text-xs text-muted-foreground">{steps[2].desc}</p>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddExperience} className="space-y-3 bg-accent/20 border border-border/40 p-4 rounded-2xl">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Role Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Lead Designer"
                      value={expForm.title}
                      onChange={(e) => setExpForm({ ...expForm, title: e.target.value })}
                      className="w-full bg-accent/40 border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-ring/40 outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Vercel"
                      value={expForm.company}
                      onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                      className="w-full bg-accent/40 border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-ring/40 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Start Date</label>
                    <input
                      type="date"
                      value={expForm.startDate}
                      onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                      className="w-full bg-accent/40 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-ring/40 outline-none transition-colors"
                    />
                  </div>
                  <Button type="submit" variant="primary" className="rounded-xl py-2 h-9 text-xs">
                    <Plus className="size-3.5" /> Add Experience
                  </Button>
                </div>
              </form>

              {/* Added list */}
              <div className="space-y-2 max-h-[140px] overflow-y-auto scrollbar-none">
                {onboardingData.experience.length === 0 ? (
                  <div className="text-center py-4 text-xs text-muted-foreground/50 border border-dashed border-border/60 rounded-2xl">
                    No past roles added. Set experiences above.
                  </div>
                ) : (
                  onboardingData.experience.map((exp, index) => (
                    <div key={index} className="flex items-center justify-between gap-3 p-3 bg-card border border-border rounded-xl">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-foreground truncate">{exp.title}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{exp.company} · {exp.startDate}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRemoveExperience(index)}
                        className="text-destructive hover:bg-destructive/10 rounded-lg"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-6 border-t border-border mt-8">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            className={`rounded-xl flex items-center gap-1 text-xs shrink-0 ${
              onboardingStep === 0 && 'opacity-0 pointer-events-none'
            }`}
          >
            <ArrowLeft className="size-4" /> Back
          </Button>

          {onboardingStep < steps.length - 1 ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              className="rounded-xl flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5"
            >
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="premium"
              onClick={handleSubmit}
              disabled={onboardMutation.isPending}
              className="rounded-xl flex items-center gap-1.5 text-xs font-bold px-5 py-2.5"
            >
              {onboardMutation.isPending ? (
                'Onboarding...'
              ) : (
                <>
                  Complete Setup <CheckCircle2 className="size-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
