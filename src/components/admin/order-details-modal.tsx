import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/order-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { 
  Clock8, 
  SquarePen, 
  Trash2,
  X,
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
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">NOME:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">{order.customer.name}</span>
                      <Button variant="ghost" size="icon" className="h-4 w-4 text-[#575757]">
                        <SquarePen className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">TELEFONE:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">{order.customer.phone}</span>
                      <Button variant="ghost" size="icon" className="h-4 w-4 text-[#575757]">
                        <SquarePen className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {!order.withdrawal && order.address && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">ENDEREÇO:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700">{order.address.address}</span>
                          <Button variant="ghost" size="icon" className="h-4 w-4 text-[#575757]">
                            <SquarePen className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">BAIRRO:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700">{order.address.neighborhood}</span>
                          <Button variant="ghost" size="icon" className="h-4 w-4 text-[#575757]">
                            <SquarePen className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
                  Informações do <span className="font-bold text-gray-700">Pedido</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">FORMA DE PAGAMENTO:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">{paymentInfo.label}</span>
                      <Button variant="ghost" size="icon" className="h-4 w-4 text-[#575757]">
                        <SquarePen className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">DATA E HORA:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">{formatDate(order.date)}</span>
                      <Button variant="ghost" size="icon" className="h-4 w-4 text-[#575757]">
                        <SquarePen className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">ENTREGADOR:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">Freire Guerra</span>
                      <Button variant="ghost" size="icon" className="h-4 w-4 text-[#575757]">
                        <SquarePen className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
                  Resumo <span className="font-bold text-gray-700">Financeiro</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">TOTAL DOS ITENS:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{formatCurrency(subtotal)}</span>
                      <Button variant="ghost" size="icon" className="h-4 w-4 text-[#575757]">
                        <SquarePen className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">TAXA DE ENTREGA:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{formatCurrency(deliveryFee)}</span>
                      <Button variant="ghost" size="icon" className="h-4 w-4 text-[#575757]">
                        <SquarePen className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="font-bold text-gray-900">TOTAL:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-gray-900">{formatCurrency(order.total)}</span>
                      <Button variant="ghost" size="icon" className="h-4 w-4 text-[#575757]">
                        <SquarePen className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
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
                    <div className="bg-primary text-white px-3 py-1 rounded-xs text-sm font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-[#575757]">
                      <SquarePen className="h-4 w-4" />
                    </Button>
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