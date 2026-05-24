import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { CandidateDashboardLayout, RecruiterDashboardLayout, MarketingLayout, MinimalLayout } from '@/components/layout/Layouts'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'

// ─── Lazy pages ──────────────────────────────────────────────────────────────
const Landing = lazy(() => import('@/pages/Landing'))
const JobSearch = lazy(() => import('@/pages/JobSearch'))
const JobDetail = lazy(() => import('@/pages/JobDetail'))
const CandidateDashboard = lazy(() => import('@/pages/CandidateDashboard'))
const RecruiterDashboard = lazy(() => import('@/pages/RecruiterDashboard'))
const SavedJobs = lazy(() => import('@/pages/SavedJobs'))
const Applications = lazy(() => import('@/pages/Applications'))
const Companies = lazy(() => import('@/pages/Companies'))
const CompanyDetail = lazy(() => import('@/pages/CompanyDetail'))
const AIMatches = lazy(() => import('@/pages/AIMatches'))
const NotFound = lazy(() => import('@/pages/NotFound'))

export const router = createBrowserRouter([
  // ── Marketing (no sidebar) ─────────────────────────────────────────────────
  {
    element: <MarketingLayout />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
    children: [
      { index: true, element: <Landing /> },
      { path: '/companies', element: <Companies /> },
      { path: '/companies/:slug', element: <CompanyDetail /> },
      { path: '/jobs', element: <JobSearch /> },
      { path: '/jobs/:id', element: <JobDetail /> },
    ],
  },
  // ── App Candidate Scope (with candidate sidebar nav) ──────────────────────
  {
    path: '/app',
    element: <CandidateDashboardLayout />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard', element: <CandidateDashboard /> },
      { path: 'jobs', element: <JobSearch /> },
      { path: 'jobs/:id', element: <JobDetail /> },
      { path: 'companies', element: <Companies /> },
      { path: 'companies/:slug', element: <CompanyDetail /> },
      { path: 'saved', element: <SavedJobs /> },
      { path: 'applications', element: <Applications /> },
      { path: 'ai-matches', element: <AIMatches /> },
      { path: 'settings', element: <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p className="text-muted-foreground mt-1">Configure candidate accounts and features.</p></div> },
    ],
  },
  // ── App Recruiter Scope (with recruiter sidebar nav) ──────────────────────
  {
    path: '/app/recruiter',
    element: <RecruiterDashboardLayout />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
    children: [
      { index: true, element: <RecruiterDashboard /> },
      { path: 'post', element: <div className="p-6"><h1 className="text-2xl font-bold">Post a New Job</h1><p className="text-muted-foreground mt-1">Step-by-step publisher form coming in Phase 3.</p></div> },
      { path: 'applicants', element: <div className="p-6"><h1 className="text-2xl font-bold">Applicants Hub</h1><p className="text-muted-foreground mt-1">Candidate applications tracking coming in Phase 2.</p></div> },
      { path: 'analytics', element: <div className="p-6"><h1 className="text-2xl font-bold">Company Analytics</h1><p className="text-muted-foreground mt-1">Detailed recruitment logs and charts coming in Phase 3.</p></div> },
      { path: 'settings', element: <div className="p-6"><h1 className="text-2xl font-bold">Recruiter Settings</h1><p className="text-muted-foreground mt-1">Configure recruiter permissions and setups.</p></div> },
    ],
  },
  // ── Fallback ───────────────────────────────────────────────────────────────
  { path: '*', element: <MinimalLayout />, children: [{ index: true, element: <NotFound /> }] },
])
