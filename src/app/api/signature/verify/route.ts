import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 400 })

    const sig = await queryOne(
      `SELECT sr.*, c.title as contract_title, c.number as contract_number,
              c.lessor_name, c.lessor_document_type, c.lessor_document_number,
              c.lessee_name, c.lessee_document_type, c.lessee_document_number,
              c.amount, c.currency, c.property_address,
              w.name as workspace_name
       FROM signature_requests sr
       JOIN contracts c ON c.id = sr.contract_id
       JOIN workspaces w ON w.id = sr.workspace_id
       WHERE sr.token=$1`,
      [token]
    )
    if (!sig) return NextResponse.json({ error: 'Solicitud de firma no encontrada' }, { status: 404 })
    if (sig.status === 'signed') return NextResponse.json({ error: 'Ya fue firmado' }, { status: 400 })
    if (sig.status === 'expired') return NextResponse.json({ error: 'El enlace ha expirado' }, { status: 400 })
    if (sig.status === 'declined') return NextResponse.json({ error: 'La solicitud fue rechazada' }, { status: 400 })

    return NextResponse.json({ signature: sig })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, action } = body
    if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 400 })

    const sig = await queryOne('SELECT * FROM signature_requests WHERE token=$1', [token])
    if (!sig) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
    if (sig.status !== 'pending' && sig.status !== 'sent') {
      return NextResponse.json({ error: `Estado inválido: ${sig.status}` }, { status: 400 })
    }

    if (action === 'sign') {
      await queryOne(
        `UPDATE signature_requests SET status='signed', signed_at=NOW() WHERE id=$1 RETURNING *`,
        [sig.id]
      )
      return NextResponse.json({ success: true, message: 'Documento firmado exitosamente' })
    } else if (action === 'decline') {
      await queryOne(
        `UPDATE signature_requests SET status='declined' WHERE id=$1`,
        [sig.id]
      )
      return NextResponse.json({ success: true, message: 'Solicitud rechazada' })
    }

    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
