import React, { useState, useEffect } from 'react';
import { useUsers } from '@/app/admin/settings/users/hooks/useUsers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/order-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock8, 
  SquarePen, 
  Trash2,
  X,
  Copy,
  Save,
  Edit3
} from 'lucide-react';

interface OrderItem {
  id: string;
  catalog_item_id: number;
  name: string;
  price: number;
  quantity: number;
  observation?: string;
  image?: string;
  weight?: string;
  extras?: Array<{
    name: string;
    price: number;
  }>;
  prepare_methods?: Array<{
    name: string;
  }>;
  steps?: Array<{
    name: string;
    options?: Array<{
      name: string;
    }>;
  }>;
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
    address?: {
      address: string;
      neighborhood: string;
      complement?: string;
      reference?: string;
    };
    items: OrderItem[];
    shop: {
      name: string;
      phone: string;
    };
    customer: {
      name: string;
      phone: string;
    };
    deliveryPerson?: string;
  };
  onUpdateOrder?: (orderId: string, data: Partial<any>) => Promise<void>;
  onCancelOrder?: (orderId: string) => Promise<void>;
}

const getStatusInfo = (status: string) => {
  const statusMap = {
    delivered: { label: "ENTREGUE", color: "bg-emerald-500 text-white" },
    in_transit: { label: "EM TRÂNSITO", color: "bg-blue-500 text-white" },
    processing: { label: "PROCESSANDO", color: "bg-amber-500 text-white" },
    preparing: { label: "EM PREPARO", color: "bg-orange-500 text-white" },
    cancelled: { label: "CANCELADO", color: "bg-red-500 text-white" }
  };
  return statusMap[status as keyof typeof statusMap] || statusMap.processing;
};

