import { createConsumer } from "@rails/actioncable"
import { getClientToken } from "./auth"

export function createCustomerOrdersCableWithToken() {
  const token = getClientToken()
  console.log('🔍 Token do cliente para WebSocket:', token ? 'Presente' : 'Ausente')
  
  if (token) {
    const base = process.env.NEXT_PUBLIC_CABLE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    // Respeita o protocolo já declarado (ws:// em dev local, sem TLS) em vez de
    // forçar wss:// sempre — contra um Puma sem TLS isso derruba a conexão.
    const wsBase = base.startsWith('ws') ? base : base.replace('https', 'wss').replace('http', 'ws')
    const cableUrl = `${wsBase.replace(/\/$/, '')}/cable?token=${token}`
    console.log('🔗 URL do WebSocket:', cableUrl.replace(token, '***TOKEN***'))
    try {
      return createConsumer(cableUrl)
    } catch (e) {
      console.error('Failed to create ActionCable consumer:', e)
      return null
    }
  }
  console.warn('⚠️ Token do cliente não encontrado')
  return null
}
