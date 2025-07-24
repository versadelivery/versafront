'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { getCustomerOrders } from "@/services/order-service";
import { CustomerOrder } from "@/types/order";
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Store, 
  CreditCard, 
  Wallet, 
  QrCode,
  ArrowRight,
  Calendar,
  MapPin,
  ShoppingBag
} from "lucide-react";

const getPaymentMethodInfo = (method: string) => {
  const methodMap = {
    credit: { label: "Cartão de Crédito", icon: CreditCard },
    debit: { label: "Cartão de Débito", icon: CreditCard },
    manual_pix: { label: "PIX", icon: QrCode },
    cash: { label: "Dinheiro", icon: Wallet }
  };
  return methodMap[method as keyof typeof methodMap] || { label: method, icon: CreditCard };
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('pt-BR'),
    time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  };
};

const getStatusInfo = (status: string) => {
  const statusMap = {
    received: { label: "Recebido", color: "bg-blue-100 text-blue-800" },
    in_analysis: { label: "Em Análise", color: "bg-yellow-100 text-yellow-800" },
    preparing: { label: "Preparando", color: "bg-orange-100 text-orange-800" },
    ready: { label: "Pronto", color: "bg-green-100 text-green-800" },
    delivered: { label: "Entregue", color: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800" }
  };
  return statusMap[status as keyof typeof statusMap] || { label: status, color: "bg-gray-100 text-gray-800" };
};

export default function OrdersPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = React.use(params);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getCustomerOrders();
        if (response) {
          setOrders(response.data);
        }
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-primary rounded-xs">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Meus Pedidos</h1>
          </div>
          <p className="text-slate-600 text-lg">Acompanhe todos os seus pedidos em um só lugar</p>
        </div>
        
        <div className="space-y-6">
          {orders.map((order) => {
            const paymentInfo = getPaymentMethodInfo(order.attributes.payment_method);
            const PaymentIcon = paymentInfo.icon;
            const dateInfo = formatDate(order.attributes.created_at);
            const statusInfo = getStatusInfo(order.attributes.status);
            const totalPrice = order.attributes.total_price ? parseFloat(order.attributes.total_price) : 0;
            const itemsCount = order.attributes.items.data.length;
            
            return (
              <Card key={order.id} className="group border-0 shadow-sm hover:shadow-xl transition-all duration-500 bg-white rounded-xs overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="flex-1 p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-slate-900">#{order.attributes.id}</h3>
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <p className="text-slate-600 font-medium text-lg">{order.attributes.shop.data.attributes.name}</p>
                          <p className="text-slate-500">{dateInfo.date} às {dateInfo.time}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalPrice)}</p>
                          <p className="text-slate-500">{itemsCount} {itemsCount === 1 ? 'item' : 'itens'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-slate-100 rounded-xs">
                            <PaymentIcon className="h-5 w-5 text-slate-700" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-500 font-medium">PAGAMENTO</p>
                            <p className="text-slate-900 font-semibold">{paymentInfo.label}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-slate-100 rounded-xs">
                            {order.attributes.withdrawal ? (
                              <Store className="h-5 w-5 text-slate-700" />
                            ) : (
                              <Truck className="h-5 w-5 text-slate-700" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-slate-500 font-medium">TIPO</p>
                            <p className="text-slate-900 font-semibold">{order.attributes.withdrawal ? "Retirada" : "Entrega"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-slate-100 rounded-xs">
                            <Calendar className="h-5 w-5 text-slate-700" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-500 font-medium">PEDIDO</p>
                            <p className="text-slate-900 font-semibold">{dateInfo.time}</p>
                          </div>
                        </div>
                      </div>
                      
                      {!order.attributes.withdrawal && order.attributes.address.data && (
                        <div className="mb-6 p-4 bg-slate-50 rounded-xs border-l-4 border-slate-900">
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-slate-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-slate-500 mb-1">ENDEREÇO DE ENTREGA</p>
                              <p className="text-slate-900 font-medium">{order.attributes.address.data.attributes.address}</p>
                              <p className="text-slate-700">{order.attributes.address.data.attributes.neighborhood}</p>
                              {order.attributes.address.data.attributes.complement && (
                                <p className="text-slate-600 text-sm">{order.attributes.address.data.attributes.complement}</p>
                              )}
                              {order.attributes.address.data.attributes.reference && (
                                <p className="text-slate-600 text-sm">Ref: {order.attributes.address.data.attributes.reference}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <Button
                          onClick={() => router.push(`/pedidos/${order.id}`)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xs font-semibold transition-all duration-300 group-hover:bg-primary/90"
                        >
                          Ver detalhes
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {orders.length === 0 && (
          <Card className="border-0 shadow-sm bg-white rounded-xs">
            <CardContent className="py-20 text-center">
              <div className="p-6 bg-slate-100 rounded-xs w-fit mx-auto mb-6">
                <ShoppingBag className="h-16 w-16 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Nenhum pedido encontrado</h3>
              <p className="text-slate-600 mb-8 text-lg">Você ainda não fez nenhum pedido</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}