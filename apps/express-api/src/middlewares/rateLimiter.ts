import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError'

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimits = new Map<string, RateLimitRecord>()

export function rateLimiter(limit = 100, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.ip || req.socket.remoteAddress || 'unknown-ip') as string
    const now = Date.now()

    const record = rateLimits.get(ip)

    if (!record || now > record.resetTime) {
      rateLimits.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      })
      res.setHeader('X-RateLimit-Limit', limit)
      res.setHeader('X-RateLimit-Remaining', limit - 1)
      res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString())
      return next()
    }

    if (record.count >= limit) {
      res.setHeader('X-RateLimit-Limit', limit)
      res.setHeader('X-RateLimit-Remaining', 0)
      res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString())
      return next(new AppError('Too many requests, please try again later', 429))
    }

    record.count++
    res.setHeader('X-RateLimit-Limit', limit)
    res.setHeader('X-RateLimit-Remaining', limit - record.count)
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString())
    next()
  }
}
