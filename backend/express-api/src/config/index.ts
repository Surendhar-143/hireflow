import dotenv from 'dotenv'
import path from 'path'
import { z } from 'zod'

dotenv.config({ path: path.join(__dirname, '../../.env') })

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('8000'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  FASTAPI_AI_URL: z.string().url().default('http://localhost:8001'),
  // Comma-separated list of allowed CORS origins, e.g. "https://hireflow.app,https://www.hireflow.app"
  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  SENTRY_DSN: z.string().url().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
})

const env = envSchema.safeParse(process.env)

if (!env.success) {
  console.error('❌ Invalid environment variables:', env.error.format())
  process.exit(1)
}

export const config = env.data
