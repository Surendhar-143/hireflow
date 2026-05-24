import { ApplicationRepository } from '../repositories/application.repository'
import { JobRepository } from '../repositories/job.repository'
import { UserRepository } from '../repositories/user.repository'
import { NotificationService } from './notification.service'
import { AppError } from '../errors/AppError'
import { prisma } from '../lib/prisma'
import { AuditService } from './audit.service'

const applicationRepository = new ApplicationRepository()
const jobRepository = new JobRepository()
const userRepository = new UserRepository()
const notificationService = new NotificationService()

export class ApplicationService {
  async getApplicationById(id: string) {
    const application = await applicationRepository.findById(id)
    if (!application) {
      throw new AppError('Application not found', 404)
    }
    return application
  }

  async submitApplication(data: {
    jobId: string
    candidateId: string // Relates to User.id (which carries candidateProfile relation)
    coverLetter?: string
    resumeUrl?: string
  }) {
    const job = await jobRepository.findById(data.jobId)
    if (!job) {
      throw new AppError('Job not found', 404)
    }

    if (job.status !== 'active') {
      throw new AppError('Cannot apply to an inactive job post', 400)
    }

    const user = await userRepository.findById(data.candidateId)
    if (!user || !user.candidateProfile) {
      throw new AppError('Candidate profile not found', 400)
    }

    const existing = await applicationRepository.findByJobAndCandidate(data.jobId, user.candidateProfile.id)
    if (existing) {
      throw new AppError('You have already applied for this position', 400)
    }

    const application = await applicationRepository.create({
      job: { connect: { id: data.jobId } },
      candidate: { connect: { id: user.candidateProfile.id } },
      coverLetter: data.coverLetter,
      resumeUrl: data.resumeUrl || user.candidateProfile.resumeUrl || undefined,
      status: 'applied',
      events: {
        create: {
          status: 'applied',
          note: 'Application submitted',
          actor: 'candidate',
        },
      },
    })

    await jobRepository.incrementApplicantCount(data.jobId)

    // Sync CandidateActivity — use atomic increment instead of full count query
    const candidateProfileId = user.candidateProfile.id
    await prisma.candidateActivity.upsert({
      where: { candidateId: candidateProfileId },
      create: {
        candidateId: candidateProfileId,
        appsSubmitted: 1,
        jobsSavedCount: 0,
      },
      update: {
        // Atomic increment — no separate count() query needed
        appsSubmitted: { increment: 1 },
        lastActiveAt: new Date(),
      },
    }).catch(() => {})

    // Log Audit Event
    AuditService.log({
      actorId: user.id,
      action: 'application.submit',
      resourceType: 'Application',
      resourceId: application.id,
      payload: { jobId: data.jobId },
    })

    // Trigger Notifications in background
    notificationService
      .createNotification({
        userId: user.id,
        title: 'Application Submitted',
        message: `You have successfully applied for ${job.title} at ${job.company.name}.`,
        type: 'application_status',
      })
      .catch(() => {})

    prisma.recruiterProfile
      .findMany({
        where: { companyId: job.companyId },
      })
      .then((recruiters) => {
        for (const rec of recruiters) {
          notificationService
            .createNotification({
              userId: rec.userId,
              title: 'New Job Applicant',
              message: `${user.name} has applied for ${job.title}.`,
              type: 'application_status',
            })
            .catch(() => {})
        }
      })
      .catch(() => {})

    return application
  }

  async updateApplicationStatus(id: string, status: string, note?: string, actor = 'recruiter') {
    const application = await this.getApplicationById(id)

    const validStatuses = ['applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn']
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid application status', 400)
    }

    const updated = await applicationRepository.update(id, {
      status,
      events: {
        create: {
          status,
          note: note || `Status updated to ${status}`,
          actor,
        },
      },
    })

    // Log Audit Event
    AuditService.log({
      action: 'application.update_status',
      resourceType: 'Application',
      resourceId: updated.id,
      payload: { status, actor, note },
    })

    // Trigger candidate status update notification in background
    notificationService
      .createNotification({
        userId: application.candidate.userId,
        title: 'Application Updated',
        message: `Your application status for ${application.job.title} has been updated to ${status}.`,
        type: 'application_status',
      })
      .catch(() => {})

    return updated
  }

  async listApplicationsForJob(jobId: string) {
    const job = await jobRepository.findById(jobId)
    if (!job) {
      throw new AppError('Job not found', 404)
    }
    return applicationRepository.findAllByJob(jobId)
  }

  async listApplicationsForCandidate(candidateId: string) {
    const user = await userRepository.findById(candidateId)
    if (!user || !user.candidateProfile) {
      throw new AppError('Candidate profile not found', 400)
    }
    return applicationRepository.findAllByCandidate(user.candidateProfile.id)
  }
}
export default ApplicationService
