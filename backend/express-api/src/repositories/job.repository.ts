import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'
import { JobFilters } from '@hireflow/types'

export class JobRepository {
  async findById(id: string) {
    return prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
      },
    })
  }

  async findBySlug(slug: string) {
    return prisma.job.findUnique({
      where: { slug },
      include: {
        company: true,
      },
    })
  }

  async findAll(params: {
    cursor?: string
    limit: number
    filters: JobFilters
  }) {
    const { cursor, limit, filters } = params

    // Build the dynamic filtering object
    const where: Prisma.JobWhereInput = {
      status: filters.companyId ? undefined : 'active',
    }

    if (filters.companyId) {
      where.companyId = filters.companyId
    }

    const andConditions: Prisma.JobWhereInput[] = []

    if (filters.query) {
      andConditions.push({
        OR: [
          { title: { contains: filters.query, mode: 'insensitive' } },
          { description: { contains: filters.query, mode: 'insensitive' } },
          { skills: { hasSome: [filters.query] } },
        ],
      })
    }

    if (filters.location) {
      andConditions.push({
        location: { contains: filters.location, mode: 'insensitive' },
      })
    }

    if (filters.type && filters.type.length > 0) {
      andConditions.push({ type: { in: filters.type } })
    }

    if (filters.workMode && filters.workMode.length > 0) {
      andConditions.push({ workMode: { in: filters.workMode } })
    }

    if (filters.experienceLevel && filters.experienceLevel.length > 0) {
      andConditions.push({ experienceLevel: { in: filters.experienceLevel } })
    }

    if (filters.skills && filters.skills.length > 0) {
      andConditions.push({ skills: { hasSome: filters.skills } })
    }

    if (filters.salaryMin !== undefined) {
      andConditions.push({
        OR: [
          { salaryMin: { gte: filters.salaryMin } },
          { salaryMin: null },
        ],
      })
    }

    if (filters.salaryMax !== undefined) {
      andConditions.push({
        OR: [
          { salaryMax: { lte: filters.salaryMax } },
          { salaryMax: null },
        ],
      })
    }

    if (filters.postedWithin) {
      const now = new Date()
      const dateLimit = new Date()
      if (filters.postedWithin === '24h') dateLimit.setHours(now.getHours() - 24)
      else if (filters.postedWithin === '7d') dateLimit.setDate(now.getDate() - 7)
      else if (filters.postedWithin === '30d') dateLimit.setDate(now.getDate() - 30)
      andConditions.push({ createdAt: { gte: dateLimit } })
    }

    if (andConditions.length > 0) {
      where.AND = andConditions
    }

    const data = await prisma.job.findMany({
      where,
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          // Select only fields needed for list display — avoid fetching full company rows
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            industry: true,
            size: true,
            verified: true,
          },
        },
      },
    })

    const hasMore = data.length > limit
    if (hasMore) data.pop()

    return {
      data,
      hasMore,
      nextCursor: hasMore ? data[data.length - 1].id : undefined,
    }
  }

  async create(data: Prisma.JobCreateInput) {
    // Use a transaction to ensure job creation + analytics initialization are atomic
    return prisma.$transaction(async (tx) => {
      const job = await tx.job.create({
        data,
        include: { company: true },
      })

      // Initialize JobAnalytics in same transaction
      await tx.jobAnalytics.create({
        data: {
          jobId: job.id,
          viewCount: 0,
          applicantCount: 0,
          conversionRate: 0.0,
        },
      })

      // Upsert CompanyAnalytics using aggregate in same transaction
      const companyId = job.companyId
      const [jobCounts, analyticsAgg] = await Promise.all([
        tx.job.aggregate({
          where: { companyId },
          _count: { _all: true, status: true },
        }),
        tx.jobAnalytics.aggregate({
          where: { job: { companyId } },
          _sum: { applicantCount: true },
          _avg: { conversionRate: true },
        }),
      ])

      const allJobs = await tx.job.findMany({
        where: { companyId },
        select: { status: true },
      })
      const activeJobsCount = allJobs.filter((j) => j.status === 'active').length

      await tx.companyAnalytics.upsert({
        where: { companyId },
        create: {
          companyId,
          totalJobs: jobCounts._count._all,
          activeJobs: activeJobsCount,
          totalApplications: analyticsAgg._sum.applicantCount ?? 0,
          averageConversion: analyticsAgg._avg.conversionRate ?? 0.0,
        },
        update: {
          totalJobs: jobCounts._count._all,
          activeJobs: activeJobsCount,
          totalApplications: analyticsAgg._sum.applicantCount ?? 0,
          averageConversion: analyticsAgg._avg.conversionRate ?? 0.0,
        },
      })

      return job
    })
  }

  async update(id: string, data: Prisma.JobUpdateInput) {
    return prisma.$transaction(async (tx) => {
      const job = await tx.job.update({
        where: { id },
        data,
        include: { company: true },
      })

      // Sync CompanyAnalytics inside same transaction
      const companyId = job.companyId
      const [allJobs, analyticsAgg] = await Promise.all([
        tx.job.findMany({ where: { companyId }, select: { status: true } }),
        tx.jobAnalytics.aggregate({
          where: { job: { companyId } },
          _sum: { applicantCount: true },
          _avg: { conversionRate: true },
        }),
      ])

      const activeJobsCount = allJobs.filter((j) => j.status === 'active').length

      await tx.companyAnalytics.upsert({
        where: { companyId },
        create: {
          companyId,
          totalJobs: allJobs.length,
          activeJobs: activeJobsCount,
          totalApplications: analyticsAgg._sum.applicantCount ?? 0,
          averageConversion: analyticsAgg._avg.conversionRate ?? 0.0,
        },
        update: {
          totalJobs: allJobs.length,
          activeJobs: activeJobsCount,
          totalApplications: analyticsAgg._sum.applicantCount ?? 0,
          averageConversion: analyticsAgg._avg.conversionRate ?? 0.0,
        },
      })

      return job
    })
  }

  async incrementApplicantCount(id: string) {
    // Atomic applicant count increment — single query, no cascading reads
    const job = await prisma.job.update({
      where: { id },
      data: { applicantCount: { increment: 1 } },
      include: { company: true },
    })

    const views = job.viewCount
    const apps = job.applicantCount
    const conversion = views > 0 ? (apps / views) : 0.0

    // Fire-and-forget analytics sync — does not block applicant submission
    prisma.jobAnalytics.upsert({
      where: { jobId: id },
      create: { jobId: id, viewCount: views, applicantCount: apps, conversionRate: conversion },
      update: { applicantCount: apps, conversionRate: conversion },
    }).catch(() => {})

    return job
  }

  async incrementViewCount(id: string) {
    // Atomic view count increment — single query
    const job = await prisma.job.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    const views = job.viewCount
    const apps = job.applicantCount
    const conversion = views > 0 ? (apps / views) : 0.0

    // Fire-and-forget — view count sync does not block detail page load
    prisma.jobAnalytics.upsert({
      where: { jobId: id },
      create: { jobId: id, viewCount: views, applicantCount: apps, conversionRate: conversion },
      update: { viewCount: views, conversionRate: conversion },
    }).catch(() => {})

    return job
  }

  async delete(id: string) {
    return prisma.job.delete({ where: { id } })
  }
}
