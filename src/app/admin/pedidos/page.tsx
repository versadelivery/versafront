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
  X,
  UtensilsCrossed
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
import { OrderTypeToggles } from '@/components/admin/order-type-toggles';
import { formatPrice } from '@/app/(public)/[slug]/format-price';
import { useAdminActionCable, AdminOrderData } from '@/lib/admin-cable';
import OrderCard from '@/components/admin/order-card';
import { useRestaurantSounds } from '@/hooks/use-restaurant-sounds';
import { useShop } from '@/hooks/use-shop';
import Link from 'next/link';
import api from '@/api/config';
import { toast } from 'sonner';
import ScheduledOrdersList, { ScheduledOrderRow } from '@/components/admin/scheduled-orders-list';
import { confirmScheduledOrder, releaseScheduledOrder } from '@/services/scheduling-service';
import { usePrinterConfig } from '@/hooks/use-printer-config';
import { mapOrderItem } from './map-order-item';
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
    deliveryPerson: socketOrder.attributes.delivery_person ?? undefined,
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

// Mapeamento backend status → frontend status
const backendToFrontendStatus: Record<string, Order['status']> = {
  'received': 'recebidos',
  'accepted': 'aceitos',
  'in_analysis': 'em_analise',
  'in_preparation': 'em_preparo',
  'ready': 'prontos',
  'left_for_delivery': 'saiu',
  'delivered': 'entregue',
  'cancelled': 'cancelled'
};

