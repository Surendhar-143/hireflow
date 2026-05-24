/**
 * Jobs API Service
 * ─────────────────────────────────────────────────────────────────────────────
 * All job-related API calls. Returns typed DTOs — never raw server shapes.
 */

import { httpGet, httpPost, httpDelete } from '@/api/http'
import type {
  ApiResponse,
  JobDTO,
  JobFilters,
  CursorPage,
  SavedJobDTO,
} from '@hireflow/types'

// ─── Query param builder ─────────────────────────────────────────────────────

function buildJobParams(
  filters: JobFilters = {},
  cursor?: string,
  limit = 20
): Record<string, string | number | boolean | undefined> {
  return {
    limit,
    cursor,
    query: filters.query,
    location: filters.location,
    companyId: filters.companyId,
    postedWithin: filters.postedWithin,
    salaryMin: filters.salaryMin,
    salaryMax: filters.salaryMax,
    featured: filters.featured,
    sortBy: filters.sortBy,
    type: filters.type?.join(','),
    workMode: filters.workMode?.join(','),
    experienceLevel: filters.experienceLevel?.join(','),
    skills: filters.skills?.join(','),
  }
}

// ─── Jobs API ────────────────────────────────────────────────────────────────

export const jobsApi = {
  /**
   * Paginated job listing with filters.
   * Returns a cursor page — frontend manages cursor state for infinite scroll.
   */
  list: async (filters?: JobFilters, cursor?: string, limit = 20): Promise<CursorPage<JobDTO>> => {
    const res = await httpGet<ApiResponse<JobDTO[]>>(
      '/jobs',
      buildJobParams(filters, cursor, limit)
    )
    return {
      data: res.data ?? [],
      nextCursor: (res.meta as any)?.nextCursor,
      hasMore: (res.meta as any)?.hasMore ?? false,
    }
  },

  /**
   * Single job by UUID or slug.
   */
  get: async (idOrSlug: string): Promise<JobDTO> => {
    const res = await httpGet<ApiResponse<JobDTO>>(`/jobs/${idOrSlug}`)
    return res.data
  },

  /**
   * Related jobs (same company, same skills) — up to 4.
   */
  related: async (jobId: string, companyId: string, skills: string[]): Promise<JobDTO[]> => {
    // Fetch by company (up to 4 active jobs excluding this one)
    const res = await httpGet<ApiResponse<JobDTO[]>>('/jobs', {
      companyId,
      limit: 5,
      skills: skills.slice(0, 3).join(','),
    })
    return (res.data ?? []).filter((j) => j.id !== jobId).slice(0, 4)
  },

  /**
   * Saved jobs for the current candidate.
   */
  saved: {
    list: async (): Promise<SavedJobDTO[]> => {
      const res = await httpGet<ApiResponse<SavedJobDTO[]>>('/candidates/saved')
      return res.data ?? []
    },
    save: async (jobId: string): Promise<void> => {
      await httpPost('/candidates/saved', { jobId })
    },
    remove: async (jobId: string): Promise<void> => {
      await httpDelete(`/candidates/saved/${jobId}`)
    },
  },
}
