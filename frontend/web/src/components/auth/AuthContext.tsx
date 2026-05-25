import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { authApi } from '@/api/auth.api'
import { useQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/react-query'
import type { UserDTO } from '@hireflow/types'

interface AuthContextType {
  user: UserDTO | null
  supabaseUser: any | null
  session: any | null
  isLoading: boolean
  loginWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, name: string, role: 'candidate' | 'recruiter') => Promise<void>
  logout: () => Promise<void>
  sendMagicLink: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Singleton lock outside React lifecycle to prevent StrictMode duplicate firing
let initialHydrationLock: Promise<any> | null = null

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null)
  const [isSessionLoading, setIsSessionLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // 1. Singleton Session Fetch
    if (!initialHydrationLock) {
      initialHydrationLock = supabase.auth.getSession()
    }

    initialHydrationLock.then(({ data: { session: initialSession } }) => {
      if (mounted) {
        setSession(initialSession)
        setSupabaseUser(initialSession?.user ?? null)
        setIsSessionLoading(false)
      }
    })

    // 2. Stable Subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!mounted) return
      
      setSession(currentSession)
      setSupabaseUser(currentSession?.user ?? null)

      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('hf_token')
        localStorage.removeItem('hf_role')
        queryClient.clear() // Clear cache entirely on logout
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (currentSession?.access_token) {
          localStorage.setItem('hf_token', currentSession.access_token)
          // Do NOT invalidate everything; only invalidate the user profile
          queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
      // We don't nullify initialHydrationLock so HMR/StrictMode doesn't refetch the session redundantly
    }
  }, [])

  // 3. Delegate profile fetching to React Query (Built-in deduplication & caching)
  const { data: user = null, isLoading: isProfileLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      if (!session?.access_token) return null
      
      // Ensure token is in localStorage for http client
      localStorage.setItem('hf_token', session.access_token)
      
      try {
        const profile = await authApi.getMe()
        if (profile?.role) {
          localStorage.setItem('hf_role', profile.role)
        }
        return profile
      } catch (err: any) {
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          console.warn('Network error: Could not reach the authentication server.')
        } else {
          console.error('Failed to hydrate local profile database:', err)
        }
        return null
      }
    },
    enabled: !!session?.access_token,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 1,
  })

  const loginWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUpWithEmail = async (email: string, password: string, name: string, role: 'candidate' | 'recruiter') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          default_role: role,
        },
      },
    })
    
    if (error) throw error

    if (data?.session?.access_token) {
      localStorage.setItem('hf_token', data.session.access_token)
      localStorage.setItem('hf_role', role)
      try {
        await authApi.onboard({ role, name })
      } catch (err) {
        console.error('Failed auto-onboarding seed step on signup:', err)
      }
    }
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const sendMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/app/onboard` },
    })
    if (error) throw error
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        isLoading: isSessionLoading || (!!session && isProfileLoading),
        loginWithEmail,
        signUpWithEmail,
        logout,
        sendMagicLink,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
