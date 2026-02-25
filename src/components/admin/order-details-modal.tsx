import React, { useState, useEffect, useMemo } from 'react';
import { useUsers } from '@/app/admin/settings/users/hooks/useUsers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import {
  Copy, Loader2, Store, Truck, User, MapPin, Package,
  CreditCard, CheckCircle2, Clock, Minus, Plus,
} from 'lucide-react';
import { toast } from 'sonner';

// =============================================================================
// TIPOS
// =============================================================================

interface OrderItem {
  id: string;
  catalog_item_id?: number;
  name: string;
  price: number;      // preço unitário
  quantity: number;
  observation?: string;
  image?: string;
  weight?: string;
  extras?: Array<{ name: string; price: number }>;
  prepare_methods?: Array<{ name: string }>;
  steps?: Array<{ name: string; options?: Array<{ name: string }> }>;
}

interface OrderDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    id: string;
    date: string;
    status: string;
    payment_status: string;
    total: number;
    withdrawal: boolean;
    payment_method: string;
    delivery_fee?: number;
    address?: {
      address: string;
      neighborhood: string;
      complement?: string;
      reference?: string;
    };
    items: OrderItem[];
    shop: { name: string; phone: string };
    customer?: { name: string; phone: string };
    deliveryPerson?: string;
  };
  onUpdateOrder?: (orderId: string, data: Record<string, any>) => Promise<void>;
  onCancelOrder?: (orderId: string) => Promise<void>;
}

interface EditedItem {
  id: string;
  price: number;
  quantity: number;
  observation: string;
}

// =============================================================================
// HELPERS
// =============================================================================

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  recebidos:  { label: 'RECEBIDO',    color: 'bg-amber-500 text-white' },
  aceitos:    { label: 'ACEITO',      color: 'bg-blue-500 text-white' },
  em_analise: { label: 'EM ANÁLISE',  color: 'bg-yellow-500 text-white' },
  em_preparo: { label: 'EM PREPARO',  color: 'bg-orange-500 text-white' },
  prontos:    { label: 'PRONTO',      color: 'bg-primary text-white' },
  saiu:       { label: 'EM TRÂNSITO', color: 'bg-blue-600 text-white' },
  entregue:   { label: 'ENTREGUE',    color: 'bg-emerald-500 text-white' },
  cancelled:  { label: 'CANCELADO',   color: 'bg-red-500 text-white' },
};

const PAYMENT_OPTIONS = [
  { value: 'credit',     label: 'Cartão de Crédito' },
  { value: 'debit',      label: 'Cartão de Débito' },
  { value: 'manual_pix', label: 'Pix' },
  { value: 'cash',       label: 'Dinheiro' },
];

const getStatusInfo = (status: string) =>
  STATUS_MAP[status] ?? { label: status.toUpperCase(), color: 'bg-gray-500 text-white' };

const getPaymentLabel = (method: string) =>
  PAYMENT_OPTIONS.find(o => o.value === method)?.label ?? method;

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

// Formata float para string de preço com 2 casas
const fmtPrice = (value: number) => value.toFixed(2).replace('.', ',');

