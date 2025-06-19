import { createConsumer } from "@rails/actioncable"
import { getClientToken } from "./auth"
import { useEffect, useRef, useState } from "react"
import { ActionCableOrderData } from "@/types/order"

export function createCableWithToken() {
  const token = getClientToken()
  if (token) {
    const cableUrl = `ws://localhost:3000/cable?token=${token}`
    console.log('cableUrl', cableUrl)
    return createConsumer(cableUrl)
  }
  return null
}

export function useActionCable() {
  const [isConnected, setIsConnected] = useState(false)
  const cableRef = useRef<any>(null)

  useEffect(() => {
    const token = getClientToken()
    if (token) {
      const cable = createCableWithToken()
      if (cable) {
        cableRef.current = cable
        setIsConnected(true)
        console.log('Action Cable conectado')
      }
    }

    return () => {
      if (cableRef.current) {
        cableRef.current.disconnect()
        setIsConnected(false)
      }
    }
  }, [])

  const subscribeToOrder = (orderId: string, onData: (data: ActionCableOrderData) => void) => {
    if (!cableRef.current) {
      console.error('Cable não está conectado')
      return () => {}
    }

    const subscription = cableRef.current.subscriptions.create(
      {
        channel: "OrderChannel",
        id: orderId,
      },
      {
        received: (payload: any) => {
          console.log('Payload recebido:', payload)
          
          if (!payload?.event) return

          // Evento inicial
          if (payload.event === "initial_order_data") {
            console.log('Dados iniciais do pedido recebidos')
            onData(payload.data.data)
          }

          // Eventos futuros
          if (payload.event === "order_updated") {
            console.log('Pedido atualizado recebido')
            onData(payload.data.data)
          }
        },
        connected: () => {
          console.log('Subscrição conectada para o pedido:', orderId)
        },
        disconnected: () => {
          console.log('Subscrição desconectada para o pedido:', orderId)
        },
        rejected: () => {
          console.error('Subscrição rejeitada para o pedido:', orderId)
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
