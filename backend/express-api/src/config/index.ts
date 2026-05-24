import dotenv from 'dotenv'
import path from 'path'
import { z } from 'zod'

dotenv.config({ path: path.join(__dirname, '../../.env') })

// Helper to safely treat empty strings from process.env (placeholders in cloud platforms) as undefined
const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => (val === '' ? undefined : val), schema)

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: emptyToUndefined(
    z
      .string()
      .transform((val) => parseInt(val, 10))
      .default('8000')
  ),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  FASTAPI_AI_URL: emptyToUndefined(
    z.string().url().default('http://localhost:8001')
  ),
  CORS_ALLOWED_ORIGINS: emptyToUndefined(
    z.string().default('http://localhost:5173')
  ),
  SENTRY_DSN: emptyToUndefined(
    z.string().url().optional()
  ),
  SUPABASE_URL: emptyToUndefined(
    z.string().url().optional()
  ),
  SUPABASE_ANON_KEY: emptyToUndefined(
    z.string().optional()
  ),
})

const env = envSchema.safeParse(process.env)

if (!env.success) {
  console.error('❌ Invalid environment variables:', env.error.format())
  process.exit(1)
}

export const config = env.data
