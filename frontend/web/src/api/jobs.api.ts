/**
 * Jobs API Service
 * ─────────────────────────────────────────────────────────────────────────────
 * All job-related API calls. Returns typed DTOs — never raw server shapes.
 */

import { httpGet, httpPost, httpPatch, httpDelete } from '@/api/http'
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

  /**
   * Creates a new job posting (recruiter only).
   */
  create: async (payload: Omit<JobDTO, 'id' | 'company' | 'applicantCount' | 'viewCount' | 'createdAt' | 'updatedAt'>): Promise<JobDTO> => {
    const res = await httpPost<ApiResponse<JobDTO>>('/jobs', payload)
    return res.data
  },

  /**
   * Updates an existing job posting (recruiter only).
   */
  update: async (id: string, payload: Partial<JobDTO>): Promise<JobDTO> => {
    const res = await httpPatch<ApiResponse<JobDTO>>(`/jobs/${id}`, payload)
    return res.data
  },

  /**
   * Deletes a job posting (recruiter only).
   */
  delete: async (id: string): Promise<void> => {
    await httpDelete(`/jobs/${id}`)
  },
}
