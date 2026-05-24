import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        candidateProfile: true,
        recruiterProfile: true,
      },
    })
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
