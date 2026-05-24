import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'

export class UserRepository {
  async findById(id: string) {
    let user = await prisma.user.findUnique({
      where: { id },
      include: {
        candidateProfile: true,
        recruiterProfile: true,
      },
    })
    if (!user) {
      const candidateProfile = await prisma.candidateProfile.findUnique({
        where: { id },
        include: {
          user: {
            include: {
              candidateProfile: true,
              recruiterProfile: true,
            },
          },
        },
      })
      if (candidateProfile) {
        user = candidateProfile.user as any
      }
    }
    if (!user) {
      const recruiterProfile = await prisma.recruiterProfile.findUnique({
        where: { id },
        include: {
          user: {
            include: {
              candidateProfile: true,
              recruiterProfile: true,
            },
          },
        },
      })
      if (recruiterProfile) {
        user = recruiterProfile.user as any
      }
    }
    return user
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        candidateProfile: true,
        recruiterProfile: true,
      },
    })
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
    })
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
    })
  }

  async createCandidateProfile(data: Prisma.CandidateProfileUncheckedCreateInput) {
    return prisma.candidateProfile.create({
      data,
    })
  }

  async createRecruiterProfile(data: Prisma.RecruiterProfileUncheckedCreateInput) {
    return prisma.recruiterProfile.create({
      data,
    })
  }

  async updateCandidateProfile(userId: string, data: Prisma.CandidateProfileUpdateInput) {
    return prisma.candidateProfile.update({
      where: { userId },
      data,
    })
  }

  async updateRecruiterProfile(userId: string, data: Prisma.RecruiterProfileUpdateInput) {
    return prisma.recruiterProfile.update({
      where: { userId },
      data,
    })
  }
}
export default UserRepository
