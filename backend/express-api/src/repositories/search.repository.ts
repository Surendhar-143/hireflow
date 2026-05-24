import { prisma } from '../lib/prisma'

export class SearchRepository {
  /**
   * Search jobs and companies simultaneously using a keyword query.
   * Returns raw Prisma rows — mapping to DTOs happens in the service layer.
   */
  async search(params: { q: string; type: 'jobs' | 'companies' | 'all'; limit: number }) {
    const { q, type, limit } = params
    const start = Date.now()

    const [jobs, companies] = await Promise.all([
      // ── Jobs search ──────────────────────────────────────────────────────
      type === 'companies'
        ? Promise.resolve([])
        : prisma.job.findMany({
            where: {
              status: 'active',
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { location: { contains: q, mode: 'insensitive' } },
                { skills: { hasSome: [q] } },
              ],
            },
            take: limit,
            orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
            include: { company: true },
          }),

      // ── Companies search ─────────────────────────────────────────────────
      type === 'jobs'
        ? Promise.resolve([])
        : prisma.company.findMany({
            where: {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { industry: { contains: q, mode: 'insensitive' } },
                { location: { contains: q, mode: 'insensitive' } },
              ],
            },
            take: limit,
            orderBy: { name: 'asc' },
          }),
    ])

    return {
      jobs,
      companies,
      total: jobs.length + companies.length,
      took: Date.now() - start,
    }
  }
}
