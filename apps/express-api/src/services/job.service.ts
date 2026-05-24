import { JobRepository } from '../repositories/job.repository'
import { CompanyRepository } from '../repositories/company.repository'
import { JobSchema } from '@hireflow/schemas'
import { AppError } from '../errors/AppError'
import { JobFilters, JobDTO, CursorPage } from '@hireflow/types'
import { cacheGet, cacheSet, cacheDeletePattern } from '../utils/cache'
import { mapJob } from '../lib/mappers'

const jobRepository = new JobRepository()
const companyRepository = new CompanyRepository()

export class JobService {
  async getJobById(id: string, incrementViews = false): Promise<JobDTO> {
    const job = await jobRepository.findById(id)
    if (!job) throw new AppError('Job not found', 404)
    if (incrementViews) await jobRepository.incrementViewCount(id)
    return mapJob(job)
  }

  async getJobBySlug(slug: string, incrementViews = false): Promise<JobDTO> {
    const job = await jobRepository.findBySlug(slug)
    if (!job) throw new AppError('Job not found', 404)
    if (incrementViews) await jobRepository.incrementViewCount(job.id)
    return mapJob(job)
  }

  async listJobs(
    cursor: string | undefined,
    limit: number,
    filters: JobFilters
  ): Promise<CursorPage<JobDTO>> {
    const cacheKey = `jobs:feed:cursor=${cursor || ''}:limit=${limit}:${JSON.stringify(filters)}`

    const cached = cacheGet<CursorPage<JobDTO>>(cacheKey)
    if (cached) return cached

    const result = await jobRepository.findAll({ cursor, limit, filters })

    const page: CursorPage<JobDTO> = {
      data: result.data.map(mapJob),
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    }

    // Cache public job feed for 60s
    cacheSet(cacheKey, page, 60 * 1000)

    return page
  }

  async createJob(data: unknown): Promise<JobDTO> {
    const parsed = JobSchema.parse(data)

    const company = await companyRepository.findById(parsed.companyId)
    if (!company) throw new AppError('Company does not exist', 400)

    const existing = await jobRepository.findBySlug(parsed.slug)
    if (existing) throw new AppError('Job slug already in use', 400)

    const { salary, ...rest } = parsed
    const jobData: Record<string, unknown> = { ...rest }

    if (salary) {
      jobData.salaryMin = salary.min
      jobData.salaryMax = salary.max
      jobData.salaryCurrency = salary.currency
    }

    const job = await jobRepository.create(jobData as any)
    cacheDeletePattern(/^jobs:feed/)
    return mapJob(job)
  }

  async updateJob(id: string, data: unknown): Promise<JobDTO> {
    await this.getJobById(id)

    const parsed = JobSchema.partial().parse(data)

    if (parsed.slug) {
      const existing = await jobRepository.findBySlug(parsed.slug)
      if (existing && existing.id !== id) throw new AppError('Job slug already in use', 400)
    }

    const { salary, companyId: _companyId, ...rest } = parsed
    const updateData: Record<string, unknown> = { ...rest }

    if (salary) {
      updateData.salaryMin = salary.min
      updateData.salaryMax = salary.max
      updateData.salaryCurrency = salary.currency
    }

    const updated = await jobRepository.update(id, updateData as any)
    cacheDeletePattern(/^jobs:feed/)
    return mapJob(updated)
  }

  async deleteJob(id: string): Promise<void> {
    await this.getJobById(id)
    await jobRepository.delete(id)
    cacheDeletePattern(/^jobs:feed/)
  }
}

export default JobService
