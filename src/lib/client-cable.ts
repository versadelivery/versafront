import { createConsumer } from "@rails/actioncable"
import { getToken } from "./auth"
import { useEffect, useRef, useState } from "react"

export interface ClientOrderData {
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

export function createClientCableWithToken() {
  const token = getToken()
  if (token) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const cableUrl = apiUrl.replace('http', 'ws').replace('https', 'wss') + `/cable?token=${token}`
    return createConsumer(cableUrl)
  }
  return null
}

export function useClientActionCable(orderId: string) {
  const [isConnected, setIsConnected] = useState(false)
  const cableRef = useRef<any>(null)

  useEffect(() => {
    const token = getToken()
    if (token && orderId) {
      const cable = createClientCableWithToken()
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
  }, [orderId])

  const subscribeToOrder = (onData: (data: ClientOrderData) => void) => {
    if (!cableRef.current || !orderId) {
      console.error('Client Cable não está conectado ou orderId não fornecido')
      return () => {}
    }

    const subscription = cableRef.current.subscriptions.create(
      {
        channel: "OrderChannel",
        id: orderId
      },
      {
        received: (payload: any) => {
          if (!payload?.event) return

          // Evento inicial
          if (payload.event === "initial_order_data") {
            onData(payload.data.data)
          }

          // Eventos futuros
          if (payload.event === "order_updated") {
            onData(payload.data.data)
          }
        },
        connected: () => {
          console.log('Subscrição client conectada para pedido:', orderId)
        },
        disconnected: () => {
          console.log('Subscrição client desconectada para pedido:', orderId)
        },
        rejected: () => {
          console.error('Subscrição client rejeitada para pedido:', orderId)
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
    subscribeToOrder,
    disconnect,
    isConnected: () => isConnected
  }
}
