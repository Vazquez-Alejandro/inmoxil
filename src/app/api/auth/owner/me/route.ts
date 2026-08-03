import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { getOwnerFromCookie } from '@/lib/owner-auth'

export async function GET() {
  try {
    const data = getOwnerFromCookie()
    if (!data) return NextResponse.json({ owner: null })

    const owner = await queryOne('SELECT id, name, email, phone, workspace_id FROM property_owners WHERE id=$1', [data.id])
    if (!owner) return NextResponse.json({ owner: null })

    return NextResponse.json({ owner: { id: owner.id, name: owner.name, email: owner.email, phone: owner.phone, workspaceId: owner.workspace_id } })
  } catch {
    return NextResponse.json({ owner: null })
  }
}
