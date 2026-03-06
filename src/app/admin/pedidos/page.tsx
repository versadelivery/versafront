'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { KDSBoard } from '@/components/admin/kds-board';
import { Button } from '@/components/ui/button';
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
  ArrowRight,
  Router,
  ArrowLeft,
  Search,
  Filter,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import OrderDetailsModal from '@/components/admin/order-details-modal';
import { formatPrice } from '@/app/(public)/[slug]/format-price';
import { useAdminActionCable, AdminOrderData } from '@/lib/admin-cable';
import OrderCard from '@/components/admin/order-card';
import { useRestaurantSounds } from '@/hooks/use-restaurant-sounds';
import { useShop } from '@/hooks/use-shop';
import AdminHeader from '@/components/admin/catalog-header';
import { useRouter } from 'next/navigation';
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

const mapOrderStatus = (status: Order['status']) => {
  const statusMap = {
    recebidos: 'processing',
    aceitos: 'processing',
    em_analise: 'processing',
    em_preparo: 'preparing',
    prontos: 'in_transit',
    saiu: 'in_transit',
    entregue: 'delivered',
    cancelled: 'cancelled'
  };
  return statusMap[status] || 'processing';
};

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickSearchId, setQuickSearchId] = useState('');
  const [filterDeliveryType, setFilterDeliveryType] = useState<'all' | 'delivery' | 'pickup'>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<'all' | 'cash' | 'debit' | 'credit' | 'manual_pix'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | Order['status']>('all');
  const [showFilters, setShowFilters] = useState(false);
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
  const isUpdatingRef = useRef<Record<string, boolean>>({});
  const lastLocalChangeRef = useRef<Record<string, { statusAt?: number; paymentAt?: number }>>({});
  const socketOrdersCache = useRef<Map<string, Order>>(new Map());

  const { subscribeToAdminOrders, updateOrder, updateOrderDetails, isConnected } = useAdminActionCable();
  const { orderAccepted, orderReady, newOrder, orderOverdue } = useRestaurantSounds();
  const { shop } = useShop();
  const estimatedPrepTime = shop?.estimated_prep_time ?? null;
  const estimatedDeliveryTime = shop?.estimated_delivery_time ?? null;
  const seenOrderIdsRef = useRef<Set<string>>(new Set());
  const overdueAlertedRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = subscribeToAdminOrders((socketOrders: AdminOrderData[]) => {
      
      // Verificar se algum pedido está sendo atualizado no momento
      const hasUpdatingOrders = Object.keys(isUpdatingRef.current).some(
        orderId => isUpdatingRef.current[orderId]
      );
      
      if (hasUpdatingOrders) {
        // Aplicar atualização com delay para não conflitar com otimistic update
        setTimeout(() => {
          const convertedOrders = socketOrders.map(convertSocketDataToOrder);
          // atualizar cache com dados vindos do servidor
          socketOrdersCache.current = new Map(convertedOrders.map(o => [o.id, o]));
          setOrders((prev) => {
            const now = Date.now();
            const prevById = new Map(prev.map(o => [o.id, o]));
            return convertedOrders.map(incoming => {
              const current = prevById.get(incoming.id);
              if (!current) return incoming;
              const last = lastLocalChangeRef.current[incoming.id] || {};
              const keepLocalStatus = last.statusAt !== undefined && (now - (last.statusAt as number)) < 5000; // Aumentado para 5 segundos
              const keepLocalPayment = last.paymentAt !== undefined && (now - (last.paymentAt as number)) < 5000;
              
              
              return {
                ...current,
                ...incoming,
                status: keepLocalStatus ? current.status : incoming.status,
                paymentStatus: keepLocalPayment ? current.paymentStatus : incoming.paymentStatus,
              };
            });
          });
        }, 2000); // Reduzido para 2 segundos
        return;
      }
      
      // Detectar novos pedidos comparando com o estado atual
      setOrders((prevOrders) => {
        const convertedOrders = socketOrders.map(convertSocketDataToOrder);
        // atualizar cache com dados vindos do servidor
        socketOrdersCache.current = new Map(convertedOrders.map(o => [o.id, o]));
        
        // No primeiro broadcast, apenas registrar os pedidos existentes sem tocar som
        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
          convertedOrders.forEach(order => seenOrderIdsRef.current.add(order.id));
        } else {
          // Verificar se há novos pedidos (pedidos que não existiam antes)
          const newOrders = convertedOrders.filter(socketOrder =>
            !prevOrders.some(prevOrder => prevOrder.id === socketOrder.id)
          );

          // Tocar som de novo pedido para pedidos genuinamente novos
          newOrders.forEach(order => {
            if (!seenOrderIdsRef.current.has(order.id)) {
              seenOrderIdsRef.current.add(order.id);
              newOrder();
            }
          });

          // Registrar todos os pedidos atuais como vistos
          convertedOrders.forEach(order => seenOrderIdsRef.current.add(order.id));
        }

        // Mesclar mantendo alterações locais recentes
        const now = Date.now();
        const prevById = new Map(prevOrders.map(o => [o.id, o]));
        return convertedOrders.map(incoming => {
          const current = prevById.get(incoming.id);
          if (!current) return incoming;
          const last = lastLocalChangeRef.current[incoming.id] || {};
          const keepLocalStatus = last.statusAt !== undefined && (now - (last.statusAt as number)) < 5000; // Aumentado para 5 segundos
          const keepLocalPayment = last.paymentAt !== undefined && (now - (last.paymentAt as number)) < 5000;
          
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

  // Alerta sonoro para pedidos atrasados (preparo e entrega)
  useEffect(() => {
    if (orders.length === 0) return;
    if (!estimatedPrepTime && !estimatedDeliveryTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      orders.forEach((order) => {
        if (overdueAlertedRef.current.has(order.id)) return;

        // Atraso no preparo
        if (['aceitos', 'em_analise', 'em_preparo'].includes(order.status) && estimatedPrepTime) {
          const acceptedAt = order.socketData?.attributes?.accepted_at;
          if (!acceptedAt) return;
          const t = new Date(acceptedAt).getTime();
          if (!isNaN(t) && now > t + estimatedPrepTime * 60 * 1000) {
            overdueAlertedRef.current.add(order.id);
            orderOverdue();
          }
        }

        // Atraso na entrega (conta a partir de pronto)
        if (['prontos', 'saiu'].includes(order.status) && estimatedDeliveryTime) {
          const readyAt = order.socketData?.attributes?.ready_at;
          if (!readyAt) return;
          const t = new Date(readyAt).getTime();
          if (!isNaN(t) && now > t + estimatedDeliveryTime * 60 * 1000) {
            overdueAlertedRef.current.add(order.id);
            orderOverdue();
          }
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [orders, estimatedPrepTime, estimatedDeliveryTime, orderOverdue]);

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: Order['status']) => {

    // Marcar como atualizando
    isUpdatingRef.current[orderId] = true;

    // Mapear status do frontend para o backend
    const statusMap: Record<Order['status'], string> = {
      'recebidos': 'received',
      'aceitos': 'accepted',
      'em_analise': 'in_analysis',
      'em_preparo': 'in_preparation',
      'prontos': 'ready',
      'saiu': 'left_for_delivery',
      'entregue': 'delivered',
      'cancelled': 'cancelled'
    };

    const backendStatus = statusMap[newStatus];
    
    // Primeiro atualizar o estado local de forma otimista
    setOrders((prevOrders: Order[]) => {
      const updatedOrders = prevOrders.map((order: Order) => 
        order.id === orderId 
          ? { 
              ...order, 
              status: newStatus,
              readyTime: newStatus === 'prontos' ? new Date().toLocaleTimeString() : order.readyTime
            }
          : order
      );
      return updatedOrders;
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
      } else {
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
      // Sempre limpar a flag após 3 segundos (dar tempo para o websocket responder)
      setTimeout(() => {
        delete isUpdatingRef.current[orderId];
      }, 3000);
    }
  }, [updateOrder]);

  const togglePaymentStatus = useCallback((orderId: string) => {
    // Evitar múltiplas execuções usando ref
    if (isUpdatingRef.current[orderId]) {
      return;
    }

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
    }, 2000);
  }, [updateOrder]);

  const updateDeliveryPerson = (orderId: string, deliveryPerson: string) => {
    setOrders(orders.map((order: Order) => 
      order.id === orderId 
        ? { ...order, deliveryPerson }
        : order
    ));
  };

  const cancelOrder = useCallback(async (orderId: string, reason: string, reasonType?: string) => {
    
    // Verificar se já está atualizando
    if (isUpdatingRef.current[orderId]) {
      return;
    }

    // Marcar como atualizando
    isUpdatingRef.current[orderId] = true;

    // Atualizar estado local de forma otimista
    setOrders((prevOrders: Order[]) => {
      const updatedOrders = prevOrders.map((order: Order) => 
        order.id === orderId 
          ? { ...order, status: 'cancelled' as Order['status'] }
          : order
      );
      
      return updatedOrders;
    });

    try {
      // Enviar cancelamento via websocket
      const success = await updateOrder(orderId, 'cancelled', undefined, undefined, reasonType || reason);
      
      if (success) {
      } else {
        // Reverter cancelamento otimista em caso de falha
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
      console.error('❌ Erro ao cancelar pedido:', error);
      // Reverter cancelamento otimista em caso de erro
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
      // Sempre limpar a flag após 3 segundos
      setTimeout(() => {
        delete isUpdatingRef.current[orderId];
      }, 3000);
    }
  }, [updateOrder]);

  const toggleColumn = (status: string) => {
    setExpandedColumns((prev: Record<string, boolean>) => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const filteredOrders = React.useMemo(() => {
    return orders.filter((order: Order) => {
      // Filtro por busca textual (ID, nome do cliente, telefone)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchId = order.id.toString().includes(q);
        const matchName = order.customerName?.toLowerCase().includes(q);
        const customerPhone = order.socketData?.attributes?.customer?.data?.attributes?.cellphone ||
                              (order.socketData?.attributes?.customer as any)?.cellphone || '';
        const matchPhone = customerPhone.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchPhone) return false;
      }

      // Filtro por tipo de entrega
      if (filterDeliveryType !== 'all') {
        if (filterDeliveryType === 'pickup' && order.deliveryType !== 'pickup') return false;
        if (filterDeliveryType === 'delivery' && order.deliveryType !== 'delivery') return false;
      }

      // Filtro por forma de pagamento
      if (filterPaymentMethod !== 'all') {
        if (order.socketData?.attributes?.payment_method !== filterPaymentMethod) return false;
      }

      // Filtro por status
      if (filterStatus !== 'all') {
        if (order.status !== filterStatus) return false;
      }

      return true;
    });
  }, [orders, searchQuery, filterDeliveryType, filterPaymentMethod, filterStatus]);

  const handleQuickSearch = useCallback(() => {
    const id = quickSearchId.trim();
    if (!id) return;
    const found = orders.find((o) => o.id.toString() === id);
    if (found) {
      setSelectedOrderId(found.id);
      setQuickSearchId('');
    }
  }, [quickSearchId, orders]);

  const hasActiveFilters = searchQuery.trim() !== '' || filterDeliveryType !== 'all' || filterPaymentMethod !== 'all' || filterStatus !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterDeliveryType('all');
    setFilterPaymentMethod('all');
    setFilterStatus('all');
  };

  const getOrdersByStatus = (status: Order['status']) => {
    return filteredOrders.filter((order: Order) => order.status === status);
  };

  const selectedOrder = orders.find((order: Order) => order.id === selectedOrderId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a
                href="/admin"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">Voltar</span>
              </a>
              <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
              <h1 className="text-base sm:text-lg font-bold text-gray-900">
                Pedidos
              </h1>
            </div>

            <Button
              onClick={() => window.location.href = '/admin/pdv'}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 rounded-md h-9 text-sm"
            >
              <SquarePen className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Pedido</span>
              <span className="sm:hidden">PDV</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-4">
        {/* Busca rápida por ID + Busca geral + Filtros */}
        <div className="mb-4 space-y-3">
          {/* Linha principal: Busca rápida por ID e busca geral */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Busca rápida por ID */}
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="N° do pedido..."
                  value={quickSearchId}
                  onChange={(e) => setQuickSearchId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch()}
                  className="pl-9 w-40 sm:w-48 rounded-md border-[#E5E2DD]"
                />
              </div>
              <Button
                onClick={handleQuickSearch}
                variant="outline"
                size="default"
                className="rounded-md border border-gray-300 cursor-pointer"
              >
                Ir
              </Button>
            </div>

            {/* Busca geral por nome/telefone/ID */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por ID, nome do cliente ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-md border-[#E5E2DD]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Botão de filtros */}
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 whitespace-nowrap rounded-md border border-gray-300 cursor-pointer"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-1 h-5 w-5 flex items-center justify-center text-xs rounded-md bg-primary text-white font-semibold">
                  !
                </span>
              )}
            </Button>
          </div>

          {/* Painel de filtros avançados */}
          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-3 p-4 bg-white rounded-md border border-[#E5E2DD]">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Tipo</label>
                <Select value={filterDeliveryType} onValueChange={(v) => setFilterDeliveryType(v as any)}>
                  <SelectTrigger className="rounded-md border-[#E5E2DD] cursor-pointer">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="pickup">Retirada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Pagamento</label>
                <Select value={filterPaymentMethod} onValueChange={(v) => setFilterPaymentMethod(v as any)}>
                  <SelectTrigger className="rounded-md border-[#E5E2DD] cursor-pointer">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="manual_pix">PIX</SelectItem>
                    <SelectItem value="credit">Cartão de Crédito</SelectItem>
                    <SelectItem value="debit">Cartão de Débito</SelectItem>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
                  <SelectTrigger className="rounded-md border-[#E5E2DD] cursor-pointer">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="recebidos">Recebidos</SelectItem>
                    <SelectItem value="aceitos">Aceitos</SelectItem>
                    <SelectItem value="em_analise">Em Análise</SelectItem>
                    <SelectItem value="em_preparo">Em Preparo</SelectItem>
                    <SelectItem value="prontos">Entrega</SelectItem>
                    <SelectItem value="saiu">Saiu para Entrega</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                    <SelectItem value="cancelled">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button variant="ghost" onClick={clearAllFilters} className="text-sm text-muted-foreground rounded-md cursor-pointer">
                    <X className="h-4 w-4 mr-1" />
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Indicador de filtros ativos */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Mostrando {filteredOrders.length} de {orders.length} pedidos</span>
            </div>
          )}
        </div>

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
                    <div key={status} className="bg-white rounded-md border border-[#E5E2DD]">
                      <button
                        onClick={() => toggleColumn(status)}
                        className="w-full px-4 py-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${config.color}`} />
                          <span className="font-semibold text-sm text-gray-900">
                            {config.title}
                          </span>
                          <span className="text-sm text-muted-foreground">({statusOrders.length})</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </button>

                      {isExpanded && (
                        <div className="px-3 pb-3 border-t border-[#E5E2DD]">
                          {statusOrders.map(order => (
                            <OrderCard
                              key={order.id}
                              order={order}
                              config={config}
                              estimatedPrepTime={estimatedPrepTime}
                              estimatedDeliveryTime={estimatedDeliveryTime}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Object.entries(statusConfig).map(([status, config]) => {
                  const statusOrders = getOrdersByStatus(status as Order['status']);
                  const isExpanded = expandedColumns[status];

                  return (
                    <div key={status} className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
                      <button
                        onClick={() => toggleColumn(status)}
                        className="w-full px-4 py-3 flex items-center justify-between border-b border-[#E5E2DD]"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${config.color}`} />
                          <h2 className="font-semibold text-sm text-gray-900">
                            {config.title}
                          </h2>
                          <span className="text-sm text-muted-foreground">({statusOrders.length})</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </button>

                      {isExpanded && (
                        <div className="p-3 max-h-[80vh] overflow-y-auto bg-[#FAF9F7]">
                          {statusOrders.map(order => (
                            <OrderCard
                              key={order.id}
                              order={order}
                              config={config}
                              estimatedPrepTime={estimatedPrepTime}
                              estimatedDeliveryTime={estimatedDeliveryTime}
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
            <div className="bg-white rounded-md border border-[#E5E2DD] p-4">
              <KDSBoard
                orders={filteredOrders.map((o) => ({
                  id: o.id,
                  customerName: o.customerName,
                  status: o.status,
                  createdAtLabel: o.time,
                  acceptedAt: o.socketData.attributes.accepted_at || null,
                  readyAt: o.socketData.attributes.ready_at || null,
                  items: (o.socketData.attributes.items.data || []).map((it: any) => ({
                    name: it.attributes.catalog_item?.data?.attributes?.name || it.attributes.name || 'Item não encontrado',
                    qty: Number(it.attributes.quantity || 1),
                    note: it.attributes.observation || undefined,
                  })),
                }))}
                estimatedPrepTime={estimatedPrepTime}
                estimatedDeliveryTime={estimatedDeliveryTime}
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
            status: mapOrderStatus(selectedOrder.status),
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
            items: selectedOrder.socketData.attributes.items.data.map(item => ({
              id: item.id,
              catalog_item_id: item.attributes.catalog_item?.data?.id ? parseInt(item.attributes.catalog_item.data.id) : null,
              name: item.attributes.catalog_item?.data?.attributes?.name || item.attributes.name || 'Item não encontrado',
              price: parseFloat(item.attributes.price_with_discount || item.attributes.price),
              total_price: parseFloat(item.attributes.total_price || '0'),
              quantity: item.attributes.quantity,
              observation: item.attributes.observation,
              image: item.attributes.catalog_item?.data?.attributes?.image_url,
              weight: item.attributes.item_type === 'weight_per_kg' ? `${item.attributes.quantity}kg` : undefined,
              extras: item.attributes.catalog_item?.data?.attributes?.extra?.data?.map((extra: any) => ({
                name: extra.attributes.name,
                price: parseFloat(extra.attributes.price)
              })) || [],
              prepare_methods: item.attributes.catalog_item?.data?.attributes?.prepare_method?.data?.map((method: any) => ({
                name: method.attributes.name
              })) || [],
              steps: item.attributes.catalog_item?.data?.attributes?.steps?.data?.map((step: any) => ({
                name: step.attributes.name,
                options: step.attributes.options?.data?.map((option: any) => ({
                  name: option.attributes.name
                })) || []
              })) || [],
              complements: (item.attributes as any).complements?.map((comp: any) => ({
                name: comp.name,
                price: parseFloat(comp.price)
              })) || []
            })),
            shop: {
              name: selectedOrder.socketData.attributes.shop.data.attributes.name,
              phone: selectedOrder.socketData.attributes.shop.data.attributes.cellphone
            },
            customer: selectedOrder.socketData.attributes.customer?.data ? {
            name: selectedOrder.socketData.attributes.customer.data.attributes.name,
            phone: selectedOrder.socketData.attributes.customer.data.attributes.cellphone
            } : {
              name: (selectedOrder.socketData.attributes.customer as any)?.name || 'Cliente',
              phone: (selectedOrder.socketData.attributes.customer as any)?.cellphone || ''
            },
            deliveryPerson: selectedOrder.deliveryPerson || (selectedOrder.socketData.attributes as any).delivery_person || '',
            discount_amount: parseFloat(selectedOrder.socketData.attributes.discount_amount || '0'),
            payment_adjustment_amount: parseFloat(selectedOrder.socketData.attributes.payment_adjustment_amount || '0'),
            coupon_code: selectedOrder.socketData.attributes.coupon_code || undefined
          }}
          onUpdateOrder={async (orderId, data) => {
            
            // Atualizar localmente primeiro para feedback imediato
            setOrders(prev => prev.map(order => {
              if (order.id === orderId) {
                const updatedOrder = { ...order };
                
                // Atualizar dados do cliente
                if (data.customer) {
                  if (data.customer.name) {
                    updatedOrder.customerName = data.customer.name;
                  }
                  if (data.customer.phone) {
                    // Atualizar telefone no socketData
                    if (updatedOrder.socketData?.attributes?.customer?.data?.attributes) {
                      updatedOrder.socketData.attributes.customer.data.attributes.cellphone = data.customer.phone;
                    }
                  }
                }
                
                // Atualizar dados do endereço
                if (data.address && updatedOrder.socketData?.attributes?.address?.data?.attributes) {
                  Object.assign(updatedOrder.socketData.attributes.address.data.attributes, data.address);
                }
                
                // Atualizar dados da loja
                if (data.shop && updatedOrder.socketData?.attributes?.shop?.data?.attributes) {
                  Object.assign(updatedOrder.socketData.attributes.shop.data.attributes, data.shop);
                }
                
                // Atualizar dados financeiros
                if (data.total !== undefined) {
                  updatedOrder.amount = data.total;
                }
                
                // Atualizar entregador
                if (data.deliveryPerson !== undefined) {
                  updatedOrder.deliveryPerson = data.deliveryPerson;
                  // Atualizar também no socketData
                  if (updatedOrder.socketData?.attributes) {
                    (updatedOrder.socketData.attributes as any).delivery_person = data.deliveryPerson;
                  }
                }
                
                return updatedOrder;
              }
              return order;
            }));
            
            // Enviar via WebSocket
            try {
              const success = await updateOrderDetails(orderId, data);

            } catch (error) {
              console.error('❌ Erro ao atualizar pedido:', error);
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