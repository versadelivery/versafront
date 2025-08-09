import { createConsumer } from "@rails/actioncable"
import { getToken } from "./auth"
import { useEffect, useRef, useState } from "react"

export interface AdminOrderData {
  id: string
  type: string
  attributes: {
    id: number
    status: string
    total_price: string | null
    total_items_price: string | null
    delivery_fee: string | null
    withdrawal: boolean
    payment_method: string
    created_at: string
    items: {
      data: any[]
    }
    address: {
      data: any | null
    }
    shop: {
      data: {
        id: string
        type: string
        attributes: {
          cellphone: string
          name: string
          slug: string
          address: string
          description: string
          image_url: string
        }
      }
    }
    customer: {
      data: {
        id: string
        type: string
        attributes: {
          id: number
          name: string
          email: string
          cellphone: string
        }
      }
    }
  }
}

export function createAdminCableWithToken() {
  const token = getToken()
  if (token) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const cableUrl = apiUrl.replace('http', 'ws').replace('https', 'wss') + `/cable?token=${token}`
    return createConsumer(cableUrl)
  }
  return null
}

export function useAdminActionCable() {
  const [isConnected, setIsConnected] = useState(false)
  const cableRef = useRef<any>(null)

  useEffect(() => {
    const token = getToken()
    if (token) {
      const cable = createAdminCableWithToken()
      if (cable) {
        cableRef.current = cable
        setIsConnected(true)
      }
    }

    return () => {
      if (cableRef.current) {
        cableRef.current.disconnect()
        setIsConnected(false)
      }
    }
  }, [])

  const subscribeToAdminOrders = (onData: (data: AdminOrderData[]) => void) => {
    if (!cableRef.current) {
      console.error('Admin Cable não está conectado')
      return () => {}
    }

    const subscription = cableRef.current.subscriptions.create(
      {
        channel: "OrderAdminChannel",
      },
      {
        received: (payload: any) => {
          
          if (!payload?.event) return

          // Evento inicial
          if (payload.event === "initial_order_admin_data") {
            onData(payload.data.data)
          }

          // Eventos futuros
          if (payload.event === "order_updated") {
            onData(payload.data.data)
          }
        },
        connected: () => {
          console.log('Subscrição admin conectada')
        },
        disconnected: () => {
          console.log('Subscrição admin desconectada')
        },
        rejected: () => {
          console.error('Subscrição admin rejeitada')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }

  const disconnect = () => {
    if (cableRef.current) {
      cableRef.current.disconnect()
      setIsConnected(false)
    }
  }

  return {
    subscribeToAdminOrders,
    disconnect,
    isConnected: () => isConnected
  }
} 