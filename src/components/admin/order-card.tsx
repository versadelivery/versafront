'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUsers } from '@/app/admin/settings/users/hooks/useUsers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Truck,
  CheckCircle,
  XCircle,
  PackageX,
  Copy,
  ArrowRight,
  MessageCircle,
  Printer,
  CreditCard,
  Phone,
  MapPin,
  Tag,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { usePrepTimer } from '@/hooks/use-prep-timer';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/app/(public)/[slug]/format-price';
import { User } from '@/app/admin/settings/users/services/userService';
import CancelOrderModal from './cancel-order-modal';
import SelectDeliveryPersonModal from './select-delivery-person-modal';
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

// Labels para o botão de avançar status
const nextStatusLabels: Record<string, string> = {
  aceitos: 'ACEITAR',
  em_analise: 'EM ANÁLISE',
  em_preparo: 'EM PREPARO',
  prontos: 'PRONTO',
  saiu: 'SAIU P/ ENTREGA',
  entregue: 'ENTREGUE',
};

interface OrderCardProps {
  order: Order;
  config: any;
  estimatedPrepTime?: number | null;
  estimatedDeliveryTime?: number | null;
  defaultDeliveryPersonName?: string | null;
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  onTogglePaymentStatus: (orderId: string) => void;
  onDeliveryPersonChange: (orderId: string, deliveryPerson: string) => void;
  onOpenOrderDetails: (orderId: string) => void;
  onCancelOrder?: (orderId: string, reason: string, reasonType?: string) => void;
  nextStatus?: Order['status'] | null;
}

