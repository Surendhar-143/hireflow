import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { sendSuccess } from '../utils/response'
import { AppError } from '../errors/AppError'
import { AuditService } from '../services/audit.service'

export class AdminController {
  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            }
          }
        },
        take: 100, // Limit to last 100 logs for safety
      })

      return sendSuccess(res, logs, 'System audit logs retrieved successfully')
    } catch (error) {
      next(error)
    }
  }

  async toggleCandidateVisibility(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string
      
      const candidateProfile = await prisma.candidateProfile.findUnique({
        where: { id },
      })

      if (!candidateProfile) {
        throw new AppError('Candidate profile not found', 404)
      }

      const userRecord = await prisma.user.findUnique({
        where: { id: candidateProfile.userId }
      })

      const updated = await prisma.candidateProfile.update({
        where: { id },
        data: {
          openToWork: !candidateProfile.openToWork
        },
      })

      const userAgentHeader = req.headers['user-agent']
      const userAgentStr = Array.isArray(userAgentHeader) ? userAgentHeader[0] : userAgentHeader

      // Log the event
      await AuditService.log({
        actorId: req.user?.id,
        action: 'admin.toggle_candidate_visibility',
        ipAddress: req.ip,
        userAgent: userAgentStr || undefined,
        resourceType: 'CandidateProfile',
        resourceId: id,
        payload: {
          candidateName: userRecord?.name || 'Unknown',
          previousState: candidateProfile.openToWork,
          newState: updated.openToWork
        }
      })

      const result = {
        ...updated,
        user: userRecord ? {
          id: userRecord.id,
          email: userRecord.email,
          name: userRecord.name,
        } : null
      }

      return sendSuccess(res, result, `Candidate visibility toggled to ${updated.openToWork ? 'Open to Work' : 'Hidden'}`)
    } catch (error) {
      next(error)
    }
  }

  async listCandidates(req: Request, res: Response, next: NextFunction) {
    try {
      const candidates = await prisma.candidateProfile.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      })
      return sendSuccess(res, candidates, 'Candidates retrieved successfully')
    } catch (error) {
      next(error)
    }
  }
}
export default AdminController
