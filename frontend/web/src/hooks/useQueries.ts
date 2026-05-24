/**
 * TanStack Query Hooks
 * ─────────────────────────────────────────────────────────────────────────────
 * All data-fetching hooks for the HireFlow frontend.
 * 
 * Caching strategy:
 *   - Job list:    staleTime 60s   (public feed, refreshes slowly)
 *   - Job detail:  staleTime 120s  (rarely changes mid-session)
 *   - Companies:   staleTime 300s  (very stable)
 *   - Search:      staleTime 30s   (fast iteration feel)
 *   - Dashboard:   staleTime 30s   (live enough for recruiter/candidate)
 *   - Saved jobs:  staleTime 0     (always fresh — user-owned data)
 */

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  infiniteQueryOptions,
  queryOptions,
} from '@tanstack/react-query'
import { jobsApi } from '@/api/jobs.api'
import { companiesApi } from '@/api/companies.api'
import { searchApi } from '@/api/search.api'
import { dashboardApi } from '@/api/dashboard.api'
import { authApi } from '@/api/auth.api'
import { candidatesApi } from '@/api/candidates.api'
import { applicationsApi } from '@/api/applications.api'
import { aiApi } from '@/api/ai.api'
import type { JobFilters, JobDTO } from '@hireflow/types'

// ─── Query Key Factory ────────────────────────────────────────────────────────

export const queryKeys = {
  jobs: {
    all: ['jobs'] as const,
    lists: () => ['jobs', 'list'] as const,
    list: (filters: JobFilters) => ['jobs', 'list', filters] as const,
    detail: (id: string) => ['jobs', 'detail', id] as const,
    related: (id: string) => ['jobs', 'related', id] as const,
  },
  companies: {
    all: ['companies'] as const,
    lists: () => ['companies', 'list'] as const,
    list: (query?: string, page?: number) => ['companies', 'list', { query, page }] as const,
    detail: (slug: string) => ['companies', 'detail', slug] as const,
  },
  saved: {
    all: ['saved-jobs'] as const,
  },
  search: {
    results: (q: string, type?: string) => ['search', q, type] as const,
  },
  dashboard: {
    candidate: () => ['dashboard', 'candidate'] as const,
    recruiter: (companyId: string) => ['dashboard', 'recruiter', companyId] as const,
  },
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  applications: {
    all: ['applications'] as const,
    candidate: (candidateId: string) => ['applications', 'candidate', candidateId] as const,
    detail: (id: string) => ['applications', 'detail', id] as const,
  },
  ai: {
    match: (candidateId?: string) => ['ai', 'match', candidateId] as const,
    hybrid: (q: string) => ['ai', 'hybrid', q] as const,
  },
} as const

// ─── Jobs — Infinite scroll feed ─────────────────────────────────────────────

export function useInfiniteJobs(filters: JobFilters = {}) {
  return useInfiniteQuery(
    infiniteQueryOptions({
      queryKey: queryKeys.jobs.list(filters),
      queryFn: ({ pageParam }) =>
        jobsApi.list(filters, pageParam as string | undefined, 20),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.nextCursor : undefined,
      staleTime: 60_000,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    })
  )
}

// ─── Jobs — Simple list (no infinite scroll) ──────────────────────────────────

export function useJobs(filters: JobFilters = {}) {
  return useQuery(
    queryOptions({
      queryKey: queryKeys.jobs.list(filters),
      queryFn: () => jobsApi.list(filters, undefined, 50),
      staleTime: 60_000,
      retry: 2,
    })
  )
}

// ─── Job Detail ───────────────────────────────────────────────────────────────

export function useJob(idOrSlug?: string) {
  return useQuery(
    queryOptions({
      queryKey: queryKeys.jobs.detail(idOrSlug!),
      queryFn: () => jobsApi.get(idOrSlug!),
      enabled: !!idOrSlug,
      staleTime: 120_000,
      retry: 1,
    })
  )
}

// ─── Related Jobs ─────────────────────────────────────────────────────────────

export function useRelatedJobs(jobId?: string, companyId?: string, skills?: string[]) {
  return useQuery(
    queryOptions({
      queryKey: queryKeys.jobs.related(jobId!),
      queryFn: () => jobsApi.related(jobId!, companyId!, skills ?? []),
      enabled: !!jobId && !!companyId,
      staleTime: 120_000,
      retry: 1,
    })
  )
}

// ─── Companies — Paginated ────────────────────────────────────────────────────

export function useCompanies(query?: string, page = 1) {
  return useQuery(
    queryOptions({
      queryKey: queryKeys.companies.list(query, page),
      queryFn: () => companiesApi.list({ query, page, limit: 20 }),
      staleTime: 300_000,
      retry: 2,
      placeholderData: (prev) => prev, // Keep previous page while loading next
    })
  )
}

// ─── Company Detail ───────────────────────────────────────────────────────────

export function useCompany(slug?: string) {
  return useQuery(
    queryOptions({
      queryKey: queryKeys.companies.detail(slug!),
      queryFn: () => companiesApi.get(slug!),
      enabled: !!slug,
      staleTime: 300_000,
      retry: 1,
    })
  )
}

// ─── Search ───────────────────────────────────────────────────────────────────

