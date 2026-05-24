import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { JobFilters } from '@hireflow/types'

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const keys = {
  jobs: {
    all: ['jobs'] as const,
    list: (filters: JobFilters) => ['jobs', 'list', filters] as const,
    detail: (id: string) => ['jobs', 'detail', id] as const,
  },
  companies: {
    all: ['companies'] as const,
    list: () => ['companies', 'list'] as const,
    detail: (slug: string) => ['companies', 'detail', slug] as const,
  },
  dashboard: {
    candidate: () => ['dashboard', 'candidate'] as const,
    recruiter: (companyId: string) => ['dashboard', 'recruiter', companyId] as const,
  },
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export function useJobs(filters: JobFilters = {}) {
  return useQuery({
    queryKey: keys.jobs.list(filters),
    queryFn: () => apiClient.jobs.list(filters),
  })
}

export function useJob(id?: string) {
  return useQuery({
    queryKey: keys.jobs.detail(id!),
    queryFn: () => apiClient.jobs.getById(id!),
    enabled: !!id,
  })
}

// ─── Companies ────────────────────────────────────────────────────────────────
export function useCompanies() {
  return useQuery({
    queryKey: keys.companies.list(),
    queryFn: () => apiClient.companies.list(),
  })
}

export function useCompany(slug?: string) {
  return useQuery({
    queryKey: keys.companies.detail(slug!),
    queryFn: () => apiClient.companies.getBySlug(slug!),
    enabled: !!slug,
  })
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function useCandidateDashboard() {
  return useQuery({
    queryKey: keys.dashboard.candidate(),
    queryFn: () => apiClient.dashboard.getCandidateStats(),
  })
}

export function useRecruiterDashboard(companyId: string) {
  return useQuery({
    queryKey: keys.dashboard.recruiter(companyId),
    queryFn: () => apiClient.dashboard.getRecruiterStats(companyId),
  })
}
