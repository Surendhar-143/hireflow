import type { Job, Company, JobFilters } from '@hireflow/types'

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1'

async function request(path: string, options: RequestInit = {}, token?: string) {
  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Convert database flat salary columns to frontend nested salary object
function mapJob(job: any): Job {
  return {
    ...job,
    salary: job.salaryMin !== null && job.salaryMin !== undefined
      ? {
          min: job.salaryMin,
          max: job.salaryMax,
          currency: job.salaryCurrency || 'USD',
        }
      : undefined,
  }
}

export const apiClient = {
  jobs: {
    list: async (filters?: JobFilters): Promise<{ data: Job[]; total: number }> => {
      const params = new URLSearchParams()
      params.append('limit', '50') // Fetch up to 50 jobs for list
      
      if (filters) {
        if (filters.query) params.append('query', filters.query)
        if (filters.location) params.append('location', filters.location)
        if (filters.companyId) params.append('companyId', filters.companyId)
        if (filters.postedWithin) params.append('postedWithin', filters.postedWithin)
        if (filters.salaryMin !== undefined) params.append('salaryMin', String(filters.salaryMin))
        if (filters.salaryMax !== undefined) params.append('salaryMax', String(filters.salaryMax))
        if (filters.type && filters.type.length > 0) params.append('type', filters.type.join(','))
        if (filters.workMode && filters.workMode.length > 0) params.append('workMode', filters.workMode.join(','))
        if (filters.experienceLevel && filters.experienceLevel.length > 0) params.append('experienceLevel', filters.experienceLevel.join(','))
        if (filters.skills && filters.skills.length > 0) params.append('skills', filters.skills.join(','))
      }

      // Public / Candidate endpoint, authenticated with mock candidate token
      const resObj = await request(`/jobs?${params.toString()}`, {}, 'mock-candidate-token')
      const mappedData: Job[] = (resObj.data || []).map(mapJob)
      return { data: mappedData, total: mappedData.length }
    },
    getById: async (idOrSlug: string): Promise<Job | undefined> => {
      try {
        const resObj = await request(`/jobs/${idOrSlug}`, {}, 'mock-candidate-token')
        return resObj.data ? mapJob(resObj.data) : undefined
      } catch (e) {
        console.error(`Failed to fetch job with ID/Slug "${idOrSlug}":`, e)
        return undefined
      }
    },
  },
  companies: {
    list: async (): Promise<{ data: Company[]; total: number }> => {
      const resObj = await request('/companies?limit=50', {}, 'mock-candidate-token')
      return { data: resObj.data || [], total: (resObj.data || []).length }
    },
    getBySlug: async (slug: string): Promise<Company | undefined> => {
      try {
        const resObj = await request(`/companies/${slug}`, {}, 'mock-candidate-token')
        return resObj.data || undefined
      } catch (e) {
        console.error(`Failed to fetch company with slug "${slug}":`, e)
        return undefined
      }
    },
  },
  dashboard: {
    getCandidateStats: async () => {
      // 1. Fetch current candidate profile from /auth/me
      const userRes = await request('/auth/me', {}, 'mock-candidate-token')
      const user = userRes.data
      const candidateProfileId = user?.candidateProfile?.id

      if (!candidateProfileId) {
        throw new Error('Candidate profile not found')
      }

      // 2. Fetch applications count
      const appsRes = await request(`/applications/candidate/${candidateProfileId}`, {}, 'mock-candidate-token')
      const applicationsCount = (appsRes.data || []).length

      // 3. Fetch saved jobs count
      const savedRes = await request('/candidates/saved', {}, 'mock-candidate-token')
      const savedCount = (savedRes.data || []).length

      // 4. Fetch AI matched jobs
      let aiMatches: Job[] = []
      try {
        const aiRes = await request('/ai/match', {
          method: 'POST',
          body: JSON.stringify({ candidateId: candidateProfileId }),
        }, 'mock-candidate-token')
        aiMatches = (aiRes.data || []).map(mapJob)
      } catch (err) {
        console.error('Failed to fetch AI matches:', err)
      }

      // 5. Use profile completeness score as a metric
      const profileViews = user?.candidateProfile?.profileCompletionScore || 85

      return {
        aiMatches,
        applicationsCount,
        profileViews,
        savedCount,
      }
    },
    getRecruiterStats: async (companyId: string) => {
      // 1. Fetch jobs posted by the company
      const jobsRes = await request(`/jobs?companyId=${companyId}`, {}, 'mock-recruiter-token')
      const companyJobs: Job[] = (jobsRes.data || []).map(mapJob)

      // 2. Fetch recruiter analytics
      let totalApplicants = 0
      const pipeline = { applied: 0, screening: 0, interview: 0, offer: 0 }

      try {
        const analyticsRes = await request(`/recruiter/analytics?companyId=${companyId}`, {}, 'mock-recruiter-token')
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
        activeJobs: companyJobs.filter((j: Job) => j.status === 'active'),
        totalApplicants,
        pipeline,
      }
    },
  },
}
