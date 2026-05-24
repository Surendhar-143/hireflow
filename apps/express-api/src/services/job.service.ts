import { JobRepository } from '../repositories/job.repository'
import { CompanyRepository } from '../repositories/company.repository'
import { JobSchema } from '@hireflow/schemas'
import { AppError } from '../errors/AppError'
import { JobFilters } from '@hireflow/types'
import { cacheGet, cacheSet, cacheDeletePattern } from '../utils/cache'

const jobRepository = new JobRepository()
const companyRepository = new CompanyRepository()

export class JobService {
  async getJobById(id: string, incrementViews = false) {
    const job = await jobRepository.findById(id)
    if (!job) {
      throw new AppError('Job not found', 404)
    }
    if (incrementViews) {
      await jobRepository.incrementViewCount(id)
    }
    return job
  }

  async getJobBySlug(slug: string, incrementViews = false) {
    const job = await jobRepository.findBySlug(slug)
    if (!job) {
      throw new AppError('Job not found', 404)
    }
    if (incrementViews) {
      await jobRepository.incrementViewCount(job.id)
    }
    return job
  }

  async listJobs(cursor: string | undefined, limit: number, filters: JobFilters) {
    const cacheKey = `jobs:feed:cursor=${cursor || ''}:limit=${limit}:${JSON.stringify(filters)}`
    
    const cached = cacheGet(cacheKey)
    if (cached) {
      return cached
    }

    const result = await jobRepository.findAll({ cursor, limit, filters })
    
    // Cache for 1 minute
    cacheSet(cacheKey, result, 60 * 1000)

    return result
  }

  async createJob(data: any) {
    const parsed = JobSchema.parse(data)

    const company = await companyRepository.findById(parsed.companyId)
    if (!company) {
      throw new AppError('Company does not exist', 400)
    }

    const existing = await jobRepository.findBySlug(parsed.slug)
    if (existing) {
      throw new AppError('Job slug already in use', 400)
    }

    const { salary, ...rest } = parsed
    const jobData: any = {
      ...rest,
    }

    if (salary) {
      jobData.salaryMin = salary.min
      jobData.salaryMax = salary.max
      jobData.salaryCurrency = salary.currency
    }

    const job = await jobRepository.create(jobData)

    // Invalidate jobs cache
    cacheDeletePattern(/^jobs:feed/)

    return job
  }

  async updateJob(id: string, data: any) {
    await this.getJobById(id)

    const parsed = JobSchema.partial().parse(data)

    if (parsed.slug) {
      const existing = await jobRepository.findBySlug(parsed.slug)
      if (existing && existing.id !== id) {
        throw new AppError('Job slug already in use', 400)
      }
    }

    const { salary, companyId, ...rest } = parsed
    const updateData: any = {
      ...rest,
    }

    if (salary) {
      updateData.salaryMin = salary.min
      updateData.salaryMax = salary.max
      updateData.salaryCurrency = salary.currency
    }

    const updatedJob = await jobRepository.update(id, updateData)

    // Invalidate jobs cache
    cacheDeletePattern(/^jobs:feed/)

    return updatedJob
  }

  async deleteJob(id: string) {
    await this.getJobById(id)
    const deleted = await jobRepository.delete(id)

    // Invalidate jobs cache
    cacheDeletePattern(/^jobs:feed/)

    return deleted
  }
}
export default JobService
