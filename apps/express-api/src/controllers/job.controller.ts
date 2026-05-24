import { Request, Response, NextFunction } from 'express'
import { JobService } from '../services/job.service'
import { sendSuccess } from '../utils/response'
import { JobFilters } from '@hireflow/types'
import { AppError } from '../errors/AppError'

const jobService = new JobService()

export class JobController {
  async getJob(req: Request, res: Response, next: NextFunction) {
    try {
      const idOrSlug = req.params.idOrSlug as string
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)

      const job = isUuid
        ? await jobService.getJobById(idOrSlug, true)
        : await jobService.getJobBySlug(idOrSlug, true)

      return sendSuccess(res, job, 'Job details retrieved')
    } catch (error) {
      next(error)
    }
  }

  async listJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const cursor = req.query.cursor as string | undefined
      const limit = parseInt(req.query.limit as string, 10) || 10

      const filters: JobFilters = {
        query: req.query.query as string | undefined,
        location: req.query.location as string | undefined,
        companyId: req.query.companyId as string | undefined,
        postedWithin: req.query.postedWithin as any | undefined,
        salaryMin: req.query.salaryMin ? parseInt(req.query.salaryMin as string, 10) : undefined,
        salaryMax: req.query.salaryMax ? parseInt(req.query.salaryMax as string, 10) : undefined,
      }

      if (req.query.type) {
        filters.type = (req.query.type as string).split(',') as any[]
      }
      if (req.query.workMode) {
        filters.workMode = (req.query.workMode as string).split(',') as any[]
      }
      if (req.query.experienceLevel) {
        filters.experienceLevel = (req.query.experienceLevel as string).split(',') as any[]
      }
      if (req.query.skills) {
        filters.skills = (req.query.skills as string).split(',')
      }

      const result = await jobService.listJobs(cursor, limit, filters)
      return sendSuccess(res, result.data, 'Jobs listed successfully', 200, {
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
        limit,
      })
    } catch (error) {
      next(error)
    }
  }

  async createJob(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user?.role === 'recruiter') {
        req.body.companyId = req.user.recruiterProfile?.companyId
      }

      const job = await jobService.createJob(req.body)
      return sendSuccess(res, job, 'Job post created successfully', 201)
    } catch (error) {
      next(error)
    }
  }

  async updateJob(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string
      const jobToUpdate = await jobService.getJobById(id)

      if (req.user?.role === 'recruiter' && jobToUpdate.companyId !== req.user.recruiterProfile?.companyId) {
        throw new AppError('Forbidden: You can only update jobs posted by your own company', 403)
      }

      const job = await jobService.updateJob(id, req.body)
      return sendSuccess(res, job, 'Job post updated successfully')
    } catch (error) {
      next(error)
    }
  }

  async deleteJob(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string
      const jobToDelete = await jobService.getJobById(id)

      if (req.user?.role === 'recruiter' && jobToDelete.companyId !== req.user.recruiterProfile?.companyId) {
        throw new AppError('Forbidden: You can only delete jobs posted by your own company', 403)
      }

      await jobService.deleteJob(id)
      return sendSuccess(res, null, 'Job post deleted successfully')
    } catch (error) {
      next(error)
    }
  }
}
export default JobController
