import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ExternalLink, Users, Briefcase, CheckCircle2, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton, SkeletonCircle, SkeletonText } from '@/components/ui/skeleton'
import { Stagger, StaggerItem, FadeIn } from '@/components/motion'
import { useCompanies } from '@/hooks/useQueries'
import { formatCompact } from '@/lib/utils'

const sizeLabel = {
  startup: 'Startup', small: 'Small', medium: 'Medium', large: 'Large', enterprise: 'Enterprise',
}

function CompanySkeleton() {
  return (
    <div className="h-full bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <SkeletonCircle size="lg" className="rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <SkeletonText lines={2} />
      <div className="flex gap-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex gap-1.5 flex-wrap">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  )
}

export default function Companies() {
  const { data, isLoading } = useCompanies()
  const companies = data?.data || []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface-elevated/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <FadeIn>
            <h1 className="text-2xl font-bold text-foreground mb-1">Top Companies Hiring</h1>
            <p className="text-sm text-muted-foreground">
              {companies.length} world-class companies actively hiring on HireFlow
            </p>
          </FadeIn>
        </div>
      </div>

      {/* Company grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CompanySkeleton key={i} />
            ))}
          </div>
        ) : (
          <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.06}>
            {companies.map((company) => (
              <StaggerItem key={company.id}>
                <Link to={`/companies/${company.slug}`} className="block group h-full">
                  <div className={`
                    relative h-full bg-card border border-border rounded-2xl p-5
                    transition-all duration-base
                    hover:border-ring/40 hover:shadow-card-hover hover:-translate-y-0.5
                  `}>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-xl border border-border overflow-hidden bg-muted shrink-0">
                          {company.logo ? (
                            <img src={company.logo} alt={company.name} className="size-full object-cover" loading="lazy" />
                          ) : (
                            <div className="size-full flex items-center justify-center text-muted-foreground text-xs font-bold">
                              {company.name[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                              {company.name}
                            </span>
                            {company.verified && <CheckCircle2 className="size-3.5 text-info shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{company.industry}</p>
                        </div>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                    </div>

                    {/* Description */}
                    <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {company.description}
                    </p>

                    {/* Stats */}
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="size-3 shrink-0" />
                        {company.employeeCount < 1000
                          ? `${company.employeeCount}`
                          : `${formatCompact(company.employeeCount)}`}{' '}
                        employees
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="size-3 shrink-0" />
                        {company.openPositions} open roles
                      </span>
                    </div>

                    {/* Badges */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-[10px]">{sizeLabel[company.size]}</Badge>
                      {company.stage && (
                        <Badge variant="secondary" className="text-[10px] capitalize">{company.stage}</Badge>
                      )}
                      {company.benefits.slice(0, 1).map((b) => (
                        <Badge key={b} variant="ghost" className="text-[10px]">{b}</Badge>
                      ))}
                    </div>

                    {/* Tech stack */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {company.techStack.slice(0, 4).map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border/50">
                          {t}
                        </span>
                      ))}
                      {company.techStack.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] text-muted-foreground">
                          +{company.techStack.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </div>
  )
}
