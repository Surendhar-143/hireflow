// ─── Standard API Response Envelope ─────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta: ApiMeta
}

export interface ApiMeta {
  // Cursor-based pagination (jobs)
  nextCursor?: string
  hasMore?: boolean
  limit?: number
  // Offset-based pagination (companies)
  total?: number
  page?: number
  pageSize?: number
  // Timing
  took?: number
}

export interface ApiError {
  success: false
  message: string
  errors?: { field?: string; message: string }[]
}

// ─── Cursor Pagination ────────────────────────────────────────────────────────

export interface CursorPage<T> {
  data: T[]
  nextCursor: string | undefined
  hasMore: boolean
}

// ─── Offset Pagination ────────────────────────────────────────────────────────

export interface OffsetPage<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

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

// DTO — what frontend receives — never raw DB shape
export interface JobDTO extends Timestamps {
  id: ID
  title: string
  slug: string
  companyId: ID
  company: CompanySummaryDTO
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

// Backward-compat alias
export type Job = JobDTO

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
  featured?: boolean
  postedWithin?: '24h' | '7d' | '30d'
  cursor?: string
  limit?: number
  sortBy?: 'recent' | 'salary' | 'applicants'
}

// ─── Companies ───────────────────────────────────────────────────────────────

export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
export type CompanyStage = 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'public'

export interface CompanySummaryDTO {
  id: ID
  name: string
  slug: string
  logo?: string
  industry: string
  size: CompanySize
  verified: boolean
}

// Backward-compat alias
export type CompanySummary = CompanySummaryDTO

export interface CompanyDTO extends CompanySummaryDTO, Timestamps {
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
  // Derived — included in detail view
  jobs?: JobDTO[]
}

// Backward-compat alias
export type Company = CompanyDTO

export interface CultureValue {
  icon: string
  title: string
  description: string
}

// ─── Search ──────────────────────────────────────────────────────────────────

export interface SearchQuery {
  q: string
  type?: 'jobs' | 'companies' | 'all'
  limit?: number
}

export interface SearchResultDTO {
  jobs: JobDTO[]
  companies: CompanyDTO[]
  total: number
  took: number
}

// ─── Users ───────────────────────────────────────────────────────────────────

export type UserRole = 'candidate' | 'recruiter' | 'admin'

export interface UserDTO extends Timestamps {
  id: ID
  email: string
  name: string
  avatar?: string
  role: UserRole
  onboardingCompleted: boolean
  candidateProfile?: CandidateProfileDTO
  recruiterProfile?: RecruiterProfileDTO
}

export type User = UserDTO

export interface CandidateProfileDTO extends UserDTO {
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

export type CandidateProfile = CandidateProfileDTO

export interface RecruiterProfileDTO extends UserDTO {
  companyId: ID
  company: CompanySummaryDTO
  title: string
  bio?: string
}

export type RecruiterProfile = RecruiterProfileDTO

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

export interface ApplicationDTO extends Timestamps {
  id: ID
  jobId: ID
  job: JobDTO
  candidateId: ID
  candidate: CandidateProfileDTO
  status: ApplicationStatus
  timeline: ApplicationEvent[]
  coverLetter?: string
  resumeUrl?: string
  aiScore?: number
  notes?: string
}

export type Application = ApplicationDTO

export interface ApplicationEvent {
  id: ID
  status: ApplicationStatus
  timestamp: string
  note?: string
  actor?: string
}

// ─── Saved Jobs ───────────────────────────────────────────────────────────────

export interface SavedJobDTO extends Timestamps {
  id: ID
  jobId: ID
  job: JobDTO
  candidateId: ID
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
