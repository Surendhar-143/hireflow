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
      status: filters.companyId ? undefined : 'active', // Allow recruiters to see drafts/closed in dashboard
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
      andConditions.push({
        type: { in: filters.type },
      })
    }

    if (filters.workMode && filters.workMode.length > 0) {
      andConditions.push({
        workMode: { in: filters.workMode },
      })
    }

    if (filters.experienceLevel && filters.experienceLevel.length > 0) {
      andConditions.push({
        experienceLevel: { in: filters.experienceLevel },
      })
    }

    if (filters.skills && filters.skills.length > 0) {
      andConditions.push({
        skills: { hasSome: filters.skills },
      })
    }

    if (filters.salaryMin !== undefined) {
      andConditions.push({
        OR: [
          { salaryMin: { gte: filters.salaryMin } },
          { salaryMin: null }, // Handle null ranges gracefully
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
      let dateLimit = new Date()

      if (filters.postedWithin === '24h') {
        dateLimit.setHours(now.getHours() - 24)
      } else if (filters.postedWithin === '7d') {
        dateLimit.setDate(now.getDate() - 7)
      } else if (filters.postedWithin === '30d') {
        dateLimit.setDate(now.getDate() - 30)
      }

      andConditions.push({
        createdAt: { gte: dateLimit },
      })
    }

    if (andConditions.length > 0) {
      where.AND = andConditions
    }

    // Execute query with Cursor-based pagination
    const data = await prisma.job.findMany({
      where,
      take: limit + 1, // Fetch one extra element to determine if hasMore exists
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        company: true,
      },
    })

    const hasMore = data.length > limit
    if (hasMore) {
      data.pop() // Remove the extra check element
    }

    const nextCursor = hasMore ? data[data.length - 1].id : undefined

    return {
      data,
      hasMore,
      nextCursor,
    }
  }

  async create(data: Prisma.JobCreateInput) {
    const job = await prisma.job.create({
      data,
      include: {
        company: true,
      },
    })

    // Initialize JobAnalytics
    await prisma.jobAnalytics.create({
      data: {
        jobId: job.id,
        viewCount: 0,
        applicantCount: 0,
        conversionRate: 0.0,
      },
    })

    // Update CompanyAnalytics
    const companyId = job.companyId
    const companyJobs = await prisma.job.findMany({ where: { companyId } })
    const activeJobsCount = companyJobs.filter((j) => j.status === 'active').length
    const totalJobsCount = companyJobs.length

    const companyAnalyticsData = await prisma.jobAnalytics.aggregate({
      where: { job: { companyId } },
      _sum: {
        applicantCount: true,
      },
      _avg: {
        conversionRate: true,
      },
    })

    await prisma.companyAnalytics.upsert({
      where: { companyId },
      create: {
        companyId,
        totalJobs: totalJobsCount,
        activeJobs: activeJobsCount,
        totalApplications: companyAnalyticsData._sum.applicantCount || 0,
        averageConversion: companyAnalyticsData._avg.conversionRate || 0.0,
      },
      update: {
        totalJobs: totalJobsCount,
        activeJobs: activeJobsCount,
        totalApplications: companyAnalyticsData._sum.applicantCount || 0,
        averageConversion: companyAnalyticsData._avg.conversionRate || 0.0,
      },
    })

    return job
  }

  async update(id: string, data: Prisma.JobUpdateInput) {
    const job = await prisma.job.update({
      where: { id },
      data,
      include: {
        company: true,
      },
    })

    // Update CompanyAnalytics because job status could have changed
    const companyId = job.companyId
    const companyJobs = await prisma.job.findMany({ where: { companyId } })
    const activeJobsCount = companyJobs.filter((j) => j.status === 'active').length
    const totalJobsCount = companyJobs.length

    const companyAnalyticsData = await prisma.jobAnalytics.aggregate({
      where: { job: { companyId } },
      _sum: {
        applicantCount: true,
      },
      _avg: {
        conversionRate: true,
      },
    })

    await prisma.companyAnalytics.upsert({
      where: { companyId },
      create: {
        companyId,
        totalJobs: totalJobsCount,
        activeJobs: activeJobsCount,
        totalApplications: companyAnalyticsData._sum.applicantCount || 0,
        averageConversion: companyAnalyticsData._avg.conversionRate || 0.0,
      },
      update: {
        totalJobs: totalJobsCount,
        activeJobs: activeJobsCount,
        totalApplications: companyAnalyticsData._sum.applicantCount || 0,
        averageConversion: companyAnalyticsData._avg.conversionRate || 0.0,
      },
    })

    return job
  }

  async incrementApplicantCount(id: string) {
    const job = await prisma.job.update({
      where: { id },
      data: {
        applicantCount: { increment: 1 },
      },
      include: {
        company: true,
      },
    })

    // Sync JobAnalytics
    const views = job.viewCount
    const apps = job.applicantCount
    const conversion = views > 0 ? (apps / views) : 0.0
    await prisma.jobAnalytics.upsert({
      where: { jobId: id },
      create: {
        jobId: id,
        viewCount: views,
        applicantCount: apps,
        conversionRate: conversion,
      },
      update: {
        applicantCount: apps,
        conversionRate: conversion,
      },
    })

    // Sync CompanyAnalytics
    const companyId = job.companyId
    const companyJobs = await prisma.job.findMany({ where: { companyId } })
    const activeJobsCount = companyJobs.filter((j) => j.status === 'active').length
    const totalJobsCount = companyJobs.length
    
    const companyAnalyticsData = await prisma.jobAnalytics.aggregate({
      where: { job: { companyId } },
      _sum: {
        applicantCount: true,
      },
      _avg: {
        conversionRate: true,
      },
    })

    await prisma.companyAnalytics.upsert({
      where: { companyId },
      create: {
        companyId,
        totalJobs: totalJobsCount,
        activeJobs: activeJobsCount,
        totalApplications: companyAnalyticsData._sum.applicantCount || 0,
        averageConversion: companyAnalyticsData._avg.conversionRate || 0.0,
      },
      update: {
        totalJobs: totalJobsCount,
        activeJobs: activeJobsCount,
        totalApplications: companyAnalyticsData._sum.applicantCount || 0,
        averageConversion: companyAnalyticsData._avg.conversionRate || 0.0,
      },
    })

    return job
  }

  async incrementViewCount(id: string) {
    const job = await prisma.job.update({
      where: { id },
      data: {
        viewCount: { increment: 1 },
      },
    })

    // Sync JobAnalytics
    const views = job.viewCount
    const apps = job.applicantCount
    const conversion = views > 0 ? (apps / views) : 0.0
    await prisma.jobAnalytics.upsert({
      where: { jobId: id },
      create: {
        jobId: id,
        viewCount: views,
        applicantCount: apps,
        conversionRate: conversion,
      },
      update: {
        viewCount: views,
        conversionRate: conversion,
      },
    })

    return job
  }

  async delete(id: string) {
    return prisma.job.delete({
      where: { id },
    })
  }
}
