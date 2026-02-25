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
  Printer,
  Phone,
  MapPin,
  CreditCard,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/app/(public)/[slug]/format-price';
import { User } from '@/app/admin/settings/users/services/userService';
import CancelOrderModal from './cancel-order-modal';
import { buildWhatsAppOrderMessage } from '@/utils/whatsapp-template';

const PAYMENT_LABELS: Record<string, string> = {
  credit: 'Cartão de Crédito',
  debit: 'Cartão de Débito',
  manual_pix: 'Pix',
  cash: 'Dinheiro',
};

const getPaymentLabel = (method: string) => PAYMENT_LABELS[method] || method;

interface Order {
  id: string;
  customerName: string;
  amount: number;
  time: string;
  deliveryPerson?: string;
  status: 'recebidos' | 'aceitos' | 'em_analise' | 'em_preparo' | 'prontos' | 'saiu' | 'entregue' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  readyTime?: string;
  leftTime?: string;
  deliveredTime?: string;
  deliveryType: 'delivery' | 'pickup';
  socketData?: any;
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
  onCancelOrder,
}: OrderCardProps) {
  const { users, loading: loadingUsers } = useUsers();
  const deliveryPeople = users.filter((u: User) => u.attributes.role === 'delivery_man');
  const isPronto = order.status === 'prontos';
  const isTerminal = ['entregue', 'cancelled'].includes(order.status);
  const showDeliveryPerson = order.deliveryType === 'delivery' && !isTerminal;

  const [showCancelModal, setShowCancelModal] = useState(false);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  // CancelOrderModal chama: onCancelOrder(orderId, selectedReasonKey, fullDisplayText)
  const handleConfirmCancel = async (orderId: string, reasonKey: string, fullText?: string) => {
    if (onCancelOrder) {
      await onCancelOrder(orderId, fullText || reasonKey, reasonKey);
    }
  };

  const handleWhatsAppNotification = () => {
    const phone = order.socketData?.attributes?.customer?.data?.attributes?.cellphone?.replace(/\D/g, '') || '';
    const items = (order.socketData?.attributes?.items?.data || []).map((item: any) => ({
      name: item.attributes.catalog_item?.data?.attributes?.name ?? item.attributes.name ?? 'Item removido',
      quantity: item.attributes.quantity,
      totalPrice: parseFloat(item.attributes.total_price || '0'),
      observation: item.attributes.observation || undefined,
    }));

    const message = buildWhatsAppOrderMessage({
      orderId: order.id,
      customerName: order.customerName,
      status: order.status,
      items,
      paymentMethod: order.socketData?.attributes?.payment_method,
      deliveryType: order.deliveryType,
      total: order.amount,
    });

    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handlePrintOrder = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const addressHtml = order.deliveryType === 'delivery' && order.socketData?.attributes?.address?.data
      ? `<p><strong>Endereço:</strong> ${order.socketData.attributes.address.data.attributes.address}</p>
         <p><strong>Bairro:</strong> ${order.socketData.attributes.address.data.attributes.neighborhood}</p>
         ${order.socketData.attributes.address.data.attributes.complement ? `<p><strong>Complemento:</strong> ${order.socketData.attributes.address.data.attributes.complement}</p>` : ''}`
      : '<p><strong>Tipo:</strong> Retirada na loja</p>';

    const itemsHtml = (order.socketData?.attributes?.items?.data || []).map((item: any) => `
      <div class="item">
        <p><strong>${item.attributes.quantity}x ${item.attributes.catalog_item?.data?.attributes?.name ?? item.attributes.name ?? 'Item removido'}</strong></p>
        <p>Preço: R$ ${parseFloat(item.attributes.total_price || '0').toFixed(2)}</p>
        ${item.attributes.observation ? `<p><em>Obs: ${item.attributes.observation}</em></p>` : ''}
      </div>`).join('') || 'Nenhum item';

    printWindow.document.write(`
      <html><head><title>Pedido #${order.id}</title>
      <style>body{font-family:Arial,sans-serif;margin:20px}.header{text-align:center;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:20px}.section{margin-bottom:20px}.section-title{font-weight:bold;font-size:16px;margin-bottom:10px}.item{margin-bottom:10px}.total{font-weight:bold;font-size:18px;border-top:1px solid #000;padding-top:10px}@media print{body{margin:0}}</style>
      </head><body>
      <div class="header"><h1>PEDIDO #${order.id}</h1><p>Data: ${order.time}</p></div>
      <div class="section"><div class="section-title">CLIENTE</div>
        <p><strong>Nome:</strong> ${order.customerName}</p>
        <p><strong>Telefone:</strong> ${order.socketData?.attributes?.customer?.data?.attributes?.cellphone || 'N/A'}</p>
        ${addressHtml}
      </div>
      <div class="section"><div class="section-title">ITENS</div>${itemsHtml}</div>
      <div class="section"><div class="section-title">FORMA DE PAGAMENTO</div>
        <p>${getPaymentLabel(order.socketData?.attributes?.payment_method || '')}</p>
      </div>
      <div class="total"><p><strong>TOTAL: R$ ${order.amount.toFixed(2)}</strong></p></div>
      </body></html>`);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
    toast.success('Impressão iniciada!', { description: 'Pedido enviado para impressora', duration: 2500 });
  };

  const handleCopyPrintFormat = () => {
    const addressText = order.deliveryType === 'delivery' && order.socketData?.attributes?.address?.data
      ? `\n📍 *ENDEREÇO*\n${order.socketData.attributes.address.data.attributes.address}\nBairro: ${order.socketData.attributes.address.data.attributes.neighborhood}${order.socketData.attributes.address.data.attributes.complement ? `\nComplemento: ${order.socketData.attributes.address.data.attributes.complement}` : ''}`
      : '*TIPO: Retirada na loja*';

    const itemsText = (order.socketData?.attributes?.items?.data || []).map((item: any) =>
      `• ${item.attributes.quantity}x ${item.attributes.catalog_item?.data?.attributes?.name ?? item.attributes.name ?? 'Item removido'}\n  R$ ${parseFloat(item.attributes.total_price || '0').toFixed(2)}${item.attributes.observation ? `\n  _Obs: ${item.attributes.observation}_` : ''}`
    ).join('\n') || 'Nenhum item';

    const text = `*PEDIDO #${order.id}*\n${order.time}\n\n*CLIENTE*\nNome: ${order.customerName}\nTelefone: ${order.socketData?.attributes?.customer?.data?.attributes?.cellphone || 'N/A'}\n${addressText}\n\n🛒 *ITENS*\n${itemsText}\n\n💳 *FORMA DE PAGAMENTO*\n${getPaymentLabel(order.socketData?.attributes?.payment_method || '')}\n\n💰 *TOTAL: R$ ${order.amount.toFixed(2)}*`.trim();

    navigator.clipboard.writeText(text).then(() => {
      toast.success('Pedido copiado com sucesso!', { description: 'Formato pronto para WhatsApp/Telegram', duration: 3000 });
    });
  };

  // ─── Sub-componentes internos ─────────────────────────────────────────────────

  // Toolbar de ações rápidas (WhatsApp, Imprimir, Copiar)
  const ActionToolbar = ({ white = false }: { white?: boolean }) => (
    <div className="flex gap-1 justify-center">
      <Button
        variant="ghost"
        size="sm"
        className={cn('rounded-xs', white ? 'text-white hover:text-white/80' : 'text-green-600 hover:text-green-700')}
        onClick={handleWhatsAppNotification}
        title="Notificar via WhatsApp"
      >
        <img src="/whatsapp.svg" alt="WhatsApp" className="w-4 h-4" />
        <span>WhatsApp</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn('rounded-xs', white && 'text-white hover:text-white/80')}
        onClick={handlePrintOrder}
        title="Imprimir Pedido"
      >
        <Printer className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn('rounded-xs', white && 'text-white hover:text-white/80')}
        onClick={handleCopyPrintFormat}
        title="Copiar Formato de Impressão"
      >
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <Card className={cn('mb-4 rounded-xs shadow border-0', config.bgColor)}>
        <CardContent className="p-4">
          {/* Cabeçalho: status de pagamento + ícone de entrega */}
          <div className="flex justify-between items-center mb-2">
            <div className={cn(
              'text-xs font-medium',
              order.paymentStatus === 'pending' ? 'text-red-500' : isPronto ? 'text-white' : 'text-green-500'
            )}>
              {order.paymentStatus === 'pending' ? 'Aguardando pagamento' : 'Pago'}
            </div>
            {order.deliveryType === 'delivery' && (
              <Truck className={cn('w-4 h-4', isPronto && 'text-white')} />
            )}
          </div>

          {/* Cliente + quantidade de itens */}
          <div className={cn('mb-2 flex items-center gap-2', isPronto && 'text-white')}>
            <h3 className={cn('font-bold text-lg leading-tight', isPronto ? 'text-white' : 'text-gray-800')}>
              {order.customerName}
            </h3>
            <Badge variant="secondary" className={cn('text-xs px-2 py-0.5', isPronto && 'bg-white text-primary')}>
              {order.socketData?.attributes?.items?.data?.length || 0} itens
            </Badge>
          </div>

          {/* Valor + horário */}
          <div className={cn('flex items-center gap-2 mb-2', isPronto && 'text-white')}>
            <div className={cn('font-bold text-lg', isPronto ? 'text-white' : 'text-green-600')}>
              {formatPrice(order.amount)}
            </div>
            <span className={cn('text-xs', isPronto ? 'text-white' : 'text-gray-500')}>{order.time}</span>
          </div>

          {/* Bloco de informações do pedido */}
          <div className={cn('rounded-sm p-2 mb-3 space-y-1.5 text-xs', isPronto ? 'bg-white/15' : 'bg-muted/50')}>
            {/* ID */}
            <div className={cn('opacity-60', isPronto ? 'text-white' : 'text-gray-500')}>
              Pedido #{order.id}
            </div>

            {/* Forma de pagamento */}
            <div className={cn('flex items-center gap-1.5', isPronto ? 'text-white' : 'text-gray-700')}>
              <CreditCard className="w-3.5 h-3.5 shrink-0 opacity-70" />
              <span>{getPaymentLabel(order.socketData?.attributes?.payment_method || '')}</span>
            </div>

            {/* Taxa de entrega */}
            {order.deliveryType === 'delivery' &&
              order.socketData?.attributes?.delivery_fee &&
              parseFloat(order.socketData.attributes.delivery_fee) > 0 && (
              <div className={cn('flex items-center gap-1.5', isPronto ? 'text-white' : 'text-blue-600')}>
                <Truck className="w-3.5 h-3.5 shrink-0 opacity-70" />
                <span>Taxa de entrega: {formatPrice(parseFloat(order.socketData.attributes.delivery_fee))}</span>
              </div>
            )}

            {/* Telefone do cliente */}
            <div className={cn('flex items-center gap-1.5', isPronto ? 'text-white' : 'text-gray-700')}>
              <Phone className="w-3.5 h-3.5 shrink-0 opacity-70" />
              <span>{order.socketData?.attributes?.customer?.data?.attributes?.cellphone || 'N/A'}</span>
            </div>

            {/* Endereço (apenas para delivery) */}
            {order.deliveryType === 'delivery' && order.socketData?.attributes?.address?.data && (
              <div className={cn('flex items-start gap-1.5', isPronto ? 'text-white' : 'text-gray-700')}>
                <MapPin className="w-3.5 h-3.5 shrink-0 opacity-70 mt-0.5" />
                <div>
                  <div>{order.socketData.attributes.address.data.attributes.address}</div>
                  {order.socketData.attributes.address.data.attributes.complement && (
                    <div className="opacity-70">{order.socketData.attributes.address.data.attributes.complement}</div>
                  )}
                  <div className="opacity-70">{order.socketData.attributes.address.data.attributes.neighborhood}</div>
                </div>
              </div>
            )}
          </div>

          {/* Itens do pedido (máx. 2 + contador) */}
          {order.socketData?.attributes?.items?.data?.length > 0 && (
            <div className={cn('text-xs mb-2', isPronto ? 'text-white' : 'text-gray-600')}>
              <div className="font-medium mb-1">Itens:</div>
              {order.socketData.attributes.items.data.slice(0, 2).map((item: any) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="truncate">
                    {item.attributes.quantity}x {item.attributes.catalog_item?.data?.attributes?.name ?? item.attributes.name ?? 'Item removido'}
                  </span>
                  <span className="ml-2">{formatPrice(parseFloat(item.attributes.total_price || '0'))}</span>
                </div>
              ))}
              {order.socketData.attributes.items.data.length > 2 && (
                <div className="opacity-60 italic">
                  +{order.socketData.attributes.items.data.length - 2} mais itens
                </div>
              )}
            </div>
          )}

          {/* Observações */}
          {order.socketData?.attributes?.items?.data?.some((item: any) => item.attributes.observation) && (
            <div className={cn('text-xs mb-2', isPronto ? 'text-white' : 'text-orange-600')}>
              <div className="font-medium">Observações:</div>
              {order.socketData.attributes.items.data
                .filter((item: any) => item.attributes.observation)
                .slice(0, 1)
                .map((item: any) => (
                  <div key={item.id} className="italic">"{item.attributes.observation}"</div>
                ))}
            </div>
          )}

          {/* Horários de saída e entrega */}
          {order.leftTime && (
            <div className={cn('flex items-center gap-1.5 text-xs mb-2', isPronto ? 'text-white' : 'text-blue-600')}>
              <Truck className="w-3.5 h-3.5 shrink-0" />
              <span>Saiu para entrega: {order.leftTime}</span>
            </div>
          )}
          {order.deliveredTime && (
            <div className={cn('flex items-center gap-1.5 text-xs mb-2', isPronto ? 'text-white' : 'text-green-600')}>
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Entregue em: {order.deliveredTime}</span>
            </div>
          )}

          {/* Seleção de entregador — apenas para delivery, antes de entregue/cancelado */}
          {showDeliveryPerson && (
            <div className="mb-3">
              <div className={cn('flex items-center gap-1.5 text-xs mb-1', isPronto ? 'text-white' : 'text-gray-600')}>
                <Truck className="w-3.5 h-3.5 shrink-0 opacity-70" />
                <span>Entregador</span>
              </div>
              <Select
                value={order.deliveryPerson || ''}
                onValueChange={(value) => onDeliveryPersonChange(order.id, value)}
                disabled={loadingUsers}
              >
                <SelectTrigger className={cn('w-full h-8 text-xs rounded-xs', isPronto && 'bg-white/20 text-white border-white/30')}>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {deliveryPeople.map((person) => (
                    <SelectItem key={person.id} value={person.attributes.name} className="text-xs">
                      {person.attributes.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* ─── Botões de ação por status ─────────────────────────────────── */}
          <div className="space-y-2">

            {/* RECEBIDOS */}
            {order.status === 'recebidos' && (
              <div className="space-y-2">
                <Button
                  className="w-full bg-white text-black font-semibold hover:bg-primary/90 hover:text-white rounded-xs"
                  onClick={() => onUpdateOrderStatus(order.id, 'aceitos')}
                >
                  ACEITAR <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="destructive"
                  className="w-full rounded-xs"
                  onClick={() => setShowCancelModal(true)}
                >
                  RECUSAR <XCircle className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* ACEITOS */}
            {order.status === 'aceitos' && (
              <div className="space-y-2">
                <ActionToolbar />
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="w-full rounded-xs" onClick={() => onUpdateOrderStatus(order.id, 'em_analise')}>
                    EM ANÁLISE
                  </Button>
                  <Button variant="outline" className="w-full rounded-xs" onClick={() => onUpdateOrderStatus(order.id, 'em_preparo')}>
                    EM PREPARO
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={order.paymentStatus === 'paid' ? 'default' : 'outline'}
                    className={cn('w-full rounded-xs', order.paymentStatus === 'paid' && 'bg-primary text-white hover:bg-primary/90')}
                    onClick={() => onTogglePaymentStatus(order.id)}
                  >
                    PAGO {order.paymentStatus === 'paid' && <CheckCircle className="w-4 h-4 ml-1" />}
                  </Button>
                  <Button variant="outline" className="w-full rounded-xs" onClick={() => onUpdateOrderStatus(order.id, 'prontos')}>
                    PRONTO
                  </Button>
                </div>
                <Button variant="destructive" className="w-full rounded-xs" onClick={() => setShowCancelModal(true)}>
                  CANCELAR <XCircle className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* EM ANÁLISE */}
            {order.status === 'em_analise' && (
              <div className="space-y-2">
                <ActionToolbar />
                <Button variant="outline" className="w-full rounded-xs" onClick={() => onUpdateOrderStatus(order.id, 'em_preparo')}>
                  EM PREPARO
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={order.paymentStatus === 'paid' ? 'default' : 'outline'}
                    className={cn('w-full rounded-xs', order.paymentStatus === 'paid' && 'bg-primary text-white hover:bg-primary/90')}
                    onClick={() => onTogglePaymentStatus(order.id)}
                  >
                    PAGO {order.paymentStatus === 'paid' && <CheckCircle className="w-4 h-4 ml-1" />}
                  </Button>
                  <Button variant="outline" className="w-full rounded-xs" onClick={() => onUpdateOrderStatus(order.id, 'prontos')}>
                    PRONTO
                  </Button>
                </div>
                <Button variant="destructive" className="w-full rounded-xs" onClick={() => setShowCancelModal(true)}>
                  CANCELAR <XCircle className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* EM PREPARO */}
            {order.status === 'em_preparo' && (
              <div className="space-y-2">
                <ActionToolbar />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={order.paymentStatus === 'paid' ? 'default' : 'outline'}
                    className={cn('w-full rounded-xs', order.paymentStatus === 'paid' && 'bg-primary text-white hover:bg-primary/90')}
                    onClick={() => onTogglePaymentStatus(order.id)}
                  >
                    PAGO {order.paymentStatus === 'paid' && <CheckCircle className="w-4 h-4 ml-1" />}
                  </Button>
                  <Button variant="outline" className="w-full rounded-xs" onClick={() => onUpdateOrderStatus(order.id, 'prontos')}>
                    PRONTO
                  </Button>
                </div>
                <Button variant="destructive" className="w-full rounded-xs" onClick={() => setShowCancelModal(true)}>
                  CANCELAR <XCircle className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* PRONTOS */}
            {order.status === 'prontos' && (
              <div className="space-y-2">
                <ActionToolbar white />
                <div className={cn('grid gap-2', order.deliveryType === 'delivery' ? 'grid-cols-2' : 'grid-cols-1')}>
                  {/* SAIU só aparece para delivery */}
                  {order.deliveryType === 'delivery' && (
                    <Button
                      variant="outline"
                      className="w-full rounded-xs"
                      onClick={() => onUpdateOrderStatus(order.id, 'saiu')}
                    >
                      <Truck className="w-3 h-3 mr-1" /> SAIU
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full rounded-xs"
                    onClick={() => onUpdateOrderStatus(order.id, 'entregue')}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" /> ENTREGUE
                  </Button>
                </div>
                <Button variant="destructive" className="w-full rounded-xs border-red-600" onClick={() => setShowCancelModal(true)}>
                  CANCELAR <XCircle className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* SAIU PARA ENTREGA */}
            {order.status === 'saiu' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="w-full rounded-xs" onClick={() => onUpdateOrderStatus(order.id, 'entregue')}>
                    <CheckCircle className="w-3 h-3 mr-1" /> ENTREGUE
                  </Button>
                  <Button variant="destructive" className="w-full rounded-xs" onClick={() => setShowCancelModal(true)}>
                    CANCELAR <XCircle className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Botão de detalhes sempre visível */}
            <Button
              variant="outline"
              className={cn('w-full rounded-xs', isPronto && 'border-white text-white hover:bg-white/10')}
              onClick={() => onOpenOrderDetails(order.id)}
            >
              <SquarePen className="w-4 h-4 mr-2" /> DETALHES DO PEDIDO
            </Button>
          </div>
        </CardContent>
      </Card>

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
