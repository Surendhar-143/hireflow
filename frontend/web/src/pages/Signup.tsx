import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Mail, Lock, User, CheckCircle2, RefreshCw, AlertCircle, Briefcase, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/AuthContext'
import { useSEO } from '@/hooks/useSEO'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function Signup() {
  const navigate = useNavigate()
  const { signUpWithEmail } = useAuth()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useSEO({
    title: 'Signup — Join HireFlow Talent discovery',
    description: 'Create your secure account to unlock semantic matches.',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    if (!email) {
      toast.error('Email is required')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    setError(null)
    const toastId = toast.loading('Creating your account & profiles...')

    try {
      await signUpWithEmail(email.trim(), password, name.trim(), role)
      toast.success('Registration successful! Please check your email to verify.', { id: toastId })
      navigate('/app/dashboard')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Signup failed. Please try again.')
      toast.error(err.message || 'Failed to register account.', { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-2 mb-8">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="size-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <Sparkles className="size-5 animate-pulse" />
          </div>
          <span className="font-black text-xl text-foreground tracking-tight">HireFlow</span>
        </Link>
        <h2 className="text-2xl font-black tracking-tight text-foreground mt-4">
          Create your account
        </h2>
        <p className="text-xs text-muted-foreground">
          Step into a premium, AI-native talent discovery ecosystem
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute inset-0 rounded-3xl pointer-events-none ring-1 ring-brand-500/10 bg-brand-500/[0.01]" />

          {error && (
            <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl border border-destructive/20 bg-destructive/5 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Select Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                I want to join as a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  disabled={isLoading}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-fast cursor-pointer',
                    role === 'candidate'
                      ? 'border-brand-500/40 bg-brand-500/10 text-brand-400 font-bold'
                      : 'border-border bg-accent/20 text-muted-foreground hover:border-ring/30 hover:text-foreground'
                  )}
                >
                  <GraduationCap className="size-5 shrink-0" />
                  <span className="text-xs">Candidate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('recruiter')}
                  disabled={isLoading}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-fast cursor-pointer',
                    role === 'recruiter'
                      ? 'border-brand-500/40 bg-brand-500/10 text-brand-400 font-bold'
                      : 'border-border bg-accent/20 text-muted-foreground hover:border-ring/30 hover:text-foreground'
                  )}
                >
                  <Briefcase className="size-5 shrink-0" />
                  <span className="text-xs">Recruiter</span>
                </button>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-muted-foreground">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-accent/40 border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-brand-500/40 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-accent/40 border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-brand-500/40 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-accent/40 border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-brand-500/40 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-brand-500/10 hover:opacity-95 transition-opacity"
            >
              {isLoading ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : (
                <>
                  Create Account <CheckCircle2 className="size-3.5" />
                </>
              )}
            </Button>
          </form>

          {/* Login redirection */}
          <div className="mt-6 text-center text-xs">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="font-bold text-brand-400 hover:text-brand-300 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
