/**
 * Dashboard API Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Custom service for Candidate and Recruiter dashboard data aggregations.
 */

import { httpGet, httpPost } from '@/api/http'
import type { ApiResponse, JobDTO } from '@hireflow/types'

export interface CandidateDashboardStats {
  aiMatches: JobDTO[]
  applicationsCount: number
  profileViews: number
  savedCount: number
}

export interface RecruiterDashboardStats {
  activeJobs: JobDTO[]
  totalApplicants: number
  pipeline: {
    applied: number
    screening: number
    interview: number
    offer: number
  }
}

export const dashboardApi = {
  /**
   * Fetches data required for the Candidate Dashboard.
   */
  getCandidateStats: async (): Promise<CandidateDashboardStats> => {
    // 1. Fetch current candidate profile from /auth/me
    const userRes = await httpGet<ApiResponse<any>>('/auth/me')
    const user = userRes.data
    const candidateProfileId = user?.candidateProfile?.id

    if (!candidateProfileId) {
      throw new Error('Candidate profile not found')
    }

    // 2. Fetch applications and saved jobs in parallel
    const [appsRes, savedRes] = await Promise.all([
      httpGet<ApiResponse<any[]>>(`/applications/candidate/${candidateProfileId}`),
      httpGet<ApiResponse<any[]>>('/candidates/saved')
    ])
    
    const applicationsCount = (appsRes.data || []).length
    const savedCount = (savedRes.data || []).length

    // 3. AI Matches are now fetched independently via useAIMatchRecommendations 
    // to prevent blocking the dashboard hydration for 5+ seconds.
    const aiMatches: JobDTO[] = []

    const profileViews = user?.candidateProfile?.profileCompletionScore || 85

    return {
      aiMatches,
      applicationsCount,
      profileViews,
      savedCount,
    }
  },

  /**
   * Fetches data required for the Recruiter Dashboard.
   */
  getRecruiterStats: async (companyId: string): Promise<RecruiterDashboardStats> => {
    // 1. Fetch jobs posted by the company
    const jobsRes = await httpGet<ApiResponse<JobDTO[]>>('/jobs', { companyId })
    const companyJobs: JobDTO[] = jobsRes.data || []

    // 2. Fetch recruiter analytics
    let totalApplicants = 0
    const pipeline = { applied: 0, screening: 0, interview: 0, offer: 0 }

    try {
      const analyticsRes = await httpGet<ApiResponse<any>>('/recruiter/analytics', { companyId })
      const analytics = analyticsRes.data
      if (analytics) {
        totalApplicants = analytics.applications?.total || 0
        const byStatus = analytics.applications?.byStatus || {}
        pipeline.applied = byStatus.applied || 0
        pipeline.screening = byStatus.screening || 0
        pipeline.interview = byStatus.interview || 0
        pipeline.offer = byStatus.offer || 0
      }
    } catch (err) {
      console.error('Failed to fetch recruiter analytics:', err)
    }

    return {
      activeJobs: companyJobs.filter((j) => j.status === 'active'),
      totalApplicants,
      pipeline,
    }
  },
}
