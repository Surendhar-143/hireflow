import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { buttonVariants, Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/AuthContext'
import logo from '@/assets/logo.png'
import logoText from '@/assets/logo_text.png'
import { Avatar } from '@/components/ui/avatar'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, User, Settings } from 'lucide-react'

export function MarketingNavbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [profileOpen])

  const handleLogout = async () => {
    setProfileOpen(false)
    try {
      await logout()
      navigate('/')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const fullName = user?.name || user?.email || 'User'
  const displayName = user?.name ? user.name.split(' ')[0] : (user?.email ? user.email.split('@')[0] : 'User')

  return (
    <header className="relative z-20 flex items-center justify-between px-6 md:px-12 h-16 border-b border-border/50 backdrop-blur-md bg-background/70">
      <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity" aria-label="HireFlow home">
        <img src={logo} className="size-8 object-contain shrink-0" alt="HireFlow logo" />
        <img src={logoText} className="h-5 object-contain shrink-0" alt="HireFlow text logo" />
      </Link>

      <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
        <Link to="/jobs" className="hover:text-foreground transition-colors">Browse Jobs</Link>
        <Link to="/companies" className="hover:text-foreground transition-colors">Companies</Link>
        <Link to="/app/recruiter" className="hover:text-foreground transition-colors">For Recruiters</Link>
      </nav>

      <div className="flex items-center gap-2">
        {user ? (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors duration-fast border",
                profileOpen
                  ? "bg-accent border-border"
                  : "bg-transparent border-transparent hover:bg-accent hover:border-border"
              )}
              aria-label="User menu"
            >
              <Avatar src={user?.avatar || undefined} name={fullName} size="sm" className="ring-1 ring-border" />
              <span className="hidden sm:block text-sm font-semibold text-foreground">{displayName}</span>
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-12 mt-1 z-50 w-64 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
                >
                  {/* User info header */}
                  <div className="p-4 border-b border-border/80">
                    <div className="flex items-center gap-3">
                      <Avatar src={user?.avatar || undefined} name={fullName} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{fullName}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{user?.email || 'No email'}</p>
                      </div>
                    </div>
                    {user?.role && (
                      <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        {user.role}
                      </span>
                    )}
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5">
                    <Link
                      to="/app/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors font-medium"
                    >
                      <User className="size-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/app/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors font-medium"
                    >
                      <Settings className="size-4" />
                      Settings
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="p-1.5 border-t border-border/80">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors w-full text-left font-medium"
                    >
                      <LogOut className="size-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <>
            <Link to="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>Sign In</Link>
            <Link to="/signup" className={cn(buttonVariants({ variant: 'premium', size: 'sm' }))}>Get Started</Link>
          </>
        )}
      </div>
    </header>
  )
}
