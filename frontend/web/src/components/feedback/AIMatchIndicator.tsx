import React from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIMatchIndicatorProps {
  score: number
  showSparkles?: boolean
  className?: string
}

export function AIMatchIndicator({ score, showSparkles = true, className }: AIMatchIndicatorProps) {
  // Curated, beautiful HSL colors
  // Excellent match: vibrant emerald/teal glow
  // Good match: warm Amber gold glow
  // Standard match: modern amethyst purple/red glow
  const colorConfig = score >= 80 
    ? {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        glow: 'shadow-emerald-500/20',
        ring: 'border-emerald-500/20',
      }
    : score >= 60
    ? {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        glow: 'shadow-amber-500/20',
        ring: 'border-amber-500/20',
      }
    : {
        text: 'text-muted-foreground',
        bg: 'bg-muted/30',
        border: 'border-border',
        glow: 'shadow-transparent',
        ring: 'border-transparent',
      }

  return (
    <div className={cn('relative inline-flex items-center gap-1.5', className)}>
      {/* Pulsating back glow */}
      {score >= 60 && (
        <span className={cn(
          'absolute inset-0 rounded-full animate-ping opacity-25 border',
          colorConfig.ring
        )} style={{ animationDuration: '3s' }} />
      )}
      
      {/* Premium Badge Container */}
      <div className={cn(
        'px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 border shadow-lg transition-all duration-300',
        colorConfig.text,
        colorConfig.bg,
        colorConfig.border,
        colorConfig.glow,
        score >= 80 ? 'hover:shadow-emerald-500/30 hover:scale-[1.02]' : 'hover:scale-[1.02]'
      )}>
        {showSparkles && score >= 60 && (
          <Sparkles className="size-3 text-current animate-pulse shrink-0" />
        )}
        <span>{score}% Match</span>
      </div>
    </div>
  )
}
