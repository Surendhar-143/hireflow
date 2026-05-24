import { z } from 'zod'

export const CompanySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric and dashes'),
  logo: z.string().url('Must be a valid URL').optional(),
  industry: z.string().min(2),
  size: z.enum(['small', 'medium', 'large']),
  verified: z.boolean().default(false),
  description: z.string().min(10).optional(),
  website: z.string().url().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  founded: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  stage: z.string().optional(),
  location: z.string().optional(),
  employeeCount: z.number().int().min(1).optional(),
  openPositions: z.number().int().min(0).default(0),
})

export type CompanyDto = z.infer<typeof CompanySchema>
