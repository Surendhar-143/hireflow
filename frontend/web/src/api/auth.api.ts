import { httpGet, httpPost } from '@/api/http'
import type { ApiResponse, UserDTO } from '@hireflow/types'

export const authApi = {
  /**
   * Retrieves the current user profile context.
   */
  getMe: async (): Promise<UserDTO> => {
    const res = await httpGet<ApiResponse<UserDTO>>('/auth/me')
    return res.data
  },

  /**
   * Completes candidate or recruiter onboarding.
   */
  onboard: async (payload: {
    role: 'candidate' | 'recruiter'
    name?: string
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
  }): Promise<UserDTO> => {
    const res = await httpPost<ApiResponse<UserDTO>>('/auth/onboard', payload)
    return res.data
  },
}
