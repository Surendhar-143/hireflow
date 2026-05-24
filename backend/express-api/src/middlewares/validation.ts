import { Request, Response, NextFunction } from 'express'
import { AnyZodObject } from 'zod'
import { ValidationError } from '../errors/AppError'

interface ValidationSchemas {
  body?: AnyZodObject
  query?: AnyZodObject
  params?: AnyZodObject
}

export function validate(schemas: ValidationSchemas) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body)
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query)
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params)
      }
      next()
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const errors = error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }))
        return next(new ValidationError('Validation failed', errors))
      }
      next(error)
    }
  }
}
