/**
 * DTO Mapper Layer
 * ─────────────────────────────────────────────────────────────────────────────
 * Maps raw Prisma entities → typed DTOs consumed by the frontend.
 * Frontend NEVER receives raw DB shapes. All transformations happen here.
 */

import type {
  JobDTO,
  CompanyDTO,
  CompanySummaryDTO,
  SalaryRange,
  CultureValue,
  ApplicationDTO,
  ApplicationEvent,
} from '@hireflow/types'

// ─── Company Mappers ──────────────────────────────────────────────────────────

/**
 * Map a raw Prisma Company row to CompanySummaryDTO
 * Used in embedded contexts (e.g. inside JobDTO)
 */
export function mapCompanySummary(raw: any): CompanySummaryDTO {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    logo: raw.logo ?? undefined,
    industry: raw.industry,
    size: raw.size,
    verified: raw.verified,
  }
}

/**
 * Map a raw Prisma Company row to full CompanyDTO
 */
export function mapCompany(raw: any): CompanyDTO {
  const culture: CultureValue[] = Array.isArray(raw.culture) ? raw.culture : []

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    logo: raw.logo ?? undefined,
    industry: raw.industry,
    size: raw.size,
    verified: raw.verified,
    description: raw.description ?? '',
    website: raw.website ?? '',
    linkedin: raw.linkedin ?? undefined,
    twitter: raw.twitter ?? undefined,
    founded: raw.founded ?? 0,
    stage: raw.stage ?? undefined,
    location: raw.location ?? '',
    employeeCount: raw.employeeCount ?? 0,
    openPositions: raw.openPositions ?? 0,
    benefits: raw.benefits ?? [],
    techStack: raw.techStack ?? [],
    culture,
    coverImage: raw.coverImage ?? undefined,
    followerCount: raw.followerCount ?? 0,
    createdAt: raw.createdAt?.toISOString?.() ?? raw.createdAt,
    updatedAt: raw.updatedAt?.toISOString?.() ?? raw.updatedAt,
    // Optionally include associated jobs if fetched
    jobs: Array.isArray(raw.jobs) ? raw.jobs.map(mapJob) : undefined,
  }
}

// ─── Job Mappers ──────────────────────────────────────────────────────────────

/**
 * Map flat Prisma salary columns to nested SalaryRange
 */
function mapSalary(raw: any): SalaryRange | undefined {
  if (raw.salaryMin == null) return undefined
  return {
    min: raw.salaryMin,
    max: raw.salaryMax ?? raw.salaryMin,
    currency: raw.salaryCurrency ?? 'USD',
  }
}

/**
 * Map a raw Prisma Job row (with included company) to JobDTO
 */
export function mapJob(raw: any): JobDTO {
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    companyId: raw.companyId,
    company: raw.company ? mapCompanySummary(raw.company) : ({} as CompanySummaryDTO),
    description: raw.description,
    requirements: raw.requirements ?? [],
    benefits: raw.benefits ?? [],
    skills: raw.skills ?? [],
    type: raw.type,
    workMode: raw.workMode,
    experienceLevel: raw.experienceLevel,
    salary: mapSalary(raw),
    location: raw.location,
    status: raw.status,
    applicantCount: raw.applicantCount ?? 0,
    viewCount: raw.viewCount ?? 0,
    featured: raw.featured ?? false,
    aiMatchScore: raw.aiMatchScore ?? undefined,
    createdAt: raw.createdAt?.toISOString?.() ?? raw.createdAt,
    updatedAt: raw.updatedAt?.toISOString?.() ?? raw.updatedAt,
  }
}

// ─── Application Mappers ──────────────────────────────────────────────────────

export function mapApplicationEvent(raw: any): ApplicationEvent {
  return {
    id: raw.id,
    status: raw.status,
    timestamp: raw.createdAt?.toISOString?.() ?? raw.createdAt,
    note: raw.note ?? undefined,
    actor: raw.actor ?? undefined,
  }
}

export function mapApplication(raw: any): ApplicationDTO {
  return {
    id: raw.id,
    jobId: raw.jobId,
    job: mapJob(raw.job),
    candidateId: raw.candidateId,
    candidate: raw.candidate,
    status: raw.status,
    timeline: (raw.events ?? []).map(mapApplicationEvent),
    coverLetter: raw.coverLetter ?? undefined,
    resumeUrl: raw.resumeUrl ?? undefined,
    aiScore: raw.aiScore ?? undefined,
    notes: raw.notes ?? undefined,
    createdAt: raw.createdAt?.toISOString?.() ?? raw.createdAt,
    updatedAt: raw.updatedAt?.toISOString?.() ?? raw.updatedAt,
  }
}
