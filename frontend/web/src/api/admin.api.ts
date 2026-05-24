import { httpGet, httpPost } from './http'
import type { ApiResponse } from '@hireflow/types'

export interface AuditLogDTO {
  id: string
  actorId: string | null
  action: string
  ipAddress: string | null
  userAgent: string | null
  resourceType: string
  resourceId: string | null
  payload: any
  createdAt: string
  actor: {
    id: string
    email: string
    name: string
    role: string
  } | null
}

export interface CandidateWithUser {
  id: string
  userId: string
  headline: string | null
  bio: string | null
  location: string | null
  skills: string[]
  openToWork: boolean
  createdAt: string
  user: {
    id: string
    email: string
    name: string
    avatar: string | null
  }
}

export const adminApi = {
  getAuditLogs: async (): Promise<AuditLogDTO[]> => {
    const res = await httpGet<ApiResponse<AuditLogDTO[]>>('/admin/logs')
    return res.data
  },
  listCandidates: async (): Promise<CandidateWithUser[]> => {
    const res = await httpGet<ApiResponse<CandidateWithUser[]>>('/admin/candidates')
    return res.data
  },
  toggleCandidateVisibility: async (id: string): Promise<any> => {
    const res = await httpPost<ApiResponse<any>>(`/admin/candidates/${id}/toggle-visibility`, {})
    return res.data
  }
}
export default adminApi
