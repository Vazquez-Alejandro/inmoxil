'use client'

import { useState, useEffect, createContext, useContext, type ReactNode } from 'react'
import { useAuth } from './auth'

interface Workspace {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  plan: 'starter' | 'pro' | 'enterprise'
  credits_remaining: number
  credits_used: number
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  public_catalog_enabled?: boolean
  pub_catalog_slug?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  contact_address?: string | null
  social_instagram?: string | null
  social_facebook?: string | null
  social_twitter?: string | null
  social_linkedin?: string | null
  whatsapp_number?: string | null
  timezone?: string | null
}

interface WorkspaceContextType {
  workspace: Workspace | null
  loading: boolean
  refresh: () => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspace: null,
  loading: true,
  refresh: async () => {},
})

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchWorkspace = async () => {
    if (!user) {
      setWorkspace(null)
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/user/workspace?userId=${user.id}`)
      const data = await res.json()
      if (data.workspace) {
        setWorkspace(data.workspace)
      }
    } catch (err) {
      console.error('Error fetching workspace:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkspace()
  }, [user])

  return (
    <WorkspaceContext.Provider value={{ workspace, loading, refresh: fetchWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  return useContext(WorkspaceContext)
}
