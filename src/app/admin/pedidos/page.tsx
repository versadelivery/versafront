'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { KDSBoard } from '@/components/admin/kds-board';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Eye, 
  ChefHat, 
  Bell,
  Copy,
  SquarePen,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import OrderDetailsModal from '@/components/admin/order-details-modal';
import { formatPrice } from '@/app/(public)/[slug]/format-price';
import { useAdminActionCable, AdminOrderData } from '@/lib/admin-cable';
import OrderCard from '@/components/admin/order-card';
import { useRestaurantSounds } from '@/hooks/use-restaurant-sounds';
// Controle de som foi movido para o Header global da administração

interface Order {
  id: string;
  customerName: string;
  amount: number;
  time: string;
  deliveryPerson?: string;
  status: 'recebidos' | 'aceitos' | 'em_analise' | 'em_preparo' | 'prontos' | 'saiu' | 'entregue' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  readyTime?: string;
  deliveryType: 'delivery' | 'pickup';
  socketData: AdminOrderData;
}

// Função para converter dados do socket para o formato da interface Order
const convertSocketDataToOrder = (socketOrder: AdminOrderData): Order => {
  const createdAt = new Date(socketOrder.attributes.created_at);
  const time = createdAt.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Mapear status do backend para o frontend
  const statusMap: Record<string, Order['status']> = {
    'received': 'recebidos',
    'accepted': 'aceitos',
    'in_analysis': 'em_analise',
    'in_preparation': 'em_preparo',
    'ready': 'prontos',
    'left_for_delivery': 'saiu',
    'delivered': 'entregue',
    'cancelled': 'cancelled'
  };

  // Calcular valor total dos itens
  const totalItemsPrice = socketOrder.attributes.items.data.reduce((sum, item) => {
    return sum + parseFloat(item.attributes.total_price || '0');
  }, 0);

  // Calcular valor total com taxa de entrega
  const deliveryFee = parseFloat(socketOrder.attributes.delivery_fee || '0');
  const totalPrice = parseFloat(socketOrder.attributes.total_price || '0') || (totalItemsPrice + deliveryFee);

  const paidAt = (socketOrder.attributes as any).paid_at || (socketOrder.attributes as any).paidAt
  const paymentStatus: Order['paymentStatus'] = paidAt ? 'paid' : 'pending'

  const customerName = socketOrder.attributes.customer?.data?.attributes?.name ||
                      (socketOrder.attributes.customer as any)?.name ||
                      'Cliente';

  return {
    id: socketOrder.id,
    customerName,
    amount: totalPrice,
    time,
    deliveryPerson: undefined, // Será definido pelo admin
    status: statusMap[socketOrder.attributes.status] || 'recebidos',
    paymentStatus,
    deliveryType: socketOrder.attributes.withdrawal ? 'pickup' : 'delivery',
    // Dados adicionais para o modal
    socketData: socketOrder
  };
};

