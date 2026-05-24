import { prisma } from '../lib/prisma'
import { CompanyRepository } from '../repositories/company.repository'
import { AppError } from '../errors/AppError'

const companyRepository = new CompanyRepository()

export class AnalyticsService {
  async getRecruiterAnalytics(companyId: string) {
    const company = await companyRepository.findById(companyId)
    if (!company) {
      throw new AppError('Company not found', 404)
    }

    const jobStats = await prisma.job.groupBy({
      by: ['status'],
      where: { companyId },
      _count: { _all: true },
    })

    const statusCounts = {
      active: 0,
      draft: 0,
      closed: 0,
    }

    for (const stat of jobStats) {
      const status = stat.status as keyof typeof statusCounts
      if (statusCounts[status] !== undefined) {
        statusCounts[status] = stat._count._all
      }
    }

    const totalJobs = statusCounts.active + statusCounts.draft + statusCounts.closed

    const appStats = await prisma.application.groupBy({
      by: ['status'],
      where: {
        job: { companyId },
      },
      _count: { _all: true },
    })

    const appStatusCounts = {
      applied: 0,
      screening: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      withdrawn: 0,
    }

    let totalApplications = 0
    for (const stat of appStats) {
      const status = stat.status as keyof typeof appStatusCounts
      if (appStatusCounts[status] !== undefined) {
        appStatusCounts[status] = stat._count._all
        totalApplications += stat._count._all
      }
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentApplications = await prisma.application.count({
      where: {
        job: { companyId },
        createdAt: { gte: sevenDaysAgo },
      },
    })

    return {
      companyId,
      companyName: company.name,
      jobs: {
        total: totalJobs,
        ...statusCounts,
      },
      applications: {
        total: totalApplications,
        recentLast7Days: recentApplications,
        byStatus: appStatusCounts,
      },
    }
  }
}
export default AnalyticsService
