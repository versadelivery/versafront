'use client';

import React, { useState } from 'react';
import { useUsers } from '@/app/admin/settings/users/hooks/useUsers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Truck, 
  CheckCircle, 
  XCircle, 
  Copy,
  SquarePen,
  Bell,
  ArrowRight,
  MessageCircle,
  Printer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/app/(public)/[slug]/format-price';
import { User } from '@/app/admin/settings/users/services/userService';
import CancelOrderModal from './cancel-order-modal';
import { buildWhatsAppOrderMessage } from '@/utils/whatsapp-template';

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
  status: 'recebidos' | 'aceitos' | 'em_analise' | 'em_preparo' | 'prontos' | 'saiu' | 'entregue' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  readyTime?: string;
  leftTime?: string; // Horário que saiu para entrega
  deliveredTime?: string; // Horário que foi entregue
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
  onCancelOrder?: (orderId: string, reason: string, reasonType?: string) => void;
}

export default function OrderCard({
  order,
  config,
  onUpdateOrderStatus,
  onTogglePaymentStatus,
  onDeliveryPersonChange,
  onOpenOrderDetails,
  onCancelOrder
}: OrderCardProps) {
  // Buscar entregadores reais
  const { users, loading: loadingUsers } = useUsers();
  console.log(users)
  const deliveryPeople = users.filter((u: User) => u.attributes.role === 'delivery_man');
  const isPronto = order.status === 'prontos';
  
  // Estado para controlar o modal de cancelamento
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  const handleDeliveryPersonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDeliveryPerson = e.target.value;
    onDeliveryPersonChange(order.id, newDeliveryPerson);
  };

  const handleOpenOrderDetails = () => {
    onOpenOrderDetails(order.id);
  };

  const handleCancelOrder = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async (orderId: string, reason: string, justification?: string) => {
    if (onCancelOrder) {
      const fullReason = justification ? `${reason} - ${justification}` : reason;
      await onCancelOrder(orderId, fullReason, reason);
    }
  };

  // Função para marcar como saiu para entrega
  const handleLeftForDelivery = async () => {
    if (onUpdateOrderStatus) {
      await onUpdateOrderStatus(order.id, 'saiu');
    }
  };

  // Função para marcar como entregue
  const handleDelivered = async () => {
    if (onUpdateOrderStatus) {
      await onUpdateOrderStatus(order.id, 'entregue');
    }
  };

  // Função para notificar via WhatsApp
  const handleWhatsAppNotification = () => {
    const customerPhone = order.socketData?.attributes?.customer?.data?.attributes?.cellphone?.replace(/\D/g, '') || '';
    const items = order.socketData?.attributes?.items?.data?.map((item: any) => ({
      name: item.attributes.catalog_item?.data?.attributes?.name || item.attributes.name || 'Item não encontrado',
      quantity: item.attributes.quantity,
      totalPrice: parseFloat(item.attributes.total_price || '0'),
      observation: item.attributes.observation || undefined,
    })) || [];

    const message = buildWhatsAppOrderMessage({
      orderId: order.id,
      customerName: order.customerName,
      status: order.status,
      items,
      paymentMethod: order.socketData?.attributes?.payment_method,
      deliveryType: order.deliveryType,
      total: order.amount,
    });

    const whatsappUrl = `https://wa.me/55${customerPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Função para imprimir pedido
  const handlePrintOrder = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printContent = `
        <html>
          <head>
            <title>Pedido #${order.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
              .section { margin-bottom: 20px; }
              .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; }
              .item { margin-bottom: 10px; }
              .total { font-weight: bold; font-size: 18px; border-top: 1px solid #000; padding-top: 10px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>PEDIDO #${order.id}</h1>
              <p>Data: ${order.time}</p>
            </div>
            
            <div class="section">
              <div class="section-title">CLIENTE</div>
              <p><strong>Nome:</strong> ${order.customerName}</p>
              <p><strong>Telefone:</strong> ${order.socketData?.attributes?.customer?.data?.attributes?.cellphone || 'N/A'}</p>
              ${order.deliveryType === 'delivery' && order.socketData?.attributes?.address?.data ? `
                <p><strong>Endereço:</strong> ${order.socketData.attributes.address.data.attributes.address}</p>
                <p><strong>Bairro:</strong> ${order.socketData.attributes.address.data.attributes.neighborhood}</p>
                ${order.socketData.attributes.address.data.attributes.complement ? `<p><strong>Complemento:</strong> ${order.socketData.attributes.address.data.attributes.complement}</p>` : ''}
              ` : '<p><strong>Tipo:</strong> Retirada na loja</p>'}
            </div>
            
            <div class="section">
              <div class="section-title">ITENS</div>
              ${order.socketData?.attributes?.items?.data?.map((item: any) => `
                <div class="item">
                  <p><strong>${item.attributes.quantity}x ${item.attributes.catalog_item?.data?.attributes?.name || item.attributes.name || 'Item não encontrado'}</strong></p>
                  <p>Preço: R$ ${parseFloat(item.attributes.total_price || '0').toFixed(2)}</p>
                  ${item.attributes.observation ? `<p><em>Obs: ${item.attributes.observation}</em></p>` : ''}
                </div>
              `).join('') || 'Nenhum item'}
            </div>
            
            <div class="section">
              <div class="section-title">FORMA DE PAGAMENTO</div>
              <p>${getPaymentMethodLabel(order.socketData?.attributes?.payment_method || '')}</p>
            </div>
            
            <div class="total">
              <p><strong>TOTAL: R$ ${order.amount.toFixed(2)}</strong></p>
            </div>
          </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Aguarda o conteúdo carregar e imprime
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
      // Toast criativo para impressão
      toast.success('🖨️ Impressão iniciada!', {
        description: 'Pedido enviado para impressora',
        duration: 2500,
      });
    }
  };

  // Função para copiar impressão (formatação para WhatsApp/Telegram)
  const handleCopyPrintFormat = () => {
    const printText = `
*PEDIDO #${order.id}*
${order.time}

*CLIENTE*
Nome: ${order.customerName}
Telefone: ${order.socketData?.attributes?.customer?.data?.attributes?.cellphone || 'N/A'}
${order.deliveryType === 'delivery' && order.socketData?.attributes?.address?.data ? `
📍 *ENDEREÇO*
${order.socketData.attributes.address.data.attributes.address}
Bairro: ${order.socketData.attributes.address.data.attributes.neighborhood}
${order.socketData.attributes.address.data.attributes.complement ? `Complemento: ${order.socketData.attributes.address.data.attributes.complement}` : ''}
` : '*TIPO: Retirada na loja*'}

🛒 *ITENS*
${order.socketData?.attributes?.items?.data?.map((item: any) => `
• ${item.attributes.quantity}x ${item.attributes.catalog_item?.data?.attributes?.name || item.attributes.name || 'Item não encontrado'}
  R$ ${parseFloat(item.attributes.total_price || '0').toFixed(2)}
  ${item.attributes.observation ? `_Obs: ${item.attributes.observation}_` : ''}
`).join('') || 'Nenhum item'}

💳 *FORMA DE PAGAMENTO*
${getPaymentMethodLabel(order.socketData?.attributes?.payment_method || '')}

💰 *TOTAL: R$ ${order.amount.toFixed(2)}*
    `.trim();
    
    navigator.clipboard.writeText(printText).then(() => {
      console.log('✅ Formato de impressão copiado!');
      // Toast criativo para cópia
      toast.success('Pedido copiado com sucesso!', {
        description: 'Formato pronto para WhatsApp/Telegram',
        duration: 3000,
      });
    });
  };

  return (
    <>
    <Card className={cn("mb-4 rounded-xs shadow border-0", config.bgColor)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className={cn("text-xs font-medium", isPronto && "text-white", order.paymentStatus === 'pending' ? 'text-red-500' : config.bgColor === 'bg-primary' ? 'text-white' : 'text-green-500')}>
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

        {/* Cupom de desconto */}
        {order.socketData?.attributes?.coupon_code && (
          <div className={cn("text-xs mb-2", isPronto ? "text-white" : "text-green-600")}>
            <div className="flex items-center gap-2">
              <span>🏷️ Cupom: {order.socketData.attributes.coupon_code} (-{formatPrice(parseFloat(order.socketData.attributes.discount_amount || '0'))})</span>
            </div>
          </div>
        )}

        {/* Ajuste de pagamento */}
        {order.socketData?.attributes?.payment_adjustment_amount && parseFloat(order.socketData.attributes.payment_adjustment_amount) !== 0 && (() => {
          const adj = parseFloat(order.socketData.attributes.payment_adjustment_amount);
          const isDiscount = adj < 0;
          return (
            <div className={cn("text-xs mb-2", isPronto ? "text-white" : isDiscount ? "text-green-600" : "text-orange-600")}>
              <div className="flex items-center gap-2">
                <span>{isDiscount ? "🟢" : "🟠"} {isDiscount ? "Desc." : "Acresc."} pagamento: {isDiscount ? "-" : "+"}{formatPrice(Math.abs(adj))}</span>
              </div>
            </div>
          );
        })()}

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
                  {item.attributes.quantity}x {item.attributes.catalog_item?.data?.attributes?.name || item.attributes.name || 'Item não encontrado'}
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

        {/* Exibir horários de saída e entrega */}
        {order.leftTime && (
          <div className={cn("text-xs mb-2", isPronto ? "text-white" : "text-blue-600")}>
            <div className="flex items-center gap-2">
              <span>🚚 Saiu para entrega: {order.leftTime}</span>
            </div>
          </div>
        )}
        
        {order.deliveredTime && (
          <div className={cn("text-xs mb-2", isPronto ? "text-white" : "text-green-600")}>
            <div className="flex items-center gap-2">
              <span>✅ Entregue em: {order.deliveredTime}</span>
            </div>
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
                onClick={handleCancelOrder}
              >
                RECUSAR
                <XCircle className="w-4 h-4 mr-2" />
              </Button>
            </div>
          )}

          {order.status === 'aceitos' && (
            <div className="space-y-2">
              <div className="flex gap-1 justify-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xs text-green-600 hover:text-green-700"
                  onClick={handleWhatsAppNotification}
                  title="Notificar via WhatsApp"
                >
                  <img src="/whatsapp.svg" alt="WhatsApp" className="w-4 h-4" />
                  <span>WhatsApp</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xs"
                  onClick={handlePrintOrder}
                  title="Imprimir Pedido"
                >
                  <Printer className="w-4 h-4"/>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xs"
                  onClick={handleCopyPrintFormat}
                  title="Copiar Formato de Impressão"
                >
                  <Copy className="w-4 h-4"/>
                </Button>
              </div>
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
              
              <Button 
                variant="destructive" 
                className="w-full rounded-xs"
                onClick={handleCancelOrder}
              >
                CANCELAR
                <XCircle className="w-4 h-4 mr-2" />
              </Button>
            </div>
          )}

          {order.status === 'em_analise' && (
            <div className="space-y-2">
              <div className="flex gap-1 justify-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xs text-green-600 hover:text-green-700"
                  onClick={handleWhatsAppNotification}
                  title="Notificar via WhatsApp"
                >
                  <img src="/whatsapp.svg" alt="WhatsApp" className="w-4 h-4" />
                  <span>WhatsApp</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xs"
                  onClick={handlePrintOrder}
                  title="Imprimir Pedido"
                >
                  <Printer className="w-4 h-4"/>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xs"
                  onClick={handleCopyPrintFormat}
                  title="Copiar Formato de Impressão"
                >
                  <Copy className="w-4 h-4"/>
                </Button>
              </div>
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
              <Button 
                variant="destructive" 
                className="w-full rounded-xs"
                onClick={handleCancelOrder}
              >
                CANCELAR
                <XCircle className="w-4 h-4 mr-2" />
              </Button>
            </div>
          )}

          {order.status === 'em_preparo' && (
            <div className="space-y-2">
              <div className="flex gap-1 justify-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xs text-green-600 hover:text-green-700"
                  onClick={handleWhatsAppNotification}
                  title="Notificar via WhatsApp"
                >
                  <img src="/whatsapp.svg" alt="WhatsApp" className="w-4 h-4" />
                  <span>WhatsApp</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xs"
                  onClick={handlePrintOrder}
                  title="Imprimir Pedido"
                >
                  <Printer className="w-4 h-4"/>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xs"
                  onClick={handleCopyPrintFormat}
                  title="Copiar Formato de Impressão"
                >
                  <Copy className="w-4 h-4"/>
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
              <Button 
                variant="destructive" 
                className="w-full rounded-xs"
                onClick={handleCancelOrder}
              >
                CANCELAR
                <XCircle className="w-4 h-4 mr-2" />
              </Button>
            </div>
          )}

          {order.status === 'prontos' && (
            <div className="space-y-2">
              <div className="flex gap-1 justify-center">
              <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xs text-white"
                  onClick={handleWhatsAppNotification}
                  title="Notificar via WhatsApp"
                >
                  <img src="/whatsapp.svg" alt="WhatsApp" className="w-4 h-4" />
                  <span>WhatsApp</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xs text-white"
                  onClick={handlePrintOrder}
                  title="Imprimir Pedido"
                >
                  <Printer className="w-4 h-4"/>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xs text-white"
                  onClick={handleCopyPrintFormat}
                  title="Copiar Formato de Impressão"
                >
                  <Copy className="w-4 h-4"/>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="w-full rounded-xs"
                  onClick={handleLeftForDelivery}
                >
                  <Truck className="w-3 h-3" />
                  SAIU
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full rounded-xs"
                  onClick={handleDelivered}
                >
                  <CheckCircle className="w-2 h-2" />
                  ENTREGUE
                </Button>
              </div>
              <Button 
                variant="destructive" 
                className="w-full rounded-xs border-red-600"
                onClick={handleCancelOrder}
              >
                CANCELAR
                <XCircle className="w-4 h-4 mr-2" />
              </Button>
            </div>
          )}

          {order.status === 'saiu' && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="w-full rounded-xs"
                  onClick={handleDelivered}
                >
                  <CheckCircle className="w-2 h-2" />
                  ENTREGUE
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full rounded-xs"
                  onClick={handleCancelOrder}
                >
                  CANCELAR
                  <XCircle className="w-4 h-4 mr-2" />
                </Button>
              </div>
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
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Modal de Cancelamento */}
    <CancelOrderModal
      open={showCancelModal}
      onOpenChange={setShowCancelModal}
      orderId={order.id}
      customerName={order.customerName}
      onCancelOrder={handleConfirmCancel}
    />
    </>
  );
} 