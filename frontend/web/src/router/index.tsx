import { Suspense, lazy, memo } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { CandidateDashboardLayout, RecruiterDashboardLayout, MarketingLayout, MinimalLayout } from '@/components/layout/Layouts'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { RoleGuard } from '@/components/auth/RoleGuard'
import {
  DashboardSkeleton,
  JobFeedSkeleton,
  JobDetailSkeleton,
  CompanyListSkeleton,
  CompanyDetailSkeleton,
  PipelineSkeleton,
  ApplicationsSkeleton,
} from '@/components/shared/Skeletons'

// ─── Lazy pages ──────────────────────────────────────────────────────────────

// Marketing / public pages
const Landing     = lazy(() => import(/* webpackChunkName: "landing" */     '@/pages/Landing'))
const JobSearch   = lazy(() => import(/* webpackChunkName: "jobs" */        '@/pages/JobSearch'))
const JobDetail   = lazy(() => import(/* webpackChunkName: "job-detail" */  '@/pages/JobDetail'))
const Companies   = lazy(() => import(/* webpackChunkName: "companies" */   '@/pages/Companies'))
const CompanyDetail = lazy(() => import(/* webpackChunkName: "company" */   '@/pages/CompanyDetail'))

// Auth pages — load together (small)
const Login   = lazy(() => import(/* webpackChunkName: "auth" */ '@/pages/Login'))
const Signup  = lazy(() => import(/* webpackChunkName: "auth" */ '@/pages/Signup'))

// Candidate app — split into own chunk
const CandidateDashboard   = lazy(() => import(/* webpackChunkName: "candidate" */ '@/pages/CandidateDashboard'))
const SavedJobs            = lazy(() => import(/* webpackChunkName: "candidate" */ '@/pages/SavedJobs'))
const Applications         = lazy(() => import(/* webpackChunkName: "candidate" */ '@/pages/Applications'))
const AIMatches            = lazy(() => import(/* webpackChunkName: "ai" */        '@/pages/AIMatches'))
const CandidateOnboarding  = lazy(() => import(/* webpackChunkName: "onboarding" */ '@/pages/CandidateOnboarding'))

// Recruiter app — split into own chunk
const RecruiterDashboard  = lazy(() => import(/* webpackChunkName: "recruiter" */  '@/pages/RecruiterDashboard'))
const PostJob             = lazy(() => import(/* webpackChunkName: "recruiter" */  '@/pages/PostJob'))
const PipelineBoard       = lazy(() => import(/* webpackChunkName: "pipeline" */   '@/pages/PipelineBoard'))

// Admin — isolated chunk (rarely loaded)
const AdminLogs  = lazy(() => import(/* webpackChunkName: "admin" */ '@/pages/AdminLogs'))
const NotFound   = lazy(() => import(/* webpackChunkName: "notfound" */ '@/pages/NotFound'))

// ─── Skeleton fallback wrappers ───────────────────────────────────────────────

/** Suspense wrapper with a contextual skeleton — prevents blank flash on route load */
function RouteShell({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  )
}

// Inline fallback components — memo'd so they don't recreate on every render
const PlaceholderSettings = memo(function PlaceholderSettings({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground mt-1">{description}</p>
    </div>
  )
})

