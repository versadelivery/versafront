'use client';

import React from 'react';
import { useUsers } from '@/app/admin/settings/users/hooks/useUsers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  CheckCircle, 
  XCircle, 
  Copy,
  SquarePen,
  Bell,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/app/(public)/[slug]/format-price';
import { User } from '@/app/admin/settings/users/services/userService';

const getPaymentMethodLabel = (method: string) => {
  const methodMap: Record<string, string> = {
    'credit': 'Cartão de Crédito',
    'debit': 'Cartão de Débito',
    'manual_pix': 'Pix',
    'cash': 'Dinheiro'
  };
  return methodMap[method] || method;
};

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
  socketData?: any; // Dados do socket para informações adicionais
}

interface OrderCardProps {
  order: Order;
  config: any;
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  onTogglePaymentStatus: (orderId: string) => void;
  onDeliveryPersonChange: (orderId: string, deliveryPerson: string) => void;
  onOpenOrderDetails: (orderId: string) => void;
}

export default function OrderCard({
  order,
  config,
  onUpdateOrderStatus,
  onTogglePaymentStatus,
  onDeliveryPersonChange,
  onOpenOrderDetails
}: OrderCardProps) {
  // Buscar entregadores reais
  const { users, loading: loadingUsers } = useUsers();
  console.log(users)
  const deliveryPeople = users.filter((u: User) => u.attributes.role === 'delivery_man');
  const isPronto = order.status === 'prontos';
  
  const handleDeliveryPersonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDeliveryPerson = e.target.value;
    onDeliveryPersonChange(order.id, newDeliveryPerson);
  };

  const handleOpenOrderDetails = () => {
    onOpenOrderDetails(order.id);
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
          <Badge variant="secondary" className={cn("text-xs px-2 py-0.5", isPronto && "bg-white text-primary")}>
            {order.socketData?.attributes?.items?.data?.length || 0} itens
          </Badge>
        </div>
        <div className={cn("flex items-center gap-2 mb-2", isPronto && "text-white")}>
          <div className={cn("font-bold text-lg", isPronto ? "text-white" : "text-green-600")}>
            {formatPrice(order.amount)}
          </div>
          <span className={cn("text-xs", isPronto ? "text-white" : "text-gray-500")}>{order.time}</span>
        </div>

        {/* Forma de pagamento */}
        <div className={cn("text-xs mb-2", isPronto ? "text-white" : "text-gray-600")}>
          <div className="flex items-center gap-2">
            <span>💳 {getPaymentMethodLabel(order.socketData?.attributes?.payment_method || '')}</span>
          </div>
        </div>

        {/* Taxa de entrega */}
        {order.deliveryType === 'delivery' && order.socketData?.attributes?.delivery_fee && parseFloat(order.socketData.attributes.delivery_fee) > 0 && (
          <div className={cn("text-xs mb-2", isPronto ? "text-white" : "text-blue-600")}>
            <div className="flex items-center gap-2">
              <span>🚚 Taxa de entrega: {formatPrice(parseFloat(order.socketData.attributes.delivery_fee))}</span>
            </div>
          </div>
        )}

        <div className={cn("text-xs", isPronto ? "text-white" : "text-gray-400", "mb-2")}>ID: {order.id}</div>
        
        {/* Informações do cliente */}
        <div className={cn("text-xs mb-2", isPronto ? "text-white" : "text-gray-600")}>
          <div className="flex items-center gap-2">
            <span>📞 {order.socketData?.attributes?.customer?.data?.attributes?.cellphone || 'N/A'}</span>
          </div>
        </div>

        {/* Endereço para delivery */}
        {order.deliveryType === 'delivery' && order.socketData?.attributes?.address?.data && (
          <div className={cn("text-xs mb-2", isPronto ? "text-white" : "text-gray-600")}>
            <div className="font-medium">📍 Entrega:</div>
            <div className="ml-2">
              <div>{order.socketData.attributes.address.data.attributes.address}</div>
              {order.socketData.attributes.address.data.attributes.complement && (
                <div className="text-gray-500">{order.socketData.attributes.address.data.attributes.complement}</div>
              )}
              <div className="text-gray-500">{order.socketData.attributes.address.data.attributes.neighborhood}</div>
            </div>
          </div>
        )}
        
        {/* Mostrar itens do pedido */}
        {order.socketData?.attributes?.items?.data?.length > 0 && (
          <div className={cn("text-xs mb-2", isPronto ? "text-white" : "text-gray-600")}>
            <div className="font-medium mb-1">Itens:</div>
            {order.socketData.attributes.items.data.slice(0, 2).map((item: any, index: number) => (
              <div key={item.id} className="flex justify-between items-center">
                <span className="truncate">
                  {item.attributes.quantity}x {item.attributes.catalog_item.data.attributes.name}
                </span>
                <span className="ml-2">
                  {formatPrice(parseFloat(item.attributes.total_price || '0'))}
                </span>
              </div>
            ))}
            {order.socketData.attributes.items.data.length > 2 && (
              <div className="text-gray-500 italic">
                +{order.socketData.attributes.items.data.length - 2} mais itens
              </div>
            )}
          </div>
        )}

        {/* Mostrar observações se houver */}
        {order.socketData?.attributes?.items?.data?.some((item: any) => item.attributes.observation) && (
          <div className={cn("text-xs mb-2", isPronto ? "text-white" : "text-orange-600")}>
            <div className="font-medium">Observações:</div>
            {order.socketData.attributes.items.data
              .filter((item: any) => item.attributes.observation)
              .slice(0, 1)
              .map((item: any) => (
                <div key={item.id} className="italic">
                  "{item.attributes.observation}"
                </div>
              ))}
          </div>
        )}

        <div className={cn("text-xs", isPronto ? "text-white" : "text-gray-600", "mb-4")}> 
          {order.status === 'recebidos' ? (
            <div className="flex items-center gap-2">
              <span>Entregador:</span>
              <select
                value={order.deliveryPerson || ''}
                onChange={handleDeliveryPersonChange}
                className="border rounded-xs px-2 py-1 text-sm bg-white w-[150px]"
                disabled={loadingUsers}
              >
                <option value="">Selecione um entregador</option>
                {deliveryPeople.map(deliveryPerson => (
                  <option key={deliveryPerson.id} value={deliveryPerson.attributes.name}>
                    {deliveryPerson.attributes.name}
                  </option>
                ))}
              </select>
              {loadingUsers && <span className="text-xs text-gray-400 ml-2">Carregando...</span>}
            </div>
          ) : (
            <>
              Entregador: <span className={cn("font-semibold", isPronto && "text-white")}>{order.deliveryPerson}</span>
            </>
          )}
        </div>

        <div className="space-y-2">
          {order.status === 'recebidos' && (
            <div className="space-y-2">
              <Button 
                className="w-full bg-white text-black font-semibold hover:bg-primary/90 hover:text-white rounded-xs"
                onClick={() => onUpdateOrderStatus(order.id, 'aceitos')}
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
                  onClick={() => onUpdateOrderStatus(order.id, 'em_analise')}
                >
                  EM ANÁLISE
                </Button>
                <Button 
                  variant="outline"
                  className="w-full rounded-xs"
                  onClick={() => onUpdateOrderStatus(order.id, 'em_preparo')}
                >
                  EM PREPARO
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={order.paymentStatus === 'paid' ? 'default' : 'outline'}
                  className={cn('w-full rounded-xs', order.paymentStatus === 'paid' ? 'bg-primary text-white hover:bg-primary/90' : '')}
                  onClick={() => onTogglePaymentStatus(order.id)}
                >
                  PAGO {order.paymentStatus === 'paid' && <CheckCircle className="w-4 h-4 ml-1" />}
                </Button>
                <Button 
                  variant="outline"
                  className="w-full rounded-xs"
                  onClick={() => onUpdateOrderStatus(order.id, 'prontos')}
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
                onClick={() => onUpdateOrderStatus(order.id, 'em_preparo')}
              >
                EM PREPARO
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={order.paymentStatus === 'paid' ? 'default' : 'outline'}
                  className={cn('w-full rounded-xs', order.paymentStatus === 'paid' ? 'bg-primary text-white hover:bg-primary/90' : '')}
                  onClick={() => onTogglePaymentStatus(order.id)}
                >
                  PAGO {order.paymentStatus === 'paid' && <CheckCircle className="w-4 h-4 ml-1" />}
                </Button>
                <Button 
                  variant="outline"
                  className="w-full rounded-xs"
                  onClick={() => onUpdateOrderStatus(order.id, 'prontos')}
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
                  onClick={() => onTogglePaymentStatus(order.id)}
                >
                  PAGO {order.paymentStatus === 'paid' && <CheckCircle className="w-4 h-4 ml-1" />}
                </Button>
                <Button 
                  variant="outline"
                  className="w-full rounded-xs"
                  onClick={() => onUpdateOrderStatus(order.id, 'prontos')}
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

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 rounded-xs"
              onClick={handleOpenOrderDetails}
            >
              DETALHES DO PEDIDO ↗
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn("rounded-xs", isPronto && "border-none")}
              onClick={() => {
                // Copiar informações do pedido para a área de transferência
                const orderInfo = `
Pedido #${order.id}
Cliente: ${order.customerName}
Telefone: ${order.socketData?.attributes?.customer?.data?.attributes?.cellphone || 'N/A'}
Valor: ${formatPrice(order.amount)}
Status: ${order.status}
Forma de pagamento: ${getPaymentMethodLabel(order.socketData?.attributes?.payment_method || '')}
${order.deliveryType === 'delivery' && order.socketData?.attributes?.address?.data ? `
Endereço: ${order.socketData.attributes.address.data.attributes.address}
Bairro: ${order.socketData.attributes.address.data.attributes.neighborhood}
${order.socketData.attributes.address.data.attributes.complement ? `Complemento: ${order.socketData.attributes.address.data.attributes.complement}` : ''}
` : ''}
Itens:
${order.socketData?.attributes?.items?.data?.map((item: any) => 
  `${item.attributes.quantity}x ${item.attributes.catalog_item.data.attributes.name} - ${formatPrice(parseFloat(item.attributes.total_price || '0'))}`
).join('\n') || 'Nenhum item'}
                `.trim();
                
                navigator.clipboard.writeText(orderInfo).then(() => {
                  // Opcional: mostrar uma notificação de sucesso
                  console.log('Informações do pedido copiadas!');
                });
              }}
            >
              <Copy className="w-4 h-4"/>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 