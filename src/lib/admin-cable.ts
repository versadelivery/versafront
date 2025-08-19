import { createConsumer } from "@rails/actioncable"
import { getToken } from "./auth"
import { useEffect, useRef, useState, useCallback } from "react"

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
  const subscriptionRef = useRef<any>(null)
  // pending confirmations: orderId -> array of pending promises waiting server confirmation
  const pendingConfirmationsRef = useRef<Record<string, Array<any>>>({});

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

  const subscribeToAdminOrders = useCallback((onData: (data: AdminOrderData[]) => void) => {
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
            // primeiro repassa os dados para o caller
            onData(payload.data.data)

            // então verifica se alguma confirmação pendente pode ser resolvida
            try {
              const orders: AdminOrderData[] = payload.data.data || []
              const pending = pendingConfirmationsRef.current || {}

              // Para cada pedido retornado, verificar promessas pendentes
              orders.forEach((socketOrder: AdminOrderData) => {
                const id = socketOrder.id
                const list = pending[id]
                if (!list || list.length === 0) return

                // status vindo do servidor (backend)
                const serverStatus: string = socketOrder.attributes.status

                // Percorre cópias para evitar mutation durante iteração
                const toKeep: Array<any> = []

                list.forEach((entry: any) => {
                  const { expectedStatus, expectedPaidAt, resolve, reject, timeoutId } = entry
                  let matched = false

                  if (expectedStatus && expectedStatus === serverStatus) {
                    matched = true
                  }

                  // Se a confirmação era sobre pagamento, checar paid flag
                  if (!matched && expectedPaidAt !== undefined) {
                    // backend envia paid via presence de paid_at (ou paidAt); consider paid se não é nulo
                    const paidAt = (socketOrder.attributes as any).paid_at || (socketOrder.attributes as any).paidAt
                    const serverPaid = !!paidAt
                    if (serverPaid === expectedPaidAt) {
                      matched = true
                    }
                  }

                  if (matched) {
                    clearTimeout(timeoutId)
                    resolve(true)
                  } else {
                    toKeep.push(entry)
                  }
                })

                if (toKeep.length > 0) {
                  pending[id] = toKeep
                } else {
                  delete pending[id]
                }
              })
            } catch (err) {
              console.error('Erro ao processar confirmações pendentes:', err)
            }
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

    // Função para enviar atualização de pedido - usando perform diretamente
    const sendData = (data: any) => {
      if (subscription && subscription.perform) {
        subscription.perform('receive', data)
      }
    }

    // Armazenar tanto a subscription quanto a função send
    subscriptionRef.current = {
      subscription,
      send: sendData
    }

    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe()
      }
      subscriptionRef.current = null
    }
  }, [])  // Array vazio para memoizar a função

  const updateOrder = useCallback((orderId: string, status?: string, paid_at?: boolean): Promise<boolean> => {
    console.log('🔄 updateOrder chamado:', { orderId, status, paid_at });
    
    return new Promise((resolve, reject) => {
      if (!subscriptionRef.current || !subscriptionRef.current.send) {
        console.error('❌ Subscription não está ativa');
        resolve(false);
        return;
      }

      const updateData = {
        event: "update_order",
        data: {
          id: orderId,
          ...(status && { status }),
          ...(paid_at !== undefined && { paid_at })
        }
      };

      console.log('📤 Enviando dados via websocket:', updateData);

      try {
        subscriptionRef.current.send(updateData);
        console.log('✅ Dados enviados com sucesso');

        // Registrar confirmação pendente: será resolvida quando o servidor enviar order_updated
        const pending = pendingConfirmationsRef.current || {}
        if (!pending[orderId]) pending[orderId] = []

        const timeoutId = setTimeout(() => {
          // Timeout: rejeitar/resolve false a confirmação pendente
          try {
            const list = pendingConfirmationsRef.current[orderId] || []
            // remover esta entrada se ainda existir
            pendingConfirmationsRef.current[orderId] = list.filter((e: any) => e.timeoutId !== timeoutId)
            resolve(false)
          } catch (err) {
            resolve(false)
          }
        }, 5000) // 5s timeout

        // Push entry
        pending[orderId].push({
          expectedStatus: status,
          expectedPaidAt: paid_at,
          resolve,
          reject,
          timeoutId
        })

        pendingConfirmationsRef.current = pending

      } catch (error) {
        console.error('❌ Erro ao enviar dados via websocket:', error);
        
        // Se houver erro, tentar reconectar
        if (cableRef.current) {
          console.log('🔄 Tentando reconectar...');
          try {
            cableRef.current.disconnect();
            setTimeout(() => {
              const newCable = createAdminCableWithToken();
              if (newCable) {
                cableRef.current = newCable;
                console.log('✅ Reconectado com sucesso');
              }
            }, 1000);
          } catch (reconnectError) {
            console.error('❌ Erro ao reconectar:', reconnectError);
          }
        }
        
  resolve(false);
      }
    });
  }, [])

  const disconnect = useCallback(() => {
    if (cableRef.current) {
      cableRef.current.disconnect()
      setIsConnected(false)
    }
  }, [])

  return {
    subscribeToAdminOrders,
    updateOrder,
    disconnect,
    isConnected: () => isConnected
  }
} 