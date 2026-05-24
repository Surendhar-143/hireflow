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
import { cacheStats } from './utils/cache'
import { prisma } from './lib/prisma'

const app = express()

// Trust the first proxy (Render load balancer / Cloudflare) to ensure accurate client IP resolving
app.set('trust proxy', 1)

const allowedOrigins = config.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim())

// Always allow standard development and your specific Vercel production deployment URLs
const requiredOrigins = [
  'https://hireflow-web-kappa.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
]
requiredOrigins.forEach((origin) => {
  if (!allowedOrigins.includes(origin)) {
    allowedOrigins.push(origin)
  }
})

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, curl, Postman in dev)
      if (!origin) return callback(null, true)
      
      const isAllowed = 
        allowedOrigins.includes('*') || 
        allowedOrigins.includes(origin) || 
        origin.endsWith('.vercel.app') || 
        origin.startsWith('http://localhost:')

      if (isAllowed) {
        return callback(null, true)
      }
      logger.warn({ origin }, 'CORS blocked: origin not in allowlist')
      callback(new Error(`CORS policy: origin "${origin}" is not allowed`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  })
)

// Security and standard parsers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Disables CSP headers (which are redundant for a JSON API)
  })
)
app.use(express.json({ limit: '2mb' }))

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

// ─── Health Check ─────────────────────────────────────────────────────────────
// Enhanced health check: verifies DB connectivity, reports cache stats + uptime
app.get('/health', async (req, res) => {
  const start = Date.now()

  // DB connectivity check — lightweight ping
  let dbStatus: 'ok' | 'degraded' = 'ok'
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch {
    dbStatus = 'degraded'
  }

  const dbLatencyMs = Date.now() - start
  const cache = cacheStats()
  const uptime = Math.floor(process.uptime())
  const memUsage = process.memoryUsage()

  const healthy = dbStatus === 'ok'

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    data: {
      status: healthy ? 'ok' : 'degraded',
      service: 'express-api-gateway',
      timestamp: new Date().toISOString(),
      uptime: `${uptime}s`,
      db: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      cache: {
        size: cache.size,
        maxSize: cache.maxSize,
        hitRate: cache.hitRate,
        hits: cache.hits,
        misses: cache.misses,
      },
      memory: {
        heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(memUsage.heapTotal / 1024 / 1024),
        rssMb: Math.round(memUsage.rss / 1024 / 1024),
      },
    },
  })
})

// Catch-all for unhandled routes
app.use('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404))
})

// Global Error Handler
app.use(errorHandler)

// ─── Global unhandled rejection guard ────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Promise Rejection — this should not happen in production')
})

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught Exception — shutting down')
  process.exit(1)
})

const PORT = config.PORT

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Express API Gateway running in ${config.NODE_ENV} mode on port ${PORT}`)
    logger.info(`CORS allowed origins: ${allowedOrigins.join(', ')}`)
  })
}

export { app }
export default app
