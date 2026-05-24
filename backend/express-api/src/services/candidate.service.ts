import { prisma } from '../lib/prisma'
import { UserRepository } from '../repositories/user.repository'
import { JobRepository } from '../repositories/job.repository'
import { AppError } from '../errors/AppError'

const userRepository = new UserRepository()
const jobRepository = new JobRepository()

export class CandidateService {
  async saveJob(candidateUserId: string, jobId: string) {
    const user = await userRepository.findById(candidateUserId)
    if (!user || !user.candidateProfile) {
      throw new AppError('Candidate profile not found', 404)
    }

    const job = await jobRepository.findById(jobId)
    if (!job) {
      throw new AppError('Job not found', 404)
    }

    try {
      const savedJob = await prisma.savedJob.create({
        data: {
          candidateId: user.candidateProfile.id,
          jobId: job.id,
        },
        include: {
          job: {
            include: {
              company: true,
            },
          },
        },
      })

      // Sync CandidateActivity
      const candidateProfileId = user.candidateProfile.id
      const savedCount = await prisma.savedJob.count({
        where: { candidateId: candidateProfileId },
      })
      await prisma.candidateActivity.upsert({
        where: { candidateId: candidateProfileId },
        create: {
          candidateId: candidateProfileId,
          jobsSavedCount: savedCount,
          appsSubmitted: 0,
        },
        update: {
          jobsSavedCount: savedCount,
          lastActiveAt: new Date(),
        },
      }).catch(() => {})

      return savedJob
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new AppError('Job is already saved', 400)
      }
      throw e
    }
  }

  async unsaveJob(candidateUserId: string, jobId: string) {
    const user = await userRepository.findById(candidateUserId)
    if (!user || !user.candidateProfile) {
      throw new AppError('Candidate profile not found', 404)
    }

    const savedJob = await prisma.savedJob.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: user.candidateProfile.id,
          jobId,
        },
      },
    })

    if (!savedJob) {
      throw new AppError('Saved job record not found', 404)
    }

    await prisma.savedJob.delete({
      where: { id: savedJob.id },
    })

    // Sync CandidateActivity
    const candidateProfileId = user.candidateProfile.id
    const savedCount = await prisma.savedJob.count({
      where: { candidateId: candidateProfileId },
    })
    await prisma.candidateActivity.upsert({
      where: { candidateId: candidateProfileId },
      create: {
        candidateId: candidateProfileId,
        jobsSavedCount: savedCount,
        appsSubmitted: 0,
      },
      update: {
        jobsSavedCount: savedCount,
        lastActiveAt: new Date(),
      },
    }).catch(() => {})

    return { jobId, success: true }
  }

  async listSavedJobs(candidateUserId: string) {
    const user = await userRepository.findById(candidateUserId)
    if (!user || !user.candidateProfile) {
      throw new AppError('Candidate profile not found', 404)
    }

    return prisma.savedJob.findMany({
      where: { candidateId: user.candidateProfile.id },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async calculateProfileScore(candidateUserId: string) {
    const user = await userRepository.findById(candidateUserId)
    if (!user || !user.candidateProfile) {
      throw new AppError('Candidate profile not found', 404)
    }

    const profile = user.candidateProfile
    let score = 0

    if (profile.headline) score += 15
    if (profile.bio) score += 15
    if (profile.location) score += 10
    if (profile.resumeUrl) score += 20

    if (profile.skills && profile.skills.length > 0) {
      score += 15
    }

    const experience = profile.experience as any[] | null
    if (experience && experience.length > 0) {
      score += 15
    }

    const education = profile.education as any[] | null
    if (education && education.length > 0) {
      score += 10
    }

    await userRepository.updateCandidateProfile(user.id, {
      profileCompletionScore: score,
    })

    return {
      userId: user.id,
      score,
      breakdown: {
        headline: !!profile.headline,
        bio: !!profile.bio,
        location: !!profile.location,
        resume: !!profile.resumeUrl,
        skills: profile.skills && profile.skills.length > 0,
        experience: experience && experience.length > 0,
        education: education && education.length > 0,
      },
    }
  }

  async updateProfile(candidateUserId: string, data: {
    headline?: string
    bio?: string
    location?: string
    skills?: string[]
    experience?: any[]
    education?: any[]
    linkedinUrl?: string
    githubUrl?: string
    portfolioUrl?: string
    openToWork?: boolean
    resumeUrl?: string
  }) {
    const user = await userRepository.findById(candidateUserId)
    if (!user || !user.candidateProfile) {
      throw new AppError('Candidate profile not found', 404)
    }

    const updatedProfile = await userRepository.updateCandidateProfile(user.id, data)
    
    // Recalculate profile score after update
    await this.calculateProfileScore(user.id)

    return updatedProfile
  }
}
export default CandidateService

