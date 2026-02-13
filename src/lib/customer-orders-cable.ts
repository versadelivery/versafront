import { createConsumer } from "@rails/actioncable"
import { getClientToken } from "./auth"

export function createCustomerOrdersCableWithToken() {
  const token = getClientToken()
  console.log('🔍 Token do cliente para WebSocket:', token ? 'Presente' : 'Ausente')
  
  if (token) {
    const base = process.env.NEXT_PUBLIC_CABLE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const wsBase = base.startsWith('ws') ? base : base.replace('http', 'ws').replace('https', 'wss')
    const cableUrl = `${wsBase.replace(/\/$/, '')}${wsBase.endsWith('/cable') ? '' : '/cable'}?token=${token}`
    console.log('🔗 URL do WebSocket:', cableUrl.replace(token, '***TOKEN***'))
    return createConsumer(cableUrl)
  }
  console.warn('⚠️ Token do cliente não encontrado')
  return null
}
