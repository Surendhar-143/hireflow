import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Globe, Linkedin, Twitter, Users, Building2,
  CheckCircle2, MapPin, Briefcase, Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/feedback/EmptyState'
import { JobCard } from '@/features/jobs/JobCard'
import { Skeleton, SkeletonCircle, SkeletonText, SkeletonJobCard } from '@/components/ui/skeleton'
import { useCompany, useJobs } from '@/hooks/useQueries'
import { formatCompact } from '@/lib/utils'

const sizeLabel = { startup: 'Startup', small: 'Small', medium: 'Medium', large: 'Large', enterprise: 'Enterprise' }

export default function CompanyDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  
  const { data: company, isLoading: companyLoading } = useCompany(slug)
  const { data: jobsData, isLoading: jobsLoading } = useJobs({ companyId: company?.id })
  
  const jobs = jobsData?.data || []

  if (companyLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-8 w-24 mb-5" />
          <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
            <div className="h-32 bg-muted shimmer" />
            <div className="px-6 pb-6">
              <div className="flex items-end justify-between -mt-8 mb-4">
                <SkeletonCircle size="xl" className="rounded-2xl border-4 border-card" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/4 mb-4" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <Skeleton className="h-6 w-32" />
                <SkeletonText lines={4} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <Skeleton className="h-5 w-24" />
                <SkeletonText lines={3} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Building2 className="size-7" />}
          title="Company not found"
          description="This company profile may have been removed."
          action={{ label: 'Browse companies', onClick: () => navigate('/companies') }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-5 -ml-2">
            <ArrowLeft className="size-4" /> Back
          </Button>
        </motion.div>

        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card border border-border rounded-2xl overflow-hidden mb-6"
        >
          {/* Cover gradient */}
          <div className="h-32 bg-gradient-to-br from-brand-900/60 to-brand-600/30 relative">
            <div className="absolute inset-0 bg-grid-white/[0.02]" />
          </div>
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-8 mb-4">
              <div className="size-16 rounded-2xl border-4 border-card bg-muted overflow-hidden shadow-lg">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} loading="lazy" className="size-full object-cover" />
                ) : (
                  <div className="size-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                    {company.name[0]}
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm">Follow</Button>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">{company.name}</h1>
                  {company.verified && <CheckCircle2 className="size-4 text-info shrink-0" />}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{company.industry} · {sizeLabel[company.size]}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{company.location}</span>
              <span className="flex items-center gap-1.5"><Users className="size-3.5" />{formatCompact(company.employeeCount)} employees</span>
              <span className="flex items-center gap-1.5"><Calendar className="size-3.5" />Founded {company.founded}</span>
              <span className="flex items-center gap-1.5"><Briefcase className="size-3.5" />{jobs.length} open roles</span>
            </div>

            {/* Links */}
            <div className="mt-3 flex gap-2">
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm"><Globe className="size-3.5" />{company.website.replace('https://', '')}</Button>
                </a>
              )}
              {company.linkedin && (
                <a href={`https://linkedin.com/company/${company.linkedin}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm"><Linkedin className="size-3.5" /></Button>
                </a>
              )}
              {company.twitter && (
                <a href={`https://twitter.com/${company.twitter}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm"><Twitter className="size-3.5" /></Button>
                </a>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: description + culture + tech */}
          <div className="lg:col-span-2 space-y-5">
            {/* About */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="text-base font-semibold text-foreground mb-3">About {company.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{company.description}</p>
            </div>

            {/* Culture */}
            {company.culture.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <h2 className="text-base font-semibold text-foreground mb-4">Culture & Values</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {company.culture.map((c) => (
                    <div key={c.title} className="flex gap-3 p-3 rounded-xl bg-accent/30 border border-border/50">
                      <span className="text-xl shrink-0">{c.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Jobs */}
            <div>
              <h2 className="text-base font-semibold text-foreground mb-3">
                Open Positions <span className="text-muted-foreground font-normal">({jobs.length})</span>
              </h2>
              {jobsLoading ? (
                <div className="space-y-3">
                  <SkeletonJobCard />
                  <SkeletonJobCard />
                </div>
              ) : jobs.length === 0 ? (
                <EmptyState
                  icon={<Briefcase className="size-6" />}
                  title="No open positions"
                  description="This company isn't actively hiring right now."
                  size="sm"
                />
              ) : (
                <div className="space-y-3">
                  {jobs.map((job, i) => <JobCard key={job.id} job={job} index={i} />)}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Benefits */}
            {company.benefits.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Benefits & Perks</h3>
                <ul className="space-y-2">
                  {company.benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="text-success shrink-0">✓</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tech Stack */}
            {company.techStack.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Tech Stack</h3>
                <div className="flex flex-wrap gap-1.5">
                  {company.techStack.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[11px]">{t}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Stage badge */}
            {company.stage && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">Company Stage</h3>
                <Badge variant="premium" className="capitalize">{company.stage}</Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
