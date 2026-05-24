/**
 * Candidates API Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles candidate profile updates, history persistence, and completeness.
 */

import { httpPut } from '@/api/http'
import type { ApiResponse } from '@hireflow/types'

export const candidatesApi = {
  /**
   * Updates the candidate profile data and triggers completeness score recalculation.
   */
  updateProfile: async (payload: {
    headline?: string
    bio?: string
    location?: string
    skills?: string[]
    experience?: any[]
    education?: any[]
    linkedinUrl?: string
    githubUrl?: string
    portfolioUrl?: string
    openToWork?: boolean
    resumeUrl?: string
  }): Promise<any> => {
    const res = await httpPut<ApiResponse<any>>('/candidates/profile', payload)
    return res.data
  },
}
