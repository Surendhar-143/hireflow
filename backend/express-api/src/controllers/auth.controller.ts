import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { sendSuccess } from '../utils/response'
import { AppError } from '../errors/AppError'
import { AuditService } from '../services/audit.service'

export class AuthController {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }
      return sendSuccess(res, req.user, 'Current user profile retrieved')
    } catch (error) {
      next(error)
    }
  }

  async onboard(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      if (req.user.onboardingCompleted) {
        return sendSuccess(res, req.user, 'Onboarding already completed')
      }

      const { role, name, ...profileData } = req.body

      if (!role || !['candidate', 'recruiter'].includes(role)) {
        throw new AppError('Valid role (candidate or recruiter) is required', 400)
      }

      // Perform updates inside a transaction
      const updatedUser = await prisma.$transaction(async (tx) => {
        // 1. Update user role and status
        const uUser = await tx.user.update({
          where: { id: req.user!.id },
          data: {
            role,
            name: name || req.user!.name,
            onboardingCompleted: true,
          },
        })

        // 2. Create corresponding profile
        if (role === 'candidate') {
          await tx.candidateProfile.create({
            data: {
              userId: uUser.id,
              headline: profileData.headline || '',
              bio: profileData.bio || '',
              location: profileData.location || '',
              skills: profileData.skills || [],
              experience: profileData.experience || [],
              education: profileData.education || [],
              linkedinUrl: profileData.linkedinUrl || null,
              githubUrl: profileData.githubUrl || null,
              portfolioUrl: profileData.portfolioUrl || null,
              openToWork: profileData.openToWork !== undefined ? profileData.openToWork : true,
              profileCompletionScore: 10,
            },
          })
        } else if (role === 'recruiter') {
          let companyId = profileData.companyId

          // If no companyId, create or find a company based on companyName/slug
          if (!companyId) {
            const companyName = profileData.companyName || 'My Tech Company'
            const baseSlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            const companySlug = baseSlug.replace(/(^-|-$)/g, '') || `company-${Date.now()}`

            let company = await tx.company.findFirst({
              where: {
                OR: [
                  { slug: companySlug },
                  { name: companyName },
                ],
              },
            })

            if (!company) {
              company = await tx.company.create({
                data: {
                  name: companyName,
                  slug: companySlug,
                  industry: profileData.industry || 'Technology',
                  size: profileData.companySize || 'small',
                  location: profileData.companyLocation || '',
                },
              })
            }
            companyId = company.id
          }

          await tx.recruiterProfile.create({
            data: {
              userId: uUser.id,
              companyId,
              title: profileData.title || 'Recruiter',
              bio: profileData.bio || '',
            },
          })
        }

        // Return user with loaded profiles
        return tx.user.findUnique({
          where: { id: uUser.id },
          include: {
            candidateProfile: true,
            recruiterProfile: true,
          },
        })
      })

      // Log Audit Event
      if (updatedUser) {
        AuditService.log({
          actorId: updatedUser.id,
          action: 'auth.onboard',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          resourceType: 'User',
          resourceId: updatedUser.id,
          payload: { role },
        })
      }

      return sendSuccess(res, updatedUser, 'User onboarded successfully')
    } catch (error) {
      next(error)
    }
  }
}

export default AuthController