export const router = createBrowserRouter([
  // ── Authentication Pages ───────────────────────────────────────────────────
  {
    path: '/login',
    element: (
      <RouteShell fallback={null}>
        <Login />
      </RouteShell>
    ),
  },
  {
    path: '/signup',
    element: (
      <RouteShell fallback={null}>
        <Signup />
      </RouteShell>
    ),
  },

  // ── Marketing (no sidebar) ─────────────────────────────────────────────────
  {
    element: <MarketingLayout />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
    children: [
      {
        index: true,
        element: (
          <RouteShell fallback={null}>
            <Landing />
          </RouteShell>
        ),
      },
      {
        path: '/companies',
        element: (
          <RouteShell fallback={<CompanyListSkeleton />}>
            <Companies />
          </RouteShell>
        ),
      },
      {
        path: '/companies/:slug',
        element: (
          <RouteShell fallback={<CompanyDetailSkeleton />}>
            <CompanyDetail />
          </RouteShell>
        ),
      },
      {
        path: '/jobs',
        element: (
          <RouteShell fallback={<JobFeedSkeleton count={9} />}>
            <JobSearch />
          </RouteShell>
        ),
      },
      {
        path: '/jobs/:id',
        element: (
          <RouteShell fallback={<JobDetailSkeleton />}>
            <JobDetail />
          </RouteShell>
        ),
      },
    ],
  },

  // ── App Candidate Scope (with candidate sidebar nav) ──────────────────────
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['candidate', 'admin']}>
          <CandidateDashboardLayout />
        </RoleGuard>
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      {
        path: 'dashboard',
        element: (
          <RouteShell fallback={<DashboardSkeleton />}>
            <CandidateDashboard />
          </RouteShell>
        ),
      },
      {
        path: 'jobs',
        element: (
          <RouteShell fallback={<JobFeedSkeleton count={9} />}>
            <JobSearch />
          </RouteShell>
        ),
      },
      {
        path: 'jobs/:id',
        element: (
          <RouteShell fallback={<JobDetailSkeleton />}>
            <JobDetail />
          </RouteShell>
        ),
      },
      {
        path: 'companies',
        element: (
          <RouteShell fallback={<CompanyListSkeleton />}>
            <Companies />
          </RouteShell>
        ),
      },
      {
        path: 'companies/:slug',
        element: (
          <RouteShell fallback={<CompanyDetailSkeleton />}>
            <CompanyDetail />
          </RouteShell>
        ),
      },
      {
        path: 'saved',
        element: (
          <RouteShell fallback={<JobFeedSkeleton count={4} />}>
            <SavedJobs />
          </RouteShell>
        ),
      },
      {
        path: 'applications',
        element: (
          <RouteShell fallback={<ApplicationsSkeleton />}>
            <Applications />
          </RouteShell>
        ),
      },
      {
        path: 'ai-matches',
        element: (
          <RouteShell fallback={<DashboardSkeleton />}>
            <AIMatches />
          </RouteShell>
        ),
      },
      {
        path: 'onboarding',
        element: (
          <RouteShell fallback={<DashboardSkeleton />}>
            <CandidateOnboarding />
          </RouteShell>
        ),
      },
      {
        path: 'onboard',
        element: (
          <RouteShell fallback={<DashboardSkeleton />}>
            <CandidateOnboarding />
          </RouteShell>
        ),
      },
      {
        path: 'settings',
        element: (
          <PlaceholderSettings
            title="Settings"
            description="Configure candidate accounts and features."
          />
        ),
      },
      {
        path: 'admin',
        element: (
          <RouteShell fallback={<DashboardSkeleton />}>
            <AdminLogs />
          </RouteShell>
        ),
      },
    ],
  },

  // ── App Recruiter Scope (with recruiter sidebar nav) ──────────────────────
  {
    path: '/app/recruiter',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['recruiter', 'admin']}>
          <RecruiterDashboardLayout />
        </RoleGuard>
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
    children: [
      {
        index: true,
        element: (
          <RouteShell fallback={<DashboardSkeleton />}>
            <RecruiterDashboard />
          </RouteShell>
        ),
      },
      {
        path: 'post',
        element: (
          <RouteShell fallback={<DashboardSkeleton />}>
            <PostJob />
          </RouteShell>
        ),
      },
      {
        path: 'applicants',
        element: (
          <RouteShell fallback={<PipelineSkeleton />}>
            <PipelineBoard />
          </RouteShell>
        ),
      },
      {
        path: 'analytics',
        element: (
          <PlaceholderSettings
            title="Company Analytics"
            description="Detailed recruitment logs and charts coming soon."
          />
        ),
      },
      {
        path: 'settings',
        element: (
          <PlaceholderSettings
            title="Recruiter Settings"
            description="Configure recruiter permissions and setups."
          />
        ),
      },
    ],
  },

  // ── Fallback ───────────────────────────────────────────────────────────────
  {
    path: '*',
    element: <MinimalLayout />,
    children: [
      {
        index: true,
        element: (
          <RouteShell fallback={null}>
            <NotFound />
          </RouteShell>
        ),
      },
    ],
  },
])
