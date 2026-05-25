import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Mail, Lock, LogIn, ArrowRight, Zap, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react'
import logo from '@/assets/logo.png'
import logoText from '@/assets/logo_text.png'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/AuthContext'
import { useSEO } from '@/hooks/useSEO'
import { toast } from 'sonner'

export default function Login() {
  const navigate = useNavigate()
  const { loginWithEmail, sendMagicLink, user, isLoading: isAuthLoading } = useAuth()

  React.useEffect(() => {
    if (!isAuthLoading && user) {
      navigate('/app/dashboard')
    }
  }, [user, isAuthLoading, navigate])
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'password' | 'magic' | 'reset'>('password')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useSEO({
    title: 'Login — Welcome Back to HireFlow',
    description: 'Access your premium talent discovery workspace.',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Email is required')
      return
    }

    setIsLoading(true)
    setError(null)
    const toastId = toast.loading(
      mode === 'password'
        ? 'Signing you in...'
        : mode === 'magic'
        ? 'Sending magic link...'
        : 'Sending reset instructions...'
    )

    try {
      if (mode === 'password') {
        if (!password) {
          throw new Error('Password is required')
        }
        await loginWithEmail(email.trim(), password)
        toast.success('Successfully logged in!', { id: toastId })
        // After successful hydration, routing auto-handles app redirection
        navigate('/app/dashboard')
      } else if (mode === 'magic') {
        await sendMagicLink(email.trim())
        toast.success('Magic link sent successfully! Check your inbox.', { id: toastId })
      } else if (mode === 'reset') {
        // Send recovery flow via OTP
        await sendMagicLink(email.trim())
        toast.success('Password recovery link sent successfully!', { id: toastId })
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Authentication failed. Please check credentials.')
      toast.error(err.message || 'Authentication action failed.', { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-2 mb-8">
        <Link to="/" className="inline-flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <img src={logo} className="size-9 object-contain shrink-0 drop-shadow-glow" alt="HireFlow logo" />
          <img src={logoText} className="h-5 object-contain shrink-0" alt="HireFlow text" />
        </Link>
        <h1 className="text-2xl font-black tracking-tight text-foreground mt-4">
          {mode === 'password'
            ? 'Sign in to your account'
            : mode === 'magic'
            ? 'Access via Magic Link'
            : 'Reset your password'}
        </h1>
        <p className="text-xs text-muted-foreground">
          {mode === 'password'
            ? 'Secure, passwordless and email logins'
            : 'Enter email to receive an instant authentication link'}
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

            {mode === 'password' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset')
                      setError(null)
                    }}
                    className="text-[10px] font-bold text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-accent/40 border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-brand-500/40 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-brand-500/10 hover:opacity-95 transition-opacity"
            >
              {isLoading ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : mode === 'password' ? (
                <>
                  Sign In <LogIn className="size-3.5" />
                </>
              ) : mode === 'magic' ? (
                <>
                  Send Magic Link <Zap className="size-3.5" />
                </>
              ) : (
                <>
                  Send Reset Link <ArrowRight className="size-3.5" />
                </>
              )}
            </Button>
          </form>

          {/* Separation line */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold">
              <span className="bg-card px-3 text-muted-foreground">Or access with</span>
            </div>
          </div>

          {/* Toggle Modes button */}
          <div className="flex gap-2">
            {mode === 'password' ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-[10px] font-bold rounded-xl h-8 text-muted-foreground"
                onClick={() => {
                  setMode('magic')
                  setError(null)
                }}
                disabled={isLoading}
              >
                <Zap className="size-3 mr-1 text-brand-400" /> Use Magic Link
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-[10px] font-bold rounded-xl h-8 text-muted-foreground"
                onClick={() => {
                  setMode('password')
                  setError(null)
                }}
                disabled={isLoading}
              >
                <ArrowLeft className="size-3 mr-1 text-muted-foreground" /> Back to Password
              </Button>
            )}
          </div>

          {/* Sign up link */}
          <div className="mt-6 text-center text-xs">
            <span className="text-muted-foreground">New to HireFlow? </span>
            <Link to="/signup" className="font-bold text-brand-400 hover:text-brand-300 transition-colors">
              Create an account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
