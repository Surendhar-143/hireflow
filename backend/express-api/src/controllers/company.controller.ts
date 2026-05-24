import { Request, Response, NextFunction } from 'express'
import { CompanyService } from '../services/company.service'
import { sendSuccess } from '../utils/response'
import { AppError } from '../errors/AppError'

const companyService = new CompanyService()

export class CompanyController {
  async getCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const idOrSlug = req.params.idOrSlug as string
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)

      const company = isUuid
        ? await companyService.getCompanyById(idOrSlug)
        : await companyService.getCompanyBySlug(idOrSlug)

      return sendSuccess(res, company, 'Company profile retrieved')
    } catch (error) {
      next(error)
    }
  }

  async listCompanies(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1
      const limit = parseInt(req.query.limit as string, 10) || 10
      const query = req.query.query as string | undefined

      const result = await companyService.listCompanies(page, limit, query)
      return sendSuccess(res, result.data, 'Companies listed successfully', 200, {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        hasMore: result.hasMore,
      })
    } catch (error) {
      next(error)
    }
  }

  async createCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const company = await companyService.createCompany(req.body)
      return sendSuccess(res, company, 'Company profile created successfully', 201)
    } catch (error) {
      next(error)
    }
  }

  async updateCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string

      if (req.user?.role === 'recruiter' && req.user.recruiterProfile?.companyId !== id) {
        throw new AppError('Forbidden: You can only update your own company', 403)
      }

      const company = await companyService.updateCompany(id, req.body)
      return sendSuccess(res, company, 'Company profile updated successfully')
    } catch (error) {
      next(error)
    }
  }

  async deleteCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string

      if (req.user?.role === 'recruiter' && req.user.recruiterProfile?.companyId !== id) {
        throw new AppError('Forbidden: You can only delete your own company', 403)
      }

      await companyService.deleteCompany(id)
      return sendSuccess(res, null, 'Company profile deleted successfully')
    } catch (error) {
      next(error)
    }
  }
}
export default CompanyController
