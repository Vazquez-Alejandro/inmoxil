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
    confidence: 'alta' | 'media' | 'baja'
  }[]
}

function calculateLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []
  for (let i = 0; i <= b.length; i++) matrix[i] = [i]
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

function fuzzyMatch(query: string, text: string, threshold = 0.8): boolean {
  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()
  if (textLower.includes(queryLower)) return true
  const words = queryLower.split(/\s+/)
  for (const word of words) {
    if (word.length < 3) continue
    const textWords = textLower.split(/\s+/)
    for (const tw of textWords) {
      const distance = calculateLevenshteinDistance(word, tw)
      const maxLen = Math.max(word.length, tw.length)
      const similarity = 1 - distance / maxLen
      if (similarity >= threshold) return true
    }
  }
  return false
}

export async function matchLeadToProperties(workspaceId: string, leadId: string): Promise<MatchingResult | null> {
  const leadResult = await queryOne(
    `SELECT pl.*, p.title as property_title FROM pipeline_leads pl
     LEFT JOIN properties p ON p.id = pl.property_id WHERE pl.id=$1`,
    [leadId]
  )
  if (!leadResult) return null

  const properties = await query(
    `SELECT id, title, address, city, price, currency, operation_type, property_type, bedrooms, description, amenities
     FROM properties WHERE workspace_id=$1 AND status='active'`,
    [workspaceId]
  )

  const lead = {
    name: leadResult.full_name,
    budgetMin: leadResult.budget_min,
    budgetMax: leadResult.budget_max,
    currency: leadResult.currency || 'ARS',
    requirements: (leadResult.requirements || '').toLowerCase(),
    source: (leadResult.source || '').toLowerCase(),
    preferredNeighborhoods: (leadResult.preferred_neighborhoods || '').toLowerCase().split(',').map((s: string) => s.trim()),
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
      const matchedKeywords = keywords.filter((k: string) => fuzzyMatch(k, desc))
      if (matchedKeywords.length > 0) {
        score.push(Math.min(matchedKeywords.length * 10, 40))
        reasons.push(`Coincide: ${matchedKeywords.slice(0, 3).join(', ')}`)
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

    if (lead.preferredNeighborhoods.length > 0 && p.city) {
      const pCity = p.city.toLowerCase()
      const pAddr = (p.address || '').toLowerCase()
      const neighborhoodMatch = lead.preferredNeighborhoods.some((n: string) => 
        n && (pCity.includes(n) || pAddr.includes(n))
      )
      if (neighborhoodMatch) {
        score.push(15)
        reasons.push('Barrio preferido')
      }
    }

    if (p.amenities && req) {
      try {
        const amenities = typeof p.amenities === 'string' ? JSON.parse(p.amenities) : p.amenities
        if (Array.isArray(amenities)) {
          const reqWords = req.split(/[\s,]+/).filter(Boolean)
          const amenityMatches = amenities.filter((a: string) => 
            reqWords.some((w: string) => w.length >= 3 && a.toLowerCase().includes(w))
          )
          if (amenityMatches.length > 0) {
            score.push(Math.min(amenityMatches.length * 5, 15))
            reasons.push(`Amenities: ${amenityMatches.slice(0, 2).join(', ')}`)
          }
        }
      } catch {}
    }

    const totalScore = score.reduce((a, b) => a + b, 0)
    if (totalScore > 0) {
      let confidence: 'alta' | 'media' | 'baja' = 'baja'
      if (totalScore >= 60) confidence = 'alta'
      else if (totalScore >= 30) confidence = 'media'

      matches.push({
        id: p.id, title: p.title || 'Sin titulo', address: p.address || '', city: p.city || '',
        price: pPrice, currency: pCurrency, operationType: p.operation_type,
        propertyType: p.property_type, bedrooms: parseInt(p.bedrooms) || 0,
        score: totalScore, matchReasons: reasons, confidence,
      })
    }
  }

  matches.sort((a, b) => b.score - a.score)

  return { leadId, leadName: lead.name, properties: matches.slice(0, 10) }
}