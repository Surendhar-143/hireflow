export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  public readonly errors: any[]

  constructor(message: string, errors: any[] = []) {
    super(message, 400)
    this.errors = errors
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, isOperational = true) {
    super(message, 500, isOperational)
  }
}

export class AIServiceError extends AppError {
  constructor(message: string, isOperational = true) {
    super(message, 502, isOperational)
  }
}
