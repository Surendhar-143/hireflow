/**
 * Search API Service
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { httpGet } from '@/api/http'
import type { ApiResponse, SearchResultDTO } from '@hireflow/types'

export const searchApi = {
  /**
   * Cross-entity keyword search across jobs + companies.
   * Returns both result sets in a single round trip.
   */
  search: async (params: {
    q: string
    type?: 'jobs' | 'companies' | 'all'
    limit?: number
  }): Promise<SearchResultDTO> => {
    const res = await httpGet<ApiResponse<SearchResultDTO>>('/search', {
      q: params.q,
      type: params.type ?? 'all',
      limit: params.limit ?? 10,
    })
    return res.data
  },
}
