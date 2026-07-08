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
    beds: number
    score: number
    matchReasons: string[]
    confidence: 'alta' | 'media' | 'baja'
  }[]
}

export interface PropertyMatchResult {
  propertyId: string
  propertyTitle: string
  leads: {
    id: string
    name: string
    phone: string
    email: string
    budgetMin: number
    budgetMax: number
    currency: string
    requirements: string
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

function getConfidence(score: number): 'alta' | 'media' | 'baja' {
  if (score >= 60) return 'alta'
  if (score >= 30) return 'media'
  return 'baja'
}

function calculatePropertyLeadScore(property: any, lead: any): { score: number; reasons: string[] } {
  const score: number[] = []
  const reasons: string[] = []

  const pPrice = parseFloat(property.price) || 0
  const pCurrency = property.currency || 'ARS'
  const lCurrency = lead.currency || 'ARS'
  const lBudgetMin = parseFloat(lead.budget_min) || 0
  const lBudgetMax = parseFloat(lead.budget_max) || 0

  // Budget match
  if (lBudgetMin && lBudgetMax && pPrice > 0) {
    const converted = pCurrency === lCurrency ? pPrice : pCurrency === 'USD' ? pPrice * 1200 : pPrice / 1200
    if (converted >= lBudgetMin && converted <= lBudgetMax) {
      score.push(30)
      reasons.push('Dentro del presupuesto')
    } else if (converted >= lBudgetMin * 0.8 && converted <= lBudgetMax * 1.2) {
      score.push(15)
      reasons.push('Cerca del presupuesto')
    }
  }

  // Keyword matching
  const req = (lead.requirements || '').toLowerCase()
  const desc = ((property.description || '') + ' ' + (property.title || '')).toLowerCase()
  if (req && desc) {
    const keywords = req.split(/[\s,]+/).filter(Boolean)
    const matchedKeywords = keywords.filter((k: string) => fuzzyMatch(k, desc))
    if (matchedKeywords.length > 0) {
      score.push(Math.min(matchedKeywords.length * 10, 40))
      reasons.push(`Coincide: ${matchedKeywords.slice(0, 3).join(', ')}`)
    }
  }

  // Bedrooms match
  if (property.beds && req) {
    const beds = parseInt(property.beds) || 0
    const bedMatch = req.match(/(\d+)\s*ambientes?|(\d+)\s*dormitorios?/)
    if (bedMatch) {
      const wanted = parseInt(bedMatch[1] || bedMatch[2]) || 0
      if (wanted > 0 && beds >= wanted) {
        score.push(20)
        reasons.push(`${beds} ambientes`)
      }
    }
  }

  // Operation type match
  const opType = (property.operation_type || '').toLowerCase()
  if (req && opType === 'alquiler' && req.includes('alquiler')) {
    score.push(20)
    reasons.push('Coincide tipo: alquiler')
  } else if (req && ((opType === 'venta' && req.includes('venta')) || req.includes('compr'))) {
    score.push(20)
    reasons.push('Coincide tipo: venta')
  }

  // Property type match
  const pType = (property.property_type || '').toLowerCase()
  if (req && pType && req.includes(pType)) {
    score.push(15)
    reasons.push(`Coincide tipo: ${pType}`)
  }

  // Neighborhood match
  if (req && property.city) {
    const pCity = property.city.toLowerCase()
    const pAddr = (property.address || '').toLowerCase()
    const pNeighborhood = (property.neighborhood || '').toLowerCase()
    const neighborhoods = req.match(/barrio\s+(\w+)|zona\s+(\w+)/g) || []
    const neighborhoodMatch = neighborhoods.some((n: string) => {
      const cleaned = n.replace(/barrio\s+|zona\s+/gi, '').trim()
      return cleaned && (pCity.includes(cleaned) || pAddr.includes(cleaned) || pNeighborhood.includes(cleaned))
    }) || pAddr.split(/\s+/).some((word: string) => word.length > 3 && req.includes(word))
    if (neighborhoodMatch) {
      score.push(15)
      reasons.push('Barrio preferido')
    }
  }

  // Features/amenities match
  if (property.features && req) {
    try {
      const features = typeof property.features === 'string' ? JSON.parse(property.features) : property.features
      if (Array.isArray(features)) {
        const reqWords = req.split(/[\s,]+/).filter(Boolean)
        const featureMatches = features.filter((f: string) =>
          reqWords.some((w: string) => w.length >= 3 && f.toLowerCase().includes(w))
        )
        if (featureMatches.length > 0) {
          score.push(Math.min(featureMatches.length * 5, 15))
          reasons.push(`Características: ${featureMatches.slice(0, 2).join(', ')}`)
        }
      }
    } catch {}
  }

  return { score: score.reduce((a, b) => a + b, 0), reasons }
}

export async function matchLeadToProperties(workspaceId: string, leadId: string): Promise<MatchingResult | null> {
  const leadResult = await queryOne(
    `SELECT pl.* FROM pipeline_leads pl WHERE pl.id=$1`,
    [leadId]
  )
  if (!leadResult) return null

  const properties = await query(
    `SELECT id, title, address, city, neighborhood, price, currency, operation_type, property_type, beds, description, features
     FROM properties WHERE workspace_id=$1 AND status='active'`,
    [workspaceId]
  )

  const matches: MatchingResult['properties'] = []
  for (const p of (properties || [])) {
    const { score, reasons } = calculatePropertyLeadScore(p, leadResult)
    if (score > 0) {
      matches.push({
        id: p.id, title: p.title || 'Sin titulo', address: p.address || '', city: p.city || '',
        price: parseFloat(p.price) || 0, currency: p.currency || 'ARS',
        operationType: p.operation_type, propertyType: p.property_type,
        beds: parseInt(p.beds) || 0,
        score, matchReasons: reasons, confidence: getConfidence(score),
      })
    }
  }

  matches.sort((a, b) => b.score - a.score)
  return { leadId, leadName: leadResult.full_name, properties: matches.slice(0, 10) }
}

export async function matchPropertyToLeads(workspaceId: string, propertyId: string): Promise<PropertyMatchResult | null> {
  const property = await queryOne(
    `SELECT id, title, address, city, neighborhood, price, currency, operation_type, property_type, beds, description, features
     FROM properties WHERE id=$1 AND workspace_id=$2`,
    [propertyId, workspaceId]
  )
  if (!property) return null

  const leads = await query(
    `SELECT id, full_name, phone, email, budget_min, budget_max, currency, requirements
     FROM pipeline_leads WHERE workspace_id=$1 AND status='activo'`,
    [workspaceId]
  )

  const matches: PropertyMatchResult['leads'] = []
  for (const lead of (leads || [])) {
    const { score, reasons } = calculatePropertyLeadScore(property, lead)
    if (score > 0) {
      matches.push({
        id: lead.id, name: lead.full_name, phone: lead.phone || '', email: lead.email || '',
        budgetMin: parseFloat(lead.budget_min) || 0, budgetMax: parseFloat(lead.budget_max) || 0,
        currency: lead.currency || 'ARS', requirements: lead.requirements || '',
        score, matchReasons: reasons, confidence: getConfidence(score),
      })
    }
  }

  matches.sort((a, b) => b.score - a.score)
  return { propertyId, propertyTitle: property.title || 'Sin titulo', leads: matches.slice(0, 10) }
}

export async function runAutoMatching(workspaceId: string, propertyId: string): Promise<{ matchesFound: number; highConfidence: number }> {
  const result = await matchPropertyToLeads(workspaceId, propertyId)
  if (!result || result.leads.length === 0) {
    return { matchesFound: 0, highConfidence: 0 }
  }

  const highConfidence = result.leads.filter(l => l.confidence === 'alta').length
  const mediumConfidence = result.leads.filter(l => l.confidence === 'media').length

  if (highConfidence > 0 || mediumConfidence > 0) {
    const { createNotification } = await import('@/lib/notifications/db')
    const topMatches = result.leads.slice(0, 5)
    const matchList = topMatches.map(l => `${l.name} (${l.confidence})`).join(', ')

    await createNotification({
      workspaceId,
      type: 'matching_encontrado',
      title: `Matches encontrados para: ${result.propertyTitle}`,
      message: `${result.leads.length} clientes compatibles. Alta confianza: ${highConfidence}. Principales: ${matchList}`,
      link: `/dashboard/properties?highlight=${propertyId}`,
      icon: 'matching',
    })
  }

  return { matchesFound: result.leads.length, highConfidence }
}
