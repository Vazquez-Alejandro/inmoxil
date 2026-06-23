import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticket = await queryOne(
      `SELECT t.*, p.title as property_title, p.address as property_address
       FROM maintenance_tickets t LEFT JOIN properties p ON p.id = t.property_id WHERE t.id=$1`,
      [params.id]
    )
    if (!ticket) return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 })
    return NextResponse.json({ ticket })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const allowed = ['status', 'assigned_to', 'notes', 'priority', 'description']
    const sets: string[] = []
    const values: any[] = []
    let idx = 1
    for (const field of allowed) {
      if (body[field] !== undefined) {
        sets.push(`${field}=$${idx++}`)
        values.push(body[field])
      }
    }
    if (body.status === 'resuelto' || body.status === 'cerrado') {
      sets.push(`closed_at=$${idx++}`)
      values.push(new Date().toISOString())
    }
    if (sets.length === 0) return NextResponse.json({ error: 'Sin campos' }, { status: 400 })
    sets.push(`updated_at=NOW()`)
    values.push(params.id)
    const updated = await queryOne(
      `UPDATE maintenance_tickets SET ${sets.join(',')} WHERE id=$${idx} RETURNING *`,
      values
    )
    return NextResponse.json({ success: true, ticket: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await query('DELETE FROM maintenance_tickets WHERE id=$1', [params.id])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
