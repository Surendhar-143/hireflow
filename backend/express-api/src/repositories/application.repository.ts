import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'

export class ApplicationRepository {
  async findById(id: string) {
    return prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        candidate: {
          include: {
            user: true,
          },
        },
        events: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })
  }

  async findByJobAndCandidate(jobId: string, candidateId: string) {
    return prisma.application.findFirst({
      where: {
        jobId,
        candidateId,
      },
    })
  }

  async findAllByCandidate(candidateId: string) {
    return prisma.application.findMany({
      where: { candidateId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        events: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findAllByJob(jobId: string) {
    return prisma.application.findMany({
      where: { jobId },
      include: {
        candidate: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: Prisma.ApplicationCreateInput) {
    return prisma.application.create({
      data,
      include: {
        job: {
          include: {
            company: true,
          },
        },
        events: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })
  }

  async update(id: string, data: Prisma.ApplicationUpdateInput) {
    return prisma.application.update({
      where: { id },
      data,
      include: {
        job: {
          include: {
            company: true,
          },
        },
        events: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })
  }
}
