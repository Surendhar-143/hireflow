import { Response } from 'express'

export function sendSuccess(res: Response, data: any = {}, message = 'Success', statusCode = 200, meta: any = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  })
}

export function sendError(res: Response, message = 'Internal Server Error', statusCode = 500, errors?: any[]) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  })
}
