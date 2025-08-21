'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { useRestaurantSounds } from '@/hooks/use-restaurant-sounds';
import { SoundSettings } from '@/components/admin/sound-settings';

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

  const paidAt = (socketOrder.attributes as any).paid_at || (socketOrder.attributes as any).paidAt
  const paymentStatus: Order['paymentStatus'] = paidAt ? 'paid' : 'pending'

  return {
    id: socketOrder.id,
    customerName: socketOrder.attributes.customer.data.attributes.name,
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
  const isUpdatingRef = useRef<Record<string, boolean>>({});
  const lastLocalChangeRef = useRef<Record<string, { statusAt?: number; paymentAt?: number }>>({});
  const socketOrdersCache = useRef<Map<string, Order>>(new Map());

  const { subscribeToAdminOrders, updateOrder, isConnected } = useAdminActionCable();
  const { orderAccepted, orderReady, newOrder, updateSettings } = useRestaurantSounds();

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
      console.log(socketOrders);
      
      // Verificar se algum pedido está sendo atualizado no momento
      const hasUpdatingOrders = Object.keys(isUpdatingRef.current).some(
        orderId => isUpdatingRef.current[orderId]
      );
      
      if (hasUpdatingOrders) {
        console.log('⏳ Ignorando atualização do WebSocket - pedidos sendo atualizados localmente');
        // Aplicar atualização com delay para não conflitar com otimistic update
        setTimeout(() => {
          const convertedOrders = socketOrders.map(convertSocketDataToOrder);
          // atualizar cache com dados vindos do servidor
          socketOrdersCache.current = new Map(convertedOrders.map(o => [o.id, o]));
          console.log(socketOrders)
          setOrders((prev) => {
            const now = Date.now();
            const prevById = new Map(prev.map(o => [o.id, o]));
            return convertedOrders.map(incoming => {
              const current = prevById.get(incoming.id);
              if (!current) return incoming;
              const last = lastLocalChangeRef.current[incoming.id] || {};
              const keepLocalStatus = last.statusAt !== undefined && (now - (last.statusAt as number)) < 4000;
              const keepLocalPayment = last.paymentAt !== undefined && (now - (last.paymentAt as number)) < 4000;
              return {
                ...current,
                ...incoming,
                status: keepLocalStatus ? current.status : incoming.status,
                paymentStatus: keepLocalPayment ? current.paymentStatus : incoming.paymentStatus,
              };
            });
          });
        }, 3000); // 3 segundos de delay
        return;
      }
      
      // Detectar novos pedidos comparando com o estado atual
      setOrders((prevOrders) => {
        const convertedOrders = socketOrders.map(convertSocketDataToOrder);
        // atualizar cache com dados vindos do servidor
        socketOrdersCache.current = new Map(convertedOrders.map(o => [o.id, o]));
        
        // Verificar se há novos pedidos (pedidos que não existiam antes)
        const newOrders = convertedOrders.filter(socketOrder => 
          !prevOrders.some(prevOrder => prevOrder.id === socketOrder.id)
        );
        
        // Se há novos pedidos, tocar som de notificação
        if (newOrders.length > 0 && prevOrders.length > 0) {
          console.log('🆕 Novos pedidos detectados:', newOrders.length);
          newOrder();
        }

        // Mesclar mantendo alterações locais recentes
        const now = Date.now();
        const prevById = new Map(prevOrders.map(o => [o.id, o]));
        return convertedOrders.map(incoming => {
          const current = prevById.get(incoming.id);
          if (!current) return incoming;
          const last = lastLocalChangeRef.current[incoming.id] || {};
          const keepLocalStatus = last.statusAt !== undefined && (now - (last.statusAt as number)) < 4000;
          const keepLocalPayment = last.paymentAt !== undefined && (now - (last.paymentAt as number)) < 4000;
          return {
            ...current,
            ...incoming,
            status: keepLocalStatus ? current.status : incoming.status,
            paymentStatus: keepLocalPayment ? current.paymentStatus : incoming.paymentStatus,
          };
        });
      });
      
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
  }, []); // Remover dependência subscribeToAdminOrders

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: Order['status']) => {
    console.log('🚀 Iniciando atualização de status:', orderId, newStatus);
    
    // Verificar se já está atualizando
    if (isUpdatingRef.current[orderId]) {
      console.log('⏳ Já está atualizando o pedido:', orderId);
      return;
    }

    // Marcar como atualizando
    isUpdatingRef.current[orderId] = true;

    // Mapear status do frontend para o backend
    const statusMap: Record<Order['status'], string> = {
      'recebidos': 'received',
      'aceitos': 'accepted',
      'em_analise': 'in_analysis',
      'em_preparo': 'in_preparation',
      'prontos': 'ready'
    };

    const backendStatus = statusMap[newStatus];
    
    // Primeiro atualizar o estado local de forma otimista
    setOrders((prevOrders: Order[]) => {
      return prevOrders.map((order: Order) => 
        order.id === orderId 
          ? { 
              ...order, 
              status: newStatus,
              readyTime: newStatus === 'prontos' ? new Date().toLocaleTimeString() : order.readyTime
            }
          : order
      );
    });
    // registrar momento da alteração local do status
    lastLocalChangeRef.current[orderId] = {
      ...(lastLocalChangeRef.current[orderId] || {}),
      statusAt: Date.now(),
    };

    // Tocar som baseado no novo status
    if (newStatus === 'aceitos') {
      orderAccepted();
    } else if (newStatus === 'prontos') {
      orderReady();
    }

    try {
      // Enviar via websocket e aguardar resposta
      const success = await updateOrder(orderId, backendStatus);
      
      if (success) {
        console.log('✅ Atualização confirmada pelo backend:', orderId, backendStatus);
      } else {
        console.log('❌ Falha confirmada pelo backend, revertendo:', orderId);
        // Reverter atualização otimista em caso de falha para o status vindo do servidor mais recente
        setOrders((prevOrders: Order[]) => {
          const current = prevOrders.find(o => o.id === orderId);
          const serverOrder = socketOrdersCache.current.get(orderId);
          const fallbackStatus = serverOrder?.status || current?.status || 'recebidos';
          return prevOrders.map((order: Order) => 
            order.id === orderId 
              ? { ...order, status: fallbackStatus as Order['status'] }
              : order
          );
        });
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar status do pedido:', error);
      // Reverter atualização otimista em caso de erro
      setOrders((prevOrders: Order[]) => {
        const current = prevOrders.find(o => o.id === orderId);
        const serverOrder = socketOrdersCache.current.get(orderId);
        const fallbackStatus = serverOrder?.status || current?.status || 'recebidos';
        return prevOrders.map((order: Order) => 
          order.id === orderId 
            ? { ...order, status: fallbackStatus as Order['status'] }
            : order
        );
      });
    } finally {
      // Sempre limpar a flag após 2 segundos (dar tempo para o websocket responder)
      setTimeout(() => {
        console.log(`🔓 Limpando flag de atualização para pedido ${orderId}`);
        delete isUpdatingRef.current[orderId];
      }, 2000);
    }
  }, [updateOrder]);

  const togglePaymentStatus = useCallback((orderId: string) => {
    // Evitar múltiplas execuções usando ref
    if (isUpdatingRef.current[orderId]) {
      console.log('Já está atualizando pagamento do pedido:', orderId);
      return;
    }

    console.log('Iniciando toggle de pagamento:', orderId);
    isUpdatingRef.current[orderId] = true;

    // Encontrar pedido atual e determinar novo status
    let newPaymentStatus: 'pending' | 'paid' = 'pending';
    
    setOrders((prevOrders: Order[]) => {
      const currentOrder = prevOrders.find((order: Order) => order.id === orderId);
      if (!currentOrder) {
        console.error('Pedido não encontrado:', orderId);
        isUpdatingRef.current[orderId] = false;
        return prevOrders;
      }

      newPaymentStatus = currentOrder.paymentStatus === 'pending' ? 'paid' : 'pending';
      
      // Atualizar estado local de forma otimista
      const updatedOrders = prevOrders.map((order: Order) => 
        order.id === orderId 
          ? { ...order, paymentStatus: newPaymentStatus }
          : order
      );

      // Enviar via websocket após atualizar estado
      try {
        updateOrder(orderId, undefined, newPaymentStatus === 'paid');
        console.log('Toggle de pagamento enviado via websocket:', orderId, newPaymentStatus);
      } catch (error) {
        console.error('Erro ao atualizar status de pagamento:', error);
      }

      return updatedOrders;
    });

    // registrar momento da alteração local do pagamento
    lastLocalChangeRef.current[orderId] = {
      ...(lastLocalChangeRef.current[orderId] || {}),
      paymentAt: Date.now(),
    };

    // Liberar o lock após um delay
    setTimeout(() => {
      isUpdatingRef.current[orderId] = false;
      console.log('Lock de pagamento liberado para pedido:', orderId);
    }, 2000);
  }, [updateOrder]);

  const updateDeliveryPerson = (orderId: string, deliveryPerson: string) => {
    setOrders(orders.map((order: Order) => 
      order.id === orderId 
        ? { ...order, deliveryPerson }
        : order
    ));
  };

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
              <SoundSettings onSettingsChange={updateSettings} />
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
            },
            deliveryPerson: selectedOrder.deliveryPerson || ''
          }}
          onUpdateOrder={async (orderId, data) => {
            // Atualizar localmente
            setOrders(prev => prev.map(order => order.id === orderId ? { ...order, ...data } : order));
            // Atualizar via WebSocket se for entregador
            if (data.deliveryPerson && updateOrder) {
              await updateOrder(orderId, undefined, undefined, data.deliveryPerson);
            }
            // Atualizar outros campos se necessário (exemplo: nome, telefone, etc)
            // Aqui você pode adicionar lógica para outros campos se a API permitir
          }}
          onCancelOrder={async (orderId) => {
            // Atualizar localmente para status 'recebidos' (frontend) e 'cancelled' (backend)
            setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: 'recebidos' } : order));
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