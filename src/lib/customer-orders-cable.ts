import { createConsumer } from "@rails/actioncable"
import { getClientToken } from "./auth"

export function createCustomerOrdersCableWithToken() {
  const token = getClientToken()
  console.log('🔍 Token do cliente para WebSocket:', token ? 'Presente' : 'Ausente')
  
  if (token) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const host = apiUrl.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '').replace(/\/$/, '')
    const cableUrl = `wss://${host}/cable?token=${token}`
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
