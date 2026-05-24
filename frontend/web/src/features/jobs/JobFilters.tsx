import React, { useState } from 'react'
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSearchStore } from '@/store/search-store'
import type { JobType, WorkMode, ExperienceLevel } from '@hireflow/types'

// ─── Filter data ──────────────────────────────────────────────────────────────
const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
]

const WORK_MODES: { value: WorkMode; label: string }[] = [
  { value: 'remote', label: '🌍 Remote' },
  { value: 'hybrid', label: '🏢 Hybrid' },
  { value: 'onsite', label: '📍 On-site' },
]

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead / Staff' },
  { value: 'executive', label: 'Executive' },
]

const SALARY_RANGES = [
  { label: '$0 – $80K', min: 0, max: 80000 },
  { label: '$80K – $120K', min: 80000, max: 120000 },
  { label: '$120K – $180K', min: 120000, max: 180000 },
  { label: '$180K – $250K', min: 180000, max: 250000 },
  { label: '$250K+', min: 250000, max: 999999 },
]

const POSTED_WITHIN = [
  { value: '24h' as const, label: 'Last 24 hours' },
  { value: '7d' as const, label: 'Last 7 days' },
  { value: '30d' as const, label: 'Last 30 days' },
]

// ─── Filter Section ───────────────────────────────────────────────────────────
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-border last:border-0 py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-sm font-medium text-foreground hover:text-primary transition-colors mb-3"
      >
        {title}
        {open ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Multi-select pill ────────────────────────────────────────────────────────
function FilterPill({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-fast',
        selected
          ? 'bg-primary/15 border-primary/40 text-primary'
          : 'bg-transparent border-border text-muted-foreground hover:border-ring/40 hover:text-foreground'
      )}
    >
      {label}
    </button>
  )
}

// ─── Toggle helpers ───────────────────────────────────────────────────────────
function toggleItem<T>(arr: T[] | undefined, item: T): T[] {
  const a = arr ?? []
  return a.includes(item) ? a.filter((x) => x !== item) : [...a, item]
}

// ─── JobFilters Panel ─────────────────────────────────────────────────────────
interface JobFiltersProps {
  resultCount: number
}

export function JobFilters({ resultCount }: JobFiltersProps) {
  const { filters, setFilters, resetFilters, activeFilterCount } = useSearchStore()

  return (
    <aside className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-1 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="premium" className="text-[10px] px-1.5 h-4">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
          >
            <X className="size-3" /> Clear all
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-3">{resultCount} results</p>

      {/* Job Type */}
      <FilterSection title="Job Type">
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map((t) => (
            <FilterPill
              key={t.value}
              label={t.label}
              selected={filters.type?.includes(t.value) ?? false}
              onClick={() => setFilters({ type: toggleItem(filters.type, t.value) })}
            />
          ))}
        </div>
      </FilterSection>

      {/* Work Mode */}
      <FilterSection title="Work Mode">
        <div className="flex flex-wrap gap-2">
          {WORK_MODES.map((m) => (
            <FilterPill
              key={m.value}
              label={m.label}
              selected={filters.workMode?.includes(m.value) ?? false}
              onClick={() => setFilters({ workMode: toggleItem(filters.workMode, m.value) })}
            />
          ))}
        </div>
      </FilterSection>

      {/* Experience Level */}
      <FilterSection title="Experience Level">
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE_LEVELS.map((l) => (
            <FilterPill
              key={l.value}
              label={l.label}
              selected={filters.experienceLevel?.includes(l.value) ?? false}
              onClick={() =>
                setFilters({ experienceLevel: toggleItem(filters.experienceLevel, l.value) })
              }
            />
          ))}
        </div>
      </FilterSection>

      {/* Salary */}
      <FilterSection title="Salary Range">
        <div className="flex flex-col gap-1.5">
          {SALARY_RANGES.map((r) => {
            const selected = filters.salaryMin === r.min && filters.salaryMax === r.max
            return (
              <button
                key={r.label}
                onClick={() =>
                  setFilters(selected ? { salaryMin: undefined, salaryMax: undefined } : { salaryMin: r.min, salaryMax: r.max })
                }
                className={cn(
                  'flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm text-left transition-colors duration-fast',
                  selected
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <span
                  className={cn(
                    'size-3.5 rounded-full border-2 shrink-0 transition-colors',
                    selected ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                  )}
                />
                {r.label}
              </button>
            )
          })}
        </div>
      </FilterSection>

      {/* Posted Within */}
      <FilterSection title="Posted Within">
        <div className="flex flex-wrap gap-2">
          {POSTED_WITHIN.map((p) => (
            <FilterPill
              key={p.value}
              label={p.label}
              selected={filters.postedWithin === p.value}
              onClick={() =>
                setFilters({ postedWithin: filters.postedWithin === p.value ? undefined : p.value })
              }
            />
          ))}
        </div>
      </FilterSection>
    </aside>
  )
}

// ─── Active Filter Chips ──────────────────────────────────────────────────────
export function ActiveFilterChips() {
  const { filters, setFilters, activeFilterCount } = useSearchStore()
  if (activeFilterCount === 0) return null

  const chips: { label: string; onRemove: () => void }[] = [
    ...(filters.type ?? []).map((t) => ({
      label: t,
      onRemove: () => setFilters({ type: filters.type?.filter((x) => x !== t) }),
    })),
    ...(filters.workMode ?? []).map((m) => ({
      label: m,
      onRemove: () => setFilters({ workMode: filters.workMode?.filter((x) => x !== m) }),
    })),
    ...(filters.experienceLevel ?? []).map((l) => ({
      label: l,
      onRemove: () =>
        setFilters({ experienceLevel: filters.experienceLevel?.filter((x) => x !== l) }),
    })),
    ...(filters.postedWithin
      ? [{ label: `Posted: ${filters.postedWithin}`, onRemove: () => setFilters({ postedWithin: undefined }) }]
      : []),
  ]

  return (
    <motion.div layout className="flex flex-wrap gap-2 items-center">
      {chips.map((chip) => (
        <motion.span
          layout
          key={chip.label}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="text-primary/60 hover:text-primary"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="size-3" />
          </button>
        </motion.span>
      ))}
    </motion.div>
  )
}
