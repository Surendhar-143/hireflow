// ─── Common ──────────────────────────────────────────────────────────────────

export type ID = string

export interface Timestamps {
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export type SalaryRange = {
  min: number
  max: number
  currency: string
}

// ─── Jobs ────────────────────────────────────────────────────────────────────

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance'
export type WorkMode = 'remote' | 'hybrid' | 'onsite'
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
export type JobStatus = 'active' | 'paused' | 'closed' | 'draft'
export type ApplicationStatus =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn'

export interface Job extends Timestamps {
  id: ID
  title: string
  slug: string
  companyId: ID
  company: CompanySummary
  description: string
  requirements: string[]
  benefits: string[]
  skills: string[]
  type: JobType
  workMode: WorkMode
  experienceLevel: ExperienceLevel
  salary?: SalaryRange
  location: string
  status: JobStatus
  applicantCount: number
  viewCount: number
  featured: boolean
  aiMatchScore?: number
}

export interface JobFilters {
  query?: string
  type?: JobType[]
  workMode?: WorkMode[]
  experienceLevel?: ExperienceLevel[]
  skills?: string[]
  location?: string
  salaryMin?: number
  salaryMax?: number
  companyId?: string
  postedWithin?: '24h' | '7d' | '30d'
}

// ─── Companies ───────────────────────────────────────────────────────────────

export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
export type CompanyStage = 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'public'

export interface CompanySummary {
  id: ID
  name: string
  slug: string
  logo?: string
  industry: string
  size: CompanySize
  verified: boolean
}

export interface Company extends CompanySummary, Timestamps {
  description: string
  website: string
  linkedin?: string
  twitter?: string
  founded: number
  stage?: CompanyStage
  location: string
  employeeCount: number
  openPositions: number
  benefits: string[]
  techStack: string[]
  culture: CultureValue[]
  coverImage?: string
  followerCount: number
}

export interface CultureValue {
  icon: string
  title: string
  description: string
}

// ─── Users ───────────────────────────────────────────────────────────────────

export type UserRole = 'candidate' | 'recruiter' | 'admin'

export interface User extends Timestamps {
  id: ID
  email: string
  name: string
  avatar?: string
  role: UserRole
  onboardingCompleted: boolean
}

export interface CandidateProfile extends User {
  headline?: string
  bio?: string
  location?: string
  skills: string[]
  experience: WorkExperience[]
  education: Education[]
  resumeUrl?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  openToWork: boolean
  expectedSalary?: SalaryRange
  profileCompletionScore: number
}

export interface RecruiterProfile extends User {
  companyId: ID
  company: CompanySummary
  title: string
  bio?: string
}

export interface WorkExperience {
  id: ID
  title: string
  company: string
  companyLogo?: string
  startDate: string
  endDate?: string
  current: boolean
  description?: string
  skills: string[]
}

export interface Education {
  id: ID
  institution: string
  degree: string
  field: string
  startYear: number
  endYear?: number
  current: boolean
}

// ─── Applications ─────────────────────────────────────────────────────────────

export interface Application extends Timestamps {
  id: ID
  jobId: ID
  job: Job
  candidateId: ID
  candidate: CandidateProfile
  status: ApplicationStatus
  timeline: ApplicationEvent[]
  coverLetter?: string
  resumeUrl?: string
  aiScore?: number
  notes?: string
}

export interface ApplicationEvent {
  id: ID
  status: ApplicationStatus
  timestamp: string
  note?: string
  actor?: string
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface NavItem {
  id: string
  label: string
  href: string
  icon?: string
  badge?: string | number
  children?: NavItem[]
}
