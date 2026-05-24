import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { authApi } from '@/api/auth.api'
import { useQueryClient } from '@tanstack/react-query'
import type { UserDTO } from '@hireflow/types'
import { toast } from 'sonner'

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null)
  const [user, setUser] = useState<UserDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const queryClient = useQueryClient()
  
  const lastTokenRef = useRef<string | null>(null)
  const activeHydrationRef = useRef<Promise<void> | null>(null)

  // Hydrate user profile from backend database (with request deduplication)
  const hydrateProfile = async (token: string) => {
    // If we already have a user and the token hasn't changed, skip duplicate request
    if (lastTokenRef.current === token && user) {
      return
    }
    // If there is an active hydration for this exact token in progress, return that promise to deduplicate
    if (lastTokenRef.current === token && activeHydrationRef.current) {
      return activeHydrationRef.current
    }

    lastTokenRef.current = token

    const hydrationPromise = (async () => {
      try {
        localStorage.setItem('hf_token', token)
        const profile = await authApi.getMe()
        setUser(profile)
        if (profile.role) {
          localStorage.setItem('hf_role', profile.role)
        }
      } catch (err: any) {
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          console.warn('Network error: Could not reach the authentication server. Please check CORS settings and server status.')
        } else {
          console.error('Failed to hydrate local profile database:', err)
        }
        setUser(null)
        lastTokenRef.current = null
      } finally {
        activeHydrationRef.current = null
      }
    })()

    activeHydrationRef.current = hydrationPromise
    return hydrationPromise
  }

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setSupabaseUser(session?.user ?? null)
      if (session?.access_token) {
        hydrateProfile(session.access_token).then(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession)
      setSupabaseUser(currentSession?.user ?? null)

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (currentSession?.access_token) {
          setIsLoading(true)
          await hydrateProfile(currentSession.access_token)
          // Invalidate queries so that dashboard/jobs reload with proper role context
          queryClient.invalidateQueries()
          setIsLoading(false)
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('hf_token')
        localStorage.removeItem('hf_role')
        setUser(null)
        queryClient.clear()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient])

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

    // Perform an immediate onboarding seeding if signup succeeds
    if (data?.session?.access_token) {
      localStorage.setItem('hf_token', data.session.access_token)
      localStorage.setItem('hf_role', role)
      try {
        await authApi.onboard({
          role,
          name,
        })
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
      options: {
        emailRedirectTo: `${window.location.origin}/app/onboard`,
      },
    })
    if (error) throw error
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        isLoading,
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
