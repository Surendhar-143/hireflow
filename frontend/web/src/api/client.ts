/**
 * API Client — Unified barrel export
 * ─────────────────────────────────────────────────────────────────────────────
 * Re-exports all service modules. Import from here OR from individual modules.
 */

export { jobsApi } from '@/api/jobs.api'
export { companiesApi } from '@/api/companies.api'
export { searchApi } from '@/api/search.api'
export { dashboardApi } from '@/api/dashboard.api'
export { authApi } from '@/api/auth.api'
export { candidatesApi } from '@/api/candidates.api'
export { applicationsApi } from '@/api/applications.api'
export { uploadApi } from '@/api/upload.api'
export { ApiError } from '@/api/http'

// ─── Legacy compat layer ──────────────────────────────────────────────────────
// Kept for any pages still using the old apiClient shape.
// Migrate gradually to the individual service modules above.

import { jobsApi } from '@/api/jobs.api'
import { companiesApi } from '@/api/companies.api'
import type { JobDTO, JobFilters, CompanyDTO } from '@hireflow/types'

export const apiClient = {
  jobs: {
    list: async (filters?: JobFilters): Promise<{ data: JobDTO[]; total: number }> => {
      const page = await jobsApi.list(filters)
      return { data: page.data, total: page.data.length }
    },
    getById: async (idOrSlug: string): Promise<JobDTO | undefined> => {
      try {
        return await jobsApi.get(idOrSlug)
      } catch {
        return undefined
      }
    },
  },
  companies: {
    list: async (): Promise<{ data: CompanyDTO[]; total: number }> => {
      const page = await companiesApi.list()
      return { data: page.data, total: page.total }
    },
    getBySlug: async (slug: string): Promise<CompanyDTO | undefined> => {
      try {
        return await companiesApi.get(slug)
      } catch {
        return undefined
      }
    },
  },
}
