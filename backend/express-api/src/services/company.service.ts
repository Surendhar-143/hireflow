import { CompanyRepository } from '../repositories/company.repository'
import { CompanySchema } from '@hireflow/schemas'
import { AppError } from '../errors/AppError'
import { CompanyDTO, OffsetPage } from '@hireflow/types'
import { mapCompany } from '../lib/mappers'
import { cacheGet, cacheSet, cacheDelete, cacheDeletePattern } from '../utils/cache'

const companyRepository = new CompanyRepository()

export class CompanyService {
  async getCompanyById(id: string): Promise<CompanyDTO> {
    const cacheKey = `company:id:${id}`
    const cached = cacheGet<CompanyDTO>(cacheKey)
    if (cached) return cached

    const company = await companyRepository.findById(id)
    if (!company) throw new AppError('Company not found', 404)

    const dto = mapCompany(company)
    // Cache company detail for 10 minutes — company pages rarely change
    cacheSet(cacheKey, dto, 600 * 1000)
    return dto
  }

  async getCompanyBySlug(slug: string): Promise<CompanyDTO> {
    const cacheKey = `company:slug:${slug}`
    const cached = cacheGet<CompanyDTO>(cacheKey)
    if (cached) return cached

    const company = await companyRepository.findBySlug(slug)
    if (!company) throw new AppError('Company not found', 404)

    const dto = mapCompany(company)
    // Cache company detail for 10 minutes
    cacheSet(cacheKey, dto, 600 * 1000)
    return dto
  }

  async listCompanies(
    page: number,
    limit: number,
    query?: string
  ): Promise<OffsetPage<CompanyDTO>> {
    const cacheKey = `companies:list:page=${page}:limit=${limit}:q=${query || ''}`
    const cached = cacheGet<OffsetPage<CompanyDTO>>(cacheKey)
    if (cached) return cached

    const result = await companyRepository.findAll({ page, limit, query })
    const page_data: OffsetPage<CompanyDTO> = {
      data: result.data.map(mapCompany),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      hasMore: result.hasMore,
    }

    // Cache company list for 5 minutes — stable public data
    cacheSet(cacheKey, page_data, 300 * 1000)
    return page_data
  }

  async createCompany(data: unknown): Promise<CompanyDTO> {
    const parsed = CompanySchema.parse(data)

    const existing = await companyRepository.findBySlug(parsed.slug)
    if (existing) throw new AppError('Company slug already in use', 400)

    const company = await companyRepository.create(parsed as any)
    // Invalidate company list caches
    cacheDeletePattern(/^companies:list/)
    return mapCompany(company)
  }

  async updateCompany(id: string, data: unknown): Promise<CompanyDTO> {
    const existing = await this.getCompanyById(id)
    const parsed = CompanySchema.partial().parse(data)

    if (parsed.slug) {
      const slugTaken = await companyRepository.findBySlug(parsed.slug)
      if (slugTaken && slugTaken.id !== id) throw new AppError('Company slug already in use', 400)
    }

    const updated = await companyRepository.update(id, parsed as any)
    // Invalidate this company's caches
    cacheDelete(`company:id:${id}`)
    if (existing.slug) cacheDelete(`company:slug:${existing.slug}`)
    cacheDeletePattern(/^companies:list/)
    return mapCompany(updated)
  }

  async deleteCompany(id: string): Promise<void> {
    const company = await this.getCompanyById(id)
    await companyRepository.delete(id)
    cacheDelete(`company:id:${id}`)
    if (company.slug) cacheDelete(`company:slug:${company.slug}`)
    cacheDeletePattern(/^companies:list/)
  }
}

export default CompanyService