export default function OrderCard({
  order,
  config,
  estimatedPrepTime,
  estimatedDeliveryTime,
  defaultDeliveryPersonName,
  onUpdateOrderStatus,
  onTogglePaymentStatus,
  onDeliveryPersonChange,
  onOpenOrderDetails,
  onCancelOrder,
  nextStatus
}: OrderCardProps) {
  // Buscar entregadores reais
  const { users, loading: loadingUsers } = useUsers();

  // Cronômetro de preparo — ativo para pedidos aceitos, em análise ou em preparo
  const acceptedAt = order.socketData?.attributes?.accepted_at;
  const isPrepping = ['aceitos', 'em_analise', 'em_preparo'].includes(order.status);
  const prepTimer = usePrepTimer(isPrepping ? acceptedAt : null, estimatedPrepTime, 'Preparo');

  // Cronômetro de entrega — ativo a partir de pronto (ready_at) até ser entregue
  const readyAt = order.socketData?.attributes?.ready_at;
  const isDelivering = ['prontos', 'saiu'].includes(order.status);
  const deliveryTimer = usePrepTimer(isDelivering ? readyAt : null, estimatedDeliveryTime, 'Entrega');

  // Timer ativo (preparo ou entrega)
  const timer = prepTimer || deliveryTimer;
  const hasActiveTimer = !!timer;
  const deliveryPeople = users.filter((u: User) => u.attributes.role === 'delivery_man');

  const isRecebido = order.status === 'recebidos';
  const isEntregue = order.status === 'entregue';
  const isCancelled = order.status === 'cancelled';
  
  // Estado para controlar os modais
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeliveryFailedModal, setShowDeliveryFailedModal] = useState(false);
  const [showDeliveryPersonModal, setShowDeliveryPersonModal] = useState(false);

  // Pedidos de retirada pulam o status 'saiu' e vão direto para 'entregue'
  const effectiveNextStatus = (nextStatus === 'saiu' && order.deliveryType === 'pickup')
    ? 'entregue' as Order['status']
    : nextStatus;

  // Statuses onde o dropdown de entregador fica disponível (apenas para delivery)
  const showDeliveryDropdown = order.deliveryType === 'delivery' && ['recebidos', 'aceitos', 'em_analise', 'em_preparo', 'prontos'].includes(order.status);

  // Pré-selecionar motoboy padrão quando pedido de delivery não tem entregador
  const defaultAppliedRef = useRef(false);
  useEffect(() => {
    if (
      !defaultAppliedRef.current &&
      defaultDeliveryPersonName &&
      !order.deliveryPerson &&
      order.deliveryType === 'delivery'
    ) {
      defaultAppliedRef.current = true;
      onDeliveryPersonChange(order.id, defaultDeliveryPersonName);
    }
  }, [defaultDeliveryPersonName, order.deliveryPerson, order.deliveryType, order.id]);
  
  const handleDeliveryPersonChange = (value: string) => {
    onDeliveryPersonChange(order.id, value === "none" ? "" : value);
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
    if (!order.deliveryPerson) {
      setShowDeliveryPersonModal(true);
      return;
    }
    if (onUpdateOrderStatus) {
      await onUpdateOrderStatus(order.id, 'saiu');
    }
  };

  // Confirmar saída com entregador selecionado no modal
  const handleConfirmDeliveryAndDispatch = async (deliveryPersonName: string) => {
    onDeliveryPersonChange(order.id, deliveryPersonName);
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

  const items = order.socketData?.attributes?.items?.data;
  const itemCount = items?.length || 0;
  const address = order.socketData?.attributes?.address?.data?.attributes;
  const rawPhone = order.socketData?.attributes?.customer?.data?.attributes?.cellphone;
  const customerPhone = rawPhone && rawPhone !== 'N/A' ? rawPhone : undefined;
  const paymentMethod = order.socketData?.attributes?.payment_method;
  const deliveryFee = order.socketData?.attributes?.delivery_fee ? parseFloat(order.socketData.attributes.delivery_fee) : 0;
  const couponCode = order.socketData?.attributes?.coupon_code;
  const discountAmount = parseFloat(order.socketData?.attributes?.discount_amount || '0');
  const paymentAdj = order.socketData?.attributes?.payment_adjustment_amount ? parseFloat(order.socketData.attributes.payment_adjustment_amount) : 0;
  const hasObservations = items?.some((item: any) => item.attributes.observation);

  return (
    <>
    <Card className={cn(
      "mb-3 rounded-md border shadow-none overflow-hidden",
      timer?.isOverdue
        ? "border-red-400"
        : "border-[#E5E2DD]",
      isRecebido ? "bg-[#FFFBF5]"
        : isEntregue ? "bg-[#7ED957]"
        : isCancelled ? "bg-white opacity-50"
        : "bg-white"
    )}>
      <CardContent className="p-0">
        {/* ── Header: ID + horário + tipo + pagamento ── */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-700">
            <span className="font-medium">#{order.id}</span>
            <span>·</span>
            <span>{order.time}</span>
            {order.deliveryType === 'delivery' && (
              <>
                <span>·</span>
                <Truck className="w-3 h-3" />
              </>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn("text-[10px] font-semibold underline underline-offset-2 cursor-default",
                order.paymentStatus === 'pending'
                  ? 'text-red-600 decoration-red-600'
                  : 'text-green-600 decoration-green-600'
              )}>
                {order.paymentStatus === 'pending' ? 'Aguardando' : 'Pago'}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-gray-800 text-white [&>svg]:fill-gray-800 [&>svg]:bg-gray-800">
              {order.paymentStatus === 'pending' ? 'Aguardando pagamento' : 'O pedido foi pago'}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* ── Cliente ── */}
        <div className="px-3 pb-2">
          <h3 className="font-bold text-sm leading-tight truncate text-gray-900">
            {order.customerName}
          </h3>
          {customerPhone && (
            <div className="flex items-center gap-1.5 text-xs text-gray-700 mt-0.5">
              <Phone className="w-3 h-3" />
              <span>{customerPhone}</span>
            </div>
          )}
        </div>

        <hr className="border-[#E5E2DD]" />

        {/* ── Itens + Total ── */}
        <div className="px-3 py-2">
          {itemCount > 0 && (
            <div className="space-y-0.5 text-xs text-gray-700 mb-2">
              {items.slice(0, 3).map((item: any) => (
                <div key={item.id} className="flex justify-between items-center gap-2">
                  <span className="truncate min-w-0">
                    {item.attributes.quantity}x {item.attributes.catalog_item?.data?.attributes?.name || item.attributes.name || 'Item removido'}
                  </span>
                  <span className="flex-shrink-0 text-gray-700">
                    {formatPrice(parseFloat(item.attributes.total_price || '0'))}
                  </span>
                </div>
              ))}
              {itemCount > 3 && (
                <div className="text-gray-700 text-[11px]">
                  +{itemCount - 3} {itemCount - 3 === 1 ? 'item' : 'itens'}
                </div>
              )}
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-700">Total</span>
            <span className={cn("font-bold text-base", isEntregue ? "text-[#1B1B1B]" : "text-primary")}>
              {formatPrice(order.amount)}
            </span>
          </div>
        </div>

        {/* ── Detalhes financeiros (pagamento, taxa, cupom, ajuste) ── */}
        {(paymentMethod || (order.deliveryType === 'delivery' && deliveryFee > 0) || couponCode || paymentAdj !== 0) && (
          <>
            <hr className="border-[#E5E2DD]" />
            <div className="px-3 py-2 space-y-1 text-xs">
              {paymentMethod && (
                <div className="flex items-center gap-1.5 text-gray-700">
                  <CreditCard className="w-3 h-3 text-gray-700" />
                  <span>{getPaymentMethodLabel(paymentMethod)}</span>
                </div>
              )}
              {order.deliveryType === 'delivery' && deliveryFee > 0 && (
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Truck className="w-3 h-3 text-gray-700" />
                  <span>Entrega: {formatPrice(deliveryFee)}</span>
                </div>
              )}
              {couponCode && (
                <div className="flex items-center gap-1.5 text-green-600">
                  <Tag className="w-3 h-3 text-green-500" />
                  <span>{couponCode} (-{formatPrice(discountAmount)})</span>
                </div>
              )}
              {paymentAdj !== 0 && (
                <div className={cn("flex items-center gap-1.5", paymentAdj < 0 ? "text-green-600" : "text-orange-600")}>
                  <span className={cn("w-2 h-2 rounded-full flex-shrink-0", paymentAdj < 0 ? "bg-green-500" : "bg-orange-500")} />
                  <span>{paymentAdj < 0 ? "Desc." : "Acresc."}: {paymentAdj < 0 ? "-" : "+"}{formatPrice(Math.abs(paymentAdj))}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Endereço (delivery) ── */}
        {order.deliveryType === 'delivery' && address && (
          <>
            <hr className="border-[#E5E2DD]" />
            <div className="px-3 py-2">
              <div className="flex items-start gap-1.5 text-xs text-gray-700">
                <MapPin className="w-3 h-3 text-gray-700 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="truncate">{address.address}</div>
                  {address.complement && (
                    <div className="text-gray-700 truncate">{address.complement}</div>
                  )}
                  <div className="text-gray-700 truncate">{address.neighborhood}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Observações ── */}
        {hasObservations && (
          <>
            <hr className="border-[#E5E2DD]" />
            <div className="px-3 py-2">
              <div className="text-xs text-orange-600 space-y-0.5">
                {items
                  .filter((item: any) => item.attributes.observation)
                  .slice(0, 2)
                  .map((item: any) => (
                    <div key={item.id} className="flex items-start gap-1.5">
                      <MessageCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span className="italic">"{item.attributes.observation}"</span>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        {/* ── Entregador ── */}
        {(showDeliveryDropdown || order.deliveryPerson) && (
          <>
            <hr className="border-[#E5E2DD]" />
            <div className="px-3 py-2 text-xs text-gray-700">
              {showDeliveryDropdown ? (
                <div className="flex items-center gap-2">
                  <Truck className="w-3 h-3 text-gray-700" />
                  <Select
                    value={order.deliveryPerson || "none"}
                    onValueChange={handleDeliveryPersonChange}
                    disabled={loadingUsers}
                  >
                    <SelectTrigger className="h-7 text-xs max-w-[180px] rounded-md cursor-pointer border-[#E5E2DD] bg-white">
                      <SelectValue placeholder="Selecione entregador" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border-[#E5E2DD]">
                      <SelectItem value="none">Selecione entregador</SelectItem>
                      {deliveryPeople.map(dp => (
                        <SelectItem key={dp.id} value={dp.attributes.name}>
                          {dp.attributes.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {loadingUsers && <span className="text-gray-700 ml-1">Carregando...</span>}
                </div>
              ) : order.deliveryPerson ? (
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3 h-3 text-gray-700" />
                  <span>Entregador: <span className="font-semibold">{order.deliveryPerson}</span></span>
                </div>
              ) : null}
            </div>
          </>
        )}

        {/* ── Timer de preparo/entrega ── */}
        {hasActiveTimer && timer && (
          <>
            <hr className="border-[#E5E2DD]" />
            <div className="px-3 py-2">
              <div className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold",
                timer.isOverdue
                  ? "border-red-300 bg-white text-red-700"
                  : "border-[#E5E2DD] bg-white text-gray-700"
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", timer.isOverdue ? "bg-red-500" : "bg-primary")} />
                <span>{timer.timerLabel}</span>
                <span className={cn("tabular-nums font-bold", timer.isOverdue ? "text-red-700" : "text-gray-900")}>
                  {timer.label}
                </span>
              </div>
            </div>
          </>
        )}

        {/* ── Timeline (saiu / entregue) ── */}
        {(order.leftTime || order.deliveredTime) && (
          <>
            <hr className="border-[#E5E2DD]" />
            <div className="px-3 py-2 space-y-1 text-xs">
              {order.leftTime && (
                <div className="flex items-center gap-1.5 text-blue-600">
                  <Truck className="w-3 h-3" />
                  <span>Saiu: {order.leftTime}</span>
                </div>
              )}
              {order.deliveredTime && (
                <div className="flex items-center gap-1.5 text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  <span>Entregue: {order.deliveredTime}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Ações ── */}
        <hr className="border-[#E5E2DD]" />
        <div className="px-3 py-2.5 space-y-2">
          {/* Botões utilitários (WhatsApp, Imprimir, Copiar) — aparecem após recebido */}
          {!isRecebido && !isEntregue && !isCancelled && (
            <div className="flex gap-1 justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-md border border-gray-300 cursor-pointer text-green-600 hover:text-green-700"
                onClick={handleWhatsAppNotification}
                title="Notificar via WhatsApp"
              >
                <img src="/whatsapp.svg" alt="WhatsApp" className="w-4 h-4" />
                <span>WhatsApp</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-md border border-gray-300 cursor-pointer"
                onClick={handlePrintOrder}
                title="Imprimir Pedido"
              >
                <Printer className="w-4 h-4"/>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-md border border-gray-300 cursor-pointer"
                onClick={handleCopyPrintFormat}
                title="Copiar Formato de Impressão"
              >
                <Copy className="w-4 h-4"/>
              </Button>
            </div>
          )}

          {/* Botão principal: avançar para o próximo status do fluxo */}
          {effectiveNextStatus && !isEntregue && !isCancelled && (
            <Button
              variant="ghost"
              className="w-full font-semibold rounded-xl bg-[#1B1B1B] text-white hover:bg-[#7ED957] hover:text-black transition-colors cursor-pointer"
              onClick={() => {
                if (effectiveNextStatus === 'saiu') {
                  handleLeftForDelivery();
                } else {
                  onUpdateOrderStatus(order.id, effectiveNextStatus);
                }
              }}
            >
              {nextStatusLabels[effectiveNextStatus] || effectiveNextStatus.toUpperCase()}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {/* Botão PAGO — disponível enquanto o pedido está em andamento */}
          {!isRecebido && !isEntregue && !isCancelled && (
            <Button
              variant="ghost"
              className={cn(
                'w-full font-semibold rounded-xl border transition-colors cursor-pointer',
                order.paymentStatus === 'paid'
                  ? 'bg-primary text-white border-primary hover:bg-primary/90 hover:text-white'
                  : 'bg-white text-[#1B1B1B] border-[#1B1B1B] hover:!bg-primary hover:!text-white hover:!border-primary'
              )}
              onClick={() => onTogglePaymentStatus(order.id)}
            >
              PAGO {order.paymentStatus === 'paid' && <CheckCircle className="w-4 h-4 ml-1" />}
            </Button>
          )}

          {/* Botão ENTREGA NÃO REALIZADA — aparece apenas para pedidos delivery que saíram para entrega */}
          {order.status === 'saiu' && order.deliveryType === 'delivery' && !isCancelled && (
            <Button
              variant="ghost"
              className="w-full font-semibold rounded-xl bg-orange-500 text-white hover:bg-orange-600 hover:text-white transition-colors cursor-pointer"
              onClick={() => setShowDeliveryFailedModal(true)}
            >
              ENTREGA NÃO REALIZADA
              <PackageX className="w-4 h-4 ml-1" />
            </Button>
          )}

          {/* Botão CANCELAR / RECUSAR */}
          {!isEntregue && !isCancelled && (
            <Button
              variant="ghost"
              className="w-full font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 hover:text-white transition-colors cursor-pointer"
              onClick={handleCancelOrder}
            >
              {isRecebido ? 'RECUSAR' : 'CANCELAR'}
              <XCircle className="w-4 h-4 ml-1" />
            </Button>
          )}

          <Button
            variant="ghost"
            className="w-full font-semibold rounded-xl bg-white text-[#1B1B1B] border border-[#1B1B1B] hover:!bg-[#1B1B1B] hover:!text-white transition-colors cursor-pointer"
            onClick={handleOpenOrderDetails}
          >
            DETALHES DO PEDIDO
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Modal de Cancelamento */}
    <CancelOrderModal
      open={showCancelModal}
      onOpenChange={setShowCancelModal}
      orderId={order.id}
      customerName={order.customerName}
      orderStatus={order.status}
      onCancelOrder={handleConfirmCancel}
    />

    {/* Modal de Entrega Não Realizada */}
    <CancelOrderModal
      open={showDeliveryFailedModal}
      onOpenChange={setShowDeliveryFailedModal}
      orderId={order.id}
      customerName={order.customerName}
      orderStatus={order.status}
      mode="delivery_failed"
      onCancelOrder={handleConfirmCancel}
    />

    {/* Modal de Seleção de Entregador */}
    <SelectDeliveryPersonModal
      open={showDeliveryPersonModal}
      onOpenChange={setShowDeliveryPersonModal}
      deliveryPeople={deliveryPeople}
      onConfirm={handleConfirmDeliveryAndDispatch}
      defaultValue={defaultDeliveryPersonName || ''}
    />
    </>
  );
} 