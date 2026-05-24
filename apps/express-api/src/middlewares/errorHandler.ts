import { Request, Response, NextFunction } from 'express'
import { AppError, ValidationError } from '../errors/AppError'
import { logger } from '../utils/logger'
import { sendError } from '../utils/response'

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ValidationError) {
    logger.warn({ err }, 'Validation Error')
    return sendError(res, err.message, err.statusCode, err.errors)
  }

  if (err instanceof AppError) {
    logger.warn({ err }, 'Application Error')
    return sendError(res, err.message, err.statusCode)
  }

  // Unhandled errors
  logger.error({ err }, 'Unhandled Exception')
  return sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    500
  )
}
