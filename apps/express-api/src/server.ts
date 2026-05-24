import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import pinoHttp from 'pino-http'
import { config } from './config'
import { logger } from './utils/logger'
import { errorHandler } from './middlewares/errorHandler'
import { requestId } from './middlewares/requestId'
import { requestTimer } from './middlewares/requestTimer'
import { rateLimiter } from './middlewares/rateLimiter'
import { apiRouter } from './routes'
import { CONFIG } from '@hireflow/config'
import { AppError } from './errors/AppError'

const app = express()

// Security and standard parsers
app.use(helmet())
app.use(cors())
app.use(express.json())

// Correlation/Trace & Timer Loggers
app.use(requestId)
app.use(pinoHttp({ logger }))
app.use(requestTimer)

// Global Rate Limiting
app.use(
  rateLimiter(
    CONFIG.API.RATE_LIMIT.MAX_REQUESTS,
    CONFIG.API.RATE_LIMIT.WINDOW_MS
  )
)

// Main router mounting
app.use('/api/v1', apiRouter)

// Fallback health check at gateway root
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HireFlow Express API Gateway root',
    data: {
      status: 'ok',
      service: 'express-api-gateway',
      timestamp: new Date().toISOString(),
    },
  })
})

// Catch-all for unhandled routes
app.use('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404))
})

// Global Error Handler
app.use(errorHandler)

const PORT = config.PORT

app.listen(PORT, () => {
  logger.info(`Express API Gateway running in ${config.NODE_ENV} mode on port ${PORT}`)
})
export default app
