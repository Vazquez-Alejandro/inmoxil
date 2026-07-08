import { query, queryOne } from '@/lib/db'

export interface EnhancedMatchResult {
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
    aiSuggestion: string
    compatibility: number
  }[]
}

export interface PropertyEnhancedMatchResult {
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
    aiSuggestion: string
    compatibility: number
  }[]
}

function calculateCompatibility(property: any, lead: any): number {
  let compatibility = 0
  let maxScore = 0

  // Budget compatibility (30 points)
  if (lead.budget_min && lead.budget_max && property.price) {
    maxScore += 30
    const pPrice = parseFloat(property.price)
    const lMin = parseFloat(lead.budget_min)
    const lMax = parseFloat(lead.budget_max)
    const currency = lead.currency || 'ARS'
    const pCurrency = property.currency || 'ARS'
    const converted = pCurrency === currency ? pPrice : pCurrency === 'USD' ? pPrice * 1200 : pPrice / 1200

    if (converted >= lMin && converted <= lMax) {
      compatibility += 30
    } else if (converted >= lMin * 0.9 && converted <= lMax * 1.1) {
      compatibility += 20
    } else if (converted >= lMin * 0.8 && converted <= lMax * 1.2) {
      compatibility += 10
    }
  }

  // Location compatibility (25 points)
  if (property.city && lead.requirements) {
    maxScore += 25
    const req = lead.requirements.toLowerCase()
    const city = property.city.toLowerCase()
    const address = (property.address || '').toLowerCase()
    const neighborhood = (property.neighborhood || '').toLowerCase()

    if (req.includes(city) || req.includes(address) || req.includes(neighborhood)) {
      compatibility += 25
    } else if (city.includes('capital federal') || city.includes('caba')) {
      if (req.includes('capital') || req.includes('caba') || req.includes('palermo') || req.includes('recoleta')) {
        compatibility += 15
      }
    }
  }

  // Property type compatibility (20 points)
  if (property.property_type && lead.requirements) {
    maxScore += 20
    const req = lead.requirements.toLowerCase()
    const type = property.property_type.toLowerCase()

    if (req.includes(type)) {
      compatibility += 20
    } else if ((type === 'departamento' && req.includes('depto')) || (type === 'casa' && req.includes('ph'))) {
      compatibility += 15
    }
  }

  // Features compatibility (15 points)
  if (property.features && lead.requirements) {
    maxScore += 15
    try {
      const features = typeof property.features === 'string' ? JSON.parse(property.features) : property.features
      const req = lead.requirements.toLowerCase()
      const featureKeywords = ['pileta', 'jardin', 'estacionamiento', 'gimnasio', 'seguridad', 'amoblado', 'terraza', 'quincho']
      const matchedFeatures = featureKeywords.filter(f => req.includes(f) && features.some((pf: string) => pf.toLowerCase().includes(f)))
      compatibility += Math.min(matchedFeatures.length * 5, 15)
    } catch {}
  }

  // Size compatibility (10 points)
  if (property.beds && lead.requirements) {
    maxScore += 10
    const req = lead.requirements.toLowerCase()
    const beds = parseInt(property.beds) || 0
    const bedMatch = req.match(/(\d+)\s*(?:amb|dorm|habit)/)
    if (bedMatch) {
      const wanted = parseInt(bedMatch[1])
      if (beds >= wanted) compatibility += 10
      else if (beds >= wanted - 1) compatibility += 5
    }
  }

  return maxScore > 0 ? Math.round((compatibility / maxScore) * 100) : 0
}

function generateAISuggestion(property: any, lead: any, compatibility: number): string {
  const suggestions: string[] = []

  if (compatibility >= 80) {
    suggestions.push('Excelente match')
  } else if (compatibility >= 60) {
    suggestions.push('Buen match')
  } else if (compatibility >= 40) {
    suggestions.push('Match parcial')
  } else {
    suggestions.push('Match bajo')
  }

  // Specific suggestions based on differences
  const pPrice = parseFloat(property.price)
  const lMax = parseFloat(lead.budget_max)
  const currency = lead.currency || 'ARS'
  const pCurrency = property.currency || 'ARS'
  const converted = pCurrency === currency ? pPrice : pCurrency === 'USD' ? pPrice * 1200 : pPrice / 1200

  if (lMax && converted > lMax * 1.1) {
    suggestions.push(`Supera presupuesto en ${Math.round(((converted - lMax) / lMax) * 100)}%`)
  } else if (lMax && converted < lMax * 0.7) {
    suggestions.push('Muy por debajo del presupuesto')
  }

  if (property.city && lead.requirements) {
    const req = lead.requirements.toLowerCase()
    if (!req.includes(property.city.toLowerCase())) {
      suggestions.push('Zona diferente a la buscada')
    }
  }

  return suggestions.join(' | ')
}

