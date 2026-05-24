import React, { useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Search, Briefcase, Building2, LayoutDashboard, Bookmark, FileText,
  Sparkles, Moon, Sun, X, ArrowRight, Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/ui-store'
import { useSearchStore } from '@/store/search-store'
import { MOCK_JOBS, MOCK_COMPANIES } from '@/data/mock'

// ─── Command types ────────────────────────────────────────────────────────────
interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  action: () => void
  section: string
  keywords?: string[]
}

// ─── Highlight match ──────────────────────────────────────────────────────────
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-brand-500/20 text-brand-300 rounded-sm">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

// ─── Command Menu ─────────────────────────────────────────────────────────────
export function CommandMenu() {
  const { commandMenuOpen, setCommandMenuOpen, theme, toggleTheme } = useUIStore()
  const { recentSearches, setQuery } = useSearchStore()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [selected, setSelected] = useState(0)

  // Close on ESC / open on ⌘K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandMenuOpen(!commandMenuOpen)
      }
      if (e.key === 'Escape') setCommandMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [commandMenuOpen, setCommandMenuOpen])

  // Reset on open
  useEffect(() => {
    if (commandMenuOpen) { setInput(''); setSelected(0) }
  }, [commandMenuOpen])

  const close = useCallback(() => setCommandMenuOpen(false), [setCommandMenuOpen])

  // ── Build command list ─────────────────────────────────────────────────────
  const staticCommands: CommandItem[] = [
    { id: 'dashboard', label: 'Dashboard', description: 'Go to your dashboard', icon: LayoutDashboard, action: () => { navigate('/app/dashboard'); close() }, section: 'Navigation' },
    { id: 'jobs', label: 'Browse Jobs', description: 'Search all open positions', icon: Briefcase, action: () => { navigate('/jobs'); close() }, section: 'Navigation' },
    { id: 'companies', label: 'Companies', description: 'Explore top companies', icon: Building2, action: () => { navigate('/companies'); close() }, section: 'Navigation' },
    { id: 'saved', label: 'Saved Jobs', description: 'Jobs you\'ve bookmarked', icon: Bookmark, action: () => { navigate('/app/saved'); close() }, section: 'Navigation' },
    { id: 'applications', label: 'My Applications', description: 'Track your applications', icon: FileText, action: () => { navigate('/app/applications'); close() }, section: 'Navigation' },
    { id: 'ai-matches', label: 'AI Matches', description: 'Jobs matched by AI to your profile', icon: Sparkles, action: () => { navigate('/app/ai-matches'); close() }, section: 'AI' },
    { id: 'theme', label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, icon: theme === 'dark' ? Sun : Moon, action: () => { toggleTheme(); close() }, section: 'Preferences' },
  ]

  const jobCommands: CommandItem[] = MOCK_JOBS.slice(0, 5).map((job) => ({
    id: `job-${job.id}`,
    label: job.title,
    description: job.company.name,
    icon: Briefcase,
    action: () => { navigate(`/jobs/${job.id}`); close() },
    section: 'Jobs',
    keywords: [...job.skills, job.company.name],
  }))

  const companyCommands: CommandItem[] = MOCK_COMPANIES.map((c) => ({
    id: `company-${c.id}`,
    label: c.name,
    description: c.industry,
    icon: Building2,
    action: () => { navigate(`/companies/${c.slug}`); close() },
    section: 'Companies',
    keywords: [c.industry],
  }))

  const allCommands = [...staticCommands, ...jobCommands, ...companyCommands]

  // Filter
  const filtered = input.trim()
    ? allCommands.filter((c) => {
        const q = input.toLowerCase()
        return (
          c.label.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.keywords?.some((k) => k.toLowerCase().includes(q))
        )
      })
    : staticCommands

  // Group by section
  const groups = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = []
    acc[item.section].push(item)
    return acc
  }, {})

  // Keyboard navigation
  const flatItems = filtered
  useEffect(() => { setSelected(0) }, [input])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => (s + 1) % flatItems.length) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => (s - 1 + flatItems.length) % flatItems.length) }
    if (e.key === 'Enter' && flatItems[selected]) flatItems[selected].action()
  }

  return (
    <AnimatePresence>
      {commandMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={close}
          />

          {/* Panel */}
          <motion.div
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-xl"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
          >
            <div className="bg-popover border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                <Search className="size-4 text-muted-foreground shrink-0" />
                <input
                  autoFocus
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search jobs, companies, actions..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                {input && (
                  <button onClick={() => setInput('')} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="size-3.5" />
                  </button>
                )}
                <kbd className="px-1.5 py-0.5 text-[10px] rounded border border-border text-muted-foreground bg-muted">ESC</kbd>
              </div>

              {/* Recent searches (when empty) */}
              {!input && recentSearches.length > 0 && (
                <div className="px-2 py-2 border-b border-border">
                  <p className="px-2 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">Recent</p>
                  {recentSearches.slice(0, 3).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setQuery(s)
                        navigate('/jobs')
                        close()
                      }}
                      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-left"
                    >
                      <Clock className="size-3.5 shrink-0" /> {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {filtered.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">No results for &quot;{input}&quot;</p>
                ) : (
                  Object.entries(groups).map(([section, items]) => {
                    const sectionStart = flatItems.indexOf(items[0])
                    return (
                      <div key={section}>
                        <p className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
                          {section}
                        </p>
                        {items.map((item, i) => {
                          const globalIdx = sectionStart + i
                          const isSelected = selected === globalIdx
                          return (
                            <button
                              key={item.id}
                              onClick={item.action}
                              onMouseEnter={() => setSelected(globalIdx)}
                              className={cn(
                                'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-fast',
                                isSelected ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/50'
                              )}
                            >
                              <item.icon className="size-4 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  <HighlightMatch text={item.label} query={input} />
                                </p>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                                )}
                              </div>
                              <ArrowRight className={cn('size-3.5 shrink-0 transition-opacity', isSelected ? 'opacity-100' : 'opacity-0')} />
                            </button>
                          )
                        })}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[10px] text-muted-foreground/60">
                <span><kbd className="px-1 py-0.5 rounded border border-border bg-muted text-muted-foreground">↑↓</kbd> navigate</span>
                <span><kbd className="px-1 py-0.5 rounded border border-border bg-muted text-muted-foreground">↵</kbd> select</span>
                <span><kbd className="px-1 py-0.5 rounded border border-border bg-muted text-muted-foreground">esc</kbd> close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
