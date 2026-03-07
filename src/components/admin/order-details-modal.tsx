import React, { useState, useEffect } from 'react';
import { useUsers } from '@/app/admin/settings/users/hooks/useUsers';
import { Dialog, DialogContent } from '@/components/ui/order-dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency, cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  X,
  Copy,
  Save,
  Edit3,
  User,
  MapPin,
  Phone,
  CreditCard,
  Truck,
  Store,
  Package,
  Tag,
  Clock,
  Receipt,
  ShoppingBag,
  SquarePen,
  Trash2,
  ArrowRight
} from 'lucide-react';

interface OrderItem {
  id: string;
  catalog_item_id: number | null;
  name: string;
  price: number;
  total_price?: number;
  quantity: number;
  observation?: string;
  image?: string;
  weight?: string;
  item_type?: string;
  extras?: Array<{ name: string; price: number }>;
  prepare_methods?: Array<{ name: string }>;
  steps?: Array<{ name: string; options?: Array<{ name: string }> }>;
  complements?: Array<{ name: string; price: number }>;
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
    discount_amount?: number;
    payment_adjustment_amount?: number;
    coupon_code?: string;
  };
  onUpdateOrder?: (orderId: string, data: Partial<any>) => Promise<void>;
  onCancelOrder?: (orderId: string) => Promise<void>;
}

const getStatusInfo = (status: string) => {
  const statusMap = {
    delivered: { label: 'Entregue', border: 'border-green-400', text: 'text-green-700', dot: 'bg-green-400' },
    in_transit: { label: 'Em transito', border: 'border-blue-400', text: 'text-blue-700', dot: 'bg-blue-400' },
    processing: { label: 'Processando', border: 'border-amber-400', text: 'text-amber-700', dot: 'bg-amber-400' },
    preparing: { label: 'Em preparo', border: 'border-orange-400', text: 'text-orange-700', dot: 'bg-orange-400' },
    cancelled: { label: 'Cancelado', border: 'border-red-400', text: 'text-red-700', dot: 'bg-red-400' },
  };
  return statusMap[status as keyof typeof statusMap] || statusMap.processing;
};

const getPaymentMethodLabel = (method: string) => {
  const methodMap: Record<string, string> = {
    credit: 'Cartao de Credito',
    debit: 'Cartao de Debito',
    manual_pix: 'Pix',
    cash: 'Dinheiro',
  };
  return methodMap[method] || method;
};

const formatFullDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

function SectionCard({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('bg-white rounded-md border border-[#E5E2DD] overflow-hidden', className)}>
      <div className="px-4 py-3 border-b border-[#E5E2DD] flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex items-start justify-between py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn('text-sm font-medium text-gray-900 text-right max-w-[60%]', className)}>{value}</span>
    </div>
  );
}

