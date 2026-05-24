import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WorkExperienceInput {
  title: string
  company: string
  startDate: string
  endDate?: string
  current: boolean
  description?: string
}

interface CandidateStore {
  // Onboarding wizard flow
  onboardingStep: number
  setOnboardingStep: (step: number) => void
  onboardingData: {
    headline: string
    bio: string
    location: string
    skills: string[]
    experience: WorkExperienceInput[]
    openToWork: boolean
  }
  updateOnboardingData: (data: Partial<CandidateStore['onboardingData']>) => void
  resetOnboarding: () => void

  // Profile completions
  completenessScore: number
  calculateCompleteness: () => void
}

const INITIAL_ONBOARDING_DATA = {
  headline: '',
  bio: '',
  location: '',
  skills: [],
  experience: [],
  openToWork: true,
}

export const useCandidateStore = create<CandidateStore>()(
  persist(
    (set, get) => ({
      onboardingStep: 0,
      setOnboardingStep: (onboardingStep) => set({ onboardingStep }),

      onboardingData: INITIAL_ONBOARDING_DATA,
      updateOnboardingData: (partial) =>
        set((s) => ({
          onboardingData: { ...s.onboardingData, ...partial },
        })),
      resetOnboarding: () =>
        set({
          onboardingStep: 0,
          onboardingData: INITIAL_ONBOARDING_DATA,
        }),

      completenessScore: 0,
      calculateCompleteness: () => {
        const { onboardingData } = get()
        let score = 0
        if (onboardingData.headline) score += 20
        if (onboardingData.bio) score += 20
        if (onboardingData.location) score += 15
        if (onboardingData.skills.length > 0) score += 25
        if (onboardingData.experience.length > 0) score += 20
        set({ completenessScore: score })
      },
    }),
    {
      name: 'hireflow-candidate-store',
      partialize: (s) => ({
        onboardingStep: s.onboardingStep,
        onboardingData: s.onboardingData,
      }),
    }
  )
)
