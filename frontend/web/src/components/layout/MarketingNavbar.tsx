import React from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { useAuth } from '@/components/auth/AuthContext'
import logo from '@/assets/logo.png'
import logoText from '@/assets/logo_text.png'

export function MarketingNavbar() {
  const { user } = useAuth()

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
          <Link to="/app/dashboard" className={cn(buttonVariants({ variant: 'premium', size: 'sm' }))}>
            Go to Dashboard
          </Link>
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
