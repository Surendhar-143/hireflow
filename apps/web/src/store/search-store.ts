import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { JobFilters } from '@hireflow/types'

interface SearchStore {
  query: string
  setQuery: (q: string) => void
  filters: JobFilters
  setFilters: (f: Partial<JobFilters>) => void
  resetFilters: () => void
  activeFilterCount: number
  recentSearches: string[]
  addRecentSearch: (q: string) => void
  clearRecentSearches: () => void
  savedJobs: string[]
  toggleSaveJob: (id: string) => void
  isJobSaved: (id: string) => boolean
  viewMode: 'grid' | 'list'
  setViewMode: (v: 'grid' | 'list') => void
}

const DEFAULT_FILTERS: JobFilters = {}

function countActiveFilters(f: JobFilters): number {
  return [
    f.type?.length,
    f.workMode?.length,
    f.experienceLevel?.length,
    f.skills?.length,
    f.location,
    f.salaryMin,
    f.postedWithin,
  ].filter(Boolean).length
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      query: '',
      setQuery: (query) => set({ query }),

      filters: DEFAULT_FILTERS,
      setFilters: (partial) =>
        set((s) => {
          const filters = { ...s.filters, ...partial }
          return { filters, activeFilterCount: countActiveFilters(filters) }
        }),
      resetFilters: () => set({ filters: DEFAULT_FILTERS, activeFilterCount: 0 }),
      activeFilterCount: 0,

      recentSearches: [],
      addRecentSearch: (q) => {
        if (!q.trim()) return
        set((s) => ({
          recentSearches: [q, ...s.recentSearches.filter((r) => r !== q)].slice(0, 8),
        }))
      },
      clearRecentSearches: () => set({ recentSearches: [] }),

      savedJobs: [],
      toggleSaveJob: (id) =>
        set((s) => ({
          savedJobs: s.savedJobs.includes(id)
            ? s.savedJobs.filter((j) => j !== id)
            : [...s.savedJobs, id],
        })),
      isJobSaved: (id) => get().savedJobs.includes(id),

      viewMode: 'list',
      setViewMode: (viewMode) => set({ viewMode }),
    }),
    {
      name: 'hireflow-search',
      partialize: (s) => ({
        recentSearches: s.recentSearches,
        savedJobs: s.savedJobs,
        viewMode: s.viewMode,
        filters: s.filters,
      }),
    }
  )
)
