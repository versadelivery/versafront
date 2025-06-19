'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock,
  CreditCard,
  Wallet,
  QrCode,
  Store,
  MapPin,
  Calendar,
  User,
  MessageSquare,
  Phone,
  Mail,
  Copy,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import { useActionCable } from "@/lib/cable";
import { ActionCableOrderData } from "@/types/order";

const getStatusInfo = (status: string) => {
  const statusMap = {
    ready: { 
      label: "Pronto", 
      color: "bg-emerald-500 text-white", 
      icon: CheckCircle2 
    },
    in_prepare: { 
      label: "Em preparo", 
      color: "bg-orange-500 text-white", 
      icon: Package 
    },
    in_analysis: { 
      label: "Em análise", 
      color: "bg-blue-500 text-white", 
      icon: Clock 
    },
    accepted: { 
      label: "Aceito", 
      color: "bg-green-500 text-white", 
      icon: CheckCircle2 
    },
    received: { 
      label: "Recebido", 
      color: "bg-amber-500 text-white", 
      icon: Clock 
    }
  };
  return statusMap[status as keyof typeof statusMap] || statusMap.received;
};

const getPaymentMethodInfo = (method: string) => {
  const methodMap = {
    credit: { 
      label: "Cartão de Crédito", 
      icon: CreditCard,
      payment_info: "Pagamento no ato da entrega"
    },
    debit: { 
      label: "Cartão de Débito", 
      icon: CreditCard,
      payment_info: "Pagamento no ato da entrega"
    },
    manual_pix: { 
      label: "PIX", 
      icon: QrCode,
      payment_info: "Pagamento antes da entrega"
    },
    cash: { 
      label: "Dinheiro", 
      icon: Wallet,
      payment_info: "Pagamento no ato da entrega"
    }
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

export default function OrderDetailsPage({ params }: { params: Promise<{ slug: string, id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const { subscribeToOrder, disconnect, isConnected } = useActionCable();
  const [connectionStatus, setConnectionStatus] = useState<string>('Conectando...');
  const [orderData, setOrderData] = useState<ActionCableOrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  console.log("ID do pedido recebido:", id);
  console.log("Status da conexão:", isConnected());
  console.log("Status da conexão:", connectionStatus);

  useEffect(() => {
    if (!id) return;

    const handleOrderData = (data: ActionCableOrderData) => {
      console.log("Dados do pedido recebidos via Action Cable:", data);
      setOrderData(data);
      setIsLoading(false);
      setError(null);
    };

    const unsubscribe = subscribeToOrder(id, handleOrderData);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      disconnect();
    };
  }, [id, subscribeToOrder, disconnect]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando informações do pedido...</p>
        </div>
      </div>
    );  
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar pedido: {error}</p>
          <Button onClick={() => router.push('/pedidos')}>
            Voltar para pedidos
          </Button>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Pedido não encontrado</p>
          <Button onClick={() => router.push('/pedidos')}>
            Voltar para pedidos
          </Button>
        </div>
      </div>
    );
  }

  const order = {
    id: orderData.attributes.id?.toString() || "0",
    date: orderData.attributes.created_at || new Date().toISOString(),
    status: orderData.attributes.status || "received",
    total: parseFloat(orderData.attributes.total_items_price || "0"),
    withdrawal: orderData.attributes.withdrawal || false,
    payment_method: orderData.attributes.payment_method || "cash",
    delivery_fee: parseFloat(orderData.attributes.delivery_fee || "0"),
    items: orderData.attributes.items?.data?.map((item: any) => ({
      id: item.id || "",
      catalog_item_id: parseInt(item.attributes?.catalog_item?.data?.id || "0"),
      name: item.attributes?.catalog_item?.data?.attributes?.name || "Item não informado",
      price: parseFloat(item.attributes?.price || "0"),
      quantity: item.attributes?.quantity || 0,
      observation: item.attributes?.observation || "",
      image: item.attributes?.catalog_item?.data?.attributes?.image_url || ""
    })) || [],
    shop: {
      id: orderData.attributes.shop?.data?.id || "",
      name: orderData.attributes.shop?.data?.attributes?.name || "Loja não informada",
      phone: orderData.attributes.shop?.data?.attributes?.cellphone || "",
      email: "contato@loja.com" // Não está na API ainda
    },
    customer: {
      name: orderData.attributes.customer?.data?.attributes?.name || "Cliente não informado",
      phone: orderData.attributes.customer?.data?.attributes?.cellphone || "",
      email: orderData.attributes.customer?.data?.attributes?.email || ""
    },
    address: {
      address: orderData.attributes.address?.data?.attributes?.address || "Endereço não informado",
      neighborhood: orderData.attributes.address?.data?.attributes?.neighborhood || "",
      complement: orderData.attributes.address?.data?.attributes?.complement || "",
      reference: orderData.attributes.address?.data?.attributes?.reference || ""
    },
    payment_details: {
      pix_key: "pix@email.com",
      pix_key_type: "email"
    },
    timeline: [
      { 
        status: orderData.attributes.status, 
        label: "Pedido Realizado", 
        date: orderData.attributes.created_at,
        description: "Seu pedido foi recebido e está sendo processado"
      }
    ]
  };

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;
  const paymentInfo = getPaymentMethodInfo(order.payment_method);
  const PaymentIcon = paymentInfo.icon;
  const dateInfo = formatDate(order.date);

  const subtotal = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const deliveryFee = order.withdrawal ? 0 : order.delivery_fee;
  const total = subtotal + deliveryFee;

  const handleSendReceipt = () => {
    const message = `Olá! Segue o comprovante do pagamento do pedido #${order.id}`;
    const whatsappUrl = `https://wa.me/${order.shop.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText(order.payment_details.pix_key);
    toast.success('Chave PIX copiada para área de transferência');
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="container mx-auto px-6 py-12">
        <Button
          variant="ghost"
          className="mb-8 hover:bg-slate-100 text-slate-700 font-medium"
          onClick={() => router.push('/pedidos')}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Voltar para pedidos
        </Button>

        <div className="space-y-8">
          <Card className="border-0 shadow-sm bg-white rounded-xs overflow-hidden">
            <div className="bg-primary p-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <h1 className="text-4xl font-bold text-primary-foreground">#{order.id}</h1>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <StatusIcon className="h-5 w-5 text-white" />
                      <span className="text-white font-semibold text-sm">{statusInfo.label}</span>
                    </div>
                  </div>
                  <p className="text-primary-foreground text-xl font-medium mb-1">{order.shop.name}</p>
                  <p className="text-primary-foreground/80">{dateInfo.date} às {dateInfo.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-white">{formatCurrency(total)}</p>
                  <p className="text-slate-300">Total do pedido</p>
                </div>
              </div>
            </div>
            
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-xs">
                    <PaymentIcon className="h-6 w-6 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">PAGAMENTO</p>
                    <p className="text-slate-900 font-bold">{paymentInfo.label}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-xs">
                    {order.withdrawal ? (
                      <Store className="h-6 w-6 text-slate-700" />
                    ) : (
                      <Truck className="h-6 w-6 text-slate-700" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">TIPO</p>
                    <p className="text-slate-900 font-bold">{order.withdrawal ? "Retirada" : "Entrega"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-xs">
                    <Package className="h-6 w-6 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">ITENS</p>
                    <p className="text-slate-900 font-bold">{order.items.length} produtos</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.payment_method === 'manual_pix' && (
            <Card className="border-0 shadow-sm bg-white rounded-xs">
              <CardHeader className="bg-amber-50 border-b border-amber-200">
                <CardTitle className="flex items-center gap-3 text-amber-800">
                  <QrCode className="h-6 w-6" />
                  Pagamento PIX
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="bg-slate-50 p-6 rounded-xs mb-6">
                  <p className="text-sm font-semibold text-slate-500 mb-2">CHAVE PIX</p>
                  <div className="flex items-center justify-between bg-white p-4 rounded-xs border">
                    <span className="font-mono text-lg text-slate-900">{order.payment_details.pix_key}</span>
                    <Button
                      onClick={copyPixKey}
                      variant="outline"
                      size="sm"
                      className="border-slate-300 hover:bg-slate-50"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    Tipo: {order.payment_details.pix_key_type === 'email' ? 'E-mail' : 'CPF/CNPJ'}
                  </p>
                </div>
                <Button 
                  onClick={handleSendReceipt}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xs font-semibold"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Enviar comprovante via WhatsApp
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-sm bg-white rounded-xs">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="flex items-center gap-3 text-slate-900">
                    <Package className="h-6 w-6" />
                    Itens do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {order.items.map((item: any, index: number) => (
                      <div key={item.id}>
                        <div className="flex gap-6">
                          <div className="relative">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 rounded-xs object-cover"
                            />
                            <Badge className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-xs">
                              {item.quantity}x
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900 text-lg mb-1">{item.name}</h4>
                            <p className="text-slate-600 mb-2">
                              {formatCurrency(item.price)} cada
                            </p>
                            {item.observation && (
                              <div className="flex items-start gap-2 mb-2">
                                <MessageSquare className="h-4 w-4 text-slate-500 mt-0.5" />
                                <p className="text-sm text-slate-600 italic">{item.observation}</p>
                              </div>
                            )}
                            <p className="font-bold text-slate-900">
                              Total: {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                        {index < order.items.length - 1 && <Separator className="mt-6" />}
                      </div>
                    ))}
                    
                    <div className="bg-slate-50 p-6 rounded-xs mt-8">
                      <div className="space-y-3">
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal</span>
                          <span className="font-medium">{formatCurrency(subtotal)}</span>
                        </div>
                        {!order.withdrawal && deliveryFee > 0 && (
                          <div className="flex justify-between text-slate-600">
                            <span>Taxa de entrega</span>
                            <span className="font-medium">{formatCurrency(deliveryFee)}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between text-xl font-bold text-slate-900">
                          <span>Total</span>
                          <span>{formatCurrency(total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              {!order.withdrawal ? (
                <Card className="border-0 shadow-sm bg-white rounded-xs">
                  <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="flex items-center gap-3 text-slate-900">
                      <MapPin className="h-6 w-6" />
                      Endereço de Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="font-bold text-slate-900">{order.address.address}</p>
                      <p className="text-slate-700">{order.address.neighborhood}</p>
                      {order.address.complement && (
                        <p className="text-slate-600">{order.address.complement}</p>
                      )}
                      {order.address.reference && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-xs">
                          <p className="text-sm font-semibold text-slate-500">REFERÊNCIA</p>
                          <p className="text-slate-700">{order.address.reference}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-sm bg-white rounded-xs">
                  <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="flex items-center gap-3 text-slate-900">
                      <Store className="h-6 w-6" />
                      Retirada na Loja
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-slate-600 mb-3">
                      Seu pedido estará disponível para retirada na loja.
                    </p>
                    <p className="font-bold text-slate-900">{order.shop.name}</p>
                  </CardContent>
                </Card>
              )}

              <Card className="border-0 shadow-sm bg-white rounded-xs">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="flex items-center gap-3 text-slate-900">
                    <Phone className="h-6 w-6" />
                    Contatos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-3">ESTABELECIMENTO</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-900 font-medium">{order.shop.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-900 font-medium">{order.shop.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-3">CLIENTE</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-900 font-medium">{order.customer.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-900 font-medium">{order.customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-900 font-medium">{order.customer.email}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}