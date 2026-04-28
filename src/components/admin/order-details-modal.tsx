import React, { useState, useEffect, useRef } from 'react';
import { useUsers } from '@/app/admin/settings/users/hooks/useUsers';
import { Dialog, DialogContent } from '@/components/ui/order-dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency, cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
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
  CreditCard,
  Truck,
  Store,
  Package,
  Tag,
  Clock,
  Receipt,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Search,
  Loader2,
  PackageX,
} from 'lucide-react';
import { getCatalog } from '@/api/requests/catalog/requests';
import { ItemOptionsDialog } from '@/app/admin/pdv/item-options-dialog';

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
  selected_extras?: Array<{ id: number; name: string; price: number }>;
  selected_prepare_methods?: Array<{ id: number; name: string }>;
  available_extras?: Array<{ id: number; name: string; price: number }>;
  available_prepare_methods?: Array<{ id: number; name: string }>;
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
    manual_adjustment?: number;
    coupon_code?: string;
    cancellation_reason?: string;
    cancellation_reason_type?: string;
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

const CANCELLATION_REASON_LABELS: Record<string, string> = {
  address_not_found: 'Endereço não localizado',
  customer_absent: 'Cliente ausente / não atende',
  customer_refused: 'Cliente recusou o pedido',
  delivery_area_unsafe: 'Área de risco / insegura',
  delivery_refused_no_payment: 'Pagamento não realizado na entrega',
  client_requested: 'Cliente solicitou o cancelamento',
  payment_rejected: 'Pagamento rejeitado',
  out_of_stock: 'Produto fora de estoque',
  delivery_unavailable: 'Entrega indisponível',
  other: 'Outro motivo',
};

