import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        size === 'sm' && 'py-8 px-4 gap-3',
        size === 'md' && 'py-16 px-6 gap-4',
        size === 'lg' && 'py-24 px-8 gap-5',
        className
      )}
      role="status"
      aria-label={title}
    >
      {icon && (
        <div
          className={cn(
            'flex items-center justify-center rounded-2xl bg-muted text-muted-foreground',
            size === 'sm' && 'size-12 [&_svg]:size-5',
            size === 'md' && 'size-16 [&_svg]:size-7',
            size === 'lg' && 'size-20 [&_svg]:size-9'
          )}
        >
          {icon}
        </div>
      )}
      <div className="space-y-1.5 max-w-sm">
        <h3
          className={cn(
            'font-semibold text-foreground',
            size === 'sm' && 'text-sm',
            size === 'md' && 'text-base',
            size === 'lg' && 'text-lg'
          )}
        >
          {title}
        </h3>
        {description && (
          <p
            className={cn(
              'text-muted-foreground',
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-sm',
              size === 'lg' && 'text-base'
            )}
          >
            {description}
          </p>
        )}
      </div>
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2 pt-1">
          {action && (
            <Button
              size={size === 'sm' ? 'sm' : 'md'}
              variant="primary"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              size={size === 'sm' ? 'sm' : 'md'}
              variant="ghost"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
