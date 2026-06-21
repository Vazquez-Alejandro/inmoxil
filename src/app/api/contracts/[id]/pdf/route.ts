import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAuth } from '@/lib/api-auth'
import { getContract } from '@/lib/contracts/db'
import { generateContractPdf, generateContractPreview } from '@/lib/contracts/generator'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contract = await getContract(params.id)
    if (!contract) return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 })

    const { error } = await requireWorkspaceAuth(contract.workspaceId)
    if (error) return error

    const { searchParams } = new URL(request.url)
    const preview = searchParams.get('preview') === 'true'

    if (preview) {
      const html = await generateContractPreview(contract)
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    const pdf = await generateContractPdf(contract)
    const filename = `${contract.number.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdf.length.toString(),
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}