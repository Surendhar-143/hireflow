import { Request, Response, NextFunction } from 'express'
import { AIService } from '../services/ai.service'
import { UserRepository } from '../repositories/user.repository'
import { JobRepository } from '../repositories/job.repository'
import { sendSuccess } from '../utils/response'
import { AppError } from '../errors/AppError'

const aiService = new AIService()
const userRepository = new UserRepository()
const jobRepository = new JobRepository()

export class AIController {
  async matchJobs(req: Request, res: Response, next: NextFunction) {
    try {
      let { candidateId } = req.body
      if (req.user?.role === 'candidate') {
        candidateId = req.user.candidateProfile?.id
      }

      if (!candidateId) {
        throw new AppError('candidateId is required in body', 400)
      }

      const user = await userRepository.findById(candidateId)
      if (!user || !user.candidateProfile) {
        throw new AppError('Candidate profile not found', 404)
      }

      const jobsResult = await jobRepository.findAll({ limit: 100, filters: {} })
      const jobs = jobsResult.data

      if (jobs.length === 0) {
        return sendSuccess(res, [], 'No active jobs available for recommendation matching')
      }

      const scores = await aiService.matchCandidateToJobs(user.candidateProfile, jobs)

      const rankedJobs = scores.map((scoreObj) => {
        const job = jobs.find((j) => j.id === scoreObj.jobId)
        return {
          ...job,
          aiMatchScore: scoreObj.score,
        }
      }).sort((a, b) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0))

      return sendSuccess(res, rankedJobs, 'Ranked recommendation jobs list retrieved')
    } catch (error) {
      next(error)
    }
  }

  async parseResume(req: Request, res: Response, next: NextFunction) {
    try {
      const { resumeText } = req.body
      if (!resumeText) {
        throw new AppError('resumeText is required in request body', 400)
      }

      const parsed = await aiService.parseResume(resumeText)
      return sendSuccess(res, parsed, 'Resume parsed successfully')
    } catch (error) {
      next(error)
    }
  }
}
export default AIController
