'use client'

import { useState, useEffect, createContext, useContext, type ReactNode } from 'react'
import { getSupabase } from './supabase-browser'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, companyName: string, fullName: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => ({}),
  signIn: async () => ({}),
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const supabase = getSupabase()
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    } catch {
      setLoading(false)
    }
  }, [])

  const signUp = async (email: string, password: string, companyName: string, fullName: string) => {
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { company_name: companyName, full_name: fullName },
        },
      })

      if (error) return { error: error.message }

      if (data.user) {
        const { error: wsError } = await (supabase.from('workspaces') as any).insert({
          name: companyName,
          slug: companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        })

        if (!wsError && data.user) {
          const { data: ws } = await (supabase.from('workspaces') as any)
            .select('id')
            .eq('slug', companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
            .single()

          if (ws) {
            await (supabase.from('users') as any).insert({
              id: data.user.id,
              email: data.user.email!,
              full_name: fullName,
              workspace_id: ws.id,
              role: 'owner',
            })
          }
        }
      }

      return {}
    } catch (err: any) {
      return { error: err.message }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const supabase = getSupabase()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message }
      return {}
    } catch (err: any) {
      return { error: err.message }
    }
  }

  const signOut = async () => {
    try {
      const supabase = getSupabase()
      await supabase.auth.signOut()
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
