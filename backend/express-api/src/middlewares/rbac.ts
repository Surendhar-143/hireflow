import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { AppError } from '../errors/AppError'

/**
 * Ensures recruiter has active company organization affiliation
 */
export function requireOrganization(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new AppError('Authentication required', 401))
  }
  
  if (req.user.role === 'admin') {
    return next()
  }

  if (req.user.role !== 'recruiter' || !req.user.recruiterProfile?.companyId) {
    return next(new AppError('Forbidden: Recruiter organization affiliation required', 403))
  }

  next()
}

/**
 * Ensures candidate/recruiter actor owns or has access permission to specified resource
 */
export function requireOwnership(resourceType: 'application' | 'profile' | 'job') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401)
      }

      // Admins bypass ownership checks
      if (req.user.role === 'admin') {
        return next()
      }

      const resourceId = req.params.id || req.body.id
      if (!resourceId) {
        throw new AppError('Resource ID parameter is missing', 400)
      }

      if (resourceType === 'application') {
        const application = await prisma.application.findUnique({
          where: { id: resourceId },
          include: { job: true },
        })

        if (!application) {
          throw new AppError('Application not found', 404)
        }

        // Candidates can only access their own applications
        if (req.user.role === 'candidate') {
          const candidateId = req.user.candidateProfile?.id
          if (!candidateId || application.candidateId !== candidateId) {
            throw new AppError('Forbidden: You do not own this application', 403)
          }
        } 
        // Recruiters can only access applications matching their company jobs
        else if (req.user.role === 'recruiter') {
          const companyId = req.user.recruiterProfile?.companyId
          if (!companyId || application.job.companyId !== companyId) {
            throw new AppError('Forbidden: This application belongs to another organization', 403)
          }
        }
      } 
      
      else if (resourceType === 'profile') {
        const candidateId = req.user.candidateProfile?.id
        if (!candidateId || resourceId !== candidateId) {
          throw new AppError('Forbidden: You cannot modify another candidate\'s profile', 403)
        }
      } 
      
      else if (resourceType === 'job') {
        const job = await prisma.job.findUnique({
          where: { id: resourceId },
        })

        if (!job) {
          throw new AppError('Job not found', 404)
        }

        const companyId = req.user.recruiterProfile?.companyId
        if (!companyId || job.companyId !== companyId) {
          throw new AppError('Forbidden: You do not own this job opening', 403)
        }
      }

      next()
    } catch (err) {
      next(err)
    }
  }
}
