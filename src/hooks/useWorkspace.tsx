'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Workspace = Database['public']['Tables']['workspaces']['Row']

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
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchWorkspace = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setWorkspace(null)
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('workspace_id')
        .eq('id', user.id)
        .single()

      if (!userData) {
        setWorkspace(null)
        return
      }

      const { data: ws } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', userData.workspace_id)
        .single()

      setWorkspace(ws)
    } catch (error) {
      console.error('Error fetching workspace:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkspace()
  }, [])

  return (
    <WorkspaceContext.Provider value={{ workspace, loading, refresh: fetchWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  return useContext(WorkspaceContext)
}
