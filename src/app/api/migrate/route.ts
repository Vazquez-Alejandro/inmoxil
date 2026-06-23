import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src/migrations/012_features.sql')
    const sql = fs.readFileSync(filePath, 'utf8')
    const statements = sql
      .split('\n')
      .filter(l => !l.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
    for (const stmt of statements) {
      await query(stmt)
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
