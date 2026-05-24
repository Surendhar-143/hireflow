import { z } from 'zod'

export const JobSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  companyId: z.string().uuid(),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.array(z.string()).min(1),
  benefits: z.array(z.string()).optional(),
  skills: z.array(z.string()).min(1),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance']),
  workMode: z.enum(['remote', 'hybrid', 'onsite']),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']),
  salary: z.object({
    min: z.number().int().min(0),
    max: z.number().int().min(0),
    currency: z.string().length(3).default('USD')
  }).optional(),
  location: z.string(),
  status: z.enum(['draft', 'active', 'closed']).default('active'),
})

export type JobDto = z.infer<typeof JobSchema>
