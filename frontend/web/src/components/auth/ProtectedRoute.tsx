import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { RefreshCw } from 'lucide-react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, supabaseUser, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-muted-foreground gap-3">
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

  return <>{children}</>
}
