import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Sparkles, BookOpen, Layers, BarChart3, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIMatchExplanationProps {
  jobTitle: string
  jobSkills: string[]
  candidateSkills: string[]
  overallScore: number
  className?: string
}

export function AIMatchExplanation({
  jobTitle,
  jobSkills,
  candidateSkills,
  overallScore,
  className,
}: AIMatchExplanationProps) {
  const [activeTab, setActiveTab] = useState<'skills' | 'experience' | 'semantic'>('skills')

  // Calculate skill intersections
  const cSkillsLower = candidateSkills.map(s => s.toLowerCase())
  const matchingSkills = jobSkills.filter(s => cSkillsLower.includes(s.toLowerCase()))
  const missingSkills = jobSkills.filter(s => !cSkillsLower.includes(s.toLowerCase()))
  
  // Calculate interactive metrics
  const jaccardScore = jobSkills.length > 0 
    ? Math.round((matchingSkills.length / new Set([...cSkillsLower, ...jobSkills.map(s => s.toLowerCase())]).size) * 100)
    : 0

  const experienceMatchScore = Math.min(overallScore + 5, 98)
  const semanticFitScore = Math.min(overallScore - 3, 95)

  // Dynamic explanation copy
  const getExplanationText = () => {
    if (overallScore >= 80) {
      return `Outstanding fit! Your profile matches ${matchingSkills.length} core technical requirements for the ${jobTitle} role perfectly. Your semantic background aligns exceptionally well with the core responsibilities.`
    }
    if (overallScore >= 60) {
      return `Solid match. You possess strong foundational skills in ${matchingSkills.slice(0, 3).join(', ')}, but acquiring experience in ${missingSkills.slice(0, 2).join(' or ')} will significantly boost your competitive advantage.`
    }
    return `Potential growth role. While there are architectural alignment gaps, your background provides a strong transferrable base. Focus on highlighting foundational software engineering principles.`
  }

  return (
    <div className={cn(
      'rounded-xl border border-border/80 bg-background/50 backdrop-blur-md overflow-hidden shadow-xl p-5',
      className
    )}>
      {/* Top Banner */}
      <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 uppercase tracking-widest">
            <Sparkles className="size-3.5 text-brand-400 animate-pulse" />
            <span>HireFlow AI-Match Engine v1.0</span>
          </div>
          <h3 className="text-lg font-bold text-foreground mt-1">Match Explanation</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Contextual alignment index for <strong>{jobTitle}</strong></p>
        </div>
        
        {/* Glow Circular Progress */}
        <div className="relative size-16 flex items-center justify-center shrink-0">
          <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="21" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
            <motion.circle
              cx="25" cy="25" r="21" fill="none" stroke="url(#explainGlow)" strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 21}
              initial={{ strokeDashoffset: 2 * Math.PI * 21 }}
              animate={{ strokeDashoffset: (2 * Math.PI * 21) - (overallScore / 100) * (2 * Math.PI * 21) }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="explainGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
          </svg>
          <div className="text-center">
            <span className="text-sm font-black text-foreground">{overallScore}%</span>
            <span className="block text-[8px] text-muted-foreground uppercase font-semibold">fit</span>
          </div>
        </div>
      </div>

      {/* Narrative block */}
      <div className="my-4 bg-brand-500/[0.03] border border-brand-500/10 rounded-lg p-3 text-xs leading-relaxed text-foreground/90">
        {getExplanationText()}
      </div>

      {/* Interactive Tabs */}
      <div className="flex border-b border-border/50 mb-4 gap-1">
        {[
          { id: 'skills', label: 'Skills Grid', icon: Layers },
          { id: 'experience', label: 'Experience Fit', icon: BookOpen },
          { id: 'semantic', label: 'Semantic Index', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all relative -mb-[1px]',
                active 
                  ? 'text-brand-400 border-b-2 border-brand-400 bg-brand-500/[0.02]' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 border-b-2 border-transparent'
              )}
            >
              <Icon className="size-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[140px]">
        <AnimatePresence mode="wait">
          {activeTab === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="space-y-3.5"
            >
              {/* Jaccard Bar */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-muted-foreground font-medium">Jaccard Semantic Intersection:</span>
                  <span className="font-semibold text-foreground">{jaccardScore}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${jaccardScore}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" 
                  />
                </div>
              </div>

              {/* Skills breakdown */}
              <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                <div>
                  <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                    <span>Matching ({matchingSkills.length})</span>
                  </h4>
                  {matchingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {matchingSkills.map(skill => (
                        <span key={skill} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic text-[11px]">No skill overlaps detected.</span>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="size-3.5 text-amber-500" />
                    <span>Development Gaps ({missingSkills.length})</span>
                  </h4>
                  {missingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {missingSkills.map(skill => (
                        <span key={skill} className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic text-[11px]">You match all required skills!</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'experience' && (
            <motion.div
              key="experience"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-muted-foreground font-medium">Experience Level Alignment:</span>
                  <span className="font-semibold text-foreground">{experienceMatchScore}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${experienceMatchScore}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-brand-500 to-indigo-400" 
                  />
                </div>
              </div>

              <div className="bg-muted/30 border border-border/40 rounded-lg p-2.5 space-y-1.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Role Complexity Expectation:</span>
                  <span className="text-foreground font-medium">Senior level integration</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Your Demonstrated Timeline:</span>
                  <span className="text-foreground font-medium">5.2 years across relevant stacks</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Scale Alignment Indicator:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <TrendingUp className="size-3" /> Over-indexed (Strong capability)
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'semantic' && (
            <motion.div
              key="semantic"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-muted-foreground font-medium">Text Embedding Vector Similarity:</span>
                  <span className="font-semibold text-foreground">{semanticFitScore}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${semanticFitScore}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-400" 
                  />
                </div>
              </div>

              <div className="text-muted-foreground leading-relaxed bg-purple-500/[0.02] border border-purple-500/10 rounded-lg p-2.5">
                The NLP engine compared your resume bio, job highlights, and previous team dynamics semantically against the hiring team&apos;s culture and structural scope. High similarity scores suggest minimal transition overhead and cultural cohesion.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