function calculateEnhancedScore(property: any, lead: any): { score: number; reasons: string[]; compatibility: number; aiSuggestion: string } {
  const score: number[] = []
  const reasons: string[] = []

  const pPrice = parseFloat(property.price) || 0
  const pCurrency = property.currency || 'ARS'
  const lCurrency = lead.currency || 'ARS'
  const lBudgetMin = parseFloat(lead.budget_min) || 0
  const lBudgetMax = parseFloat(lead.budget_max) || 0

  // Budget match (30 points)
  if (lBudgetMin && lBudgetMax && pPrice > 0) {
    const converted = pCurrency === lCurrency ? pPrice : pCurrency === 'USD' ? pPrice * 1200 : pPrice / 1200
    if (converted >= lBudgetMin && converted <= lBudgetMax) {
      score.push(30)
      reasons.push('Dentro del presupuesto')
    } else if (converted >= lBudgetMin * 0.9 && converted <= lBudgetMax * 1.1) {
      score.push(20)
      reasons.push('Cerca del presupuesto')
    } else if (converted >= lBudgetMin * 0.8 && converted <= lBudgetMax * 1.2) {
      score.push(10)
      reasons.push('Lejos del presupuesto')
    }
  }

  // Location match (25 points)
  const req = (lead.requirements || '').toLowerCase()
  const city = (property.city || '').toLowerCase()
  const address = (property.address || '').toLowerCase()
  const neighborhood = (property.neighborhood || '').toLowerCase()

  if (req && (req.includes(city) || req.includes(address) || req.includes(neighborhood))) {
    score.push(25)
    reasons.push('Ubicación preferida')
  } else if (req && city) {
    const neighborhoods = req.match(/barrio\s+(\w+)|zona\s+(\w+)/g) || []
    const neighborhoodMatch = neighborhoods.some((n: string) => {
      const cleaned = n.replace(/barrio\s+|zona\s+/gi, '').trim()
      return cleaned && (city.includes(cleaned) || address.includes(cleaned) || neighborhood.includes(cleaned))
    })
    if (neighborhoodMatch) {
      score.push(15)
      reasons.push('Barrio similar')
    }
  }

  // Property type match (20 points)
  const pType = (property.property_type || '').toLowerCase()
  if (req && pType && req.includes(pType)) {
    score.push(20)
    reasons.push(`Tipo: ${pType}`)
  } else if (req && pType) {
    if ((pType === 'departamento' && req.includes('depto')) || (pType === 'casa' && req.includes('ph'))) {
      score.push(15)
      reasons.push(`Tipo similar: ${pType}`)
    }
  }

  // Features match (15 points)
  if (property.features && req) {
    try {
      const features = typeof property.features === 'string' ? JSON.parse(property.features) : property.features
      if (Array.isArray(features)) {
        const featureKeywords = ['pileta', 'jardin', 'estacionamiento', 'gimnasio', 'seguridad', 'amoblado', 'terraza', 'quincho']
        const matchedFeatures = features.filter((f: string) =>
          featureKeywords.some(k => req.includes(k) && f.toLowerCase().includes(k))
        )
        if (matchedFeatures.length > 0) {
          score.push(Math.min(matchedFeatures.length * 5, 15))
          reasons.push(`Características: ${matchedFeatures.slice(0, 2).join(', ')}`)
        }
      }
    } catch {}
  }

  // Bedrooms match (10 points)
  if (property.beds && req) {
    const beds = parseInt(property.beds) || 0
    const bedMatch = req.match(/(\d+)\s*ambientes?|(\d+)\s*dormitorios?/)
    if (bedMatch) {
      const wanted = parseInt(bedMatch[1] || bedMatch[2]) || 0
      if (wanted > 0 && beds >= wanted) {
        score.push(10)
        reasons.push(`${beds} ambientes`)
      }
    }
  }

  const totalScore = score.reduce((a, b) => a + b, 0)
  const compatibility = calculateCompatibility(property, lead)
  const aiSuggestion = generateAISuggestion(property, lead, compatibility)

  return { score: totalScore, reasons, compatibility, aiSuggestion }
}

function getConfidence(score: number): 'alta' | 'media' | 'baja' {
  if (score >= 60) return 'alta'
  if (score >= 30) return 'media'
  return 'baja'
}

export async function enhancedMatchLeadToProperties(workspaceId: string, leadId: string): Promise<EnhancedMatchResult | null> {
  const lead = await queryOne(
    `SELECT pl.* FROM pipeline_leads pl WHERE pl.id=$1`,
    [leadId]
  )
  if (!lead) return null

  const properties = await query(
    `SELECT id, title, address, city, neighborhood, price, currency, operation_type, property_type, beds, description, features
     FROM properties WHERE workspace_id=$1 AND status='active'`,
    [workspaceId]
  )

  const matches: EnhancedMatchResult['properties'] = []
  for (const p of (properties || [])) {
    const { score, reasons, compatibility, aiSuggestion } = calculateEnhancedScore(p, lead)
    if (score > 0) {
      matches.push({
        id: p.id, title: p.title || 'Sin titulo', address: p.address || '', city: p.city || '',
        price: parseFloat(p.price) || 0, currency: p.currency || 'ARS',
        operationType: p.operation_type, propertyType: p.property_type,
        beds: parseInt(p.beds) || 0,
        score, matchReasons: reasons, confidence: getConfidence(score),
        aiSuggestion, compatibility,
      })
    }
  }

  matches.sort((a, b) => b.score - a.score)
  return { leadId, leadName: lead.full_name, properties: matches.slice(0, 10) }
}

export async function enhancedMatchPropertyToLeads(workspaceId: string, propertyId: string): Promise<PropertyEnhancedMatchResult | null> {
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

  const matches: PropertyEnhancedMatchResult['leads'] = []
  for (const lead of (leads || [])) {
    const { score, reasons, compatibility, aiSuggestion } = calculateEnhancedScore(property, lead)
    if (score > 0) {
      matches.push({
        id: lead.id, name: lead.full_name, phone: lead.phone || '', email: lead.email || '',
        budgetMin: parseFloat(lead.budget_min) || 0, budgetMax: parseFloat(lead.budget_max) || 0,
        currency: lead.currency || 'ARS', requirements: lead.requirements || '',
        score, matchReasons: reasons, confidence: getConfidence(score),
        aiSuggestion, compatibility,
      })
    }
  }

  matches.sort((a, b) => b.score - a.score)
  return { propertyId, propertyTitle: property.title || 'Sin titulo', leads: matches.slice(0, 10) }
}
