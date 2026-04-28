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
    discount_amount: string
    payment_adjustment_amount: string
    coupon_code: string | null
    withdrawal: boolean
    payment_method: string
    created_at: string
    paid_at?: string | null
    accepted_at?: string | null
    ready_at?: string | null
    left_for_delivery_at?: string | null
    delivery_person?: string | null
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
  if (!token) return null

  const base = process.env.NEXT_PUBLIC_CABLE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  // If base already points to ws(s), keep it; otherwise convert http(s) -> ws(s)
  const wsBase = base.startsWith('ws') ? base : base.replace('http', 'ws').replace('https', 'wss')
  const hasQuery = wsBase.includes('?')
  const cableUrl = `${wsBase.replace(/\/$/, '')}${wsBase.endsWith('/cable') || wsBase.endsWith('/cable/') ? '' : '/cable'}${hasQuery ? '&' : '?'}token=${token}`

  return createConsumer(cableUrl)
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
              console.log(pending)

              // Para cada pedido retornado, verificar promessas pendentes
              orders.forEach((socketOrder: AdminOrderData) => {
                const id = socketOrder.id
                const list = pending[id]
                if (!list || list.length === 0) return

                // status vindo do servidor (backend)
                const serverStatus: string = socketOrder.attributes.status

                const toKeep: Array<any> = []

                list.forEach((entry: any) => {
                  const { expectedStatus, expectedPaidAt, resolve, reject, timeoutId } = entry
                  let matched = false

                  // expectedStatus deve estar no formato backend
                  const frontendToBackend: Record<string, string> = {
                    'recebidos': 'received',
                    'aceitos': 'accepted',
                    'em_analise': 'in_analysis',
                    'em_preparo': 'in_preparation',
                    'prontos': 'ready',
                    'saiu': 'left_for_delivery',
                    'entregue': 'delivered',
                    'cancelled': 'cancelled'
                  }
                  const expectedBackendStatus = expectedStatus ? (frontendToBackend[expectedStatus] || expectedStatus) : undefined

                  if (expectedBackendStatus && expectedBackendStatus === serverStatus) {
                    matched = true
                  }

                  // Se a confirmação era sobre pagamento, checar paid flag
                  if (!matched && expectedPaidAt !== undefined) {
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

  const updateOrder = useCallback((orderId: string, status?: string, paid_at?: boolean, deliveryPerson?: string, cancellationReason?: string): Promise<boolean> => {
    console.log('🔄 updateOrder chamado:', { orderId, status, paid_at, deliveryPerson, cancellationReason });
    
    return new Promise((resolve, reject) => {
      if (!subscriptionRef.current || !subscriptionRef.current.send) {
        console.error('❌ Subscription não está ativa');
        resolve(false);
        return;
      }

      let event = "update_order";
      let updateData: any = {
        event: event,
        data: {
          id: orderId,
          ...(status && { status }),
          ...(paid_at !== undefined && { paid_at }),
          ...(deliveryPerson !== undefined && { delivery_person: deliveryPerson })
        }
      };

      // Se for cancelamento, usar evento específico
      if (status === 'cancelled') {
        event = "cancel_order";
        updateData = {
          event: event,
          data: {
            id: orderId,
            cancellation_reason_type: cancellationReason || "other",
            cancellation_reason: cancellationReason || "Cancelado pelo administrador"
          }
        };
      }

      // Se for saiu para entrega, usar evento específico (backend: left_for_delivery)
      if (status === 'left_for_delivery') {
        event = "left_for_delivery";
        updateData = {
          event: event,
          data: {
            id: orderId
          }
        };
      }

      // Se for entregue, usar evento específico (backend: delivered)
      if (status === 'delivered') {
        event = "delivered";
        updateData = {
          event: event,
          data: {
            id: orderId
          }
        };
      }

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

  const updateOrderDetails = useCallback((orderId: string, data: any): Promise<boolean> => {
    console.log('🔄 updateOrderDetails chamado:', { orderId, data });
    
    return new Promise((resolve, reject) => {
      if (!subscriptionRef.current || !subscriptionRef.current.send) {
        console.error('❌ Subscription não está ativa');
        resolve(false);
        return;
      }

      // Filtrar apenas os campos que o backend suporta
      const supportedData: any = {};
      
      if (data.customer) {
        supportedData.customer = data.customer;
      }
      
      if (data.address) {
        supportedData.address = data.address;
      }
      
      if (data.shop) {
        supportedData.shop = data.shop;
      }
      
      if (data.items) {
        supportedData.items = data.items;
      }

      if (data.total !== undefined) {
        supportedData.total = data.total;
      }

      if (data.deliveryPerson !== undefined) {
        supportedData.delivery_person = data.deliveryPerson;
      }

      if (data.payment_method !== undefined) {
        supportedData.payment_method = data.payment_method;
      }

      if (data.manual_adjustment !== undefined) {
        supportedData.manual_adjustment = data.manual_adjustment;
      }

      if (data.removed_item_ids) {
        supportedData.removed_item_ids = data.removed_item_ids;
      }

      if (data.new_items) {
        supportedData.new_items = data.new_items;
      }

      if (data.withdrawal !== undefined) {
        supportedData.withdrawal = data.withdrawal;
      }

      // Determinar se é uma edição completa ou atualização simples
      const hasItemsChanges = (data.items && (Array.isArray(data.items) ? data.items.length > 0 : Object.keys(data.items).length > 0)) ||
        data.removed_item_ids || data.new_items;
      const event = hasItemsChanges ? "edit_order" : "update_order";

      const updateData = {
        event: event,
        data: {
          id: orderId,
          ...supportedData
        }
      };

      console.log('📤 Enviando dados para o backend:', updateData);

      subscriptionRef.current.send(updateData);

      // Simular sucesso por enquanto (o backend vai responder via WebSocket)
      setTimeout(() => {
        console.log('✅ updateOrderDetails concluído');
        resolve(true);
      }, 100);
    });
  }, []);

  const disconnect = useCallback(() => {
    if (cableRef.current) {
      cableRef.current.disconnect()
      setIsConnected(false)
    }
  }, [])

  return {
    subscribeToAdminOrders,
    updateOrder,
    updateOrderDetails,
    disconnect,
    isConnected: () => isConnected
  }
} 