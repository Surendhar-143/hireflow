import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
})

// Bind events to central Pino logger
prisma.$on('error', (e) => {
  logger.error({ err: e }, 'Prisma Database Error')
})

prisma.$on('warn', (e) => {
  logger.warn({ warning: e }, 'Prisma Database Warning')
})

if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query', (e) => {
    logger.debug({ query: e.query, durationMs: e.duration }, 'Database query executed')
  })
}
export default prisma
