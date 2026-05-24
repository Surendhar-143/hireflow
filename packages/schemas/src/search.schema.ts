import { z } from 'zod'

export const SearchSchema = z.object({
  q: z.string().min(1, 'Search query cannot be empty').max(200),
  type: z.enum(['jobs', 'companies', 'all']).default('all'),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export type SearchDto = z.infer<typeof SearchSchema>
