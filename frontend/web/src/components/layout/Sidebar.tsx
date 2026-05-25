import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '@/assets/logo.png'
import logoText from '@/assets/logo_text.png'
import { useSavedJobs } from '@/hooks/useQueries'
import {
  Briefcase, LayoutDashboard, Building2, Bookmark, FileText,
  Settings, ChevronLeft, ChevronRight, Sparkles, Bell, Users,
  BarChart3, PlusCircle, Shield, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { sidebarVariants } from '@/lib/motion'
import { useUIStore } from '@/store/ui-store'
import { useAuth } from '@/components/auth/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'

const CANDIDATE_NAV = [
  { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { label: 'Browse Jobs', href: '/app/jobs', icon: Briefcase },
  { label: 'Companies', href: '/app/companies', icon: Building2 },
  { label: 'Saved Jobs', href: '/app/saved', icon: Bookmark },
  { label: 'Applications', href: '/app/applications', icon: FileText },
  { label: 'AI Matches', href: '/app/ai-matches', icon: Sparkles, badge: 'New' },
]

const RECRUITER_NAV = [
  { label: 'Overview', href: '/app/recruiter', icon: LayoutDashboard },
  { label: 'Post a Job', href: '/app/recruiter/post', icon: PlusCircle },
  { label: 'Applicants', href: '/app/recruiter/applicants', icon: Users },
  { label: 'Analytics', href: '/app/recruiter/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/app/recruiter/settings', icon: Settings },
]

interface NavItemProps {
  href: string
  icon: React.ElementType
  label: string
  badge?: string
  collapsed: boolean
  onClick?: () => void
}

const NavItem = React.memo(function NavItem({ href, icon: Icon, label, badge, collapsed, onClick }: NavItemProps) {
  return (
    <NavLink
      to={href}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium',
          'transition-colors duration-fast select-none z-10',
          isActive
            ? 'bg-accent text-foreground'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="sidebar-active"
              className="absolute inset-0 rounded-lg bg-accent"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative shrink-0">
            <Icon className="size-4" />
          </span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="relative overflow-hidden whitespace-nowrap flex-1"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
          {badge && !collapsed && (
            <Badge variant="premium" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
              {badge}
            </Badge>
          )}
          {/* Tooltip when collapsed */}
          {collapsed && (
            <div className="absolute left-full ml-2 hidden group-hover:flex items-center whitespace-nowrap">
              <div className="bg-popover border border-border text-popover-foreground text-xs font-medium px-2 py-1 rounded-md shadow-lg">
                {label}
                {badge && <span className="ml-1.5 text-brand-400">{badge}</span>}
              </div>
            </div>
          )}
        </>
      )}
    </NavLink>
  )
})

export function Sidebar({ role: initialRole = 'candidate' }: { role?: 'candidate' | 'recruiter' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { canAccessAdmin } = usePermissions()
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore()

  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  // Click outside to close profile menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileMenuOpen])

  const handleLogout = async () => {
    setProfileMenuOpen(false)
    try {
      await logout()
      navigate('/')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const activeRole = user?.role || initialRole

  const { data: savedJobRelations = [] } = useSavedJobs(activeRole === 'candidate')

  // Stable array identity — recomputes when role, admin access, or saved jobs count changes
  const nav = useMemo(() => {
    let base = activeRole === 'candidate' ? CANDIDATE_NAV : RECRUITER_NAV
    
    // Map dynamic badge values
    if (activeRole === 'candidate') {
      base = base.map(item => {
        if (item.label === 'Saved Jobs') {
          return { 
            ...item, 
            badge: savedJobRelations.length > 0 ? String(savedJobRelations.length) : undefined 
          }
        }
        return item
      })
    }
    
    if (canAccessAdmin) {
      return [...base, { label: 'Admin Logs', href: '/app/admin', icon: Shield }]
    }
    return base
  }, [activeRole, canAccessAdmin, savedJobRelations])

  const handleItemClick = useCallback(() => {
    setMobileSidebarOpen(false)
  }, [setMobileSidebarOpen])

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={sidebarCollapsed ? 'collapsed' : 'expanded'}
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col bg-surface-elevated border-r border-border',
        'overflow-hidden shadow-sidebar transition-transform duration-slow',
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}
      style={{ width: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border px-3 shrink-0">
        <Link to="/" className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity" aria-label="HireFlow home" onClick={handleItemClick}>
          <img src={logo} className="size-8 object-contain shrink-0 drop-shadow-glow" alt="HireFlow logo" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                src={logoText}
                className="h-4 object-contain shrink-0 whitespace-nowrap"
                alt="HireFlow text"
              />
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-0.5 scrollbar-none"
        aria-label={activeRole === 'candidate' ? 'Candidate navigation' : 'Recruiter navigation'}
      >
        {nav.map((item) => (
          <NavItem key={item.href} {...item} collapsed={sidebarCollapsed} onClick={handleItemClick} />
        ))}
      </nav>

      {/* Footer: User + collapse */}
      <div className="border-t border-border p-2 space-y-1 shrink-0">
        <NavItem href="/app/settings" icon={Settings} label="Settings" collapsed={sidebarCollapsed} onClick={handleItemClick} />
        
        {/* Profile with dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 w-full rounded-lg transition-colors cursor-pointer',
              profileMenuOpen ? 'bg-accent' : 'hover:bg-accent/50',
              sidebarCollapsed && 'justify-center'
            )}
            aria-label="Profile menu"
          >
            <Avatar
              src={user?.avatar || undefined}
              name={user?.name || 'Guest User'}
              size="sm"
              className="shrink-0 ring-1 ring-border"
            />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="text-xs font-medium text-foreground truncate">{user?.name || 'Guest User'}</p>
                  <p className="text-[10px] text-muted-foreground truncate capitalize">{activeRole}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {profileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className={cn(
                  'absolute z-50 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden',
                  sidebarCollapsed
                    ? 'left-full ml-2 bottom-0 w-56'
                    : 'bottom-full mb-2 left-0 right-0 w-auto'
                )}
              >
                {/* User info header */}
                <div className="p-3 border-b border-border/80">
                  <div className="flex items-center gap-2.5">
                    <Avatar src={user?.avatar || undefined} name={user?.name || 'Guest User'} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{user?.name || 'Guest User'}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{user?.email || 'No email'}</p>
                    </div>
                  </div>
                  {user?.role && (
                    <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                      {user.role}
                    </span>
                  )}
                </div>

                {/* Logout */}
                <div className="p-1.5">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
                  >
                    <LogOut className="size-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleSidebar}
          className="w-full justify-center text-muted-foreground hover:text-foreground hidden md:flex"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </div>
    </motion.aside>
  )
}
