import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { JobDTO } from '@hireflow/types'

interface RecruiterStore {
  // Job Post Draft State
  jobDraft: Partial<JobDTO>
  setJobDraft: (draft: Partial<JobDTO>) => void
  clearJobDraft: () => void

  // Bulk Selection Actions
  selectedApplicantIds: string[]
  toggleSelectApplicant: (id: string) => void
  setSelectedApplicants: (ids: string[]) => void
  clearSelection: () => void

  // UI state
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const useRecruiterStore = create<RecruiterStore>()(
  persist(
    (set) => ({
      jobDraft: {},
      setJobDraft: (partial) =>
        set((s) => ({
          jobDraft: { ...s.jobDraft, ...partial },
        })),
      clearJobDraft: () => set({ jobDraft: {} }),

      selectedApplicantIds: [],
      toggleSelectApplicant: (id) =>
        set((s) => ({
          selectedApplicantIds: s.selectedApplicantIds.includes(id)
            ? s.selectedApplicantIds.filter((x) => x !== id)
            : [...s.selectedApplicantIds, id],
        })),
      setSelectedApplicants: (selectedApplicantIds) => set({ selectedApplicantIds }),
      clearSelection: () => set({ selectedApplicantIds: [] }),

      activeTab: 'all',
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    {
      name: 'hireflow-recruiter-store',
      partialize: (s) => ({
        jobDraft: s.jobDraft,
      }),
    }
  )
)