const getPaymentMethodInfo = (method: string) => {
  const methodMap = {
    credit: { label: "Cartão de Crédito" },
    debit: { label: "Cartão de Débito" },
    manual_pix: { label: "Pix" },
    cash: { label: "Dinheiro" }
  };
  return methodMap[method as keyof typeof methodMap] || { label: method };
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export default function OrderDetailsModal({ open, onOpenChange, order, onUpdateOrder, onCancelOrder }: OrderDetailsModalProps) {
  // Buscar entregadores reais
  const { users, loading: loadingUsers } = useUsers();
  const deliveryPeople = users.filter((u: any) => u.role === 'delivery_man');
  const statusInfo = getStatusInfo(order.status);
  const paymentInfo = getPaymentMethodInfo(order.payment_method);
  const deliveryFee = order.withdrawal ? 0 : 3.00;

  const [editingField, setEditingField] = useState<{
    type: 'customer' | 'order' | 'financial' | 'item' | 'shop' | 'delivery';
    field: string;
    value: string | number;
  } | null>(null);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState(order.deliveryPerson || '');
  const [isSavingDelivery, setIsSavingDelivery] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editedOrder, setEditedOrder] = useState(order);

  // Atualizar editedOrder quando order mudar
  useEffect(() => {
    setEditedOrder(order);
  }, [order]);

  // Calcular subtotal baseado nos itens editados
  const editedSubtotal = (editedOrder.items || []).reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  const handleEdit = (type: 'customer' | 'order' | 'financial' | 'item' | 'shop', field: string, value: string | number) => {
    setEditingField({ type, field, value });
  };

  const handleSaveAllChanges = async () => {
    if (onUpdateOrder) {
      // Calcular diferenças entre order original e editedOrder
      const changes: any = {};
      
      // Verificar mudanças no cliente (null-safe)
      if ((editedOrder.customer?.name ?? '') !== (order.customer?.name ?? '')) {
        changes.customer = { ...changes.customer, name: editedOrder.customer?.name ?? '' };
      }
      if ((editedOrder.customer?.phone ?? '') !== (order.customer?.phone ?? '')) {
        changes.customer = { ...changes.customer, phone: editedOrder.customer?.phone ?? '' };
      }
      
      // Verificar mudanças no endereço
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
      
      // Verificar mudanças na loja
      if (editedOrder.shop.name !== order.shop.name) {
        changes.shop = { ...changes.shop, name: editedOrder.shop.name };
      }
      if (editedOrder.shop.phone !== order.shop.phone) {
        changes.shop = { ...changes.shop, phone: editedOrder.shop.phone };
      }
      
      // Verificar mudanças financeiras
      if (editedOrder.total !== order.total) {
        changes.total = editedOrder.total;
      }
      
      // Verificar mudanças nos itens
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
      
      // Só salvar se houver mudanças
      if (Object.keys(changes).length > 0) {
        await onUpdateOrder(order.id, changes);
        
        // Atualizar o order original com as mudanças salvas
        // para que a próxima edição funcione corretamente
        setEditedOrder((prev: any) => {
          const updated = { ...prev };
          
          // Aplicar as mudanças salvas ao order original
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
            // Atualizar os itens com as mudanças
            Object.keys(changes.items).forEach(itemId => {
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
    setEditingField(null); // Limpar o campo em edição
  };

  const handleCancelAllChanges = () => {
    setEditedOrder(order);
    setIsEditingMode(false);
    setEditingField(null);
  };

  const handleDeliveryPersonChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedDeliveryPerson(value);
    if (onUpdateOrder) {
      setIsSavingDelivery(true);
      try {
        await onUpdateOrder(order.id, { deliveryPerson: value });
        console.log('✅ Entregador atualizado com sucesso');
      } catch (error) {
        console.error('❌ Erro ao atualizar entregador:', error);
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
Cliente: ${order.customer.name}
Telefone: ${order.customer.phone}
Valor: ${formatCurrency(order.total)}
Status: ${statusInfo.label}
Forma de pagamento: ${paymentInfo.label}
${!order.withdrawal && order.address ? `
Endereço: ${order.address.address}
Bairro: ${order.address.neighborhood}
${order.address.complement ? `Complemento: ${order.address.complement}` : ''}
${order.address.reference ? `Referência: ${order.address.reference}` : ''}
` : ''}
Itens:
${order.items.map(item => 
  `${item.quantity}x ${item.name} - ${formatCurrency(item.price * item.quantity)}`
).join('\n')}
    `.trim();
    
    navigator.clipboard.writeText(orderInfo).then(() => {
      console.log('Informações do pedido copiadas!');
    });
  };

  const renderEditableField = (
    type: 'customer' | 'order' | 'financial' | 'item' | 'shop',
    field: string,
    value: string | number,
    label: string,
    inputType: 'text' | 'number' | 'textarea' = 'text'
  ) => {
    const isEditing = editingField?.type === type && editingField?.field === field;
    const isItemPrice = type === 'item' && field.startsWith('price_');

    const handleInputChange = (newValue: string | number) => {
      // Atualizar o estado editingField
      setEditingField({ type, field, value: newValue });
      
      // Atualizar também o editedOrder em tempo real
      setEditedOrder((prev: any) => {
        const updated = { ...prev };
        
        if (type === 'customer' && (field === 'name' || field === 'phone')) {
          updated.customer = { ...updated.customer, [field]: newValue };
        } else if (type === 'customer' && (field === 'address' || field === 'neighborhood' || field === 'complement' || field === 'reference')) {
          if (updated.address) {
            updated.address = { ...updated.address, [field]: newValue };
          }
        } else if (type === 'shop' && (field === 'name' || field === 'phone')) {
          updated.shop = { ...updated.shop, [field]: newValue };
        } else if (type === 'financial') {
          if (field === 'subtotal') {
            const newSubtotal = newValue as number;
            updated.total = newSubtotal + (updated.delivery_fee || 0);
          } else if (field === 'delivery_fee') {
            const newDeliveryFee = newValue as number;
            updated.total = editedSubtotal + newDeliveryFee;
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
                price: (newValue as number) / newItems[itemIndex].quantity
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
                quantity: newValue as number
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
                observation: newValue as string
              };
              updated.items = newItems;
            }
          }
        }
        
        return updated;
      });
    };

    return (
      <div className={`flex items-center justify-between ${isItemPrice ? '' : ''}`}>
        {label && <span className="font-medium text-gray-900">{label}:</span>}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className={`flex items-center gap-2 ${isItemPrice ? 'bg-primary text-white px-3 py-1 rounded-xs text-sm font-medium' : ''}`}>
              {inputType === 'textarea' ? (
                <Textarea
                  value={editingField.value as string}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className={`h-20 w-48 ${isItemPrice ? 'text-black' : ''}`}
                  placeholder="Digite aqui..."
                />
              ) : (
                <Input
                  type={inputType}
                  value={editingField.value}
                  onChange={(e) => handleInputChange(inputType === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                  className={`h-8 w-24 ${isItemPrice ? 'text-black' : ''}`}
                />
              )}
            </div>
          ) : (
            <>
              <span className={isItemPrice ? 'bg-primary text-white px-3 py-1 rounded-xs text-sm font-medium' : 'text-gray-700'}>
                {inputType === 'number' ? formatCurrency(value as number) : value}
              </span>
              {isEditingMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(type, field, value)}
                  className="h-4 w-4 text-[#575757]"
                >
                  <SquarePen className="h-3 w-3" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-full p-4">
        <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-gray-600 font-medium text-base">
              DETALHES DO PEDIDO #{order.id}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {!isEditingMode ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingMode(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyOrderInfo}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar Info
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveAllChanges}
                    className="flex items-center gap-2 text-green-600"
                  >
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelAllChanges}
                    className="flex items-center gap-2 text-red-600"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-6 w-6 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
                  Informações do <span className="font-bold text-gray-700">Cliente</span>
                </h3>
                <div className="space-y-3">
                  {renderEditableField('customer', 'name', editedOrder.customer?.name || 'Cliente', 'NOME')}
                  {renderEditableField('customer', 'phone', editedOrder.customer?.phone || '', 'TELEFONE')}

                  {!order.withdrawal && editedOrder.address && (
                    <>
                      {renderEditableField('customer', 'address', editedOrder.address.address, 'ENDEREÇO', 'textarea')}
                      {renderEditableField('customer', 'neighborhood', editedOrder.address.neighborhood, 'BAIRRO')}
                      {editedOrder.address.complement && renderEditableField('customer', 'complement', editedOrder.address.complement, 'COMPLEMENTO')}
                      {editedOrder.address.reference && renderEditableField('customer', 'reference', editedOrder.address.reference, 'REFERÊNCIA')}
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
                  Informações da <span className="font-bold text-gray-700">Loja</span>
                </h3>
                <div className="space-y-3">
                  {renderEditableField('shop', 'name', editedOrder.shop.name, 'NOME')}
                  {renderEditableField('shop', 'phone', editedOrder.shop.phone, 'TELEFONE')}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
                  Informações do <span className="font-bold text-gray-700">Pedido</span>
                </h3>
                <div className="space-y-3">
                  {renderEditableField('order', 'payment_method', paymentInfo.label, 'FORMA DE PAGAMENTO')}
                  {renderEditableField('order', 'date', formatDate(order.date), 'DATA E HORA')}
                  {/* Seleção de entregador apenas para delivery */}
                  {(!order.withdrawal) && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">ENTREGADOR:</span>
                      <select
                        value={selectedDeliveryPerson}
                        onChange={handleDeliveryPersonChange}
                        disabled={isSavingDelivery || loadingUsers}
                        className="border rounded-xs px-2 py-1 text-sm bg-white w-[150px]"
                      >
                        <option value="">Selecione um entregador</option>
                        {deliveryPeople.map(person => (
                          <option key={person.id} value={person.name}>{person.name}</option>
                        ))}
                      </select>
                      {isSavingDelivery && <span className="text-xs text-gray-400 ml-2">Salvando...</span>}
                    </div>
                  )}
        {/* Botão de cancelar pedido, só para delivery e status recebidos */}
        {(!order.withdrawal && order.status === 'processing') && (
          <div className="mt-6">
            <Button variant="destructive" className="w-full" onClick={handleCancelOrder}>
              Cancelar Pedido
            </Button>
          </div>
        )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
                  Status do <span className="font-bold text-gray-700">Pedido</span>
                </h3>
                <div className="flex items-center gap-3">
                  <Badge className={`${statusInfo.color} px-3 py-1 text-xs font-medium rounded-xs`}>
                    {statusInfo.label}
                    <Clock8 className="w-3 h-3 ml-1" />
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
                  Resumo <span className="font-bold text-gray-700">Financeiro</span>
                </h3>
                <div className="space-y-3">
                  {renderEditableField('financial', 'subtotal', editedSubtotal, 'TOTAL DOS ITENS', 'number')}
                  {renderEditableField('financial', 'delivery_fee', deliveryFee, 'TAXA DE ENTREGA', 'number')}
                  {renderEditableField('financial', 'total', editedOrder.total, 'TOTAL', 'number')}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Itens do <span className="font-bold text-gray-700">Pedido</span>
              </h3>
              {isEditingMode && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                  Adicionar Item
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              {editedOrder.items.map((item: any) => (
                <div key={item.id} className="flex items-start justify-between p-4 bg-gray-100 rounded-xs">
                  <div className="flex items-start gap-4 flex-1">
                    {item.image && (
                      <div className="flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-xs"
                          onError={(e: any) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center justify-center w-8 h-6 bg-primary text-white rounded text-xs font-medium">
                          {item.quantity}x
                        </div>
                        <span className="font-medium text-black text-lg">{item.name}</span>
                        {item.weight && (
                          <Badge variant="outline" className="text-xs">
                            {item.weight}
                          </Badge>
                        )}
                      </div>
                      
                      {item.observation && (
                        <p className="text-sm text-orange-600 mb-2 italic">
                          "{item.observation}"
                        </p>
                      )}
                      
                      {item.extras && item.extras.length > 0 && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-gray-600">Extras:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.extras.map((extra: any, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {extra.name} (+{formatCurrency(extra.price)})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {item.prepare_methods && item.prepare_methods.length > 0 && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-gray-600">Preparo:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.prepare_methods.map((method: any, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {method.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {item.steps && item.steps.length > 0 && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-gray-600">Opções:</span>
                          <div className="space-y-1 mt-1">
                            {item.steps.map((step: any, index: number) => (
                              <div key={index} className="text-xs">
                                <span className="font-medium">{step.name}:</span>
                                {step.options && step.options.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1 ml-2">
                                    {step.options.map((option: any, optIndex: number) => (
                                      <Badge key={optIndex} variant="outline" className="text-xs">
                                        {option.name}
                                      </Badge>
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
                  
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      {renderEditableField('item', `price_${item.id}`, item.price * item.quantity, '', 'number')}
                    </div>
                    {isEditingMode && (
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}