import { createConsumer } from "@rails/actioncable"
import { getToken } from "./auth"
import api from "@/api/config"
import { useEffect, useRef, useState, useCallback } from "react"

export interface AdminOrderAddressAttributes {
  id: number
  address: string
  number: string | null
  complement: string | null
  neighborhood: string | null
  reference: string | null
  latitude: string | null
  longitude: string | null
  store_latitude: string | null
  store_longitude: string | null
  distance_km: string | null
  duration_minutes: number | null
  delivery_fee_kind: string | null
  shop_delivery_neighborhood: unknown
}

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
      data: { id: string; type: string; attributes: AdminOrderAddressAttributes } | null
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
  const parsed = new URL(base.includes('://') ? base : `https://${base}`)
  const protocol = parsed.protocol === 'http:' ? 'ws:' : 'wss:'
  const cableUrl = `${protocol}//${parsed.host}${parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/$/, '')}/cable?token=${encodeURIComponent(token)}`

  try {
    return createConsumer(cableUrl)
  } catch (e) {
    console.error('Failed to create ActionCable consumer:', e)
    return null
  }
}

export function useAdminActionCable() {
  const [isConnected, setIsConnected] = useState(false)
  const [cableReady, setCableReady] = useState(false)
  const cableRef = useRef<any>(null)
  const subscriptionRef = useRef<any>(null)
  // pending confirmations: orderId -> array of pending promises waiting server confirmation
  const pendingConfirmationsRef = useRef<Record<string, Array<any>>>({});

  useEffect(() => {
    let disposed = false
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    const connect = () => {
      if (disposed || cableRef.current) return
      const token = getToken()
      if (!token) {
        retryTimer = setTimeout(connect, 250)
        return
      }
      const cable = createAdminCableWithToken()
      if (cable) {
        cableRef.current = cable
        setCableReady(true)
        setIsConnected(true)
      }
    }
    connect()

    return () => {
      disposed = true
      if (retryTimer) clearTimeout(retryTimer)
      if (cableRef.current) {
        cableRef.current.disconnect()
        cableRef.current = null
        setCableReady(false)
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
        received: (rawPayload: any) => {
          const payload = typeof rawPayload === 'string' ? JSON.parse(rawPayload) : rawPayload
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
  }, [cableReady])

  const updateOrder = useCallback((orderId: string, status?: string, paid_at?: boolean, deliveryPerson?: string, cancellationReason?: string, cancellationReasonType?: string): Promise<boolean> => {
    console.log('🔄 updateOrder chamado:', { orderId, status, paid_at, deliveryPerson, cancellationReason, cancellationReasonType });
    
    return new Promise((resolve, reject) => {
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
            cancellation_reason_type: cancellationReasonType || "other",
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

      // A persistência das ações operacionais passa pela API; o Cable fica
      // responsável por distribuir a atualização para as outras telas.
      const restData = { ...(updateData.data || {}) };
      if (status === 'cancelled' || status === 'left_for_delivery' || status === 'delivered') {
        restData.status = status;
      }
      api.patch(`/orders/${orderId}`, { order: restData })
        .then(() => resolve(true))
        .catch((error) => {
          console.error('❌ Falha ao persistir pedido pela API:', error);
          resolve(false);
        });
      return;

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

  const updateOrderDetails = useCallback(async (orderId: string, data: any): Promise<boolean> => {
    // Campos que a API de edição aceita (PATCH /orders/:id/edit)
    const order: any = {};
    for (const key of ['customer', 'address', 'shop', 'items', 'total', 'payment_method', 'removed_item_ids', 'new_items', 'withdrawal']) {
      if (data[key] !== undefined) order[key] = data[key];
    }
    if (data.deliveryPerson !== undefined) order.delivery_person = data.deliveryPerson;

    // Via REST (igual às ações de status): o WebSocket não confirma entrega e
    // descartava a edição em silêncio quando a conexão não estava ativa.
    try {
      await api.patch(`/orders/${orderId}/edit`, { order });
      return true;
    } catch (error: any) {
      console.error('❌ Falha ao editar pedido pela API:', error);
      const message = error?.response?.data?.error;
      throw new Error(typeof message === 'string' ? message : 'Não foi possível salvar as alterações do pedido');
    }
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
