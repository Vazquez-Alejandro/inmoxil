import { queryOne, insertOne } from '@/lib/db'

const BCRA_BASE = 'https://api.estadisticasbcra.com'
const INDEC_BASE = 'https://apis.datos.gob.ar/series/api/series'

interface SeriesValue {
  fecha: string
  valor: number
}

interface IPCSeries {
  s_148_3_no_estacional?: SeriesValue[]
  s_148_3_estacional?: SeriesValue[]
}

interface ICLSeries {
  s_259_1?: SeriesValue[]
}

async function fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Inmoxil/1.0' }
    })
    return res
  } finally {
    clearTimeout(id)
  }
}

export async function fetchLatestIPC(): Promise<{ value: number; date: string } | null> {
  try {
    const res = await fetchWithTimeout(`${INDEC_BASE}/?ids=148.3_No_estacional_0_0_26&limit=1&sort=desc`)
    if (!res.ok) return null
    const data = await res.json()
    const series = data?.data?.[0] as SeriesValue[]
    if (!series?.length) return null
    return { value: series[0].valor, date: series[0].fecha }
  } catch {
    return null
  }
}

export async function fetchIPCSeries(months = 24): Promise<SeriesValue[]> {
  try {
    const res = await fetchWithTimeout(`${INDEC_BASE}/?ids=148.3_No_estacional_0_0_26&limit=${months}&sort=desc`)
    if (!res.ok) return []
    const data = await res.json()
    return (data?.data?.[0] as SeriesValue[]) || []
  } catch {
    return []
  }
}

export async function fetchLatestICL(): Promise<{ value: number; date: string } | null> {
  try {
    const res = await fetchWithTimeout(`${BCRA_BASE}/icl`)
    if (!res.ok) return null
    const data = await res.json()
    const latest = data?.[data.length - 1]
    if (!latest) return null
    return { value: latest.v, date: latest.d }
  } catch {
    return null
  }
}

export async function fetchICLSeries(months = 24): Promise<SeriesValue[]> {
  try {
    const res = await fetchWithTimeout(`${BCRA_BASE}/icl`)
    if (!res.ok) return []
    const data = await res.json()
    return data.slice(-months).map((d: any) => ({ fecha: d.d, valor: d.v }))
  } catch {
    return []
  }
}

export async function fetchLatestUVT(): Promise<{ value: number; date: string } | null> {
  try {
    const res = await fetchWithTimeout(`${INDEC_BASE}/?ids=168.1_T_C_0_0_26&limit=1&sort=desc`)
    if (!res.ok) return null
    const data = await res.json()
    const series = data?.data?.[0] as SeriesValue[]
    if (!series?.length) return null
    return { value: series[0].valor, date: series[0].fecha }
  } catch {
    return null
  }
}

export async function saveIndexSnapshot(
  type: 'IPC' | 'ICL' | 'UVT',
  value: number,
  date: string,
  source: 'INDEC' | 'BCRA'
) {
  await insertOne('index_snapshots', {
    type,
    value,
    date,
    source,
    created_at: new Date().toISOString()
  })
}

export async function getLatestSnapshot(type: 'IPC' | 'ICL' | 'UVT') {
  return queryOne(
    'SELECT * FROM index_snapshots WHERE type = $1 ORDER BY date DESC LIMIT 1',
    [type]
  )
}

export async function getIndexHistory(type: 'IPC' | 'ICL' | 'UVT', months = 12) {
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - months)
  return query(
    'SELECT * FROM index_snapshots WHERE type = $1 AND date >= $2 ORDER BY date ASC',
    [type, cutoff.toISOString().split('T')[0]]
  )
}

function query(sql: string, params: any[]) {
  return import('@/lib/db').then(({ query }) => query(sql, params))
}