import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await query('DELETE FROM properties WHERE id = $1', [params.id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error' }, { status: 500 })
  }
}