const getPaymentMethodLabel = (method: string) => {
  const methodMap: Record<string, string> = {
    credit: 'Cartão de Crédito',
    debit: 'Cartão de Débito',
    manual_pix: 'PIX',
    asaas_pix: 'PIX Automático',
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

  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState(order.deliveryPerson || '');
  const [isSavingDelivery, setIsSavingDelivery] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editedOrder, setEditedOrder] = useState(order);
  const [removedItemIds, setRemovedItemIds] = useState<string[]>([]);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [catalogGroups, setCatalogGroups] = useState<any[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [newItemsToAdd, setNewItemsToAdd] = useState<any[]>([]);
  const [optionsItem, setOptionsItem] = useState<any>(null);
  const isSavingRef = useRef(false);
  const lastSyncedOrderRef = useRef(order);

  useEffect(() => {
    if (isSavingRef.current) {
      const prevIds = lastSyncedOrderRef.current.items.map((i: any) => i.id).sort().join(',');
      const newIds = order.items.map((i: any) => i.id).sort().join(',');
      if (prevIds === newIds) return;
      isSavingRef.current = false;
    }
    lastSyncedOrderRef.current = order;
    setEditedOrder(order);
    setRemovedItemIds([]);
    setNewItemsToAdd([]);
  }, [order]);

  const editedSubtotal = (editedOrder.items || []).reduce(
    (sum: number, item: any) => sum + (item.total_price ?? item.price * item.quantity),
    0,
  );

  const editedTotal = editedSubtotal
    + (editedOrder.delivery_fee || 0)
    - (editedOrder.discount_amount || 0)
    + (editedOrder.payment_adjustment_amount || 0)
    + (editedOrder.manual_adjustment || 0);

  const handleSaveAllChanges = async () => {
    if (onUpdateOrder) {
      const changes: any = {};

      if ((editedOrder.customer?.name ?? '') !== (order.customer?.name ?? '')) {
        changes.customer = { ...changes.customer, name: editedOrder.customer?.name ?? '' };
      }
      if ((editedOrder.customer?.phone ?? '') !== (order.customer?.phone ?? '')) {
        changes.customer = { ...changes.customer, phone: editedOrder.customer?.phone ?? '' };
      }

      if (editedOrder.address) {
        const origAddress = order.address || {};
        if ((editedOrder.address.address || '') !== (origAddress.address || '')) {
          changes.address = { ...changes.address, address: editedOrder.address.address };
        }
        if ((editedOrder.address.neighborhood || '') !== (origAddress.neighborhood || '')) {
          changes.address = { ...changes.address, neighborhood: editedOrder.address.neighborhood };
        }
        if ((editedOrder.address.complement || '') !== (origAddress.complement || '')) {
          changes.address = { ...changes.address, complement: editedOrder.address.complement };
        }
        if ((editedOrder.address.reference || '') !== (origAddress.reference || '')) {
          changes.address = { ...changes.address, reference: editedOrder.address.reference };
        }
      }

      if (editedOrder.shop.name !== order.shop.name) {
        changes.shop = { ...changes.shop, name: editedOrder.shop.name };
      }
      if (editedOrder.shop.phone !== order.shop.phone) {
        changes.shop = { ...changes.shop, phone: editedOrder.shop.phone };
      }

      if (editedTotal !== order.total) {
        changes.total = editedTotal;
      }

      if (editedOrder.payment_method !== order.payment_method) {
        changes.payment_method = editedOrder.payment_method;
      }

      if ((editedOrder.manual_adjustment ?? 0) !== (order.manual_adjustment ?? 0)) {
        changes.manual_adjustment = editedOrder.manual_adjustment ?? 0;
      }

      if (editedOrder.withdrawal !== order.withdrawal) {
        changes.withdrawal = editedOrder.withdrawal;
      }

      const editedItemsList: any[] = [];
      editedOrder.items.forEach((editedItem: any) => {
        if ((editedItem as any)._isNew) return;
        const originalItem = order.items.find((i: any) => i.id === editedItem.id);
        if (!originalItem) return;

        const itemChange: any = { id: editedItem.id };
        let hasChange = false;

        if (editedItem.price !== originalItem.price) {
          itemChange.price = editedItem.price;
          hasChange = true;
        }

        const origExtraIds = (originalItem.selected_extras || []).map((e: any) => e.id).sort();
        const newExtraIds = (editedItem.selected_extras || []).map((e: any) => e.id).sort();
        if (JSON.stringify(origExtraIds) !== JSON.stringify(newExtraIds)) {
          itemChange.extras_ids = newExtraIds;
          hasChange = true;
        }

        const origMethodIds = (originalItem.selected_prepare_methods || []).map((m: any) => m.id).sort();
        const newMethodIds = (editedItem.selected_prepare_methods || []).map((m: any) => m.id).sort();
        if (JSON.stringify(origMethodIds) !== JSON.stringify(newMethodIds)) {
          itemChange.prepare_methods_ids = newMethodIds;
          hasChange = true;
        }

        if (hasChange) {
          editedItemsList.push(itemChange);
        }
      });
      if (editedItemsList.length > 0) {
        changes.items = editedItemsList;
      }

      if (removedItemIds.length > 0) {
        changes.removed_item_ids = removedItemIds;
      }

      if (newItemsToAdd.length > 0) {
        changes.new_items = newItemsToAdd.map((ni: any) => ({
          catalog_item_id: ni.catalog_item_id,
          quantity: ni.quantity,
          price: ni.price,
          extras_ids: ni.extras_ids || [],
          prepare_methods_ids: ni.prepare_methods_ids || [],
          selected_shared_complements_ids: ni.selected_shared_complements_ids || [],
          steps: ni.steps || [],
          observation: ni.observation || '',
          weight: ni.weight,
        }));
      }

      if (Object.keys(changes).length > 0) {
        isSavingRef.current = true;
        await onUpdateOrder(order.id, changes);
        setTimeout(() => {
          isSavingRef.current = false;
        }, 2000);
      }
    }

    setIsEditingMode(false);
  };

  const handleCancelAllChanges = () => {
    setEditedOrder(order);
    setRemovedItemIds([]);
    setNewItemsToAdd([]);
    setIsEditingMode(false);
  };

  const handleRemoveItem = (itemId: string) => {
    const currentItems = editedOrder.items.filter((i: any) => !removedItemIds.includes(i.id));
    if (currentItems.length <= 1) {
      return;
    }
    setRemovedItemIds(prev => [...prev, itemId]);
    setEditedOrder(prev => ({
      ...prev,
      items: prev.items.filter((i: any) => i.id !== itemId),
    }));
  };

  const handleOpenAddItemModal = async () => {
    setShowAddItemModal(true);
    if (catalogGroups.length === 0) {
      setLoadingCatalog(true);
      try {
        const response = await getCatalog();
        setCatalogGroups(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar catálogo:', error);
      } finally {
        setLoadingCatalog(false);
      }
    }
  };

  const handleAddItemFromCatalog = (catalogItem: any) => {
    const hasExtras = catalogItem.attributes?.extra?.data?.length > 0;
    const hasMethods = catalogItem.attributes?.prepare_method?.data?.length > 0;
    const hasSteps = catalogItem.attributes?.steps?.data?.length > 0;
    const hasComplements = catalogItem.attributes?.shared_complements?.data?.length > 0;
    const isWeightBased = catalogItem.attributes?.item_type === 'weight_per_kg' ||
      catalogItem.attributes?.item_type === 'weight_per_g';

    if (hasExtras || hasMethods || hasSteps || hasComplements || isWeightBased) {
      setOptionsItem(catalogItem);
    } else {
      addItemDirectly(catalogItem, 1);
    }
    setShowAddItemModal(false);
    setCatalogSearch('');
  };

  const addItemDirectly = (catalogItem: any, quantity: number, options?: any) => {
    const basePrice = parseFloat(catalogItem.attributes.price_with_discount || catalogItem.attributes.price);
    const extrasPrice = options?.extrasPrice || 0;
    const complementsPrice = options?.complementsPrice || 0;
    const unitPrice = options?.weight
      ? basePrice * options.weight + extrasPrice + complementsPrice
      : basePrice + extrasPrice + complementsPrice;

    const tempId = `new_${Date.now()}_${catalogItem.id}`;

    const newItem = {
      id: tempId,
      catalog_item_id: parseInt(catalogItem.id),
      name: catalogItem.attributes.name,
      price: unitPrice,
      total_price: unitPrice * quantity,
      quantity,
      observation: options?.observation || '',
      image: catalogItem.attributes.image_url,
      extras: options?.selectedExtras?.map((e: any) => ({ name: e.name, price: e.price })) || [],
      prepare_methods: options?.selectedMethods?.map((m: any) => ({ name: m.name })) || [],
      selected_extras: options?.selectedExtras || [],
      selected_prepare_methods: options?.selectedMethods || [],
      available_extras: catalogItem.attributes.extra?.data?.map((e: any) => ({
        id: parseInt(e.id), name: e.attributes.name, price: parseFloat(e.attributes.price),
      })) || [],
      available_prepare_methods: catalogItem.attributes.prepare_method?.data?.map((m: any) => ({
        id: parseInt(m.id), name: m.attributes.name,
      })) || [],
      steps: [],
      complements: options?.selectedSharedComplements?.map((c: any) => ({ name: c.name, price: c.price })) || [],
      _isNew: true,
    };

    setNewItemsToAdd(prev => [...prev, {
      catalog_item_id: parseInt(catalogItem.id),
      quantity,
      price: basePrice,
      extras_ids: options?.selectedExtras?.map((e: any) => parseInt(e.id)) || [],
      prepare_methods_ids: options?.selectedMethods?.map((m: any) => parseInt(m.id)) || [],
      selected_shared_complements_ids: options?.selectedSharedComplements?.map((c: any) => parseInt(c.id)) || [],
      steps: options?.selectedOptions ? Object.entries(options.selectedOptions).map(([stepId, opt]: [string, any]) => ({
        catalog_item_step_id: parseInt(stepId),
        catalog_item_step_option_id: parseInt(opt.optionId),
      })) : [],
      observation: options?.observation || '',
      weight: options?.weight,
      _tempId: tempId,
    }]);

    setEditedOrder(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
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

  const handleToggleExtra = (itemId: string, extra: { id: number; name: string; price: number }, wasSelected: boolean) => {
    setEditedOrder(prev => {
      const newItems = prev.items.map((item: any) => {
        if (item.id !== itemId) return item;
        const currentExtras = item.selected_extras || [];
        const newExtras = wasSelected
          ? currentExtras.filter((e: any) => e.id !== extra.id)
          : [...currentExtras, extra];
        return { ...item, selected_extras: newExtras };
      });
      return { ...prev, items: newItems };
    });
  };

  const handleTogglePrepareMethod = (itemId: string, method: { id: number; name: string }, wasSelected: boolean) => {
    setEditedOrder(prev => {
      const newItems = prev.items.map((item: any) => {
        if (item.id !== itemId) return item;
        const currentMethods = item.selected_prepare_methods || [];
        const newMethods = wasSelected
          ? currentMethods.filter((m: any) => m.id !== method.id)
          : [...currentMethods, method];
        return { ...item, selected_prepare_methods: newMethods };
      });
      return { ...prev, items: newItems };
    });
  };

  const handleInputChange = (
    type: 'customer' | 'order' | 'financial' | 'item' | 'shop',
    field: string,
    newValue: string | number,
  ) => {
    setEditedOrder((prev: any) => {
      const updated = { ...prev };

      if (type === 'customer' && (field === 'name' || field === 'phone')) {
        updated.customer = { ...updated.customer, [field]: newValue };
      } else if (
        type === 'customer' &&
        (field === 'address' || field === 'neighborhood' || field === 'complement' || field === 'reference')
      ) {
        updated.address = { ...(updated.address || {}), [field]: newValue };
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
                'inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2',
                statusInfo.text,
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', statusInfo.dot)} />
              {statusInfo.label}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2',
                order.payment_status === 'paid' ? 'text-green-700' : 'text-red-700',
              )}
            >
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full flex-shrink-0',
                  order.payment_status === 'paid' ? 'bg-green-400' : 'bg-red-400',
                )}
              />
              {order.payment_status === 'paid' ? 'Pago' : 'Aguardando pgto'}
            </span>
            {isEditingMode ? (
              <Select
                value={editedOrder.withdrawal ? 'withdrawal' : 'delivery'}
                onValueChange={(value) => setEditedOrder(prev => ({ ...prev, withdrawal: value === 'withdrawal' }))}
              >
                <SelectTrigger className="h-8 w-36 text-sm border-[#E5E2DD] rounded-md bg-white cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-md border-[#E5E2DD]">
                  <SelectItem value="withdrawal">
                    <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Retirada</span>
                  </SelectItem>
                  <SelectItem value="delivery">
                    <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Delivery</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
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
            )}
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
                  {isEditingMode ? (
                    <>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-muted-foreground">Nome</span>
                        <Input
                          className="h-8 w-48 text-sm border-[#E5E2DD] rounded-md bg-white text-right"
                          value={editedOrder.customer?.name || ''}
                          onChange={(e) => handleInputChange('customer', 'name', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-muted-foreground">Telefone</span>
                        <Input
                          className="h-8 w-48 text-sm border-[#E5E2DD] rounded-md bg-white text-right"
                          value={editedOrder.customer?.phone || ''}
                          onChange={(e) => handleInputChange('customer', 'phone', e.target.value)}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <InfoRow label="Nome" value={editedOrder.customer?.name || 'Cliente'} />
                      <InfoRow label="Telefone" value={editedOrder.customer?.phone || 'Não informado'} />
                    </>
                  )}
                </div>
              </SectionCard>

              {/* Endereco */}
              {(!editedOrder.withdrawal && (editedOrder.address || isEditingMode)) && (
                <SectionCard icon={MapPin} title="Endereco de entrega">
                  <div className="divide-y divide-[#E5E2DD]">
                    {isEditingMode ? (
                      <>
                        <div className="flex items-center justify-between py-1.5">
                          <span className="text-sm text-muted-foreground">Rua</span>
                          <Input
                            className="h-8 w-48 text-sm border-[#E5E2DD] rounded-md bg-white text-right"
                            value={editedOrder.address?.address || ''}
                            onChange={(e) => handleInputChange('customer', 'address', e.target.value)}
                          />
                        </div>
                        <div className="flex items-center justify-between py-1.5">
                          <span className="text-sm text-muted-foreground">Bairro</span>
                          <Input
                            className="h-8 w-48 text-sm border-[#E5E2DD] rounded-md bg-white text-right"
                            value={editedOrder.address?.neighborhood || ''}
                            onChange={(e) => handleInputChange('customer', 'neighborhood', e.target.value)}
                          />
                        </div>
                        <div className="flex items-center justify-between py-1.5">
                          <span className="text-sm text-muted-foreground">Complemento</span>
                          <Input
                            className="h-8 w-48 text-sm border-[#E5E2DD] rounded-md bg-white text-right"
                            value={editedOrder.address?.complement || ''}
                            onChange={(e) => handleInputChange('customer', 'complement', e.target.value)}
                          />
                        </div>
                        <div className="flex items-center justify-between py-1.5">
                          <span className="text-sm text-muted-foreground">Referencia</span>
                          <Input
                            className="h-8 w-48 text-sm border-[#E5E2DD] rounded-md bg-white text-right"
                            value={editedOrder.address?.reference || ''}
                            onChange={(e) => handleInputChange('customer', 'reference', e.target.value)}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <InfoRow label="Rua" value={editedOrder.address?.address || ''} />
                        <InfoRow label="Bairro" value={editedOrder.address?.neighborhood || ''} />
                        {editedOrder.address?.complement && (
                          <InfoRow label="Complemento" value={editedOrder.address.complement} />
                        )}
                        {editedOrder.address?.reference && (
                          <InfoRow label="Referencia" value={editedOrder.address.reference} />
                        )}
                      </>
                    )}
                  </div>
                </SectionCard>
              )}

              {/* Loja */}
              {!isEditingMode && (
                <SectionCard icon={Store} title="Loja">
                  <div className="divide-y divide-[#E5E2DD]">
                    <InfoRow label="Nome" value={editedOrder.shop.name} />
                    <InfoRow label="Telefone" value={editedOrder.shop.phone} />
                  </div>
                </SectionCard>
              )}
            </div>

            {/* Column 2: Pedido */}
            <div className="space-y-4">
              <SectionCard icon={CreditCard} title="Pagamento">
                <div className="divide-y divide-[#E5E2DD]">
                  <div className="flex items-start justify-between py-1.5">
                    <span className="text-sm text-muted-foreground">Metodo</span>
                    {isEditingMode ? (
                      <Select
                        value={editedOrder.payment_method}
                        onValueChange={(value) => setEditedOrder(prev => ({ ...prev, payment_method: value }))}
                      >
                        <SelectTrigger className="h-8 w-40 text-sm border-[#E5E2DD] rounded-md bg-white cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-md border-[#E5E2DD]">
                          <SelectItem value="cash">Dinheiro</SelectItem>
                          <SelectItem value="manual_pix">PIX</SelectItem>
                          <SelectItem value="asaas_pix">PIX Automático</SelectItem>
                          <SelectItem value="credit">Cartão de Crédito</SelectItem>
                          <SelectItem value="debit">Cartão de Débito</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm font-medium text-gray-900">{paymentLabel}</span>
                    )}
                  </div>
                  {!isEditingMode && (
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
                  )}
                </div>
              </SectionCard>

              {!isEditingMode && (
                <SectionCard icon={Clock} title="Data e hora">
                  <div className="divide-y divide-[#E5E2DD]">
                    <InfoRow label="Data" value={formatFullDate(order.date)} />
                    <InfoRow label="Horario" value={formatTime(order.date)} />
                  </div>
                </SectionCard>
              )}

              {/* Entregador */}
              {!editedOrder.withdrawal && (
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
              {/* Motivo do cancelamento */}
              {order.status === 'cancelled' && order.cancellation_reason_type && (
                <SectionCard icon={PackageX} title="Motivo do Cancelamento">
                  <div className="divide-y divide-[#E5E2DD]">
                    <InfoRow
                      label="Motivo"
                      value={CANCELLATION_REASON_LABELS[order.cancellation_reason_type] || order.cancellation_reason_type}
                      className="text-red-700"
                    />
                    {order.cancellation_reason && (
                      <InfoRow label="Detalhes" value={order.cancellation_reason} />
                    )}
                  </div>
                </SectionCard>
              )}
            </div>

            {/* Column 3: Financeiro */}
            <div className="space-y-4">
              <SectionCard icon={Receipt} title="Resumo financeiro">
                <div className="divide-y divide-[#E5E2DD]">
                  <InfoRow label="Subtotal dos itens" value={formatCurrency(editedSubtotal)} />

                  {!isEditingMode && !editedOrder.withdrawal && (
                    <InfoRow label="Taxa de entrega" value={formatCurrency(deliveryFee)} />
                  )}

                  {!isEditingMode && order.coupon_code && order.discount_amount && order.discount_amount > 0 && (
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

                  {!isEditingMode && order.payment_adjustment_amount !== undefined && order.payment_adjustment_amount !== 0 && (
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

                  {/* Manual adjustment */}
                  {(isEditingMode || (editedOrder.manual_adjustment !== undefined && editedOrder.manual_adjustment !== 0)) && (
                    <div className="flex items-start justify-between py-1.5">
                      <span className={cn(
                        'text-sm',
                        (editedOrder.manual_adjustment ?? 0) < 0 ? 'text-green-600' : (editedOrder.manual_adjustment ?? 0) > 0 ? 'text-orange-600' : 'text-muted-foreground',
                      )}>
                        Ajuste manual
                      </span>
                      {isEditingMode ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditedOrder(prev => ({
                              ...prev,
                              manual_adjustment: -Math.abs(prev.manual_adjustment ?? 0) || -1,
                            }))}
                            className={cn(
                              'p-1 rounded border text-xs',
                              (editedOrder.manual_adjustment ?? 0) < 0
                                ? 'border-green-400 bg-green-50 text-green-700'
                                : 'border-gray-200 text-gray-400',
                            )}
                            title="Desconto"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setEditedOrder(prev => ({
                              ...prev,
                              manual_adjustment: Math.abs(prev.manual_adjustment ?? 0) || 1,
                            }))}
                            className={cn(
                              'p-1 rounded border text-xs',
                              (editedOrder.manual_adjustment ?? 0) > 0
                                ? 'border-orange-400 bg-orange-50 text-orange-700'
                                : 'border-gray-200 text-gray-400',
                            )}
                            title="Acrescimo"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <Input
                            type="number"
                            value={Math.abs(editedOrder.manual_adjustment ?? 0)}
                            onChange={(e) => {
                              const absVal = parseFloat(e.target.value) || 0;
                              const sign = (editedOrder.manual_adjustment ?? 0) < 0 ? -1 : 1;
                              setEditedOrder(prev => ({
                                ...prev,
                                manual_adjustment: absVal * sign,
                              }));
                            }}
                            className="h-8 w-24 text-sm rounded-md border-[#E5E2DD]"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      ) : (
                        <span className={cn(
                          'text-sm font-medium',
                          (editedOrder.manual_adjustment ?? 0) < 0 ? 'text-green-600' : 'text-orange-600',
                        )}>
                          {(editedOrder.manual_adjustment ?? 0) < 0 ? '-' : '+'}
                          {formatCurrency(Math.abs(editedOrder.manual_adjustment ?? 0))}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(editedTotal)}
                    </span>
                  </div>
                </div>
              </SectionCard>

              {/* Cancel order */}
              {!isEditingMode && order.status === 'processing' && (
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
            <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E5E2DD] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-gray-900">Itens do pedido ({editedOrder.items.length})</h3>
                </div>
                {isEditingMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenAddItemModal}
                    className="h-7 text-xs border-primary text-primary hover:bg-primary/5 cursor-pointer rounded-md"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Adicionar item
                  </Button>
                )}
              </div>
              <div className="px-4 py-3">
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
                            <span className="text-base font-bold text-primary">
                              {formatCurrency(item.total_price ?? item.price * item.quantity)}
                            </span>
                            {isEditingMode && (
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className={cn(
                                  'text-red-400 hover:text-red-600 transition-colors cursor-pointer',
                                  editedOrder.items.length <= 1 && 'opacity-30 cursor-not-allowed',
                                )}
                                disabled={editedOrder.items.length <= 1}
                                title={editedOrder.items.length <= 1 ? 'O pedido deve ter pelo menos 1 item' : 'Remover item'}
                              >
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
                        {isEditingMode ? (
                          <>
                            {/* Editable extras */}
                            {item.available_extras && item.available_extras.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  Adicionais
                                </span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {item.available_extras.map((extra: any) => {
                                    const isSelected = item.selected_extras?.some((se: any) => se.id === extra.id);
                                    return (
                                      <button
                                        key={`extra-${extra.id}`}
                                        onClick={() => handleToggleExtra(item.id, extra, !!isSelected)}
                                        className={cn(
                                          'text-xs px-2 py-0.5 rounded-md border transition-colors cursor-pointer',
                                          isSelected
                                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                                            : 'border-[#E5E2DD] bg-white text-gray-400 hover:border-gray-300',
                                        )}
                                      >
                                        {extra.name} (+{formatCurrency(extra.price)})
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            {/* Editable prepare methods */}
                            {item.available_prepare_methods && item.available_prepare_methods.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  Preparo
                                </span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {item.available_prepare_methods.map((method: any) => {
                                    const isSelected = item.selected_prepare_methods?.some((sm: any) => sm.id === method.id);
                                    return (
                                      <button
                                        key={`method-${method.id}`}
                                        onClick={() => handleTogglePrepareMethod(item.id, method, !!isSelected)}
                                        className={cn(
                                          'text-xs px-2 py-0.5 rounded-md border transition-colors cursor-pointer',
                                          isSelected
                                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                                            : 'border-[#E5E2DD] bg-white text-gray-400 hover:border-gray-300',
                                        )}
                                      >
                                        {method.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
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
                          </>
                        )}

                        {/* Steps - opções selecionadas */}
                        {item.selected_steps && item.selected_steps.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Opcoes
                            </span>
                            <div className="space-y-1 mt-1">
                              {item.selected_steps.map((step: any, index: number) => (
                                <div key={index} className="flex items-center gap-1">
                                  <span className="text-xs font-medium text-gray-700">{step.step_name}:</span>
                                  <span className="text-xs px-2 py-0.5 rounded-md border border-[#E5E2DD] bg-white text-gray-700">
                                    {step.option_name}
                                  </span>
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
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Add Item Modal */}
      <Dialog open={showAddItemModal} onOpenChange={setShowAddItemModal}>
        <DialogContent className="max-w-lg p-0 flex flex-col max-h-[80vh]">
          <div className="px-6 py-4 border-b border-[#E5E2DD] flex items-center justify-between flex-shrink-0">
            <h2 className="font-tomato text-lg font-bold text-gray-900">Adicionar item</h2>
            <button
              onClick={() => { setShowAddItemModal(false); setCatalogSearch(''); }}
              className="text-muted-foreground hover:text-gray-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-3 border-b border-[#E5E2DD]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Buscar item no catalogo..."
                className="pl-9 h-9 text-sm rounded-md border-[#E5E2DD]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loadingCatalog ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {catalogGroups.map((group: any) => {
                  const items = (group.attributes?.items || []).filter((item: any) =>
                    !catalogSearch ||
                    item.attributes?.name?.toLowerCase().includes(catalogSearch.toLowerCase())
                  );
                  if (items.length === 0) return null;

                  return (
                    <div key={group.id}>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {group.attributes?.name}
                      </h4>
                      <div className="space-y-1">
                        {items.map((item: any) => (
                          <button
                            key={item.id}
                            onClick={() => handleAddItemFromCatalog(item)}
                            className="w-full flex items-center justify-between p-3 rounded-md border border-[#E5E2DD] hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer text-left"
                          >
                            <div className="flex items-center gap-3">
                              {item.attributes?.image_url && (
                                <img
                                  src={item.attributes.image_url}
                                  alt={item.attributes.name}
                                  className="w-10 h-10 object-cover rounded-md bg-[#F0EFEB]"
                                />
                              )}
                              <span className="text-sm font-medium text-gray-900">
                                {item.attributes?.name}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-primary">
                              {formatCurrency(parseFloat(item.attributes?.price_with_discount || item.attributes?.price || '0'))}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Item Options Dialog (reutilizado do PDV) */}
      <ItemOptionsDialog
        item={optionsItem}
        open={!!optionsItem}
        onClose={() => setOptionsItem(null)}
        onAddToCart={(options) => {
          if (optionsItem) {
            addItemDirectly(optionsItem, 1, options);
            setOptionsItem(null);
          }
        }}
      />
    </Dialog>
  );
}