const DEFAULT_ORDER_FLOW = ['received', 'accepted', 'in_preparation', 'ready', 'left_for_delivery', 'delivered'];

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
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
    cancelled: false
  });
  const [isMobile, setIsMobile] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const isUpdatingRef = useRef<Record<string, boolean>>({});
  const lastLocalChangeRef = useRef<Record<string, { statusAt?: number; paymentAt?: number; deliveryAt?: number }>>({});
  const socketOrdersCache = useRef<Map<string, Order>>(new Map());
  const upsertedAtRef = useRef<Record<string, number>>({});

  const { subscribeToAdminOrders, updateOrder, updateOrderDetails, isConnected, connectionStatus } = useAdminActionCable();
  const { orderAccepted, orderReady, newOrder, orderOverdue } = useRestaurantSounds();
  const { shop } = useShop();
  const { config: printerConfig } = usePrinterConfig();
  const estimatedPrepTime = shop?.estimated_prep_time ?? null;
  const estimatedDeliveryTime = shop?.estimated_delivery_time ?? null;

  // Fluxo de status configurado pela loja (backend status keys)
  const orderFlow = shop?.order_flow ?? DEFAULT_ORDER_FLOW;

  // Status ativos no frontend (mapeados do backend) + cancelled sempre presente
  const activeStatuses = React.useMemo(() => {
    const mapped = orderFlow
      .map((s: string) => backendToFrontendStatus[s])
      .filter(Boolean) as Order['status'][];
    return [...mapped, 'cancelled' as Order['status']];
  }, [orderFlow]);

  // Dado um status frontend, retorna o próximo no fluxo
  const getNextStatus = React.useCallback((currentStatus: Order['status']): Order['status'] | null => {
    const idx = activeStatuses.indexOf(currentStatus);
    if (idx === -1 || idx >= activeStatuses.length - 2) return null; // -2 porque cancelled é o último
    return activeStatuses[idx + 1];
  }, [activeStatuses]);
  const seenOrderIdsRef = useRef<Set<string>>(new Set());
  const overdueAlertedRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);
  const socketReceivedRef = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mescla o pedido vindo do servidor com a cópia local, preservando mudanças que o operador acabou de fazer
  // (status, pagamento, entregador) por 5 s: a confirmação do servidor pode chegar depois do clique.
  const mergeWithLocal = (current: Order | undefined, incoming: Order, now: number): Order => {
    if (!current) return incoming;
    const last = lastLocalChangeRef.current[incoming.id] || {};
    const keepLocalStatus = last.statusAt !== undefined && (now - (last.statusAt as number)) < 5000;
    const keepLocalPayment = last.paymentAt !== undefined && (now - (last.paymentAt as number)) < 5000;
    const keepLocalDelivery = last.deliveryAt !== undefined && (now - (last.deliveryAt as number)) < 5000;

    return {
      ...current,
      ...incoming,
      status: keepLocalStatus ? current.status : incoming.status,
      paymentStatus: keepLocalPayment ? current.paymentStatus : incoming.paymentStatus,
      deliveryPerson: keepLocalDelivery ? current.deliveryPerson : incoming.deliveryPerson,
    };
  };

  // Um (ou poucos) pedidos que mudaram: entram no lugar do antigo sem mexer no resto da lista.
  const applyUpsert = (socketOrders: AdminOrderData[]) => {
    const incomingOrders = socketOrders.map(convertSocketDataToOrder);
    incomingOrders.forEach(order => {
      socketOrdersCache.current.set(order.id, order);
      upsertedAtRef.current[order.id] = Date.now();
    });

    setOrders((prevOrders) => {
      const now = Date.now();
      const next = [...prevOrders];
      incomingOrders.forEach((incoming) => {
        const index = next.findIndex(order => order.id === incoming.id);
        if (index === -1) {
          if (!seenOrderIdsRef.current.has(incoming.id)) {
            seenOrderIdsRef.current.add(incoming.id);
            newOrder();
          }
          next.unshift(incoming);
        } else {
          next[index] = mergeWithLocal(next[index], incoming, now);
        }
      });
      return next;
    });
    setIsLoading(false);
  };

  // Lista do dia pela API (formato enxuto). Serve de carga inicial, de reserva quando o tempo real não conecta
  // e de ressincronização depois que ele cai e volta (eventos perdidos nesse intervalo).
  const loadOrdersFromApi = useCallback(async (options?: { onlyIfSocketSilent?: boolean }) => {
    try {
      const startedAt = Date.now();
      const response = await api.get('/orders', { params: { summary: true }, timeout: 30000 });
      if (options?.onlyIfSocketSilent && socketReceivedRef.current) return;

      const fetched = ((response.data?.data || []) as AdminOrderData[]).map(convertSocketDataToOrder);
      socketOrdersCache.current = new Map(fetched.map(order => [order.id, order]));

      if (!isInitialLoadRef.current) {
        fetched.filter(order => !seenOrderIdsRef.current.has(order.id)).forEach(() => newOrder());
      }
      fetched.forEach(order => seenOrderIdsRef.current.add(order.id));
      isInitialLoadRef.current = false;

      setOrders((prevOrders) => {
        const now = Date.now();
        const prevById = new Map(prevOrders.map(order => [order.id, order]));
        // Evento em tempo real que chegou depois de a consulta sair é mais novo que a resposta: mantém o do evento
        const newerThanQuery = (id: string) => (upsertedAtRef.current[id] ?? 0) > startedAt;
        const merged = fetched.map(incoming =>
          newerThanQuery(incoming.id) && prevById.has(incoming.id)
            ? prevById.get(incoming.id)!
            : mergeWithLocal(prevById.get(incoming.id), incoming, now)
        );
        const fetchedIds = new Set(fetched.map(order => order.id));
        const createdMeanwhile = prevOrders.filter(order => !fetchedIds.has(order.id) && newerThanQuery(order.id));
        return [...createdMeanwhile, ...merged];
      });
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [newOrder]);

  useEffect(() => {
    let wasDisconnected = false;

    const unsubscribe = subscribeToAdminOrders((socketOrders: AdminOrderData[], kind) => {
      socketReceivedRef.current = true;

      if (kind === 'upsert') {
        applyUpsert(socketOrders);
        return;
      }

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
            return convertedOrders.map(incoming => mergeWithLocal(prevById.get(incoming.id), incoming, now));
          });
        }, 2000);
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
        return convertedOrders.map(incoming => mergeWithLocal(prevById.get(incoming.id), incoming, now));
      });

      setIsLoading(false);
    }, (status) => {
      if (status === 'disconnected') {
        wasDisconnected = true;
      } else if (status === 'connected' && wasDisconnected) {
        // Voltou depois de cair: busca o que pode ter sido perdido enquanto estava fora
        wasDisconnected = false;
        loadOrdersFromApi();
      }
    }, { initialData: false });

    // A listagem inicial não pode depender só da assinatura do socket (que pode demorar ou nem conectar).
    // Sem limite de tempo artificial: a tela mostra "carregando" até chegar dado ou dar erro de verdade.
    loadOrdersFromApi({ onlyIfSocketSilent: true });

    return () => {
      unsubscribe();
    };
  }, [subscribeToAdminOrders]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sem tempo real conectado, o painel continua atualizando por consulta leve a cada 20 s
  useEffect(() => {
    if (connectionStatus === 'connected') return;
    const timer = setInterval(() => { loadOrdersFromApi(); }, 20000);
    return () => clearInterval(timer);
  }, [connectionStatus, loadOrdersFromApi]);

  // Alerta sonoro para pedidos atrasados (preparo e entrega)
  useEffect(() => {
    if (orders.length === 0) return;
    if (!estimatedPrepTime && !estimatedDeliveryTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      let hasNewOverdue = false;

      orders.forEach((order) => {
        if (overdueAlertedRef.current.has(order.id)) return;

        // Atraso no preparo
        if (['aceitos', 'em_analise', 'em_preparo'].includes(order.status) && estimatedPrepTime) {
          const acceptedAt = order.socketData?.attributes?.accepted_at;
          if (!acceptedAt) return;
          const t = new Date(acceptedAt).getTime();
          if (!isNaN(t) && now > t + estimatedPrepTime * 60 * 1000) {
            overdueAlertedRef.current.add(order.id);
            hasNewOverdue = true;
          }
        }

        // Atraso na entrega (conta a partir de pronto)
        if (['prontos', 'saiu'].includes(order.status) && estimatedDeliveryTime) {
          const readyAt = order.socketData?.attributes?.ready_at;
          if (!readyAt) return;
          const t = new Date(readyAt).getTime();
          if (!isNaN(t) && now > t + estimatedDeliveryTime * 60 * 1000) {
            overdueAlertedRef.current.add(order.id);
            hasNewOverdue = true;
          }
        }
      });

      if (hasNewOverdue) {
        orderOverdue();
      }
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
    lastLocalChangeRef.current[orderId] = {
      ...(lastLocalChangeRef.current[orderId] || {}),
      deliveryAt: Date.now(),
    };
    setOrders(orders.map((order: Order) =>
      order.id === orderId
        ? { ...order, deliveryPerson }
        : order
    ));
    // Enviar para o backend via websocket
    updateOrder(orderId, undefined, undefined, deliveryPerson);
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
      const success = await updateOrder(orderId, 'cancelled', undefined, undefined, reason, reasonType);
      
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

  // Agendado aguardando o horário fica só na aba "Agendados" (fora das colunas do painel e do KDS)
  const isScheduledPending = (order: Order) => !!order.socketData?.attributes?.scheduled_pending;

  const matchesFilters = (order: Order, { ignoreStatus = false } = {}) => {
    {
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
      if (!ignoreStatus && filterStatus !== 'all') {
        if (order.status !== filterStatus) return false;
      }

      return true;
    }
  };

  const filteredOrders = React.useMemo(
    () => orders.filter((order: Order) => !isScheduledPending(order) && matchesFilters(order)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orders, searchQuery, filterDeliveryType, filterPaymentMethod, filterStatus]
  );

  const scheduledOrders = React.useMemo(
    () => orders.filter((order: Order) => isScheduledPending(order) && matchesFilters(order, { ignoreStatus: true })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orders, searchQuery, filterDeliveryType, filterPaymentMethod]
  );

  const scheduledRows: ScheduledOrderRow[] = React.useMemo(() => scheduledOrders.map((order: Order) => {
    const attrs = order.socketData.attributes;
    const addr = attrs.address?.data?.attributes;
    const items = (attrs.items?.data || []).map((it: any) => `${it.attributes.quantity}x ${it.attributes.catalog_item?.data?.attributes?.name || it.attributes.name || 'Item'}`);
    const paymentLabels: Record<string, string> = { cash: 'Dinheiro', credit: 'Crédito', debit: 'Débito', manual_pix: 'Pix', asaas_pix: 'Pix', store_credit: 'Crediário', food_voucher: 'Vale-refeição' };
    return {
      id: order.id,
      customerName: order.customerName,
      customerPhone: attrs.customer?.data?.attributes?.cellphone || (attrs.customer as any)?.cellphone || undefined,
      amount: order.amount,
      deliveryType: order.deliveryType,
      paymentLabel: paymentLabels[attrs.payment_method],
      scheduledFor: attrs.scheduled_for as string,
      confirmed: !!attrs.scheduled_confirmed_at,
      itemsSummary: items.join(', ') || 'Sem itens',
      address: order.deliveryType === 'delivery' && addr ? [[addr.address, addr.number].filter(Boolean).join(', '), addr.neighborhood].filter(Boolean).join(' - ') : undefined,
    };
  }), [scheduledOrders]);

  const [scheduledBusyId, setScheduledBusyId] = useState<string | null>(null);
  const runScheduledAction = async (orderId: string, action: (id: string) => Promise<unknown>, success: string) => {
    setScheduledBusyId(orderId);
    try {
      await action(orderId);
      toast.success(success);
      await loadOrdersFromApi();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Não foi possível atualizar o pedido agendado');
    } finally {
      setScheduledBusyId(null);
    }
  };

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
    return filteredOrders
      .filter((order: Order) => order.status === status)
      .sort((a, b) => {
        const dateA = new Date(a.socketData.attributes.created_at).getTime();
        const dateB = new Date(b.socketData.attributes.created_at).getTime();
        return dateB - dateA;
      });
  };

  const selectedOrder = orders.find((order: Order) => order.id === selectedOrderId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm font-medium text-gray-900">Carregando pedidos...</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {connectionStatus === 'connected' ? 'Conectado. Buscando os pedidos do dia.' : 'Conectando ao servidor.'}
          </p>
        </div>
      </div>
    );
  }

  // Sem pedidos e com erro de verdade na carga: mostrar o erro, não uma lista vazia que parece "sem pedidos"
  if (loadError && orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-sm font-medium text-gray-900">Não foi possível carregar os pedidos.</p>
          <p className="mt-1 text-xs text-muted-foreground">Confira a conexão e tente de novo.</p>
          <Button
            onClick={() => { setIsLoading(true); loadOrdersFromApi(); }}
            variant="outline"
            className="mt-4 cursor-pointer rounded-md border border-gray-300"
          >
            Tentar novamente
          </Button>
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
              <h1 className="font-tomato text-base sm:text-lg font-bold text-gray-900">
                Pedidos
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/mesas"
                aria-label="Gerenciar mesas"
                title="Gerenciar mesas"
                className="inline-flex h-9 items-center gap-2 rounded-md border border-[#E5E2DD] px-3 text-sm font-medium text-gray-700 transition-colors hover:border-primary/50 hover:text-primary"
              >
                <UtensilsCrossed className="h-4 w-4" />
                <span className="hidden sm:inline">Mesas</span>
              </Link>
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
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-4">
        {/* Entrega/retirada ligam e desligam aqui porque a operação muda durante o turno */}
        <OrderTypeToggles className="mb-4 sm:max-w-md" />

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
                    {activeStatuses.map((status) => {
                      const cfg = statusConfig[status];
                      return cfg ? (
                        <SelectItem key={status} value={status}>{cfg.title}</SelectItem>
                      ) : null;
                    })}
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
            <TabsTrigger value="agendados" data-testid="tab-agendados">
              Agendados
              {scheduledOrders.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">{scheduledOrders.length}</span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agendados">
            <ScheduledOrdersList
              orders={scheduledRows}
              busyId={scheduledBusyId}
              onConfirm={(id) => runScheduledAction(id, confirmScheduledOrder, 'Pedido agendado confirmado')}
              onRelease={(id) => runScheduledAction(id, releaseScheduledOrder, 'Pedido liberado')}
              onCancel={cancelOrder}
              onOpen={setSelectedOrderId}
            />
          </TabsContent>

          <TabsContent value="painel">
            {isMobile ? (
              <div className="space-y-4">
                {activeStatuses.filter(s => s !== 'cancelled').map((status) => {
                  const config = statusConfig[status];
                  if (!config) return null;
                  const statusOrders = getOrdersByStatus(status);
                  const isExpanded = expandedColumns[status];
                  const nextStatus = getNextStatus(status);

                  return (
                    <div key={status} className="bg-[#FAF9F7] rounded-md border border-[#E5E2DD]">
                      <button
                        onClick={() => toggleColumn(status)}
                        className="w-full px-4 py-3 flex items-center justify-between bg-white rounded-t-md"
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
                              defaultDeliveryPersonName={shop?.default_delivery_person_name}
                              onUpdateOrderStatus={updateOrderStatus}
                              onTogglePaymentStatus={togglePaymentStatus}
                              onDeliveryPersonChange={updateDeliveryPerson}
                              onOpenOrderDetails={setSelectedOrderId}
                              onCancelOrder={cancelOrder}
                              nextStatus={nextStatus}
                              printerConfig={printerConfig}
                            />
                          ))}
                          {statusOrders.length === 0 && (
                            <div className="text-center py-8 text-gray-400 text-sm">
                              Nenhum pedido
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Cancelados - seção separada */}
                {(() => {
                  const cancelledOrders = getOrdersByStatus('cancelled');
                  if (cancelledOrders.length === 0) return null;
                  const config = statusConfig['cancelled'];
                  const isExpanded = expandedColumns['cancelled'];

                  return (
                    <div className="bg-[#FAF9F7] rounded-md border border-dashed border-gray-300 opacity-75">
                      <button
                        onClick={() => toggleColumn('cancelled')}
                        className="w-full px-4 py-3 flex items-center justify-between bg-white/50 rounded-t-md"
                      >
                        <div className="flex items-center gap-2">
                          <XCircle className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium text-sm text-gray-500">
                            Cancelados
                          </span>
                          <span className="text-sm text-gray-400">({cancelledOrders.length})</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </button>

                      {isExpanded && (
                        <div className="px-3 pb-3 border-t border-dashed border-gray-300">
                          {cancelledOrders.map(order => (
                            <OrderCard
                              key={order.id}
                              order={order}
                              config={config}
                              estimatedPrepTime={estimatedPrepTime}
                              estimatedDeliveryTime={estimatedDeliveryTime}
                              defaultDeliveryPersonName={shop?.default_delivery_person_name}
                              onUpdateOrderStatus={updateOrderStatus}
                              onTogglePaymentStatus={togglePaymentStatus}
                              onDeliveryPersonChange={updateDeliveryPerson}
                              onOpenOrderDetails={setSelectedOrderId}
                              onCancelOrder={cancelOrder}
                              nextStatus={null}
                              printerConfig={printerConfig}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {activeStatuses.filter(s => s !== 'cancelled').map((status) => {
                    const config = statusConfig[status];
                    if (!config) return null;
                    const statusOrders = getOrdersByStatus(status);
                    const isExpanded = expandedColumns[status];
                    const nextStatus = getNextStatus(status);

                    return (
                      <div key={status} className="bg-[#FAF9F7] rounded-md border border-[#E5E2DD] overflow-hidden flex flex-col">
                        <button
                          onClick={() => toggleColumn(status)}
                          className="w-full px-4 py-3 flex items-center justify-between border-b border-[#E5E2DD] bg-white"
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
                          <div className={cn(
                            "p-3 max-h-[80vh] overflow-y-auto",
                            statusOrders.length === 0 && "flex-1 flex items-center justify-center"
                          )}>
                            {statusOrders.map(order => (
                              <OrderCard
                                key={order.id}
                                order={order}
                                config={config}
                                estimatedPrepTime={estimatedPrepTime}
                                estimatedDeliveryTime={estimatedDeliveryTime}
                                defaultDeliveryPersonName={shop?.default_delivery_person_name}
                                onUpdateOrderStatus={updateOrderStatus}
                                onTogglePaymentStatus={togglePaymentStatus}
                                onDeliveryPersonChange={updateDeliveryPerson}
                                onOpenOrderDetails={setSelectedOrderId}
                                onCancelOrder={cancelOrder}
                                nextStatus={nextStatus}
                                printerConfig={printerConfig}
                              />
                            ))}
                            {statusOrders.length === 0 && (
                              <div className="text-center text-gray-400 text-sm">
                                Nenhum pedido
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Cancelados - seção separada abaixo do grid */}
                {(() => {
                  const cancelledOrders = getOrdersByStatus('cancelled');
                  if (cancelledOrders.length === 0) return null;
                  const config = statusConfig['cancelled'];
                  const isExpanded = expandedColumns['cancelled'];

                  return (
                    <div className="bg-[#FAF9F7] rounded-md border border-dashed border-gray-300 opacity-75">
                      <button
                        onClick={() => toggleColumn('cancelled')}
                        className="w-full px-4 py-3 flex items-center justify-between bg-white/50 rounded-t-md"
                      >
                        <div className="flex items-center gap-2">
                          <XCircle className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium text-sm text-gray-500">
                            Cancelados
                          </span>
                          <span className="text-sm text-gray-400">({cancelledOrders.length})</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </button>

                      {isExpanded && (
                        <div className="p-3 border-t border-dashed border-gray-300">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {cancelledOrders.map(order => (
                              <OrderCard
                                key={order.id}
                                order={order}
                                config={config}
                                estimatedPrepTime={estimatedPrepTime}
                                estimatedDeliveryTime={estimatedDeliveryTime}
                                defaultDeliveryPersonName={shop?.default_delivery_person_name}
                                onUpdateOrderStatus={updateOrderStatus}
                                onTogglePaymentStatus={togglePaymentStatus}
                                onDeliveryPersonChange={updateDeliveryPerson}
                                onOpenOrderDetails={setSelectedOrderId}
                                onCancelOrder={cancelOrder}
                                nextStatus={null}
                                printerConfig={printerConfig}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
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
            address: selectedOrder.socketData.attributes.address.data ? (() => {
              const addrAttrs = selectedOrder.socketData.attributes.address.data.attributes;
              const rawNeighborhood = addrAttrs.shop_delivery_neighborhood;
              const neighborhoodFallback = typeof rawNeighborhood === 'string'
                ? rawNeighborhood
                : (rawNeighborhood as any)?.data?.attributes?.name || '';
              return {
                address: addrAttrs.address,
                number: addrAttrs.number ?? undefined,
                neighborhood: addrAttrs.neighborhood || neighborhoodFallback,
                complement: addrAttrs.complement ?? undefined,
                reference: addrAttrs.reference ?? undefined,
                latitude: addrAttrs.latitude != null ? Number(addrAttrs.latitude) : null,
                longitude: addrAttrs.longitude != null ? Number(addrAttrs.longitude) : null,
                distance_km: addrAttrs.distance_km != null ? Number(addrAttrs.distance_km) : null,
                duration_minutes: addrAttrs.duration_minutes ?? null,
                delivery_fee_kind: addrAttrs.delivery_fee_kind ?? null,
              };
            })() : undefined,
            items: selectedOrder.socketData.attributes.items.data.map(mapOrderItem),
            shop: {
              name: selectedOrder.socketData.attributes.shop.data.attributes.name,
              phone: selectedOrder.socketData.attributes.shop.data.attributes.cellphone
            },
            customer: selectedOrder.socketData.attributes.customer?.data ? {
              name: selectedOrder.socketData.attributes.customer.data.attributes.name,
              phone: selectedOrder.socketData.attributes.customer.data.attributes.cellphone
                  || (selectedOrder.socketData.attributes as any).customer_phone || ''
            } : {
              name: (selectedOrder.socketData.attributes as any).customer_name || 'Cliente',
              phone: (selectedOrder.socketData.attributes as any).customer_phone || ''
            },
            deliveryPerson: selectedOrder.deliveryPerson || (selectedOrder.socketData.attributes as any).delivery_person || '',
            discount_amount: parseFloat(selectedOrder.socketData.attributes.discount_amount || '0'),
            payment_adjustment_amount: parseFloat(selectedOrder.socketData.attributes.payment_adjustment_amount || '0'),
            pickup_adjustment_amount: parseFloat((selectedOrder.socketData.attributes as any).pickup_adjustment_amount || '0'),
            manual_adjustment: parseFloat((selectedOrder.socketData.attributes as any).manual_adjustment || '0'),
            coupon_code: selectedOrder.socketData.attributes.coupon_code || undefined
          }}
          onUpdateOrder={async (orderId, data) => {
            // Persiste primeiro: se a API recusar, a edição fica aberta e nada muda na tela
            let savedOrder: AdminOrderData | null = null;
            try {
              savedOrder = await updateOrderDetails(orderId, data);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Erro ao salvar o pedido');
              throw error;
            }

            // A resposta já traz o pedido gravado (itens, pesos, totais): a tela atualiza na hora, sem esperar o tempo real
            if (savedOrder) {
              applyUpsert([savedOrder]);
              return;
            }

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
