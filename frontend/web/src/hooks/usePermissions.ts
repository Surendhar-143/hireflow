import { useAuth } from '@/components/auth/AuthContext'

export interface Permissions {
  canPostJobs: boolean
  canEditProfile: boolean
  canViewPipeline: boolean
  canAccessAdmin: boolean
  canManageJob: (jobCompanyId: string) => boolean
  canReviewApplication: (jobCompanyId: string) => boolean
  isLoading: boolean
}

export function usePermissions(): Permissions {
  const { user, isLoading } = useAuth()

  const role = user?.role || 'candidate'

  const canPostJobs = role === 'recruiter' || role === 'admin'
  const canEditProfile = role === 'candidate' || role === 'admin'
  const canViewPipeline = role === 'recruiter' || role === 'admin'
  const canAccessAdmin = role === 'admin'

  const canManageJob = (jobCompanyId: string) => {
    if (role === 'admin') return true
    if (role !== 'recruiter') return false
    return user?.recruiterProfile?.companyId === jobCompanyId
  }

  const canReviewApplication = (jobCompanyId: string) => {
    if (role === 'admin') return true
    if (role !== 'recruiter') return false
    return user?.recruiterProfile?.companyId === jobCompanyId
  }

  return {
    canPostJobs,
    canEditProfile,
    canViewPipeline,
    canAccessAdmin,
    canManageJob,
    canReviewApplication,
    isLoading,
  }
}
