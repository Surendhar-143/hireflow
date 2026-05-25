import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { RefreshCw } from 'lucide-react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, supabaseUser, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground gap-3">
        <RefreshCw className="size-8 animate-spin text-brand-400" />
        <span className="text-xs font-bold uppercase tracking-wider animate-pulse">Hydrating Auth Session...</span>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!supabaseUser) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Enforce onboarding check
  if (user && !user.onboardingCompleted && location.pathname !== '/app/onboard') {
    return <Navigate to="/app/onboard" replace />
  }

  // Redirect to correct workspace if on wrong path
  if (user) {
    const isRecruiterPath = location.pathname.startsWith('/app/recruiter')
    const isOnboardPath = location.pathname === '/app/onboard'

    if (user.role === 'recruiter' && !isRecruiterPath && !isOnboardPath) {
      return <Navigate to="/app/recruiter" replace />
    }
    if ((user.role === 'candidate' || user.role === 'admin') && isRecruiterPath) {
      return <Navigate to="/app/dashboard" replace />
    }
  }

  return <>{children}</>
}
