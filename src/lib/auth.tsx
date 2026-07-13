'use client'

import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from 'react'
import { SessionProvider, signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from 'next-auth/react'

interface AuthUser {
  id: string
  email: string
  name: string | null
  role: string
  workspace_id: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  signUp: (email: string, password: string, companyName: string, fullName: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({}),
  signOut: async () => {},
  signUp: async () => ({}),
})

function AuthInner({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
      return
    }
    if (session?.user) {
      setUser({
        id: (session.user as any).id,
        email: session.user.email || '',
        name: session.user.name ?? null,
        role: (session.user as any).role || 'user',
        workspace_id: (session.user as any).workspace_id || '',
      })
    } else {
      setUser(null)
    }
    setLoading(false)
  }, [session, status])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const res = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (res?.error) {
        const msg = res.error === 'CredentialsSignin'
          ? 'Email o contraseña incorrectos'
          : res.error
        return { error: msg }
      }
      return {}
    } catch (err: any) {
      return { error: err.message || 'Sign in failed' }
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, companyName: string, fullName: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: fullName, companyName }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { error: data.error || 'Registration failed' }
      }
      await nextAuthSignIn('credentials', {
        email,
        password,
        callbackUrl: '/onboarding',
      })
      return {}
    } catch (err: any) {
      return { error: err.message || 'Registration failed' }
    }
  }, [])

  const signOut = useCallback(async () => {
    await nextAuthSignOut({ redirect: false })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthInner>{children}</AuthInner>
    </SessionProvider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
