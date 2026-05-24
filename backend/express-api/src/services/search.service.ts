import { SearchRepository } from '../repositories/search.repository'
import { mapJob, mapCompany } from '../lib/mappers'
import type { SearchResultDTO } from '@hireflow/types'

const searchRepository = new SearchRepository()

export class SearchService {
  async search(params: {
    q: string
    type: 'jobs' | 'companies' | 'all'
    limit: number
  }): Promise<SearchResultDTO> {
    const raw = await searchRepository.search(params)

    return {
      jobs: raw.jobs.map(mapJob),
      companies: raw.companies.map(mapCompany),
      total: raw.total,
      took: raw.took,
    }
  }
}

export default SearchService
