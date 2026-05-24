import { Request, Response, NextFunction } from 'express'
import { ApplicationService } from '../services/application.service'
import { prisma } from '../lib/prisma'
import { sendSuccess } from '../utils/response'
import { AppError } from '../errors/AppError'

const applicationService = new ApplicationService()

export class ApplicationController {
  async submitApplication(req: Request, res: Response, next: NextFunction) {
    try {
      let { jobId, candidateId, coverLetter, resumeUrl } = req.body
      if (req.user?.role === 'candidate') {
        candidateId = req.user.candidateProfile?.id
      }

      if (!jobId || !candidateId) {
        throw new AppError('Job ID and Candidate ID are required', 400)
      }

      const application = await applicationService.submitApplication({
        jobId,
        candidateId,
        coverLetter,
        resumeUrl,
      })

      return sendSuccess(res, application, 'Application submitted successfully', 201)
    } catch (error) {
      next(error)
    }
  }

  async getApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string
      const application = await applicationService.getApplicationById(id)

      if (req.user) {
        if (req.user.role === 'candidate') {
          if (application.candidateId !== req.user.candidateProfile?.id) {
            throw new AppError('Forbidden: Access denied to this application', 403)
          }
        } else if (req.user.role === 'recruiter') {
          const job = await prisma.job.findUnique({ where: { id: application.jobId } })
          if (job?.companyId !== req.user.recruiterProfile?.companyId) {
            throw new AppError('Forbidden: Access denied to applications of other companies', 403)
          }
        }
      }

      return sendSuccess(res, application, 'Application retrieved')
    } catch (error) {
      next(error)
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string
      const { status, note, actor } = req.body

      if (!status) {
        throw new AppError('Status is required', 400)
      }

      // Check ownership
      const application = await applicationService.getApplicationById(id)
      const job = await prisma.job.findUnique({ where: { id: application.jobId } })
      
      if (req.user?.role === 'recruiter' && job?.companyId !== req.user.recruiterProfile?.companyId) {
        throw new AppError('Forbidden: You can only update applications for your own company', 403)
      }

      const updatedApplication = await applicationService.updateApplicationStatus(
        id,
        status,
        note,
        actor
      )

      return sendSuccess(res, updatedApplication, 'Application status updated successfully')
    } catch (error) {
      next(error)
    }
  }

  async listJobApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const jobId = req.params.jobId as string
      const job = await prisma.job.findUnique({ where: { id: jobId } })
      if (!job) {
        throw new AppError('Job not found', 404)
      }

      if (req.user?.role === 'recruiter' && job.companyId !== req.user.recruiterProfile?.companyId) {
        throw new AppError('Forbidden: You can only list applications for jobs posted by your own company', 403)
      }

      const applications = await applicationService.listApplicationsForJob(jobId)
      return sendSuccess(res, applications, 'Job applications retrieved')
    } catch (error) {
      next(error)
    }
  }

  async listCandidateApplications(req: Request, res: Response, next: NextFunction) {
    try {
      let candidateId = req.params.candidateId as string
      if (req.user?.role === 'candidate') {
        candidateId = req.user.candidateProfile?.id as string
      }

      if (!candidateId) {
        throw new AppError('Candidate ID is required', 400)
      }

      if (req.user?.role === 'candidate' && req.user.candidateProfile?.id !== candidateId) {
        throw new AppError('Forbidden: You can only view your own applications', 403)
      }

      const applications = await applicationService.listApplicationsForCandidate(candidateId)
      return sendSuccess(res, applications, 'Candidate applications retrieved')
    } catch (error) {
      next(error)
    }
  }
}
export default ApplicationController