// Parseia string de preço de volta para float
const parsePrice = (str: string) => {
  const n = parseFloat(str.replace(',', '.').replace(/[^\d.]/g, ''));
  return isNaN(n) ? 0 : n;
};

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export default function OrderDetailsModal({
  open, onOpenChange, order, onUpdateOrder, onCancelOrder,
}: OrderDetailsModalProps) {
  const { users, loading: loadingUsers } = useUsers();
  const deliveryPeople = users.filter((u: any) => u.attributes?.role === 'delivery_man');

  // ─── Estado dos campos editáveis ──────────────────────────────────────────────
  const [customerName, setCustomerName]                 = useState(order.customer?.name || '');
  const [customerPhone, setCustomerPhone]               = useState(order.customer?.phone || '');
  const [addressLine, setAddressLine]                   = useState(order.address?.address || '');
  const [addressNeighborhood, setAddressNeighborhood]   = useState(order.address?.neighborhood || '');
  const [addressComplement, setAddressComplement]       = useState(order.address?.complement || '');
  const [addressReference, setAddressReference]         = useState(order.address?.reference || '');
  const [deliveryPerson, setDeliveryPerson]             = useState(order.deliveryPerson || '');
  const [paymentMethod, setPaymentMethod]               = useState(order.payment_method);
  const [paymentStatus, setPaymentStatus]               = useState(order.payment_status);
  const [deliveryFeeValue, setDeliveryFeeValue]         = useState(order.withdrawal ? 0 : (order.delivery_fee ?? 0));
  const [editedItems, setEditedItems]                   = useState<EditedItem[]>(() =>
    order.items.map(item => ({
      id: item.id,
      price: item.price,
      quantity: item.quantity,
      observation: item.observation || '',
    }))
  );
  const [isSaving, setIsSaving] = useState(false);

  // Sincroniza quando o pedido muda (ex: abrir modal de outro pedido)
  useEffect(() => {
    setCustomerName(order.customer?.name || '');
    setCustomerPhone(order.customer?.phone || '');
    setAddressLine(order.address?.address || '');
    setAddressNeighborhood(order.address?.neighborhood || '');
    setAddressComplement(order.address?.complement || '');
    setAddressReference(order.address?.reference || '');
    setDeliveryPerson(order.deliveryPerson || '');
    setPaymentMethod(order.payment_method);
    setPaymentStatus(order.payment_status);
    setDeliveryFeeValue(order.withdrawal ? 0 : (order.delivery_fee ?? 0));
    setEditedItems(order.items.map(item => ({
      id: item.id,
      price: item.price,
      quantity: item.quantity,
      observation: item.observation || '',
    })));
  }, [order.id]);

  // ─── Valores derivados ────────────────────────────────────────────────────────
  const statusInfo = getStatusInfo(order.status);
  const isTerminal = ['entregue', 'cancelled'].includes(order.status);

  const computedSubtotal = useMemo(
    () => editedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [editedItems],
  );
  const computedTotal = order.withdrawal ? computedSubtotal : computedSubtotal + deliveryFeeValue;

  const isDirty = useMemo(() => {
    if (customerName      !== (order.customer?.name  || '')) return true;
    if (customerPhone     !== (order.customer?.phone || '')) return true;
    if (addressLine       !== (order.address?.address       || '')) return true;
    if (addressNeighborhood !== (order.address?.neighborhood || '')) return true;
    if (addressComplement !== (order.address?.complement    || '')) return true;
    if (addressReference  !== (order.address?.reference     || '')) return true;
    if (deliveryPerson    !== (order.deliveryPerson || '')) return true;
    if (paymentMethod     !== order.payment_method)  return true;
    if (paymentStatus     !== order.payment_status)  return true;
    if (!order.withdrawal && deliveryFeeValue !== (order.delivery_fee ?? 0)) return true;
    if (editedItems.some((item, i) => {
      const orig = order.items[i];
      return item.price       !== orig.price
          || item.quantity    !== orig.quantity
          || item.observation !== (orig.observation || '');
    })) return true;
    return false;
  }, [
    customerName, customerPhone,
    addressLine, addressNeighborhood, addressComplement, addressReference,
    deliveryPerson, paymentMethod, paymentStatus, deliveryFeeValue, editedItems,
    order,
  ]);

  // ─── Handlers ─────────────────────────────────────────────────────────────────

  const handleItemChange = (index: number, field: keyof EditedItem, value: string | number) => {
    setEditedItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleItemQuantity = (index: number, delta: number) => {
    setEditedItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const next = Math.max(1, item.quantity + delta);
      return { ...item, quantity: next };
    }));
  };

  const handleSave = async () => {
    if (!onUpdateOrder || !isDirty) return;

    const changes: Record<string, any> = {};

    // Cliente
    if (customerName !== (order.customer?.name || '') || customerPhone !== (order.customer?.phone || '')) {
      changes.customer = { name: customerName, phone: customerPhone };
    }

    // Endereço
    if (
      addressLine         !== (order.address?.address       || '') ||
      addressNeighborhood !== (order.address?.neighborhood  || '') ||
      addressComplement   !== (order.address?.complement    || '') ||
      addressReference    !== (order.address?.reference     || '')
    ) {
      changes.address = {
        address:      addressLine,
        neighborhood: addressNeighborhood,
        complement:   addressComplement,
        reference:    addressReference,
      };
    }

    // Entregador
    if (deliveryPerson !== (order.deliveryPerson || '')) {
      changes.deliveryPerson = deliveryPerson;
    }

    // Pagamento
    if (paymentMethod !== order.payment_method) changes.payment_method = paymentMethod;
    if (paymentStatus !== order.payment_status)  changes.payment_status = paymentStatus;

    // Taxa de entrega
    if (!order.withdrawal && deliveryFeeValue !== (order.delivery_fee ?? 0)) {
      changes.delivery_fee = deliveryFeeValue;
    }

    // Itens (preço unitário, quantidade, observação)
    const itemChanges: Record<string, any> = {};
    editedItems.forEach((item, i) => {
      const orig = order.items[i];
      if (item.price !== orig.price || item.quantity !== orig.quantity || item.observation !== (orig.observation || '')) {
        itemChanges[item.id] = { price: item.price, quantity: item.quantity, observation: item.observation };
      }
    });
    if (Object.keys(itemChanges).length > 0) {
      changes.items = itemChanges;
    }

    // Total calculado
    changes.total = computedTotal;

    setIsSaving(true);
    try {
      await onUpdateOrder(order.id, changes);
      toast.success('Pedido atualizado com sucesso!');
    } catch {
      toast.error('Erro ao salvar alterações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!onCancelOrder) return;
    await onCancelOrder(order.id);
    onOpenChange(false);
  };

  const handleCopyInfo = () => {
    const itemsText = order.items
      .map(item => `  ${item.quantity}x ${item.name} — ${formatCurrency(item.price * item.quantity)}`)
      .join('\n');
    const addressText = !order.withdrawal && order.address
      ? `\nEndereço: ${order.address.address}, ${order.address.neighborhood}`
      : '';

    navigator.clipboard.writeText(
      `Pedido #${order.id}\nCliente: ${order.customer?.name || 'N/A'} | Tel: ${order.customer?.phone || 'N/A'}${addressText}\nPagamento: ${getPaymentLabel(order.payment_method)}\n\nItens:\n${itemsText}\n\nTotal: ${formatCurrency(order.total)}`
    );
    toast.success('Informações copiadas!');
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl p-0 bg-white max-h-[95dvh] sm:max-h-[90vh] flex flex-col overflow-hidden">

        {/* ─── Header ────────────────────────────────────────────────────────────── */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          {/* Título — pr-10 para deixar espaço para o X do Dialog */}
          <div className="pr-10">
            <DialogTitle className="text-lg font-semibold">Pedido #{order.id}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
              {formatDate(order.date)} · {getPaymentLabel(order.payment_method)}
            </DialogDescription>
          </div>
          {/* Status + ações numa linha abaixo, longe do X */}
          <div className="flex items-center gap-2 mt-3">
            <Badge className={`${statusInfo.color} px-3 py-1 text-xs font-semibold rounded-md`}>
              {statusInfo.label}
            </Badge>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={handleCopyInfo}>
              <Copy className="h-3.5 w-3.5" />
              <span className="text-xs">Copiar</span>
            </Button>
          </div>
        </DialogHeader>

        {/* ─── Conteúdo scrollável ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Tipo de entrega */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40">
            {order.withdrawal
              ? <Store className="h-4 w-4 text-muted-foreground shrink-0" />
              : <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
            }
            <span className="text-sm font-medium">
              {order.withdrawal ? 'Retirada na loja' : 'Entrega em domicílio'}
            </span>
          </div>

          {/* ── Cliente ── */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nome</label>
                <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nome do cliente" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Telefone</label>
                <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="(00) 00000-0000" />
              </div>
            </div>
          </div>

          {/* ── Endereço (delivery) ── */}
          {!order.withdrawal && (
            <>
              <hr className="border-gray-100" />
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Endereço de Entrega</p>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Endereço</label>
                    <Textarea
                      value={addressLine}
                      onChange={e => setAddressLine(e.target.value)}
                      placeholder="Rua, número..."
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Bairro</label>
                      <Input value={addressNeighborhood} onChange={e => setAddressNeighborhood(e.target.value)} placeholder="Bairro" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Complemento</label>
                      <Input value={addressComplement} onChange={e => setAddressComplement(e.target.value)} placeholder="Apto, bloco..." />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Referência</label>
                    <Input value={addressReference} onChange={e => setAddressReference(e.target.value)} placeholder="Perto de..." />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Entregador (delivery) ── */}
          {!order.withdrawal && (
            <>
              <hr className="border-gray-100" />
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Entregador</p>
                </div>
                <Select value={deliveryPerson} onValueChange={setDeliveryPerson} disabled={loadingUsers}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingUsers ? 'Carregando...' : 'Selecione um entregador'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {deliveryPeople.map((person: any) => (
                      <SelectItem key={person.id} value={person.attributes.name}>
                        {person.attributes.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* ── Itens ── */}
          <hr className="border-gray-100" />
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Itens do Pedido ({order.items.length})
              </p>
            </div>
            <div className="space-y-3">
              {order.items.map((item, index) => {
                const edited = editedItems[index];
                if (!edited) return null;
                const lineTotal = edited.price * edited.quantity;

                return (
                  <div key={item.id} className="rounded-lg bg-muted/40 p-3 space-y-3">
                    {/* Nome + extras */}
                    <div className="flex items-start gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-md object-cover shrink-0"
                          onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.name}</p>
                        {item.extras && item.extras.length > 0 && (
                          <p className="text-xs text-muted-foreground">+ {item.extras.map(e => e.name).join(', ')}</p>
                        )}
                        {item.prepare_methods && item.prepare_methods.length > 0 && (
                          <p className="text-xs text-muted-foreground">Preparo: {item.prepare_methods.map(m => m.name).join(', ')}</p>
                        )}
                        {item.steps && item.steps.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {item.steps.map((step, i) => (
                              <span key={i}>{step.name}: {step.options?.map(o => o.name).join(', ')} </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Controles: preço unitário + quantidade + total */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Preço unit. (R$)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                          <Input
                            className="pl-8 h-8 text-sm"
                            value={fmtPrice(edited.price)}
                            onChange={e => {
                              const raw = e.target.value.replace(/[^\d,]/g, '');
                              handleItemChange(index, 'price', parsePrice(raw));
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Quantidade</label>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => handleItemQuantity(index, -1)}
                            disabled={edited.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            className="h-8 text-sm text-center"
                            min={1}
                            value={edited.quantity}
                            onChange={e => handleItemChange(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => handleItemQuantity(index, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Total do item</label>
                        <div className="h-8 flex items-center px-3 rounded-md bg-white border text-sm font-semibold text-primary">
                          {formatCurrency(lineTotal)}
                        </div>
                      </div>
                    </div>

                    {/* Observação */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Observação</label>
                      <Textarea
                        value={edited.observation}
                        onChange={e => handleItemChange(index, 'observation', e.target.value)}
                        placeholder="Nenhuma observação..."
                        rows={2}
                        className="resize-none text-sm"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Pagamento ── */}
          <hr className="border-gray-100" />
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pagamento</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Forma de pagamento</label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Status do pagamento</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={paymentStatus === 'pending' ? 'default' : 'outline'}
                    className="flex-1 h-10 gap-2"
                    onClick={() => setPaymentStatus('pending')}
                  >
                    <Clock className="h-4 w-4" />
                    Pendente
                  </Button>
                  <Button
                    type="button"
                    variant={paymentStatus === 'paid' ? 'default' : 'outline'}
                    className="flex-1 h-10 gap-2"
                    onClick={() => setPaymentStatus('paid')}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Pago
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Resumo Financeiro ── */}
          <hr className="border-gray-100" />
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Resumo Financeiro</p>
            <div className="rounded-lg bg-muted/40 divide-y divide-gray-200">
              <div className="flex justify-between items-center px-4 py-3 text-sm">
                <span className="text-muted-foreground">Subtotal dos itens</span>
                <span className="font-medium">{formatCurrency(computedSubtotal)}</span>
              </div>
              {!order.withdrawal && (
                <div className="flex justify-between items-center px-4 py-3 text-sm gap-4">
                  <span className="text-muted-foreground shrink-0">Taxa de entrega</span>
                  <div className="relative w-32">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                    <Input
                      className="pl-8 h-7 text-sm text-right"
                      value={fmtPrice(deliveryFeeValue)}
                      onChange={e => {
                        const raw = e.target.value.replace(/[^\d,]/g, '');
                        setDeliveryFeeValue(parsePrice(raw));
                      }}
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center px-4 py-3 font-bold text-base">
                <span>Total</span>
                <span>{formatCurrency(computedTotal)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* ─── Footer ────────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          {!isTerminal && (
            <Button type="button" variant="destructive" size="sm" onClick={handleCancelOrder}>
              Cancelar Pedido
            </Button>
          )}
          <div className="flex-1" />
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            size="sm"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isDirty ? 'Salvar Alterações' : 'Sem alterações'}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
