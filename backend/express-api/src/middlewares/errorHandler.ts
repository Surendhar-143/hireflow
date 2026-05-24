import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'
import { AppError, ValidationError } from '../errors/AppError'
import { logger } from '../utils/logger'
import { sendError } from '../utils/response'
import { AuditService } from '../services/audit.service'

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // ── Validation Errors ────────────────────────────────────────────────────────
  if (err instanceof ValidationError) {
    logger.warn({ err }, 'Validation Error')
    return sendError(res, err.message, err.statusCode, err.errors)
  }

  // ── Application Errors ───────────────────────────────────────────────────────
  if (err instanceof AppError) {
    logger.warn({ err }, 'Application Error')

    // Log security-related failures (unauthorized or forbidden access attempts) to AuditLog
    if (err.statusCode === 401 || err.statusCode === 403) {
      AuditService.log({
        actorId: req.user?.id,
        action: `security.access_denied`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        resourceType: 'APIRequest',
        resourceId: req.originalUrl,
        payload: {
          statusCode: err.statusCode,
          message: err.message,
          method: req.method,
        }
      })
    }

    return sendError(res, err.message, err.statusCode)
  }

  // ── Prisma Known Request Errors ───────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.warn({ code: err.code, meta: err.meta }, 'Prisma Known Request Error')

    switch (err.code) {
      case 'P2002':
        // Unique constraint violation
        return sendError(res, 'A record with this value already exists', 409)
      case 'P2025':
        // Record not found (e.g. delete/update on non-existent row)
        return sendError(res, 'Record not found', 404)
      case 'P2003':
        // Foreign key constraint failure
        return sendError(res, 'Related record does not exist', 400)
      case 'P2014':
        // Required relation violation
        return sendError(res, 'This operation would violate a required relation', 400)
      default:
        logger.error({ code: err.code }, 'Unhandled Prisma error code')
        return sendError(res, 'Database operation failed', 500)
    }
  }

  // ── Prisma Validation Errors (invalid query shape) ────────────────────────────
  if (err instanceof Prisma.PrismaClientValidationError) {
    logger.warn({ err }, 'Prisma Validation Error')
    return sendError(res, 'Invalid query parameters', 400)
  }

  // ── Abort/Timeout Errors ─────────────────────────────────────────────────────
  if (err.name === 'AbortError' || err.message?.includes('aborted')) {
    logger.warn({ err }, 'Request aborted (timeout)')
    return sendError(res, 'Upstream service timed out — please retry', 503)
  }

  // ── CORS Policy Errors ────────────────────────────────────────────────────────
  if (err.message?.startsWith('CORS policy:')) {
    return sendError(res, err.message, 403)
  }

  // ── Unhandled Errors ──────────────────────────────────────────────────────────
  logger.error({ err }, 'Unhandled Exception')
  return sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    500
  )
}
