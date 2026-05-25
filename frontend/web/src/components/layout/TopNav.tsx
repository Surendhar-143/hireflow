import React from 'react'
import { Link } from 'react-router-dom'
import { Search, Bell, Sun, Moon, Command, Sparkles, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { useUIStore } from '@/store/ui-store'
import { useAuth } from '@/components/auth/AuthContext'

export function TopNav() {
  const {
    theme,
    toggleTheme,
    setCommandMenuOpen,
    setCopilotOpen,
    sidebarCollapsed,
    toggleMobileSidebar,
  } = useUIStore()
  const { user } = useAuth()

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
        'fixed top-0 right-0 z-20 h-14 flex items-center gap-3 px-4 border-b border-border',
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
        <Avatar src={user?.avatar || undefined} name={fullName} size="sm" />
        <span className="hidden lg:block text-sm font-medium text-foreground">{displayName}</span>
      </button>
    </header>
  )
}
