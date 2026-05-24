import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, CheckCircle2, ChevronRight, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTypewriter } from '@/hooks/useTypewriter'
import type { Job } from '@hireflow/types'
import { cn } from '@/lib/utils'

export function AIMatchAnalysis({ job }: { job: Job }) {
  const [expanded, setExpanded] = useState(true)
  const score = job.aiMatchScore ?? 85

  // Only simulate typewriter effect when expanded
  const analysisText = `Based on your profile, you are a strong fit for the **${job.title}** role at **${job.company.name}**. Your background in frontend development aligns perfectly with their tech stack (${job.skills?.slice(0, 3).join(', ')}).\n\nKey strengths for this role:\n• You have 5+ years of experience, exceeding their mid-level requirement.\n• Your stated salary expectations are well within their $${job.salary} budget.\n• You have previously worked in ${job.company.industry || 'technology'}, which gives you domain expertise.`
  
  const { displayedText, isTyping } = useTypewriter(expanded ? analysisText : '', 15, 300)

  return (
    <div className="bg-gradient-to-br from-brand-900/30 to-background border border-brand-500/20 rounded-2xl overflow-hidden mb-6 shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-brand-500/5 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <Sparkles className="size-4 text-brand-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">AI Match Analysis</h3>
            <p className="text-xs text-brand-400/80 mt-0.5">You&apos;re a {score}% match for this role</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Circular progress */}
          <div className="relative size-10 flex items-center justify-center shrink-0">
            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-muted/30"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <motion.path
                className="text-brand-400"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${score}, 100`}
                initial={{ strokeDasharray: '0, 100' }}
                animate={{ strokeDasharray: `${score}, 100` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-foreground">{score}</span>
          </div>
          {expanded ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 pt-1">
              <div className="pl-11 pr-4">
                <div className="prose prose-sm prose-invert max-w-none text-muted-foreground">
                  <p className="whitespace-pre-wrap leading-relaxed text-[13px]">
                    {displayedText}
                    {isTyping && <span className="inline-block w-1.5 h-3 ml-1 bg-brand-400 animate-pulse" />}
                  </p>
                </div>
                
                {/* Suggestions */}
                <motion.div 
                  className="mt-4 flex gap-2 flex-wrap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isTyping ? 0 : 1, y: isTyping ? 10 : 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button variant="outline" size="sm" className="h-7 text-[11px] rounded-full border-brand-500/20 bg-brand-500/5 hover:bg-brand-500/10">
                    <CheckCircle2 className="size-3 text-brand-400 mr-1" /> Auto-tailor resume
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-[11px] rounded-full border-brand-500/20 bg-brand-500/5 hover:bg-brand-500/10">
                    <Sparkles className="size-3 text-brand-400 mr-1" /> Generate cover letter
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
