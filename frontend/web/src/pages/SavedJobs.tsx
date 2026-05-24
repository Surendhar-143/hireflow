import React from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Search, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { SkeletonJobCard } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { JobCard } from '@/features/jobs/JobCard'
import { useSavedJobs } from '@/hooks/useQueries'
import { FadeIn } from '@/components/motion'

export default function SavedJobs() {
  const { data: savedJobRelations = [], isLoading } = useSavedJobs()
  const savedJobObjects = savedJobRelations.map((sr) => sr.job)


  return (

    <div className="max-w-4xl mx-auto px-4 py-8">
      <FadeIn>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Bookmark className="size-6 text-warning" /> Saved Jobs
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {savedJobObjects.length} job{savedJobObjects.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          {savedJobObjects.length > 0 && (
            <Link to="/jobs">
              <Button variant="outline" size="sm">
                <Search className="size-3.5" /> Find more jobs
              </Button>
            </Link>
          )}
        </div>
      </FadeIn>

      <AnimatePresence mode="popLayout">
        {isLoading ? (
          <div className="space-y-3">
            <SkeletonJobCard />
            <SkeletonJobCard />
            <SkeletonJobCard />
          </div>
        ) : savedJobObjects.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmptyState
              icon={<Bookmark className="size-8" />}
              title="No saved jobs yet"
              description="Bookmark jobs you're interested in and they'll appear here for easy access."
              action={{ label: 'Browse jobs', onClick: () => window.location.href = '/jobs' }}
            />
          </motion.div>
        ) : (
          <div className="space-y-3">
            {savedJobObjects.map((job, i) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20, scale: 0.98 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
              >
                <JobCard job={job} index={i} />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
