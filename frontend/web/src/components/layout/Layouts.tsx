import React, { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'
import { CommandMenu } from './CommandMenu'
import { AICopilot } from '@/features/ai/AICopilot'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { SkeletonCard } from '@/components/ui/skeleton'
import { useUIStore } from '@/store/ui-store'
import { pageVariants } from '@/lib/motion'

// ─── Page loading fallback ───────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <SkeletonCard className="h-8 w-48" />
        <SkeletonCard className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  )
}

// ─── Candidate Dashboard Layout ──────────────────────────────────────────────
export function CandidateDashboardLayout() {
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background">
      <CommandMenu />
      <AICopilot />
      <Sidebar role="candidate" />
      {/* Mobile Sidebar Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <TopNav />
      <main
        className={cn(
          'transition-all duration-slow pt-14 pl-0',
          sidebarCollapsed
            ? 'md:pl-[var(--sidebar-collapsed-width)]'
            : 'md:pl-[var(--sidebar-width)]'
        )}
      >
        <ErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="min-h-[calc(100vh-56px)]"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}

// ─── Recruiter Dashboard Layout ──────────────────────────────────────────────
export function RecruiterDashboardLayout() {
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background">
      <CommandMenu />
      <AICopilot />
      <Sidebar role="recruiter" />
      {/* Mobile Sidebar Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <TopNav />
      <main
        className={cn(
          'transition-all duration-slow pt-14 pl-0',
          sidebarCollapsed
            ? 'md:pl-[var(--sidebar-collapsed-width)]'
            : 'md:pl-[var(--sidebar-width)]'
        )}
      >
        <ErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="min-h-[calc(100vh-56px)]"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}

// ─── Analytics Layout ────────────────────────────────────────────────────────
export function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {children}
    </div>
  )
}

// ─── Marketing Layout (no sidebar) ──────────────────────────────────────────
export function MarketingLayout() {
  const location = useLocation()
  return (
    <ErrorBoundary>
      <CommandMenu />
      <AICopilot />
      <Suspense fallback={<div className="min-h-screen bg-background animate-pulse" />}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  )
}

// ─── Minimal Layout ──────────────────────────────────────────────────────────
export function MinimalLayout() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <ErrorBoundary>
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
