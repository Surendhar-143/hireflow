/**
 * Companies API Service
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { httpGet } from '@/api/http'
import type { ApiResponse, CompanyDTO, OffsetPage } from '@hireflow/types'

export const companiesApi = {
  /**
   * Paginated company listing with optional keyword search.
   */
  list: async (params: {
    page?: number
    limit?: number
    query?: string
  } = {}): Promise<OffsetPage<CompanyDTO>> => {
    const res = await httpGet<ApiResponse<CompanyDTO[]>>('/companies', {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      query: params.query,
    })
    return {
      data: res.data ?? [],
      total: (res.meta as any)?.total ?? 0,
      page: (res.meta as any)?.page ?? 1,
      pageSize: (res.meta as any)?.pageSize ?? 20,
      hasMore: (res.meta as any)?.hasMore ?? false,
    }
  },

  /**
   * Single company by slug (includes jobs array).
   */
  get: async (slug: string): Promise<CompanyDTO> => {
    const res = await httpGet<ApiResponse<CompanyDTO>>(`/companies/${slug}`)
    return res.data
  },
}
