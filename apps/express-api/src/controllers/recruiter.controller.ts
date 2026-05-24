import { Request, Response, NextFunction } from 'express'
import { PipelineService } from '../services/pipeline.service'
import { AnalyticsService } from '../services/analytics.service'
import { sendSuccess } from '../utils/response'
import { AppError } from '../errors/AppError'

const pipelineService = new PipelineService()
const analyticsService = new AnalyticsService()

export class RecruiterController {
  async getPipeline(req: Request, res: Response, next: NextFunction) {
    try {
      const jobId = req.params.jobId as string
      if (!jobId) {
        throw new AppError('Job ID is required', 400)
      }

      const result = await pipelineService.getJobPipeline(jobId)
      return sendSuccess(res, result, 'Recruitment pipeline stage counts retrieved')
    } catch (error) {
      next(error)
    }
  }

  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      let companyId = req.query.companyId as string
      if (req.user?.role === 'recruiter') {
        companyId = req.user.recruiterProfile?.companyId as string
      }

      if (!companyId) {
        throw new AppError('Company ID query parameter is required', 400)
      }

      const result = await analyticsService.getRecruiterAnalytics(companyId)
      return sendSuccess(res, result, 'Recruiter analytics dashboard stats retrieved')
    } catch (error) {
      next(error)
    }
  }
}
export default RecruiterController
