"use client"

import React, { useState } from 'react'
import { useDeliveryOrders } from '@/hooks/use-delivery-orders'
import { useAuth } from '@/hooks/use-auth'
import { DeliveryOrder } from '@/services/delivery-orders-service'
import { MapPin, Phone, Package, LogOut, RefreshCw, Truck, CheckCircle2, XSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CancelOrderModal from '@/components/admin/cancel-order-modal'

const statusLabel: Record<string, string> = {
  ready: 'Pronto para entrega',
  left_for_delivery: 'Saiu para entrega',
  delivered: 'Entregue',
}

const paymentLabel: Record<string, string> = {
  cash: 'Dinheiro',
  debit: 'Débito',
  credit: 'Crédito',
  manual_pix: 'Pix',
  asaas_pix: 'Pix',
}

function OrderCard({
  order,
  onUpdateStatus,
  onCancel,
  isUpdating,
}: {
  order: DeliveryOrder
  onUpdateStatus: (orderId: string, status: 'left_for_delivery' | 'delivered') => void
  onCancel: (order: DeliveryOrder) => void
  isUpdating: boolean
}) {
  const { id, attributes: a } = order
  const shortId = id.slice(0, 8).toUpperCase()
  const addr = a.address?.data?.attributes

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-mono text-gray-400">#{shortId}</span>
          <p className="font-semibold text-gray-900">{a.customer.name}</p>
          {a.customer.cellphone && (
            <a
              href={`tel:${a.customer.cellphone}`}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600"
            >
              <Phone size={12} />
              {a.customer.cellphone}
            </a>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-gray-900">
            R$ {Number(a.total_price).toFixed(2).replace('.', ',')}
          </p>
          <p className="text-xs text-gray-400">{paymentLabel[a.payment_method] ?? a.payment_method}</p>
        </div>
      </div>

      {addr && (
        <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
          <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
          <div>
            <p>{addr.address}</p>
            {addr.neighborhood && <p className="text-xs text-gray-400">{addr.neighborhood}</p>}
            {addr.complement && <p className="text-xs text-gray-400">{addr.complement}</p>}
            {addr.reference && <p className="text-xs text-gray-400">Ref: {addr.reference}</p>}
          </div>
        </div>
      )}

      {a.items.length > 0 && (
        <div className="flex flex-col gap-1">
          {a.items.map((item, i) => (
            <div key={i} className="flex items-baseline gap-1 text-sm text-gray-700">
              <span className="font-medium">{item.quantity}x</span>
              <span>{item.name}</span>
              {item.observation && (
                <span className="text-xs text-gray-400">— {item.observation}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {a.status === 'ready' && (
        <Button
          onClick={() => onUpdateStatus(id, 'left_for_delivery')}
          disabled={isUpdating}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
        >
          <Truck size={15} />
          Saiu para Entrega
        </Button>
      )}

      {a.status === 'left_for_delivery' && (
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => onUpdateStatus(id, 'delivered')}
            disabled={isUpdating}
            className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
          >
            <CheckCircle2 size={15} />
            Marcar como Entregue
          </Button>
          <Button
            variant="outline"
            onClick={() => onCancel(order)}
            disabled={isUpdating}
            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2"
          >
            <XSquare size={15} />
            Não entregue
          </Button>
        </div>
      )}
    </div>
  )
}

function Section({
  title,
  color,
  orders,
  onUpdateStatus,
  onCancel,
  isUpdating,
}: {
  title: string
  color: string
  orders: DeliveryOrder[]
  onUpdateStatus: (orderId: string, status: 'left_for_delivery' | 'delivered') => void
  onCancel: (order: DeliveryOrder) => void
  isUpdating: boolean
}) {
  if (orders.length === 0) return null
  return (
    <div>
      <div className={`flex items-center gap-2 mb-3`}>
        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <h2 className="font-semibold text-gray-800 text-sm">
          {title}
          <span className="ml-2 text-xs font-normal text-gray-400">({orders.length})</span>
        </h2>
      </div>
      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onUpdateStatus={onUpdateStatus}
            onCancel={onCancel}
            isUpdating={isUpdating}
          />
        ))}
      </div>
    </div>
  )
}

export default function DeliveryPage() {
  const { user, logout } = useAuth()
  const { ready, inTransit, delivered, isLoading, refetch, updateStatus, cancelOrder, isUpdating } =
    useDeliveryOrders()

  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null)

  const totalActive = ready.length + inTransit.length

  const handleCancelOrder = async (orderId: string, reason: string, reasonType?: string) => {
    cancelOrder({ orderId, reason, reasonType })
    setSelectedOrder(null)
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="text-xs text-gray-400">Olá,</p>
          <p className="font-semibold text-gray-900 text-sm">{user?.name ?? 'Entregador'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={logout}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="bg-green-600 text-white px-4 py-3 flex items-center gap-2">
        <Package size={16} />
        <span className="text-sm font-medium">
          {isLoading ? 'Carregando...' : `${totalActive} pedido${totalActive !== 1 ? 's' : ''} ativo${totalActive !== 1 ? 's' : ''} hoje`}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col gap-6 pb-8">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400">Carregando pedidos...</p>
            </div>
          </div>
        ) : totalActive === 0 && delivered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
            <Truck size={40} className="text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">Nenhum pedido para hoje ainda</p>
          </div>
        ) : (
          <>
            <Section
              title="Prontos para entrega"
              color="bg-green-500"
              orders={ready}
              onUpdateStatus={(orderId, status) => updateStatus({ orderId, status })}
              onCancel={setSelectedOrder}
              isUpdating={isUpdating}
            />
            <Section
              title="Saiu para entrega"
              color="bg-indigo-500"
              orders={inTransit}
              onUpdateStatus={(orderId, status) => updateStatus({ orderId, status })}
              onCancel={setSelectedOrder}
              isUpdating={isUpdating}
            />
            <Section
              title="Entregues hoje"
              color="bg-gray-300"
              orders={delivered}
              onUpdateStatus={(orderId, status) => updateStatus({ orderId, status })}
              onCancel={setSelectedOrder}
              isUpdating={isUpdating}
            />
          </>
        )}
      </div>

      {selectedOrder && (
        <CancelOrderModal
          open={!!selectedOrder}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
          orderId={selectedOrder.id}
          customerName={selectedOrder.attributes.customer.name}
          orderStatus={selectedOrder.attributes.status === 'left_for_delivery' ? 'saiu' : selectedOrder.attributes.status}
          onCancelOrder={handleCancelOrder}
        />
      )}
    </div>
  )
}
