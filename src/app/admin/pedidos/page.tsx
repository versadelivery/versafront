'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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

interface Order {
  id: string;
  customerName: string;
  amount: number;
  time: string;
  deliveryPerson?: string;
  status: 'recebidos' | 'aceitos' | 'em_analise' | 'em_preparo' | 'prontos';
  paymentStatus: 'pending' | 'paid';
  readyTime?: string;
  deliveryType: 'delivery' | 'pickup';
  socketData: AdminOrderData;
}

const mockDeliveryPeople = [
  { id: '1', name: 'Freire' },
  { id: '2', name: 'Maikon' },
  { id: '3', name: 'Matheus' },
  { id: '4', name: 'Leo' },
  { id: '5', name: 'João' },
  { id: '6', name: 'Pedro' },
];

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
    'ready': 'prontos'
  };

  // Calcular valor total dos itens
  const totalItemsPrice = socketOrder.attributes.items.data.reduce((sum, item) => {
    return sum + parseFloat(item.attributes.total_price || '0');
  }, 0);

  // Calcular valor total com taxa de entrega
  const deliveryFee = parseFloat(socketOrder.attributes.delivery_fee || '0');
  const totalPrice = parseFloat(socketOrder.attributes.total_price || '0') || (totalItemsPrice + deliveryFee);

  return {
    id: socketOrder.id,
    customerName: socketOrder.attributes.customer.data.attributes.name,
    amount: totalPrice,
    time,
    deliveryPerson: undefined, // Será definido pelo admin
    status: statusMap[socketOrder.attributes.status] || 'recebidos',
    paymentStatus: 'pending', // Será gerenciado pelo admin
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
    title: 'PRONTOS', 
    color: 'bg-primary', 
    textColor: 'text-white',
    bgColor: 'bg-primary',
    icon: <CheckCircle className="w-4 h-4 text-primary" />
  }
};

const mapOrderStatus = (status: Order['status']) => {
  const statusMap = {
    recebidos: 'processing',
    aceitos: 'processing',
    em_analise: 'processing',
    em_preparo: 'preparing',
    prontos: 'in_transit'
  };
  return statusMap[status] || 'processing';
};

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedColumns, setExpandedColumns] = useState<Record<string, boolean>>({
    recebidos: true,
    aceitos: true,
    em_analise: true,
    em_preparo: true,
    prontos: true
  });
  const [isMobile, setIsMobile] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { subscribeToAdminOrders, isConnected } = useAdminActionCable();

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
      console.log('Recebendo dados dos pedidos:', socketOrders);
      const convertedOrders = socketOrders.map(convertSocketDataToOrder);
      setOrders(convertedOrders);
      setIsLoading(false);
    });

    // Timeout para parar o loading se não receber dados em 10 segundos
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 10000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [subscribeToAdminOrders]);

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: newStatus,
            readyTime: newStatus === 'prontos' ? new Date().toLocaleTimeString() : order.readyTime
          }
        : order
    ));
  };

  const togglePaymentStatus = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, paymentStatus: order.paymentStatus === 'pending' ? 'paid' : 'pending' }
        : order
    ));
  };

  const updateDeliveryPerson = (orderId: string, deliveryPerson: string) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, deliveryPerson }
        : order
    ));
  };

  const toggleColumn = (status: string) => {
    setExpandedColumns(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const getOrdersByStatus = (status: Order['status']) => {
    return orders.filter(order => order.status === status);
  };

  const selectedOrder = orders.find(order => order.id === selectedOrderId);

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

      <div className="max-w-[1920px] mx-auto p-6">
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
                          mockDeliveryPeople={mockDeliveryPeople}
                          onUpdateOrderStatus={updateOrderStatus}
                          onTogglePaymentStatus={togglePaymentStatus}
                          onDeliveryPersonChange={updateDeliveryPerson}
                          onOpenOrderDetails={setSelectedOrderId}
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
                          mockDeliveryPeople={mockDeliveryPeople}
                          onUpdateOrderStatus={updateOrderStatus}
                          onTogglePaymentStatus={togglePaymentStatus}
                          onDeliveryPersonChange={updateDeliveryPerson}
                          onOpenOrderDetails={setSelectedOrderId}
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
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          open={!!selectedOrderId}
          onOpenChange={(open) => !open && setSelectedOrderId(null)}
          order={{
            id: selectedOrder.id,
            date: selectedOrder.socketData.attributes.created_at,
            status: mapOrderStatus(selectedOrder.status),
            payment_status: selectedOrder.paymentStatus,
            total: selectedOrder.amount,
            withdrawal: selectedOrder.deliveryType === 'pickup',
            payment_method: selectedOrder.socketData.attributes.payment_method,
            address: selectedOrder.socketData.attributes.address.data ? {
              address: selectedOrder.socketData.attributes.address.data.attributes.address,
              neighborhood: selectedOrder.socketData.attributes.address.data.attributes.neighborhood,
              complement: selectedOrder.socketData.attributes.address.data.attributes.complement,
              reference: selectedOrder.socketData.attributes.address.data.attributes.reference
            } : undefined,
            items: selectedOrder.socketData.attributes.items.data.map(item => ({
              id: item.id,
              catalog_item_id: parseInt(item.attributes.catalog_item.data.id),
              name: item.attributes.catalog_item.data.attributes.name,
              price: parseFloat(item.attributes.price),
              quantity: item.attributes.quantity,
              observation: item.attributes.observation,
              image: item.attributes.catalog_item.data.attributes.image_url,
              weight: item.attributes.item_type === 'weight_per_kg' ? `${item.attributes.quantity}kg` : undefined,
              extras: item.attributes.catalog_item.data.attributes.extra?.data?.map((extra: any) => ({
                name: extra.attributes.name,
                price: parseFloat(extra.attributes.price)
              })) || [],
              prepare_methods: item.attributes.catalog_item.data.attributes.prepare_method?.data?.map((method: any) => ({
                name: method.attributes.name
              })) || [],
              steps: item.attributes.catalog_item.data.attributes.steps?.data?.map((step: any) => ({
                name: step.attributes.name,
                options: step.attributes.options?.data?.map((option: any) => ({
                  name: option.attributes.name
                })) || []
              })) || []
            })),
            shop: {
              name: selectedOrder.socketData.attributes.shop.data.attributes.name,
              phone: selectedOrder.socketData.attributes.shop.data.attributes.cellphone
            },
            customer: {
              name: selectedOrder.socketData.attributes.customer.data.attributes.name,
              phone: selectedOrder.socketData.attributes.customer.data.attributes.cellphone
            }
          }}
        />
      )}
    </div>
  );
}