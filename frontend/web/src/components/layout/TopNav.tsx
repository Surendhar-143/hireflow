import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Bell, Sun, Moon, Command, Sparkles, Menu, Check, LogOut, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { useUIStore } from '@/store/ui-store'
import { useAuth } from '@/components/auth/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

export function TopNav() {
  const {
    theme,
    toggleTheme,
    setCommandMenuOpen,
    setCopilotOpen,
    sidebarCollapsed,
    toggleMobileSidebar,
  } = useUIStore()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: '1', text: 'Your application status for Software Engineer was updated to Interviewing.', time: '2 hours ago', unread: true },
    { id: '2', text: 'New job recommendation matched with 96% score: Frontend Engineer at Linear.', time: '5 hours ago', unread: true },
    { id: '3', text: 'Welcome to HireFlow! Complete your profile to unlock elite semantic AI matches.', time: '1 day ago', unread: false },
  ])
  
  const popoverRef = useRef<HTMLDivElement>(null)

  // Click outside to close notifications dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [notificationsOpen])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const unreadCount = notifications.filter(n => n.unread).length

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })))
  }

  const toggleUnread = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: !n.unread } : n))
  }

  // Derive display name: prefer full name, fall back to email username, then 'User'
  const displayName = user?.name
    ? user.name.split(' ')[0]
    : user?.email
    ? user.email.split('@')[0]
    : 'User'
  const fullName = user?.name || user?.email || 'User'

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-40 h-14 flex items-center gap-3 px-4 border-b border-border',
        'bg-background/80 backdrop-blur-md transition-all duration-slow left-0',
        sidebarCollapsed
          ? 'md:left-[var(--sidebar-collapsed-width)]'
          : 'md:left-[var(--sidebar-width)]'
      )}
    >
      {/* Mobile Sidebar Hamburger Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobileSidebar}
        className="md:hidden text-muted-foreground hover:text-foreground shrink-0"
        aria-label="Toggle Navigation Sidebar"
      >
        <Menu className="size-5" />
      </Button>

      {/* Spacer pushes controls to the right */}
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
      <div className="relative" ref={popoverRef}>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative text-muted-foreground hover:text-foreground transition-colors",
            notificationsOpen && "text-foreground bg-accent"
          )}
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-brand-500 ring-1 ring-background animate-pulse" />
          )}
        </Button>

        <AnimatePresence>
          {notificationsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 top-12 mt-1 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-2xl p-4 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-border/80 pb-2 mb-3">
                <h3 className="text-[10px] font-extrabold text-foreground uppercase tracking-wider">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => toggleUnread(n.id)}
                    className={cn(
                      "group flex gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors duration-fast border",
                      n.unread 
                        ? "bg-brand-500/[0.03] hover:bg-brand-500/[0.06] border-brand-500/10" 
                        : "hover:bg-accent/40 border-transparent"
                    )}
                  >
                    <div className="mt-1 shrink-0">
                      <div className={cn(
                        "size-1.5 rounded-full mt-1.5",
                        n.unread ? "bg-brand-500" : "bg-muted-foreground/30"
                      )} />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className={cn(
                        "text-xs leading-snug",
                        n.unread ? "text-foreground font-medium" : "text-muted-foreground"
                      )}>
                        {n.text}
                      </p>
                      <span className="text-[10px] text-muted-foreground/50 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/80 pt-2 mt-3 text-center">
                <Link
                  to="/app/dashboard"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
                >
                  View All Activity
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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

      {/* User Profile and Logout */}
      <div className="flex items-center gap-2 bg-accent/40 rounded-full py-1 px-2 border border-border/50">
        <div className="flex items-center gap-2" title={fullName}>
          <Avatar src={user?.avatar || undefined} name={fullName} size="sm" />
        </div>
        <div className="w-px h-4 bg-border/80 mx-0.5" />
        <button
          onClick={handleLogout}
          className="text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center p-1"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  )
}
