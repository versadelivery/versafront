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
}

const mockDeliveryPeople = [
  { id: '1', name: 'Freire' },
  { id: '2', name: 'Maikon' },
  { id: '3', name: 'Matheus' },
  { id: '4', name: 'Leo' },
  { id: '5', name: 'João' },
  { id: '6', name: 'Pedro' },
];

const mockOrders: Order[] = [
  {
    id: '92083',
    customerName: 'Gabriel Felix',
    amount: 89.00,
    time: '9:13 AM',
    deliveryPerson: 'Freire',
    status: 'recebidos',
    paymentStatus: 'pending',
    deliveryType: 'delivery'
  },
  {
    id: '92084',
    customerName: 'Hivna Castro',
    amount: 100.00,
    time: '9:25 AM',
    deliveryPerson: 'Freire',
    status: 'aceitos',
    paymentStatus: 'pending',
    deliveryType: 'delivery'
  },
  {
    id: '92085',
    customerName: 'Neymar Silva',
    amount: 67.80,
    time: '9:30 AM',
    deliveryPerson: 'Maikon',
    status: 'em_analise',
    paymentStatus: 'pending',
    deliveryType: 'pickup'
  },
  {
    id: '92086',
    customerName: 'Italo Linhares',
    amount: 92.30,
    time: '9:45 AM',
    deliveryPerson: 'Matheus',
    status: 'em_preparo',
    paymentStatus: 'paid',
    deliveryType: 'delivery'
  },
  {
    id: '92087',
    customerName: 'Freire Guerra',
    amount: 78.90,
    time: '9:50 AM',
    deliveryPerson: 'Leo',
    status: 'prontos',
    paymentStatus: 'paid',
    readyTime: '10:23:08',
    deliveryType: 'delivery'
  }
];

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
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [expandedColumns, setExpandedColumns] = useState<Record<string, boolean>>({
    recebidos: true,
    aceitos: true,
    em_analise: true,
    em_preparo: true,
    prontos: true
  });
  const [isMobile, setIsMobile] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const toggleColumn = (status: string) => {
    setExpandedColumns(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const getOrdersByStatus = (status: Order['status']) => {
    return orders.filter(order => order.status === status);
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const config = statusConfig[order.status];
    const isPronto = order.status === 'prontos';
    
    const handleDeliveryPersonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newDeliveryPerson = e.target.value;
      setOrders(orders.map(o => 
        o.id === order.id 
          ? { ...o, deliveryPerson: newDeliveryPerson }
          : o
      ));
    };

    const handleOpenOrderDetails = () => {
      setSelectedOrderId(order.id);
    };
    
    return (
      <Card className={cn("mb-4 rounded-xs shadow border-0", config.bgColor)}>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <div className={cn("text-xs font-medium", isPronto && "text-white", order.paymentStatus === 'pending' ? 'text-red-500' : 'text-green-500')}>
              {order.paymentStatus === 'pending' ? 'Aguardando pagamento' : 'Pago'}
            </div>
            <div className="flex items-center gap-2">
              {order.deliveryType === 'delivery' && <Truck className={cn("w-4 h-4", isPronto && "text-white")} />}
            </div>
          </div>

          <div className={cn("mb-2 flex items-center gap-2", isPronto && "text-white")}>
            <h3 className={cn("font-bold text-lg leading-tight", isPronto ? "text-white" : "text-gray-800")}>
              {order.customerName}
            </h3>
            <Badge variant="secondary" className={cn("text-xs px-2 py-0.5", isPronto && "bg-white text-primary")}>38</Badge>
          </div>
          <div className={cn("flex items-center gap-2 mb-2", isPronto && "text-white")}>
            <div className={cn("font-bold text-lg", isPronto ? "text-white" : "text-green-600")}>
              {formatPrice(order.amount)}
            </div>
            <span className={cn("text-xs", isPronto ? "text-white" : "text-gray-500")}>{order.time}</span>
          </div>

          <div className={cn("text-xs", isPronto ? "text-white" : "text-gray-400", "mb-2")}>ID: {order.id}</div>
          <div className={cn("text-xs", isPronto ? "text-white" : "text-gray-600", "mb-4")}>
            {order.status === 'recebidos' ? (
              <div className="flex items-center gap-2">
                <span>Entregador:</span>
                <select
                  value={order.deliveryPerson || ''}
                  onChange={handleDeliveryPersonChange}
                  className="border rounded-xs px-2 py-1 text-sm bg-white w-[100px]"
                >
                  <option value="">Selecione um entregador</option>
                  {mockDeliveryPeople.map(deliveryPerson => (
                    <option key={deliveryPerson.id} value={deliveryPerson.name}>
                      {deliveryPerson.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                Entregador: <span className={cn("font-semibold", isPronto && "text-white")}>{order.deliveryPerson}</span>
              </>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              {order.status !== 'prontos' && (
                <Button variant="outline" size="sm" className="flex-1 rounded-xs">
                  <SquarePen className="w-4 h-4 mr-1" />
                  EDITAR
                </Button>
              )}
              <Button variant="outline" size="sm" className={cn("rounded-xs", isPronto && "border-none")}>
                <Copy className="w-4 h-4"/>
              </Button>
            </div>

            {order.status === 'recebidos' && (
              <div className="space-y-2">
                <Button 
                  className="w-full bg-white text-black font-semibold hover:bg-primary/90 hover:text-white rounded-xs"
                  onClick={() => updateOrderStatus(order.id, 'aceitos')}
                >
                  ACEITAR
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full rounded-xs"
                  onClick={() => console.log('Recusar pedido', order.id)}
                >
                  RECUSAR
                  <XCircle className="w-4 h-4 mr-2" />
                </Button>
              </div>
            )}

            {order.status === 'aceitos' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline"
                    className="w-full rounded-xs"
                    onClick={() => updateOrderStatus(order.id, 'em_analise')}
                  >
                    EM ANÁLISE
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full rounded-xs"
                    onClick={() => updateOrderStatus(order.id, 'em_preparo')}
                  >
                    EM PREPARO
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={order.paymentStatus === 'paid' ? 'default' : 'outline'}
                    className={cn('w-full rounded-xs', order.paymentStatus === 'paid' ? 'bg-primary text-white hover:bg-primary/90' : '')}
                    onClick={() => togglePaymentStatus(order.id)}
                  >
                    PAGO {order.paymentStatus === 'paid' && <CheckCircle className="w-4 h-4 ml-1" />}
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full rounded-xs"
                    onClick={() => updateOrderStatus(order.id, 'prontos')}
                  >
                    PRONTO
                  </Button>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xs">
                  <Bell className="w-4 h-4 mr-2" />
                  NOTIFICAR
                </Button>
              </div>
            )}

            {order.status === 'em_analise' && (
              <div className="space-y-2">
                <Button 
                  variant="outline"
                  className="w-full rounded-xs"
                  onClick={() => updateOrderStatus(order.id, 'em_preparo')}
                >
                  EM PREPARO
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={order.paymentStatus === 'paid' ? 'default' : 'outline'}
                    className={cn('w-full rounded-xs', order.paymentStatus === 'paid' ? 'bg-primary text-white hover:bg-primary/90' : '')}
                    onClick={() => togglePaymentStatus(order.id)}
                  >
                    PAGO {order.paymentStatus === 'paid' && <CheckCircle className="w-4 h-4 ml-1" />}
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full rounded-xs"
                    onClick={() => updateOrderStatus(order.id, 'prontos')}
                  >
                    PRONTO
                  </Button>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xs">
                  <Bell className="w-4 h-4 mr-2" />
                  NOTIFICAR
                </Button>
              </div>
            )}

            {order.status === 'em_preparo' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={order.paymentStatus === 'paid' ? 'default' : 'outline'}
                    className={cn('w-full rounded-xs', order.paymentStatus === 'paid' ? 'bg-primary text-white hover:bg-primary/90' : '')}
                    onClick={() => togglePaymentStatus(order.id)}
                  >
                    PAGO {order.paymentStatus === 'paid' && <CheckCircle className="w-4 h-4 ml-1" />}
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full rounded-xs"
                    onClick={() => updateOrderStatus(order.id, 'prontos')}
                  >
                    PRONTO
                  </Button>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xs">
                  <Bell className="w-4 h-4 mr-2" />
                  NOTIFICAR
                </Button>
              </div>
            )}

            {order.status === 'prontos' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="w-full rounded-xs">
                    <Truck className="w-3 h-3" />
                    SAIU
                  </Button>
                  <Button variant="outline" className="w-full rounded-xs">
                    <CheckCircle className="w-2 h-2" />
                    ENTREGUE
                  </Button>
                </div>
                <Button className="w-full border border-white text-white font-bold rounded-xs">
                  <Bell className="w-4 h-4 mr-2 text-white" />
                  NOTIFICAR
                </Button>
              </div>
            )}

            <Button 
              variant="outline" 
              className="w-full rounded-xs"
              onClick={handleOpenOrderDetails}
            >
              DETALHES DO PEDIDO ↗
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const selectedOrder = orders.find(order => order.id === selectedOrderId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <div className="bg-white shadow-sm p-6 mb-8">
        <div className="max-w-[1920px] mx-auto">
          <h1 className="text-3xl font-bold text-gray-800">PEDIDOS</h1>
          <div className="flex items-center gap-6 mt-3 text-base text-gray-600">
            <span>🏠 INÍCIO</span>
            <span className="bg-primary text-white px-4 py-1.5 rounded">Pedidos</span>
            <span>Limpar Pedido</span>
            <span>Controle de Caixa</span>
            <span>RDS</span>
          </div>
        </div>
      </div> */}

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
                        <OrderCard key={order.id} order={order} />
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
                        <OrderCard key={order.id} order={order} />
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
            date: new Date().toISOString(),
            status: mapOrderStatus(selectedOrder.status),
            payment_status: selectedOrder.paymentStatus,
            total: selectedOrder.amount,
            withdrawal: selectedOrder.deliveryType === 'pickup',
            payment_method: 'credit',
            items: [
              {
                id: '1',
                catalog_item_id: 1,
                name: 'Produto Exemplo',
                price: selectedOrder.amount,
                quantity: 1
              }
            ],
            shop: {
              name: 'Loja Exemplo',
              phone: '(11) 99999-9999'
            },
            customer: {
              name: selectedOrder.customerName,
              phone: '(11) 99999-9999'
            }
          }}
        />
      )}
    </div>
  );
}