export default function OrderDetailsModal({
  open,
  onOpenChange,
  order,
  onUpdateOrder,
  onCancelOrder,
}: OrderDetailsModalProps) {
  const { users, loading: loadingUsers } = useUsers();
  const deliveryPeople = users.filter((u: any) => u.attributes?.role === 'delivery_man');
  const statusInfo = getStatusInfo(order.status);
  const paymentLabel = getPaymentMethodLabel(order.payment_method);
  const deliveryFee = order.delivery_fee ?? 0;

  const [editingField, setEditingField] = useState<{
    type: 'customer' | 'order' | 'financial' | 'item' | 'shop' | 'delivery';
    field: string;
    value: string | number;
  } | null>(null);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState(order.deliveryPerson || '');
  const [isSavingDelivery, setIsSavingDelivery] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editedOrder, setEditedOrder] = useState(order);

  useEffect(() => {
    setEditedOrder(order);
  }, [order]);

  const editedSubtotal = (editedOrder.items || []).reduce(
    (sum: number, item: any) => sum + (item.total_price ?? item.price * item.quantity),
    0,
  );

  const handleEdit = (
    type: 'customer' | 'order' | 'financial' | 'item' | 'shop',
    field: string,
    value: string | number,
  ) => {
    setEditingField({ type, field, value });
  };

  const handleSaveAllChanges = async () => {
    if (onUpdateOrder) {
      const changes: any = {};

      if ((editedOrder.customer?.name ?? '') !== (order.customer?.name ?? '')) {
        changes.customer = { ...changes.customer, name: editedOrder.customer?.name ?? '' };
      }
      if ((editedOrder.customer?.phone ?? '') !== (order.customer?.phone ?? '')) {
        changes.customer = { ...changes.customer, phone: editedOrder.customer?.phone ?? '' };
      }

      if (editedOrder.address && order.address) {
        if (editedOrder.address.address !== order.address.address) {
          changes.address = { ...changes.address, address: editedOrder.address.address };
        }
        if (editedOrder.address.neighborhood !== order.address.neighborhood) {
          changes.address = { ...changes.address, neighborhood: editedOrder.address.neighborhood };
        }
        if (editedOrder.address.complement !== order.address.complement) {
          changes.address = { ...changes.address, complement: editedOrder.address.complement };
        }
        if (editedOrder.address.reference !== order.address.reference) {
          changes.address = { ...changes.address, reference: editedOrder.address.reference };
        }
      }

      if (editedOrder.shop.name !== order.shop.name) {
        changes.shop = { ...changes.shop, name: editedOrder.shop.name };
      }
      if (editedOrder.shop.phone !== order.shop.phone) {
        changes.shop = { ...changes.shop, phone: editedOrder.shop.phone };
      }

      if (editedOrder.total !== order.total) {
        changes.total = editedOrder.total;
      }

      const itemChanges: any = {};
      editedOrder.items.forEach((editedItem: any, index: number) => {
        const originalItem = order.items[index];
        if (originalItem && editedItem.price !== originalItem.price) {
          itemChanges[editedItem.id] = { price: editedItem.price };
        }
      });
      if (Object.keys(itemChanges).length > 0) {
        changes.items = itemChanges;
      }

      if (Object.keys(changes).length > 0) {
        await onUpdateOrder(order.id, changes);

        setEditedOrder((prev: any) => {
          const updated = { ...prev };
          if (changes.customer) {
            updated.customer = { ...(updated.customer || {}), ...changes.customer };
          }
          if (changes.address) {
            updated.address = { ...updated.address, ...changes.address };
          }
          if (changes.shop) {
            updated.shop = { ...updated.shop, ...changes.shop };
          }
          if (changes.total !== undefined) {
            updated.total = changes.total;
          }
          if (changes.items) {
            Object.keys(changes.items).forEach((itemId) => {
              const itemIndex = updated.items.findIndex((item: any) => item.id === itemId);
              if (itemIndex !== -1) {
                updated.items[itemIndex] = { ...updated.items[itemIndex], ...changes.items[itemId] };
              }
            });
          }
          return updated;
        });
      }
    }

    setIsEditingMode(false);
    setEditingField(null);
  };

  const handleCancelAllChanges = () => {
    setEditedOrder(order);
    setIsEditingMode(false);
    setEditingField(null);
  };

  const handleDeliveryPersonChange = async (value: string) => {
    const resolvedValue = value === "none" ? "" : value;
    setSelectedDeliveryPerson(resolvedValue);
    if (onUpdateOrder) {
      setIsSavingDelivery(true);
      try {
        await onUpdateOrder(order.id, { deliveryPerson: resolvedValue });
      } catch (error) {
        console.error('Erro ao atualizar entregador:', error);
      } finally {
        setIsSavingDelivery(false);
      }
    }
  };

  const handleCancelOrder = async () => {
    if (onCancelOrder) {
      await onCancelOrder(order.id);
      onOpenChange(false);
    }
  };

  const copyOrderInfo = () => {
    const orderInfo = `
Pedido #${order.id}
Cliente: ${order.customer?.name || 'Não informado'}
Telefone: ${order.customer?.phone || 'Não informado'}
Valor: ${formatCurrency(order.total)}
Status: ${statusInfo.label}
Forma de pagamento: ${paymentLabel}
${
  !order.withdrawal && order.address
    ? `
Endereço: ${order.address.address}
Bairro: ${order.address.neighborhood}
${order.address.complement ? `Complemento: ${order.address.complement}` : ''}
${order.address.reference ? `Referencia: ${order.address.reference}` : ''}
`
    : ''
}
Itens:
${order.items.map((item) => `${item.quantity}x ${item.name} - ${formatCurrency(item.total_price ?? item.price * item.quantity)}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(orderInfo);
  };

  const handleInputChange = (
    type: 'customer' | 'order' | 'financial' | 'item' | 'shop',
    field: string,
    newValue: string | number,
  ) => {
    setEditingField({ type, field, value: newValue });

    setEditedOrder((prev: any) => {
      const updated = { ...prev };

      if (type === 'customer' && (field === 'name' || field === 'phone')) {
        updated.customer = { ...updated.customer, [field]: newValue };
      } else if (
        type === 'customer' &&
        (field === 'address' || field === 'neighborhood' || field === 'complement' || field === 'reference')
      ) {
        if (updated.address) {
          updated.address = { ...updated.address, [field]: newValue };
        }
      } else if (type === 'shop' && (field === 'name' || field === 'phone')) {
        updated.shop = { ...updated.shop, [field]: newValue };
      } else if (type === 'financial') {
        if (field === 'subtotal') {
          updated.total = (newValue as number) + (updated.delivery_fee || 0);
        } else if (field === 'delivery_fee') {
          updated.total = editedSubtotal + (newValue as number);
        } else if (field === 'total') {
          updated.total = newValue as number;
        }
      } else if (type === 'item') {
        if (field.startsWith('price_')) {
          const itemId = field.replace('price_', '');
          const newItems = [...updated.items];
          const itemIndex = newItems.findIndex((item: any) => item.id === itemId);
          if (itemIndex !== -1) {
            newItems[itemIndex] = {
              ...newItems[itemIndex],
              price: (newValue as number) / newItems[itemIndex].quantity,
            };
            updated.items = newItems;
          }
        } else if (field.startsWith('quantity_')) {
          const itemId = field.replace('quantity_', '');
          const newItems = [...updated.items];
          const itemIndex = newItems.findIndex((item: any) => item.id === itemId);
          if (itemIndex !== -1) {
            newItems[itemIndex] = {
              ...newItems[itemIndex],
              quantity: newValue as number,
            };
            updated.items = newItems;
          }
        } else if (field.startsWith('observation_')) {
          const itemId = field.replace('observation_', '');
          const newItems = [...updated.items];
          const itemIndex = newItems.findIndex((item: any) => item.id === itemId);
          if (itemIndex !== -1) {
            newItems[itemIndex] = {
              ...newItems[itemIndex],
              observation: newValue as string,
            };
            updated.items = newItems;
          }
        }
      }

      return updated;
    });
  };

  const renderEditableField = (
    type: 'customer' | 'order' | 'financial' | 'item' | 'shop',
    field: string,
    value: string | number,
    label: string,
    inputType: 'text' | 'number' | 'textarea' = 'text',
  ) => {
    const isEditing = editingField?.type === type && editingField?.field === field;
    const isItemPrice = type === 'item' && field.startsWith('price_');

    return (
      <div className="flex items-start justify-between py-1.5">
        {label && <span className="text-sm text-muted-foreground">{label}</span>}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-1">
              {inputType === 'textarea' ? (
                <Textarea
                  value={editingField.value as string}
                  onChange={(e) => handleInputChange(type, field, e.target.value)}
                  className="h-20 w-48 text-sm rounded-md border-[#E5E2DD]"
                  placeholder="Digite aqui..."
                />
              ) : (
                <Input
                  type={inputType}
                  value={editingField.value}
                  onChange={(e) =>
                    handleInputChange(type, field, inputType === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)
                  }
                  className="h-8 w-28 text-sm rounded-md border-[#E5E2DD]"
                />
              )}
            </div>
          ) : (
            <>
              <span
                className={cn(
                  'text-sm font-medium text-right',
                  isItemPrice ? 'text-primary font-bold' : 'text-gray-900',
                )}
              >
                {inputType === 'number' ? formatCurrency(value as number) : value}
              </span>
              {isEditingMode && (
                <button
                  onClick={() => handleEdit(type, field, value)}
                  className="text-muted-foreground hover:text-gray-700 transition-colors cursor-pointer"
                >
                  <SquarePen className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl p-0 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E2DD] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="font-tomato text-lg font-bold text-gray-900">Pedido #{order.id}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {formatFullDate(order.date)} as {formatTime(order.date)}
                </span>
              </div>
            </div>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border bg-white text-sm font-semibold',
                statusInfo.border,
                statusInfo.text,
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', statusInfo.dot)} />
              {statusInfo.label}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border bg-white text-sm font-semibold',
                order.payment_status === 'paid'
                  ? 'border-green-400 text-green-700'
                  : 'border-red-400 text-red-700',
              )}
            >
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  order.payment_status === 'paid' ? 'bg-green-400' : 'bg-red-400',
                )}
              />
              {order.payment_status === 'paid' ? 'Pago' : 'Aguardando pgto'}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#E5E2DD] bg-white text-sm font-medium text-gray-700',
              )}
            >
              {order.withdrawal ? (
                <>
                  <Package className="w-3.5 h-3.5" />
                  Retirada
                </>
              ) : (
                <>
                  <Truck className="w-3.5 h-3.5" />
                  Delivery
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isEditingMode ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingMode(true)}
                  className="border border-gray-300 cursor-pointer rounded-md"
                >
                  <Edit3 className="h-4 w-4 mr-1.5" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyOrderInfo}
                  className="border border-gray-300 cursor-pointer rounded-md"
                >
                  <Copy className="h-4 w-4 mr-1.5" />
                  Copiar
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveAllChanges}
                  className="border border-green-400 text-green-700 cursor-pointer rounded-md hover:bg-green-50"
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  Salvar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelAllChanges}
                  className="border border-red-400 text-red-700 cursor-pointer rounded-md hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Cancelar
                </Button>
              </>
            )}
            <button
              onClick={() => onOpenChange(false)}
              className="ml-2 text-muted-foreground hover:text-gray-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-[#FAF9F7] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Column 1: Cliente */}
            <div className="space-y-4">
              <SectionCard icon={User} title="Cliente">
                <div className="divide-y divide-[#E5E2DD]">
                  {renderEditableField('customer', 'name', editedOrder.customer?.name || 'Cliente', 'Nome')}
                  <div className="flex items-start justify-between py-1.5">
                    <span className="text-sm text-muted-foreground">Telefone</span>
                    <div className="flex items-center gap-2">
                      {editingField?.type === 'customer' && editingField?.field === 'phone' ? (
                        <Input
                          type="text"
                          value={editingField.value}
                          onChange={(e) => handleInputChange('customer', 'phone', e.target.value)}
                          className="h-8 w-36 text-sm rounded-md border-[#E5E2DD]"
                        />
                      ) : (
                        <>
                          <span className="text-sm font-medium text-gray-900">
                            {editedOrder.customer?.phone || 'N/A'}
                          </span>
                          {isEditingMode && (
                            <button
                              onClick={() => handleEdit('customer', 'phone', editedOrder.customer?.phone || '')}
                              className="text-muted-foreground hover:text-gray-700 transition-colors cursor-pointer"
                            >
                              <SquarePen className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Endereco */}
              {!order.withdrawal && editedOrder.address && (
                <SectionCard icon={MapPin} title="Endereco de entrega">
                  <div className="divide-y divide-[#E5E2DD]">
                    {renderEditableField('customer', 'address', editedOrder.address.address, 'Rua', 'textarea')}
                    {renderEditableField('customer', 'neighborhood', editedOrder.address.neighborhood, 'Bairro')}
                    {editedOrder.address.complement &&
                      renderEditableField('customer', 'complement', editedOrder.address.complement, 'Complemento')}
                    {editedOrder.address.reference &&
                      renderEditableField('customer', 'reference', editedOrder.address.reference, 'Referencia')}
                  </div>
                </SectionCard>
              )}

              {/* Loja */}
              <SectionCard icon={Store} title="Loja">
                <div className="divide-y divide-[#E5E2DD]">
                  {renderEditableField('shop', 'name', editedOrder.shop.name, 'Nome')}
                  {renderEditableField('shop', 'phone', editedOrder.shop.phone, 'Telefone')}
                </div>
              </SectionCard>
            </div>

            {/* Column 2: Pedido */}
            <div className="space-y-4">
              <SectionCard icon={CreditCard} title="Pagamento">
                <div className="divide-y divide-[#E5E2DD]">
                  <InfoRow label="Metodo" value={paymentLabel} />
                  <InfoRow
                    label="Status"
                    value={
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-semibold',
                          order.payment_status === 'paid'
                            ? 'border-green-400 text-green-700 bg-white'
                            : 'border-red-400 text-red-700 bg-white',
                        )}
                      >
                        {order.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    }
                  />
                </div>
              </SectionCard>

              <SectionCard icon={Clock} title="Data e hora">
                <div className="divide-y divide-[#E5E2DD]">
                  <InfoRow label="Data" value={formatFullDate(order.date)} />
                  <InfoRow label="Horario" value={formatTime(order.date)} />
                </div>
              </SectionCard>

              {/* Entregador */}
              {!order.withdrawal && (
                <SectionCard icon={Truck} title="Entrega">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-muted-foreground">Entregador</span>
                      <Select
                        value={selectedDeliveryPerson || "none"}
                        onValueChange={handleDeliveryPersonChange}
                        disabled={isSavingDelivery || loadingUsers}
                      >
                        <SelectTrigger className="h-9 text-sm border-[#E5E2DD] rounded-md bg-white max-w-[180px] cursor-pointer">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent className="rounded-md border-[#E5E2DD]">
                          <SelectItem value="none">Selecione</SelectItem>
                          {deliveryPeople.map((person: any) => (
                            <SelectItem key={person.id} value={person.attributes?.name || person.name}>
                              {person.attributes?.name || person.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {isSavingDelivery && (
                      <p className="text-xs text-muted-foreground">Salvando...</p>
                    )}
                  </div>
                </SectionCard>
              )}
            </div>

            {/* Column 3: Financeiro */}
            <div className="space-y-4">
              <SectionCard icon={Receipt} title="Resumo financeiro">
                <div className="divide-y divide-[#E5E2DD]">
                  {renderEditableField('financial', 'subtotal', editedSubtotal, 'Subtotal dos itens', 'number')}

                  {!order.withdrawal && (
                    <InfoRow label="Taxa de entrega" value={formatCurrency(deliveryFee)} />
                  )}

                  {order.coupon_code && order.discount_amount && order.discount_amount > 0 && (
                    <div className="flex items-start justify-between py-1.5">
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-green-500" />
                        Cupom ({order.coupon_code})
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        -{formatCurrency(order.discount_amount)}
                      </span>
                    </div>
                  )}

                  {order.payment_adjustment_amount !== undefined && order.payment_adjustment_amount !== 0 && (
                    <div className="flex items-start justify-between py-1.5">
                      <span
                        className={cn(
                          'text-sm',
                          order.payment_adjustment_amount < 0 ? 'text-green-600' : 'text-orange-600',
                        )}
                      >
                        {order.payment_adjustment_amount < 0 ? 'Desconto' : 'Acrescimo'}
                      </span>
                      <span
                        className={cn(
                          'text-sm font-medium',
                          order.payment_adjustment_amount < 0 ? 'text-green-600' : 'text-orange-600',
                        )}
                      >
                        {order.payment_adjustment_amount < 0 ? '-' : '+'}
                        {formatCurrency(Math.abs(order.payment_adjustment_amount))}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <div className="flex items-center gap-2">
                      {editingField?.type === 'financial' && editingField?.field === 'total' ? (
                        <Input
                          type="number"
                          value={editingField.value}
                          onChange={(e) =>
                            handleInputChange('financial', 'total', parseFloat(e.target.value) || 0)
                          }
                          className="h-8 w-28 text-sm rounded-md border-[#E5E2DD]"
                        />
                      ) : (
                        <>
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(editedOrder.total)}
                          </span>
                          {isEditingMode && (
                            <button
                              onClick={() => handleEdit('financial', 'total', editedOrder.total)}
                              className="text-muted-foreground hover:text-gray-700 transition-colors cursor-pointer"
                            >
                              <SquarePen className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Cancel order */}
              {order.status === 'processing' && (
                <Button
                  variant="destructive"
                  className="w-full rounded-md border border-gray-300 cursor-pointer"
                  onClick={handleCancelOrder}
                >
                  Cancelar Pedido
                </Button>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="mt-6">
            <SectionCard icon={ShoppingBag} title={`Itens do pedido (${editedOrder.items.length})`}>
              <div className="divide-y divide-[#E5E2DD]">
                {editedOrder.items.map((item: any) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-md bg-[#F0EFEB] flex-shrink-0"
                          onError={(e: any) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="inline-flex items-center justify-center w-7 h-6 bg-primary text-white rounded-md text-xs font-bold flex-shrink-0">
                              {item.quantity}x
                            </span>
                            <span className="text-base font-medium text-gray-900 truncate">
                              {item.name}
                            </span>
                            {item.weight && (
                              <span className="text-xs px-1.5 py-0.5 rounded-md border border-[#E5E2DD] bg-white text-muted-foreground flex-shrink-0">
                                {item.weight}{' '}
                                {item.item_type === 'weight_per_g'
                                  ? 'g'
                                  : item.item_type === 'weight_per_kg'
                                    ? 'kg'
                                    : ''}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {editingField?.type === 'item' &&
                            editingField?.field === `price_${item.id}` ? (
                              <Input
                                type="number"
                                value={editingField.value}
                                onChange={(e) =>
                                  handleInputChange(
                                    'item',
                                    `price_${item.id}`,
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="h-8 w-24 text-sm rounded-md border-[#E5E2DD]"
                              />
                            ) : (
                              <>
                                <span className="text-base font-bold text-primary">
                                  {formatCurrency(item.total_price ?? item.price * item.quantity)}
                                </span>
                                {isEditingMode && (
                                  <button
                                    onClick={() =>
                                      handleEdit(
                                        'item',
                                        `price_${item.id}`,
                                        item.total_price ?? item.price * item.quantity,
                                      )
                                    }
                                    className="text-muted-foreground hover:text-gray-700 transition-colors cursor-pointer"
                                  >
                                    <SquarePen className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                            {isEditingMode && (
                              <button className="text-red-400 hover:text-red-600 transition-colors cursor-pointer">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Observation */}
                        {item.observation && (
                          <p className="mt-1.5 text-sm text-orange-600 italic">
                            &quot;{item.observation}&quot;
                          </p>
                        )}

                        {/* Extras & Complements */}
                        {((item.extras && item.extras.length > 0) ||
                          (item.complements && item.complements.length > 0)) && (
                          <div className="mt-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Adicionais
                            </span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {item.extras?.map((extra: any, index: number) => (
                                <span
                                  key={`extra-${index}`}
                                  className="text-xs px-2 py-0.5 rounded-md border border-[#E5E2DD] bg-white text-gray-700"
                                >
                                  {extra.name} (+{formatCurrency(extra.price)})
                                </span>
                              ))}
                              {item.complements?.map((comp: any, index: number) => (
                                <span
                                  key={`comp-${index}`}
                                  className="text-xs px-2 py-0.5 rounded-md border border-[#E5E2DD] bg-white text-gray-700"
                                >
                                  {comp.name} (+{formatCurrency(comp.price)})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Prepare Methods */}
                        {item.prepare_methods && item.prepare_methods.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Preparo
                            </span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {item.prepare_methods.map((method: any, index: number) => (
                                <span
                                  key={index}
                                  className="text-xs px-2 py-0.5 rounded-md border border-[#E5E2DD] bg-white text-gray-700"
                                >
                                  {method.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Steps */}
                        {item.steps && item.steps.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Opcoes
                            </span>
                            <div className="space-y-1 mt-1">
                              {item.steps.map((step: any, index: number) => (
                                <div key={index}>
                                  <span className="text-xs font-medium text-gray-700">{step.name}:</span>
                                  {step.options && step.options.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-0.5 ml-2">
                                      {step.options.map((option: any, optIndex: number) => (
                                        <span
                                          key={optIndex}
                                          className="text-xs px-2 py-0.5 rounded-md border border-[#E5E2DD] bg-white text-gray-700"
                                        >
                                          {option.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
