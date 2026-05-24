import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'

export class CompanyRepository {
  async findById(id: string) {
    return prisma.company.findUnique({
      where: { id },
      include: {
        jobs: {
          where: { status: 'active' },
          take: 5,
        },
      },
    })
  }

  async findBySlug(slug: string) {
    return prisma.company.findUnique({
      where: { slug },
      include: {
        jobs: {
          where: { status: 'active' },
        },
      },
    })
  }

  async findAll(params: { page: number; limit: number; query?: string }) {
    const { page, limit, query } = params
    const skip = (page - 1) * limit

    const whereClause: Prisma.CompanyWhereInput = query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { industry: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } },
          ],
        }
      : {}

    const [data, total] = await Promise.all([
      prisma.company.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.company.count({ where: whereClause }),
    ])

    return {
      data,
      total,
      page,
      pageSize: limit,
      hasMore: skip + data.length < total,
    }
  }

  async create(data: Prisma.CompanyCreateInput) {
    return prisma.company.create({
      data,
    })
  }

  async update(id: string, data: Prisma.CompanyUpdateInput) {
    return prisma.company.update({
      where: { id },
      data,
    })
  }

  async delete(id: string) {
    return prisma.company.delete({
      where: { id },
    })
  }
}
