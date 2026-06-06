import { neon } from '@neondatabase/serverless'

let _sql: any = null

export function getDb() {
  if (!_sql) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('Missing DATABASE_URL')
    _sql = neon(url)
  }
  return _sql
}

export async function query(text: string, params?: any[]) {
  const sql = getDb()
  const result = await sql.query(text, params || [])
  return result.rows
}

export async function queryOne(text: string, params?: any[]) {
  const rows = await query(text, params)
  return rows[0] || null
}

export async function insertOne(table: string, data: Record<string, any>) {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const placeholders = keys.map((_, i) => `$${i + 1}`)
  const text = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`
  return queryOne(text, values)
}

export async function updateOne(table: string, data: Record<string, any>, where: string, whereParams: any[]) {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const setClauses = keys.map((k, i) => `${k}=$${i + 1}`)
  const params = [...values, ...whereParams]
  const text = `UPDATE ${table} SET ${setClauses.join(',')} WHERE ${where} RETURNING *`
  return queryOne(text, params)
}
