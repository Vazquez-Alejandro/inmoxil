import { query, queryOne } from '@/lib/db'

export interface MatchingResult {
  leadId: string
  leadName: string
  properties: {
    id: string
    title: string
    address: string
    city: string
    price: number
    currency: string
    operationType: string
    propertyType: string
    bedrooms: number
    score: number
    matchReasons: string[]
  }[]
}

export async function matchLeadToProperties(workspaceId: string, leadId: string): Promise<MatchingResult | null> {
  const leadResult = await queryOne(
    `SELECT pl.*, p.title as property_title FROM pipeline_leads pl
     LEFT JOIN properties p ON p.id = pl.property_id WHERE pl.id=$1`,
    [leadId]
  )
  if (!leadResult) return null

  const properties = await query(
    `SELECT id, title, address, city, price, currency, operation_type, property_type, bedrooms, description
     FROM properties WHERE workspace_id=$1 AND status='active'`,
    [workspaceId]
  )

  const lead = {
    name: leadResult.full_name,
    budgetMin: leadResult.budget_min,
    budgetMax: leadResult.budget_max,
    currency: leadResult.currency || 'ARS',
    requirements: (leadResult.requirements || '').toLowerCase(),
  }

  const matches: MatchingResult['properties'] = []
  for (const p of (properties || [])) {
    const score: number[] = []
    const reasons: string[] = []

    const pPrice = parseFloat(p.price) || 0
    const pCurrency = p.currency || 'ARS'

    if (lead.budgetMin && lead.budgetMax && pPrice > 0) {
      const converted = pCurrency === lead.currency ? pPrice : pCurrency === 'USD' ? pPrice * 1200 : pPrice / 1200
      if (converted >= lead.budgetMin && converted <= lead.budgetMax) {
        score.push(30)
        reasons.push('Dentro del presupuesto')
      } else if (converted >= lead.budgetMin * 0.8 && converted <= lead.budgetMax * 1.2) {
        score.push(15)
        reasons.push('Cerca del presupuesto')
      }
    }

    const req = lead.requirements
    const desc = ((p.description || '') + ' ' + (p.title || '')).toLowerCase()
    if (req && desc) {
      const keywords = req.split(/[\s,]+/).filter(Boolean)
      const matches = keywords.filter((k: string) => desc.includes(k))
      if (matches.length > 0) {
        score.push(Math.min(matches.length * 10, 40))
        reasons.push(`Coincide: ${matches.slice(0, 3).join(', ')}`)
      }
    }

    if (p.bedrooms && req) {
      const beds = parseInt(p.bedrooms) || 0
      const bedMatch = req.match(/(\d+)\s*ambientes?|(\d+)\s*dormitorios?/)
      if (bedMatch) {
        const wanted = parseInt(bedMatch[1] || bedMatch[2]) || 0
        if (wanted > 0 && beds >= wanted) {
          score.push(20)
          reasons.push(`${beds} ambientes`)
        }
      }
    }

    const opType = (p.operation_type || '').toLowerCase()
    if (req && opType === 'alquiler' && req.includes('alquiler')) {
      score.push(20)
      reasons.push('Coincide tipo: alquiler')
    } else if (req && (opType === 'venta' && req.includes('venta') || req.includes('compr'))) {
      score.push(20)
      reasons.push('Coincide tipo: venta')
    }

    const pType = (p.property_type || '').toLowerCase()
    if (req && pType && req.includes(pType)) {
      score.push(15)
      reasons.push(`Coincide tipo: ${pType}`)
    }

    const totalScore = score.reduce((a, b) => a + b, 0)
    if (totalScore > 0) {
      matches.push({
        id: p.id, title: p.title || 'Sin título', address: p.address || '', city: p.city || '',
        price: pPrice, currency: pCurrency, operationType: p.operation_type,
        propertyType: p.property_type, bedrooms: parseInt(p.bedrooms) || 0,
        score: totalScore, matchReasons: reasons,
      })
    }
  }

  matches.sort((a, b) => b.score - a.score)

  return { leadId, leadName: lead.name, properties: matches.slice(0, 10) }
}