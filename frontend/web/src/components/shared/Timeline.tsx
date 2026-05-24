import React from 'react'
import { Calendar, Briefcase, FileCheck, HelpCircle, ArrowRightLeft } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { ApplicationStatus } from '@hireflow/types'

interface TimelineEvent {
  id: string
  status: ApplicationStatus
  timestamp: string
  note?: string
  actor?: string
}

interface TimelineProps {
  events: TimelineEvent[]
  className?: string
}

const statusConfig = {
  applied: { label: 'Applied', icon: Briefcase, color: 'text-muted-foreground bg-muted border-border' },
  screening: { label: 'Screening', icon: HelpCircle, color: 'text-info bg-info/10 border-info/20' },
  interview: { label: 'Interview Scheduled', icon: Calendar, color: 'text-brand-400 bg-brand-500/10 border-brand-500/20' },
  offer: { label: 'Offer Received', icon: FileCheck, color: 'text-success bg-success/10 border-success/20' },
  rejected: { label: 'Application Closed', icon: FileCheck, color: 'text-destructive bg-destructive/10 border-destructive/20' },
  withdrawn: { label: 'Withdrawn', icon: ArrowRightLeft, color: 'text-muted-foreground bg-muted border-border' },
}

export function Timeline({ events, className }: TimelineProps) {
  const sortedEvents = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  if (sortedEvents.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-muted-foreground">
        No workflow history logged.
      </div>
    )
  }

  return (
    <div className={cn('relative pl-6 space-y-6 before:absolute before:inset-y-0 before:left-2.5 before:w-0.5 before:bg-border/60', className)}>
      {sortedEvents.map((event, index) => {
        const config = statusConfig[event.status] || statusConfig.applied
        const Icon = config.icon

        return (
          <div key={event.id} className="relative group">
            {/* Event marker node */}
            <div
              className={cn(
                'absolute -left-6 top-0.5 size-5 rounded-full border flex items-center justify-center transition-all duration-fast shrink-0',
                config.color,
                index === 0 && 'ring-2 ring-brand-500/30'
              )}
            >
              <Icon className="size-2.5" />
            </div>

            {/* Content card */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-xs font-semibold text-foreground">{config.label}</h4>
                <span className="text-[10px] text-muted-foreground shrink-0">{formatRelativeTime(event.timestamp)}</span>
              </div>
              {event.actor && (
                <p className="text-[10px] text-muted-foreground font-medium">
                  Updated by: <span className="text-foreground">{event.actor}</span>
                </p>
              )}
              {event.note && (
                <div className="mt-1.5 p-2 rounded-lg bg-accent/30 border border-border/40 text-[11px] text-muted-foreground leading-relaxed">
                  {event.note}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
export default Timeline
