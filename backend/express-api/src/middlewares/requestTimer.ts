import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export function requestTimer(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime()

  res.on('finish', () => {
    const diff = process.hrtime(start)
    const timeInMs = (diff[0] * 1e9 + diff[1]) / 1e6
    const correlationId = req.headers['x-request-id']

    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTimeMs: parseFloat(timeInMs.toFixed(2)),
        requestId: correlationId,
      },
      `${req.method} ${req.originalUrl} responded with ${res.statusCode} in ${timeInMs.toFixed(2)}ms`
    )
  })

  next()
}
