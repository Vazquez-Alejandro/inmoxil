import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

const SECRET = process.env.OWNER_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-owner-token-secret'

type OwnerPayload = {
  id: string
  email: string
  name: string
  workspaceId: string
  type: 'owner'
}

function sign(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('hex')
}

export function createOwnerToken(data: Omit<OwnerPayload, 'type'>): string {
  const payload: OwnerPayload = { ...data, type: 'owner' }
  const json = JSON.stringify(payload)
  const encoded = Buffer.from(json).toString('base64url')
  const signature = sign(encoded)
  return `${encoded}.${signature}`
}

export function verifyOwnerToken(token: string): OwnerPayload | null {
  try {
    const [encoded, signature] = token.split('.')
    if (!encoded || !signature) return null

    const expected = sign(encoded)
    const sigBuf = Buffer.from(signature, 'hex')
    const expectedBuf = Buffer.from(expected, 'hex')

    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return null

    const json = Buffer.from(encoded, 'base64url').toString()
    const data = JSON.parse(json) as OwnerPayload
    if (data.type !== 'owner') return null

    return data
  } catch {
    return null
  }
}

export function getOwnerFromCookie(): OwnerPayload | null {
  const token = cookies().get('owner_token')?.value
  if (!token) return null
  return verifyOwnerToken(token)
}
