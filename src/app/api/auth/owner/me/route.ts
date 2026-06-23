import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('owner_token')?.value
    if (!token) return NextResponse.json({ owner: null })

    const data = JSON.parse(Buffer.from(token, 'base64').toString())
    if (data.type !== 'owner') return NextResponse.json({ owner: null })

    const owner = await queryOne('SELECT id, name, email, phone, workspace_id FROM property_owners WHERE id=$1', [data.id])
    if (!owner) return NextResponse.json({ owner: null })

    return NextResponse.json({ owner: { id: owner.id, name: owner.name, email: owner.email, phone: owner.phone, workspaceId: owner.workspace_id } })
  } catch {
    return NextResponse.json({ owner: null })
  }
}