const statusConfig = {
  recebidos: { 
    title: 'RECEBIDOS', 
    color: 'bg-red-500', 
    textColor: 'text-red-700',
    bgColor: 'bg-yellow-100',
    icon: <Clock className="w-4 h-4" />
  },
  aceitos: { 
    title: 'ACEITOS', 
    color: 'bg-blue-500', 
    textColor: 'text-blue-700',
    bgColor: 'bg-white',
    icon: <CheckCircle className="w-4 h-4" />
  },
  em_analise: { 
    title: 'EM ANÁLISE', 
    color: 'bg-yellow-500', 
    textColor: 'text-yellow-700',
    bgColor: 'bg-white',
    icon: <Eye className="w-4 h-4" />
  },
  em_preparo: { 
    title: 'EM PREPARO', 
    color: 'bg-orange-500', 
    textColor: 'text-orange-700',
    bgColor: 'bg-white',
    icon: <ChefHat className="w-4 h-4" />
  },
  prontos: { 
    title: 'ENTREGA', 
    color: 'bg-primary', 
    textColor: 'text-white',
    bgColor: 'bg-primary',
    icon: <Truck className="w-4 h-4 text-primary" />
  },
  saiu: { 
    title: 'SAIU PARA ENTREGA', 
    color: 'bg-blue-500', 
    textColor: 'text-white',
    bgColor: 'bg-blue-100',
    icon: <Truck className="w-4 h-4" />
  },
  entregue: { 
    title: 'ENTREGUE', 
    color: 'bg-green-500', 
    textColor: 'text-white',
    bgColor: 'bg-green-100',
    icon: <CheckCircle className="w-4 h-4" />
  },
  cancelled: {
    title: 'CANCELADOS',
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: <XCircle className="w-4 h-4" />
  }
};

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedColumns, setExpandedColumns] = useState<Record<string, boolean>>({
    recebidos: true,
    aceitos: true,
    em_analise: true,
    em_preparo: true,
    prontos: true,
    saiu: true,
    entregue: true,
    cancelled: true
  });
  const [isMobile, setIsMobile] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  // Pedidos que estão sendo atualizados no momento (impede conflitos com o WebSocket)
  const updatingRef = useRef<Set<string>>(new Set());

  const { subscribeToAdminOrders, updateOrder, updateOrderDetails, isConnected } = useAdminActionCable();
  const { orderAccepted, orderReady, newOrder } = useRestaurantSounds();
  const seenOrderIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAdminOrders((socketOrders: AdminOrderData[]) => {
      const convertedOrders = socketOrders.map(convertSocketDataToOrder);

      // Tocar som para pedidos genuinamente novos (fora do setState para evitar side effects)
      convertedOrders.forEach(incoming => {
        if (!seenOrderIdsRef.current.has(incoming.id)) {
          seenOrderIdsRef.current.add(incoming.id);
          newOrder();
        }
      });

      setOrders(prev => {
        const prevById = new Map(prev.map(o => [o.id, o]));
        return convertedOrders.map(incoming => {
          // Preservar estado local enquanto um update está em andamento
          if (updatingRef.current.has(incoming.id)) {
            return prevById.get(incoming.id) ?? incoming;
          }
          return incoming;
        });
      });

      setIsLoading(false);
    });

    const timeout = setTimeout(() => setIsLoading(false), 10000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: Order['status']) => {
    if (updatingRef.current.has(orderId)) return;
    updatingRef.current.add(orderId);

    const backendStatusMap: Record<Order['status'], string> = {
      recebidos:  'received',
      aceitos:    'accepted',
      em_analise: 'in_analysis',
      em_preparo: 'in_preparation',
      prontos:    'ready',
      saiu:       'left_for_delivery',
      entregue:   'delivered',
      cancelled:  'cancelled',
    };

    // Captura status original para reverter em caso de falha
    let originalStatus: Order['status'] = newStatus;
    setOrders(prev => {
      const original = prev.find(o => o.id === orderId);
      if (original) originalStatus = original.status;
      return prev.map(o =>
        o.id === orderId
          ? { ...o, status: newStatus, readyTime: newStatus === 'prontos' ? new Date().toLocaleTimeString() : o.readyTime }
          : o
      );
    });

    if (newStatus === 'aceitos') orderAccepted();
    else if (newStatus === 'prontos') orderReady();

    try {
      const success = await updateOrder(orderId, backendStatusMap[newStatus]);
      if (!success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: originalStatus } : o));
      }
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: originalStatus } : o));
    } finally {
      updatingRef.current.delete(orderId);
    }
  }, [updateOrder, orderAccepted, orderReady]);

  const togglePaymentStatus = useCallback(async (orderId: string) => {
    if (updatingRef.current.has(orderId)) return;
    updatingRef.current.add(orderId);

    let originalPaymentStatus: 'pending' | 'paid' = 'pending';
    let newPaymentStatus: 'pending' | 'paid' = 'paid';
    setOrders(prev => {
      const current = prev.find(o => o.id === orderId);
      if (!current) return prev;
      originalPaymentStatus = current.paymentStatus;
      newPaymentStatus = current.paymentStatus === 'paid' ? 'pending' : 'paid';
      return prev.map(o => o.id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o);
    });

    try {
      await updateOrder(orderId, undefined, newPaymentStatus === 'paid');
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: originalPaymentStatus } : o));
    } finally {
      updatingRef.current.delete(orderId);
    }
  }, [updateOrder]);

  const updateDeliveryPerson = useCallback((orderId: string, deliveryPerson: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, deliveryPerson } : o));
    updateOrder(orderId, undefined, undefined, deliveryPerson).catch(err =>
      console.error('Erro ao atualizar entregador:', err)
    );
  }, [updateOrder]);

  const cancelOrder = useCallback(async (orderId: string, reason: string, reasonType?: string) => {
    if (updatingRef.current.has(orderId)) return;
    updatingRef.current.add(orderId);

    let originalStatus: Order['status'] = 'recebidos';
    setOrders(prev => {
      const original = prev.find(o => o.id === orderId);
      if (original) originalStatus = original.status;
      return prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' as Order['status'] } : o);
    });

    try {
      const success = await updateOrder(orderId, 'cancelled', undefined, undefined, reasonType || reason);
      if (!success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: originalStatus } : o));
      }
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: originalStatus } : o));
    } finally {
      updatingRef.current.delete(orderId);
    }
  }, [updateOrder]);

  const toggleColumn = (status: string) => {
    setExpandedColumns((prev: Record<string, boolean>) => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const getOrdersByStatus = (status: Order['status']) => {
    return orders.filter((order: Order) => order.status === status);
  };

  const selectedOrder = orders.find((order: Order) => order.id === selectedOrderId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando informações do pedido...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho com botão PDV */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-[1920px] mx-auto p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Pedidos</h1>
              <p className="text-gray-600">Visualize e gerencie todos os pedidos da sua loja</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => window.location.href = '/admin/pdv'}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              >
                <SquarePen className="h-4 w-4" />
                Novo Pedido (PDV)
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto p-6">
        <Tabs defaultValue="painel" className="w-full">
          <TabsList>
            <TabsTrigger value="painel">Painel</TabsTrigger>
            <TabsTrigger value="kds">KDS</TabsTrigger>
          </TabsList>

          <TabsContent value="painel">
            {isMobile ? (
              <div className="space-y-4">
                {Object.entries(statusConfig).map(([status, config]) => {
                  const statusOrders = getOrdersByStatus(status as Order['status']);
                  const isExpanded = expandedColumns[status];
                  
                  return (
                    <div key={status} className="bg-white rounded-2xl shadow-sm">
                      <button
                        onClick={() => toggleColumn(status)}
                        className="w-full p-4 flex items-center justify-between text-center border-b-0"
                      >
                        <div className="flex items-center gap-2 mx-auto">
                          {config.icon}
                          <span className="font-bold text-base text-gray-800">
                            {config.title} ({statusOrders.length})
                          </span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                      
                      {isExpanded && (
                        <div className="px-4 pb-4">
                          {statusOrders.map(order => (
                            <OrderCard
                              key={order.id}
                              order={order}
                              config={config}
                              onUpdateOrderStatus={updateOrderStatus}
                              onTogglePaymentStatus={togglePaymentStatus}
                              onDeliveryPersonChange={updateDeliveryPerson}
                              onOpenOrderDetails={setSelectedOrderId}
                              onCancelOrder={cancelOrder}
                            />
                          ))}
                          {statusOrders.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              Nenhum pedido neste status
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {Object.entries(statusConfig).map(([status, config]) => {
                  const statusOrders = getOrdersByStatus(status as Order['status']);
                  const isExpanded = expandedColumns[status];
                  
                  return (
                    <div key={status} className="bg-white rounded-2xl shadow-sm">
                      <button
                        onClick={() => toggleColumn(status)}
                        className="w-full p-4 flex items-center justify-between text-center border-b-0"
                      >
                        <div className="flex items-center gap-2 mx-auto">
                          {config.icon}
                          <h2 className="font-bold text-base text-gray-800">
                            {config.title} ({statusOrders.length})
                          </h2>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                      
                      {isExpanded && (
                        <div className="p-4 max-h-[80vh] overflow-y-auto">
                          {statusOrders.map(order => (
                            <OrderCard
                              key={order.id}
                              order={order}
                              config={config}
                              onUpdateOrderStatus={updateOrderStatus}
                              onTogglePaymentStatus={togglePaymentStatus}
                              onDeliveryPersonChange={updateDeliveryPerson}
                              onOpenOrderDetails={setSelectedOrderId}
                              onCancelOrder={cancelOrder}
                            />
                          ))}
                          {statusOrders.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              Nenhum pedido
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="kds">
            <div className="bg-white rounded-xs border shadow-sm p-4">
              <KDSBoard
                orders={orders.map((o) => ({
                  id: o.id,
                  customerName: o.customerName,
                  status: o.status,
                  createdAtLabel: o.time,
                  items: (o.socketData.attributes.items.data || []).map((it: any) => ({
                    name: it.attributes.catalog_item?.data?.attributes?.name ?? it.attributes.name ?? 'Item removido',
                    qty: Number(it.attributes.quantity || 1),
                    note: it.attributes.observation || undefined,
                  })),
                }))}
                onMarkReady={(orderId) => updateOrderStatus(orderId, 'prontos')}
                onOpenDetails={(orderId) => setSelectedOrderId(orderId)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          open={!!selectedOrderId}
          onOpenChange={(open) => !open && setSelectedOrderId(null)}
          order={{
            id: selectedOrder.id,
            date: selectedOrder.socketData.attributes.created_at,
            status: selectedOrder.status,
            payment_status: selectedOrder.paymentStatus,
            total: selectedOrder.amount,
            withdrawal: selectedOrder.deliveryType === 'pickup',
            payment_method: selectedOrder.socketData.attributes.payment_method,
            delivery_fee: parseFloat(selectedOrder.socketData.attributes.delivery_fee || '0'),
            address: selectedOrder.socketData.attributes.address.data ? {
              address: selectedOrder.socketData.attributes.address.data.attributes.address,
              neighborhood: selectedOrder.socketData.attributes.address.data.attributes.neighborhood,
              complement: selectedOrder.socketData.attributes.address.data.attributes.complement,
              reference: selectedOrder.socketData.attributes.address.data.attributes.reference
            } : undefined,
            items: selectedOrder.socketData.attributes.items.data.map(item => {
              const catalogAttrs = item.attributes.catalog_item?.data?.attributes;
              return {
              id: item.id,
              catalog_item_id: item.attributes.catalog_item?.data?.id ? parseInt(item.attributes.catalog_item.data.id) : undefined,
              name: catalogAttrs?.name ?? item.attributes.name ?? 'Item removido',
              price: parseFloat(item.attributes.price),
              quantity: item.attributes.quantity,
              observation: item.attributes.observation,
              image: catalogAttrs?.image_url,
              weight: item.attributes.item_type === 'weight_per_kg' ? `${item.attributes.quantity}kg` : undefined,
              extras: catalogAttrs?.extra?.data?.map((extra: any) => ({
                name: extra.attributes.name,
                price: parseFloat(extra.attributes.price)
              })) || [],
              prepare_methods: catalogAttrs?.prepare_method?.data?.map((method: any) => ({
                name: method.attributes.name
              })) || [],
              steps: catalogAttrs?.steps?.data?.map((step: any) => ({
                name: step.attributes.name,
                options: step.attributes.options?.data?.map((option: any) => ({
                  name: option.attributes.name
                })) || []
              })) || []
            };
            }),
            shop: {
              name: selectedOrder.socketData.attributes.shop.data.attributes.name,
              phone: selectedOrder.socketData.attributes.shop.data.attributes.cellphone
            },
            customer: selectedOrder.socketData.attributes.customer?.data ? {
            name: selectedOrder.socketData.attributes.customer.data.attributes.name,
            phone: selectedOrder.socketData.attributes.customer.data.attributes.cellphone
            } : undefined,
            deliveryPerson: selectedOrder.deliveryPerson || (selectedOrder.socketData.attributes as any).delivery_person || ''
          }}
          onUpdateOrder={async (orderId, data) => {
            // Atualizar estado local imediatamente (feedback otimista)
            setOrders(prev => prev.map(order => {
              if (order.id !== orderId) return order;
              const o = { ...order };
              const attrs = o.socketData?.attributes as any;

              if (data.customer?.name)  o.customerName = data.customer.name;
              if (data.customer?.phone && attrs?.customer?.data?.attributes)
                attrs.customer.data.attributes.cellphone = data.customer.phone;

              if (data.address && attrs?.address?.data?.attributes)
                Object.assign(attrs.address.data.attributes, data.address);

              if (data.deliveryPerson !== undefined) {
                o.deliveryPerson = data.deliveryPerson;
                if (attrs) attrs.delivery_person = data.deliveryPerson;
              }

              if (data.payment_method !== undefined && attrs)
                attrs.payment_method = data.payment_method;

              if (data.payment_status !== undefined)
                o.paymentStatus = data.payment_status as 'pending' | 'paid';

              if (data.delivery_fee !== undefined && attrs)
                attrs.delivery_fee = String(data.delivery_fee);

              if (data.total !== undefined) o.amount = data.total;

              return o;
            }));

            // Enviar via WebSocket
            try {
              await updateOrderDetails(orderId, data);
            } catch (error) {
              console.error('Erro ao atualizar pedido:', error);
            }
          }}
          onCancelOrder={async (orderId) => {
            // Atualizar localmente para status 'cancelled'
            setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: 'cancelled' } : order));
            // Atualizar via WebSocket para status cancelado
            if (updateOrder) {
              await updateOrder(orderId, 'cancelled');
            }
          }}
        />
      )}
    </div>
  );
}