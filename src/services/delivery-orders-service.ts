import api from '@/api/config'
import { API_ENDPOINTS } from '@/api/routes'

export type DeliveryOrderStatus = 'ready' | 'left_for_delivery' | 'delivered'

export interface DeliveryOrder {
  id: string
  type: string
  attributes: {
    id: string
    status: DeliveryOrderStatus
    total_price: number
    payment_method: string
    withdrawal: boolean
    created_at: string
    left_for_delivery_at: string | null
    customer: { name: string; cellphone: string }
    address: {
      data: {
        attributes: {
          address: string
          neighborhood: string
          complement: string | null
          reference: string | null
        }
      } | null
    }
    items: Array<{ name: string; quantity: number; observation: string | null }>
  }
}

export interface DeliveryOrdersResponse {
  data: DeliveryOrder[]
}

export const deliveryOrdersService = {
  async getOrders(): Promise<DeliveryOrdersResponse> {
    const response = await api.get(API_ENDPOINTS.DELIVERY_ORDERS)
    return response.data
  },

  async updateStatus(
    orderId: string,
    status: 'left_for_delivery' | 'delivered'
  ): Promise<{ data: DeliveryOrder }> {
    const response = await api.patch(`${API_ENDPOINTS.DELIVERY_ORDERS}/${orderId}`, {
      order: { status },
    })
    return response.data
  },
}
