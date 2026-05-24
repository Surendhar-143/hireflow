import { CompanyRepository } from '../repositories/company.repository'
import { CompanySchema } from '@hireflow/schemas'
import { AppError } from '../errors/AppError'

const companyRepository = new CompanyRepository()

export class CompanyService {
  async getCompanyById(id: string) {
    const company = await companyRepository.findById(id)
    if (!company) {
      throw new AppError('Company not found', 404)
    }
    return company
  }

  async getCompanyBySlug(slug: string) {
    const company = await companyRepository.findBySlug(slug)
    if (!company) {
      throw new AppError('Company not found', 404)
    }
    return company
  }

  async listCompanies(page: number, limit: number, query?: string) {
    return companyRepository.findAll({ page, limit, query })
  }

  async createCompany(data: any) {
    const parsed = CompanySchema.parse(data)
    
    const existing = await companyRepository.findBySlug(parsed.slug)
    if (existing) {
      throw new AppError('Company slug already in use', 400)
    }

    return companyRepository.create(parsed)
  }

  async updateCompany(id: string, data: any) {
    await this.getCompanyById(id)

    const parsed = CompanySchema.partial().parse(data)

    if (parsed.slug) {
      const existing = await companyRepository.findBySlug(parsed.slug)
      if (existing && existing.id !== id) {
        throw new AppError('Company slug already in use', 400)
      }
    }

    return companyRepository.update(id, parsed)
  }

  async deleteCompany(id: string) {
    await this.getCompanyById(id)
    return companyRepository.delete(id)
  }
}
export default CompanyService
