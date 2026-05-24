import React, { useMemo, useState } from 'react'
import { Search, LayoutGrid, LayoutList, Sparkles, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SkeletonJobCard } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useSearchStore } from '@/store/search-store'
import { JobCard } from '@/features/jobs/JobCard'
import { JobFilters, ActiveFilterChips } from '@/features/jobs/JobFilters'
import { SemanticSearchBar } from '@/features/ai/SemanticSearchBar'
import { useJobs } from '@/hooks/useQueries'
import { useSEO } from '@/hooks/useSEO'

// ─── Mobile Filter Drawer ─────────────────────────────────────────────────────
function MobileFilterDrawer({
  open, onClose, resultCount,
}: { open: boolean; onClose: () => void; resultCount: number }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 inset-x-0 z-50 bg-surface-elevated border-t border-border rounded-t-2xl p-5 pb-8 max-h-[85vh] overflow-y-auto md:hidden"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold">Filters</span>
              <Button variant="ghost" size="icon-sm" onClick={onClose}><X className="size-4" /></Button>
            </div>
            <JobFilters resultCount={resultCount} />
            <Button variant="primary" className="w-full mt-4" onClick={onClose}>
              Show {resultCount} results
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function SearchSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonJobCard key={i} />
      ))}
    </div>
  )
}

// ─── Job Search Page ──────────────────────────────────────────────────────────
export default function JobSearch() {
  const { query, setQuery, filters, viewMode, setViewMode, addRecentSearch, activeFilterCount } =
    useSearchStore()
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [inputValue, setInputValue] = useState(query)

  useSEO({
    title: query ? `Search results for "${query}"` : 'Browse Tech Jobs',
    description: 'Find your next remote or onsite tech role at world-class companies.',
  })

  // Use React Query
  const { data, isLoading } = useJobs({ ...filters, query })
  const results = data?.data || []
  
  const { featuredJobs, regularJobs } = useMemo(() => {
    return {
      featuredJobs: results.filter((j) => j.featured),
      regularJobs: results.filter((j) => !j.featured),
    }
  }, [results])

  return (
    <div className="min-h-screen bg-background">
      {/* ── Search Hero ────────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-surface-elevated/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h1 className="text-2xl font-bold text-foreground mb-1">Browse Jobs</h1>
            <p className="text-sm text-muted-foreground mb-5">
              Explore open roles at world-class companies
            </p>

            {/* Search bar */}
            <SemanticSearchBar 
              initialValue={inputValue}
              onSearch={(val) => {
                setInputValue(val)
                setQuery(val.trim())
                if (val.trim()) addRecentSearch(val.trim())
              }}
              onClear={() => {
                setInputValue('')
                setQuery('')
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* ── Main Layout ────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">

          {/* Filters Sidebar (desktop) */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-[calc(56px+24px)]">
              <JobFilters resultCount={results.length} />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Mobile filter trigger */}
                <Button
                  variant="outline"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setMobileFilterOpen(true)}
                >
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1.5 size-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{results.length}</span> results
                  {query && (
                    <> for <span className="text-foreground font-medium">"{query}"</span></>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setViewMode('list')}
                  className={cn('p-1.5 rounded-md transition-colors', viewMode === 'list' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground')}
                  aria-label="List view"
                >
                  <LayoutList className="size-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn('p-1.5 rounded-md transition-colors', viewMode === 'grid' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground')}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="size-4" />
                </button>
              </div>
            </div>

            {/* Active filter chips */}
            <AnimatePresence mode="popLayout">
              {activeFilterCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <ActiveFilterChips />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading */}
            {isLoading ? (
              <SearchSkeleton />
            ) : results.length === 0 ? (
              /* Empty state */
              <EmptyState
                icon={<Search className="size-7" />}
                title="No jobs found"
                description={
                  query
                    ? `No results for "${query}". Try different keywords or adjust your filters.`
                    : 'No jobs match your current filters.'
                }
                action={{ label: 'Clear filters', onClick: () => { setQuery(''); setInputValue(''); useSearchStore.getState().resetFilters() } }}
              />
            ) : (
              <>
                {/* Featured jobs */}
                {featuredJobs.length > 0 && !query && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="size-4 text-brand-400" />
                      <span className="text-sm font-semibold text-foreground">Featured Roles</span>
                    </div>
                    <div className={cn(
                      'gap-3',
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2'
                        : 'flex flex-col'
                    )}>
                      {featuredJobs.map((job, i) => (
                        <JobCard key={job.id} job={job} layout={viewMode} index={i} />
                      ))}
                    </div>
                  </div>
                )}

                {/* All / Remaining jobs */}
                {(regularJobs.length > 0 || query) && (
                  <div>
                    {featuredJobs.length > 0 && !query && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-semibold text-foreground">All Jobs</span>
                        <span className="text-xs text-muted-foreground">({regularJobs.length})</span>
                      </div>
                    )}
                    <div className={cn(
                      'gap-3',
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2'
                        : 'flex flex-col'
                    )}>
                      {(query ? results : regularJobs).map((job, i) => (
                        <JobCard key={job.id} job={job} layout={viewMode} index={i} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <MobileFilterDrawer
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        resultCount={results.length}
      />
    </div>
  )
}
