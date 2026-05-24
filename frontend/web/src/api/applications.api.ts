import { httpGet, httpPost, httpPatch } from '@/api/http'
import type { ApiResponse, ApplicationDTO } from '@hireflow/types'

export const applicationsApi = {
  /**
   * Lists all applications submitted by the candidate.
   */
  listByCandidate: async (candidateId: string): Promise<ApplicationDTO[]> => {
    const res = await httpGet<ApiResponse<ApplicationDTO[]>>(`/applications/candidate/${candidateId}`)
    return res.data ?? []
  },

  /**
   * Lists all applications submitted for a job (recruiter only).
   */
  listByJob: async (jobId: string): Promise<ApplicationDTO[]> => {
    const res = await httpGet<ApiResponse<ApplicationDTO[]>>(`/applications/job/${jobId}`)
    return res.data ?? []
  },

  /**
   * Submits a new job application.
   */
  submit: async (payload: {
    jobId: string
    coverLetter?: string
    resumeUrl?: string
  }): Promise<ApplicationDTO> => {
    const res = await httpPost<ApiResponse<ApplicationDTO>>('/applications', payload)
    return res.data
  },

  /**
   * Retrieves single application detail with timeline events.
   */
  get: async (id: string): Promise<ApplicationDTO> => {
    const res = await httpGet<ApiResponse<ApplicationDTO>>(`/applications/${id}`)
    return res.data
  },

  /**
   * Updates an application status stage (recruiter only).
   */
  updateStatus: async (
    id: string,
    payload: { status: string; note?: string }
  ): Promise<ApplicationDTO> => {
    const res = await httpPatch<ApiResponse<ApplicationDTO>>(`/applications/${id}/status`, payload)
    return res.data
  },
}
