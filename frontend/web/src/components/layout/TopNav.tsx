import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Search, Bell, Sun, Moon, Command, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useUIStore } from '@/store/ui-store'

const BREADCRUMB_MAP: Record<string, string> = {
  app: 'Home',
  jobs: 'Browse Jobs',
  dashboard: 'Dashboard',
  companies: 'Companies',
  saved: 'Saved Jobs',
  applications: 'Applications',
  recruiter: 'Recruiter',
  'ai-matches': 'AI Matches',
  settings: 'Settings',
}

function Breadcrumbs() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)

  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1 text-sm">
      {segments.map((seg, i) => {
        const label = BREADCRUMB_MAP[seg] ?? seg
        const isLast = i === segments.length - 1
        const href = '/' + segments.slice(0, i + 1).join('/')
        return (
          <React.Fragment key={seg}>
            {i > 0 && <span className="text-muted-foreground/50 select-none">/</span>}
            {isLast ? (
              <span className="text-foreground font-medium">{label}</span>
            ) : (
              <Link to={href} className="text-muted-foreground hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export function TopNav() {
  const { theme, toggleTheme, setCommandMenuOpen, setCopilotOpen } = useUIStore()

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-20 h-14 flex items-center gap-3 px-4 border-b border-border',
        'bg-background/80 backdrop-blur-md',
        'left-[var(--sidebar-width)]'
      )}
      style={{ '--sidebar-width': 'var(--sidebar-width)' } as React.CSSProperties}
    >
      {/* Breadcrumbs */}
      <Breadcrumbs />

      <div className="flex-1" />

      {/* Quick search */}
      <button
        onClick={() => setCommandMenuOpen(true)}
        className={cn(
          'hidden md:flex items-center gap-2 h-8 px-3 rounded-md border border-input bg-background',
          'text-sm text-muted-foreground hover:text-foreground hover:border-ring',
          'transition-colors duration-fast cursor-pointer select-none w-48'
        )}
        aria-label="Open command menu"
      >
        <Search className="size-3.5 shrink-0" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="hidden lg:flex items-center gap-0.5 text-[10px] text-muted-foreground/60">
          <Command className="size-2.5" />
          <span>K</span>
        </kbd>
      </button>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground" aria-label="Notifications">
        <Bell className="size-4" />
        <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-brand-500 ring-1 ring-background" />
      </Button>

      {/* Copilot */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCopilotOpen(true)}
        className="hidden sm:flex items-center gap-1.5"
      >
        <Sparkles className="size-3.5 text-brand-400" />
        Copilot
      </Button>

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>

      {/* User */}
      <button className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-accent transition-colors" aria-label="User menu">
        <Avatar name="Alex Johnson" size="sm" />
        <span className="hidden lg:block text-sm font-medium text-foreground">Alex</span>
      </button>
    </header>
  )
}
