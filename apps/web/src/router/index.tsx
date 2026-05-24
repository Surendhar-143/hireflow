import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { DashboardLayout, MarketingLayout, MinimalLayout } from '@/components/layout/Layouts'
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
  // ── App (with sidebar) ─────────────────────────────────────────────────────
  {
    path: '/app',
    element: <DashboardLayout />,
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
      { path: 'recruiter', element: <RecruiterDashboard /> },
      { path: 'settings', element: <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p className="text-muted-foreground mt-1">Coming in Phase 4.</p></div> },
    ],
  },
  // ── Fallback ───────────────────────────────────────────────────────────────
  { path: '*', element: <MinimalLayout />, children: [{ index: true, element: <NotFound /> }] },
])