export function useSearch(
  q: string,
  opts: { type?: 'jobs' | 'companies' | 'all'; limit?: number; enabled?: boolean } = {}
) {
  return useQuery(
    queryOptions({
      queryKey: queryKeys.search.results(q, opts.type),
      queryFn: () => searchApi.search({ q, type: opts.type ?? 'all', limit: opts.limit ?? 10 }),
      enabled: (opts.enabled ?? true) && q.trim().length >= 2,
      staleTime: 30_000,
      retry: 1,
    })
  )
}

// ─── Saved Jobs ───────────────────────────────────────────────────────────────

export function useSavedJobs() {
  return useQuery(
    queryOptions({
      queryKey: queryKeys.saved.all,
      queryFn: () => jobsApi.saved.list(),
      staleTime: 0, // Always fresh — user-owned data
      retry: 1,
    })
  )
}

export function useSaveJobMutation() {
  const qc = useQueryClient()

  const save = useMutation({
    mutationFn: (jobId: string) => jobsApi.saved.save(jobId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.saved.all }),
  })

  const unsave = useMutation({
    mutationFn: (jobId: string) => jobsApi.saved.remove(jobId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.saved.all }),
  })

  return { save, unsave }
}

// ─── Dashboard Stats Hooks ───────────────────────────────────────────────────

export function useCandidateDashboard() {
  return useQuery(
    queryOptions({
      queryKey: queryKeys.dashboard.candidate(),
      queryFn: () => dashboardApi.getCandidateStats(),
      staleTime: 30_000,
      retry: 1,
    })
  )
}

export function useRecruiterDashboard(companyId: string) {
  return useQuery(
    queryOptions({
      queryKey: queryKeys.dashboard.recruiter(companyId),
      queryFn: () => dashboardApi.getRecruiterStats(companyId),
      enabled: !!companyId,
      staleTime: 30_000,
      retry: 1,
    })
  )
}

// ─── Auth & Onboarding Hooks ──────────────────────────────────────────────────

export function useMe() {
  return useQuery(
    queryOptions({
      queryKey: queryKeys.auth.me(),
      queryFn: () => authApi.getMe(),
      staleTime: 300_000,
      retry: 1,
    })
  )
}

export function useOnboardMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof authApi.onboard>[0]) => authApi.onboard(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.me() })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.candidate() })
    },
  })
}

export function useUpdateProfileMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof candidatesApi.updateProfile>[0]) => candidatesApi.updateProfile(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.me() })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.candidate() })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}


// ─── Application Hooks ────────────────────────────────────────────────────────

export function useCandidateApplications(candidateId?: string) {
  return useQuery(
    queryOptions({
      queryKey: queryKeys.applications.candidate(candidateId!),
      queryFn: () => applicationsApi.listByCandidate(candidateId!),
      enabled: !!candidateId,
      staleTime: 30_000,
      retry: 1,
    })
  )
}

export function useApplication(id?: string) {
  return useQuery(
    queryOptions({
      queryKey: queryKeys.applications.detail(id!),
      queryFn: () => applicationsApi.get(id!),
      enabled: !!id,
      staleTime: 30_000,
      retry: 1,
    })
  )
}

export function useSubmitApplicationMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { jobId: string; coverLetter?: string; resumeUrl?: string }) =>
      applicationsApi.submit(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.applications.all })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.candidate() })
      qc.invalidateQueries({ queryKey: queryKeys.jobs.detail(data.jobId) })
    },
  })
}

export function useJobApplications(jobId?: string) {
  return useQuery(
    queryOptions({
      queryKey: ['applications', 'job', jobId],
      queryFn: () => applicationsApi.listByJob(jobId!),
      enabled: !!jobId,
      staleTime: 30_000,
      retry: 1,
    })
  )
}

export function useUpdateApplicationStatusMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: string; status: string; note?: string }) =>
      applicationsApi.updateStatus(payload.id, { status: payload.status, note: payload.note }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.applications.all })
      qc.invalidateQueries({ queryKey: ['applications', 'job', data.jobId] })
      qc.invalidateQueries({ queryKey: queryKeys.applications.detail(data.id) })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.candidate() })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useCreateJobMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: any) =>
      jobsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.jobs.all })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateJobMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: string; data: Partial<JobDTO> }) =>
      jobsApi.update(payload.id, payload.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.jobs.all })
      qc.invalidateQueries({ queryKey: queryKeys.jobs.detail(data.id) })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteJobMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => jobsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.jobs.all })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// ─── AI-Native Hooks ─────────────────────────────────────────────────────────

export function useHybridSearch(q: string, enabled = true) {
  return useQuery(
    queryOptions({
      queryKey: queryKeys.ai.hybrid(q),
      queryFn: () => aiApi.searchHybrid(q),
      enabled: enabled && q.trim().length >= 2,
      staleTime: 30_000,
      retry: 1,
    })
  )
}

export function useAIMatchRecommendations(candidateId?: string, enabled = true) {
  return useQuery(
    queryOptions({
      queryKey: queryKeys.ai.match(candidateId),
      queryFn: () => aiApi.matchJobs(candidateId),
      enabled: enabled,
      staleTime: 30_000,
      retry: 1,
    })
  )
}

export function useResumeParseMutation() {
  return useMutation({
    mutationFn: (resumeText: string) => aiApi.parseResume(resumeText),
  })
}

// ─── Backward-compat aliases (migrate to new names gradually) ─────────────────

/** @deprecated Use useInfiniteJobs for paginated feeds */
export const keys = {
  jobs: queryKeys.jobs,
  companies: queryKeys.companies,
  dashboard: queryKeys.dashboard,
}

/** @deprecated Alias for useJob */
export const useJob_ = useJob
