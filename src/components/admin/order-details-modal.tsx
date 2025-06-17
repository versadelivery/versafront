import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/order-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { 
  Clock8, 
  SquarePen, 
  Trash2,
  X,
  Check,
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
  };
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

export default function OrderDetailsModal({ open, onOpenChange, order }: OrderDetailsModalProps) {
  const statusInfo = getStatusInfo(order.status);
  const paymentInfo = getPaymentMethodInfo(order.payment_method);
  const deliveryFee = order.withdrawal ? 0 : 3.00;
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const [editingField, setEditingField] = useState<{
    type: 'customer' | 'order' | 'financial' | 'item';
    field: string;
    value: string | number;
  } | null>(null);

  const handleEdit = (type: 'customer' | 'order' | 'financial' | 'item', field: string, value: string | number) => {
    setEditingField({ type, field, value });
  };

  const handleSave = () => {
    // TODO: Implementar lógica de salvamento
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  const renderEditableField = (
    type: 'customer' | 'order' | 'financial' | 'item',
    field: string,
    value: string | number,
    label: string
  ) => {
    const isEditing = editingField?.type === type && editingField?.field === field;
    const isItemPrice = type === 'item' && field.startsWith('price_');

    return (
      <div className={`flex items-center justify-between ${isItemPrice ? '' : ''}`}>
        {label && <span className="font-medium text-gray-900">{label}:</span>}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className={`flex items-center gap-2 ${isItemPrice ? 'bg-primary text-white px-3 py-1 rounded-xs text-sm font-medium' : ''}`}>
              <Input
                value={editingField.value}
                onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                className={`h-8 w-24 ${isItemPrice ? 'text-black' : ''}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                className="h-6 w-6 text-green-500"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="h-6 w-6 text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <span className={isItemPrice ? 'bg-primary text-white px-3 py-1 rounded-xs text-sm font-medium' : 'text-gray-700'}>{value}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(type, field, value)}
                className="h-4 w-4 text-[#575757]"
              >
                <SquarePen className="h-3 w-3" />
              </Button>
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
                  Informações do <span className="font-bold text-gray-700">Cliente</span>
                </h3>
                <div className="space-y-3">
                  {renderEditableField('customer', 'name', order.customer.name, 'NOME')}
                  {renderEditableField('customer', 'phone', order.customer.phone, 'TELEFONE')}

                  {!order.withdrawal && order.address && (
                    <>
                      {renderEditableField('customer', 'address', order.address.address, 'ENDEREÇO')}
                      {renderEditableField('customer', 'neighborhood', order.address.neighborhood, 'BAIRRO')}
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
                  Informações do <span className="font-bold text-gray-700">Pedido</span>
                </h3>
                <div className="space-y-3">
                  {renderEditableField('order', 'payment_method', paymentInfo.label, 'FORMA DE PAGAMENTO')}
                  {renderEditableField('order', 'date', formatDate(order.date), 'DATA E HORA')}
                  {renderEditableField('order', 'delivery', 'Freire Guerra', 'ENTREGADOR')}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
                  Resumo <span className="font-bold text-gray-700">Financeiro</span>
                </h3>
                <div className="space-y-3">
                  {renderEditableField('financial', 'subtotal', formatCurrency(subtotal), 'TOTAL DOS ITENS')}
                  {renderEditableField('financial', 'delivery_fee', formatCurrency(deliveryFee), 'TAXA DE ENTREGA')}
                  {renderEditableField('financial', 'total', formatCurrency(order.total), 'TOTAL')}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
                  Status do <span className="font-bold text-gray-700">Pedido</span>
                </h3>
                <div className="flex items-center gap-3">
                  <Badge className={`${statusInfo.color} px-3 py-1 text-xs font-medium rounded-xs`}>
                    {statusInfo.label}
                    <Clock8 className="w-3 h-3" />
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Itens do <span className="font-bold text-gray-700">Pedido</span>
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                Adicionar Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-xs">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-8 rounded text-sm font-medium">
                      {item.quantity}x
                    </div>
                    <div>
                      <span className="font-medium text-black text-xl">{item.name}</span>
                      {item.weight && (
                        <span className="text-sm text-gray-500 ml-2">{item.weight}</span>
                      )}
                      {item.observation && (
                        <p className="text-xs text-gray-500 mt-1">{item.observation}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      {renderEditableField('item', `price_${item.id}`, formatCurrency(item.price * item.quantity), '')}
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
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