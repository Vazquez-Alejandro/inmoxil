import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export async function GET() {
  return NextResponse.json({ error: 'Endpoint deshabilitado' }, { status: 403 })
}
