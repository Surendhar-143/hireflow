import { CompanyRepository } from '../repositories/company.repository'
import { CompanySchema } from '@hireflow/schemas'
import { AppError } from '../errors/AppError'
import { CompanyDTO, OffsetPage } from '@hireflow/types'
import { mapCompany } from '../lib/mappers'

const companyRepository = new CompanyRepository()

export class CompanyService {
  async getCompanyById(id: string): Promise<CompanyDTO> {
    const company = await companyRepository.findById(id)
    if (!company) throw new AppError('Company not found', 404)
    return mapCompany(company)
  }

  async getCompanyBySlug(slug: string): Promise<CompanyDTO> {
    const company = await companyRepository.findBySlug(slug)
    if (!company) throw new AppError('Company not found', 404)
    return mapCompany(company)
  }

  async listCompanies(
    page: number,
    limit: number,
    query?: string
  ): Promise<OffsetPage<CompanyDTO>> {
    const result = await companyRepository.findAll({ page, limit, query })
    return {
      data: result.data.map(mapCompany),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      hasMore: result.hasMore,
    }
  }

  async createCompany(data: unknown): Promise<CompanyDTO> {
    const parsed = CompanySchema.parse(data)

    const existing = await companyRepository.findBySlug(parsed.slug)
    if (existing) throw new AppError('Company slug already in use', 400)

    const company = await companyRepository.create(parsed as any)
    return mapCompany(company)
  }

  async updateCompany(id: string, data: unknown): Promise<CompanyDTO> {
    await this.getCompanyById(id)
    const parsed = CompanySchema.partial().parse(data)

    if (parsed.slug) {
      const existing = await companyRepository.findBySlug(parsed.slug)
      if (existing && existing.id !== id) throw new AppError('Company slug already in use', 400)
    }

    const updated = await companyRepository.update(id, parsed as any)
    return mapCompany(updated)
  }

  async deleteCompany(id: string): Promise<void> {
    await this.getCompanyById(id)
    await companyRepository.delete(id)
  }
}

export default CompanyService
