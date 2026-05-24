import { Request, Response, NextFunction } from 'express'
import { CandidateService } from '../services/candidate.service'
import { sendSuccess } from '../utils/response'
import { AppError } from '../errors/AppError'

const candidateService = new CandidateService()

export class CandidateController {
  async saveJob(req: Request, res: Response, next: NextFunction) {
    try {
      let { candidateId, jobId } = req.body
      if (req.user?.role === 'candidate') {
        candidateId = req.user.candidateProfile?.id
      }

      if (!candidateId || !jobId) {
        throw new AppError('candidateId and jobId are required', 400)
      }

      const result = await candidateService.saveJob(candidateId, jobId)
      return sendSuccess(res, result, 'Job post saved successfully', 201)
    } catch (error) {
      next(error)
    }
  }

  async unsaveJob(req: Request, res: Response, next: NextFunction) {
    try {
      let { candidateId, jobId } = req.body
      if (req.user?.role === 'candidate') {
        candidateId = req.user.candidateProfile?.id
      }

      if (!candidateId || !jobId) {
        throw new AppError('candidateId and jobId are required', 400)
      }

      const result = await candidateService.unsaveJob(candidateId, jobId)
      return sendSuccess(res, result, 'Job post unsaved successfully')
    } catch (error) {
      next(error)
    }
  }

  async listSavedJobs(req: Request, res: Response, next: NextFunction) {
    try {
      let candidateId = req.query.candidateId as string
      if (req.user?.role === 'candidate') {
        candidateId = req.user.candidateProfile?.id as string
      }

      if (!candidateId) {
        throw new AppError('candidateId query parameter is required', 400)
      }

      const result = await candidateService.listSavedJobs(candidateId)
      return sendSuccess(res, result, 'Saved jobs list retrieved')
    } catch (error) {
      next(error)
    }
  }

  async getProfileScore(req: Request, res: Response, next: NextFunction) {
    try {
      let candidateId = req.params.candidateId as string
      if (req.user?.role === 'candidate') {
        candidateId = req.user.candidateProfile?.id as string
      }

      if (!candidateId) {
        throw new AppError('candidateId parameter is required', 400)
      }

      const result = await candidateService.calculateProfileScore(candidateId)
      return sendSuccess(res, result, 'Candidate profile completeness score calculated')
    } catch (error) {
      next(error)
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }
      
      const candidateUserId = req.user.id
      const profileData = req.body

      const result = await candidateService.updateProfile(candidateUserId, profileData)
      return sendSuccess(res, result, 'Candidate profile updated successfully')
    } catch (error) {
      next(error)
    }
  }
}
export default CandidateController

