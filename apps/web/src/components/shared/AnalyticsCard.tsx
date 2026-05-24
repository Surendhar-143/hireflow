import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalyticsCardProps {
  title: string
  value: string | number
  trend?: {
    value: string | number
    direction: 'up' | 'down'
    label?: string
  }
  icon?: React.ElementType
  className?: string
  color?: 'brand' | 'success' | 'info' | 'warning'
}

export function AnalyticsCard({
  title,
  value,
  trend,
  icon: Icon,
  className,
  color = 'brand',
}: AnalyticsCardProps) {
  const colorMap = {
    brand: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    success: 'text-success bg-success/10 border-success/20',
    info: 'text-info bg-info/10 border-info/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
  }

  return (
    <div
      className={cn(
        'relative bg-card border border-border rounded-2xl p-6 overflow-hidden',
        'transition-all duration-base hover:border-ring/40 hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight text-foreground">{value}</h3>
        </div>
        {Icon && (
          <div className={cn('flex items-center justify-center size-10 rounded-xl border shrink-0', colorMap[color])}>
            <Icon className="size-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 font-medium px-2 py-0.5 rounded-full shrink-0',
              trend.direction === 'up'
                ? 'text-success bg-success/10'
                : 'text-destructive bg-destructive/10'
            )}
          >
            {trend.direction === 'up' ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {trend.value}
          </span>
          {trend.label && (
            <span className="text-muted-foreground truncate">{trend.label}</span>
          )}
        </div>
      )}
    </div>
  )
}
export default AnalyticsCard
