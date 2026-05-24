import { prisma } from '../lib/prisma'

export class AuditService {
  static async log(params: {
    actorId?: string
    action: string
    ipAddress?: string
    userAgent?: string
    resourceType: string
    resourceId?: string
    payload?: any
  }) {
    const { actorId, action, ipAddress, userAgent, resourceType, resourceId, payload } = params

    // Asynchronously create the audit log entry in the database.
    // We catch any database failures to prevent audit storage issues from crashing/blocking user requests.
    prisma.auditLog
      .create({
        data: {
          actorId: actorId || null,
          action,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          resourceType,
          resourceId: resourceId || null,
          payload: payload || undefined,
        },
      })
      .catch((err) => {
        console.error(`[Audit Log Failure]: Failed to persist audit event for actor: ${actorId}, action: ${action}. Error:`, err)
      })
  }
}
export default AuditService
