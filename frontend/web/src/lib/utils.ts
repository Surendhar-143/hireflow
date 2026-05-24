import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { httpGet } from '@/api/http'
import type { ApiResponse } from '@hireflow/types'

/**
 * Utility: merge Tailwind classes safely, resolving conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as compact (e.g., 1200 → 1.2K)
 */
export function formatCompact(n: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact' }).format(n)
}

/**
 * Format a date as relative (e.g., "3 days ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

/**
 * Format salary range (e.g., "$80K – $120K")
 */
export function formatSalary(min: number, max: number, currency = 'USD'): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 0,
    }).format(n)
  return `${fmt(min)} – ${fmt(max)}`
}

/**
 * Get user initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: unknown[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as T
}

/**
 * Resolves a secure presigned read URL from the backend if the raw resumeUrl is a Supabase storage path.
 */
export async function getSecureResumeUrl(rawUrl: string | null | undefined): Promise<string> {
  if (!rawUrl) return ''
  
  if (rawUrl.includes('/resumes/') || !rawUrl.startsWith('http')) {
    const fileName = rawUrl.substring(rawUrl.lastIndexOf('/') + 1)
    try {
      const res = await httpGet<ApiResponse<{ signedUrl: string }>>('/uploads/read', {
        path: fileName,
        bucket: 'resumes'
      })
      return res.data.signedUrl
    } catch (err) {
      console.error('Failed to retrieve secure read URL for resume', err)
      return rawUrl
    }
  }
  return rawUrl
}
