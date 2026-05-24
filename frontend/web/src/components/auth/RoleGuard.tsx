import React from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { EmptyState } from '@/components/feedback/EmptyState'

interface RoleGuardProps {
  allowedRoles: ('candidate' | 'recruiter' | 'admin')[]
  children: React.ReactNode
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role as any)) {
    return (
      <div className="p-8 max-w-xl mx-auto min-h-[calc(100vh-120px)] flex flex-col justify-center">
        <EmptyState
          icon={<AlertCircle className="size-10 text-destructive animate-pulse" />}
          title="Forbidden Access"
          description={`Your account with role "${user.role}" does not possess required clearance permissions to access this workspace.`}
          action={{
            label: 'Return to Dashboard',
            onClick: () => {
              window.location.href = user.role === 'recruiter' ? '/app/recruiter/dashboard' : '/app/candidate/dashboard'
            }
          }}
        />
      </div>
    )
  }

  return <>{children}</>
}
