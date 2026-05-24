import { ApplicationRepository } from '../repositories/application.repository'
import { JobRepository } from '../repositories/job.repository'
import { AppError } from '../errors/AppError'

const applicationRepository = new ApplicationRepository()
const jobRepository = new JobRepository()

export class PipelineService {
  async getJobPipeline(jobId: string) {
    const job = await jobRepository.findById(jobId)
    if (!job) {
      throw new AppError('Job not found', 404)
    }

    const applications = await applicationRepository.findAllByJob(jobId)

    const pipeline: Record<string, any[]> = {
      applied: [],
      screening: [],
      interview: [],
      offer: [],
      rejected: [],
      withdrawn: [],
    }

    for (const app of applications) {
      const status = app.status
      if (pipeline[status]) {
        pipeline[status].push(app)
      } else {
        pipeline[status] = [app]
      }
    }

    return {
      jobId,
      jobTitle: job.title,
      pipeline,
      totalCount: applications.length,
    }
  }
}
export default PipelineService
