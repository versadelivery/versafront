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

const mockOrderDetails = {
  id: "1",
  date: "2024-03-20T14:30:00",
  status: "processing",
  payment_status: "pending",
  total: 299.90,
  withdrawal: false,
  payment_method: "manual_pix",
  payment_details: {
    pix_key: "matheuspizzas@email.com",
    pix_key_type: "email",
    card_last_digits: "1234",
    card_brand: "Visa",
    installments: 1
  },
  address: {
    address: "Major barreto, 1602",
    neighborhood: "Centro", 
    complement: "Portão vermelho",
    reference: "Em frente a Márcia"
  },
  items: [
    {
      id: "1",
      catalog_item_id: 66,
      name: "Pizza de Calabresa",
      price: 25.90,
      quantity: 2,
      observation: "Sem cebola, extra bacon e sem borda",
      image: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: "2", 
      catalog_item_id: 67,
      name: "Pizza Margherita",
      price: 18.50,
      quantity: 1,
      observation: "",
      image: "https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: "3",
      catalog_item_id: 68, 
      name: "Refrigerante 2L",
      price: 8.90,
      quantity: 3,
      observation: "Bem gelado",
      image: "https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ],
  shop: {
    id: 1,
    name: "Matheus Pizzas",
    phone: "(11) 99999-9999",
    email: "contato@matheuspizzas.com"
  },
  customer: {
    name: "Matheus",
    phone: "(85) 99123-4567"
  },
  timeline: [
    { 
      status: "processing", 
      label: "Pedido Realizado", 
      date: "2024-03-20T14:30:00",
      description: "Seu pedido foi recebido e está sendo processado"
    }
  ]
};

const getStatusInfo = (status: string) => {
  const statusMap = {
    delivered: { 
      label: "Entregue", 
      color: "bg-emerald-500 text-white", 
      icon: CheckCircle2 
    },
    in_transit: { 
      label: "Em trânsito", 
      color: "bg-blue-500 text-white", 
      icon: Truck 
    },
    processing: { 
      label: "Processando", 
      color: "bg-amber-500 text-white", 
      icon: Clock 
    },
    preparing: { 
      label: "Preparando", 
      color: "bg-orange-500 text-white", 
      icon: Package 
    },
    cancelled: { 
      label: "Cancelado", 
      color: "bg-red-500 text-white", 
      icon: Package 
    }
  };
  return statusMap[status as keyof typeof statusMap] || statusMap.processing;
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

const getPaymentStatusInfo = (status: string) => {
  const statusMap = {
    paid: { 
      label: "Pago", 
      color: "bg-emerald-500 text-white", 
      icon: CheckCircle2 
    },
    pending: { 
      label: "Pendente", 
      color: "bg-amber-500 text-white", 
      icon: Clock 
    },
    failed: { 
      label: "Falhou", 
      color: "bg-red-500 text-white", 
      icon: CreditCard 
    }
  };
  return statusMap[status as keyof typeof statusMap] || statusMap.pending;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('pt-BR'),
    time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  };
};

export default function OrderDetailsPage({ params }: { params: { slug: string, id: string } }) {
  const router = useRouter();
  const order = mockOrderDetails;
  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;
  const paymentInfo = getPaymentMethodInfo(order.payment_method);
  const PaymentIcon = paymentInfo.icon;
  const paymentStatusInfo = getPaymentStatusInfo(order.payment_status);
  const PaymentStatusIcon = paymentStatusInfo.icon;
  const dateInfo = formatDate(order.date);

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = order.withdrawal ? 0 : 5.00;

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-12">
        <Button
          variant="ghost"
          className="mb-8 hover:bg-slate-100 text-slate-700 font-medium"
          // onClick={() => router.back()}
          onClick={() => router.push('/pedidos')}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Voltar para pedidos
        </Button>

        <div className="space-y-8">
          <Card className="border-0 shadow-sm bg-white rounded-xs overflow-hidden">
            <div className="bg-primary p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <h1 className="text-4xl font-bold text-primary-foreground">#{order.id}</h1>
                    <Badge className={`${statusInfo.color} border-0 px-4 py-2 rounded-xs font-semibold text-sm`}>
                      <StatusIcon className="h-4 w-4 mr-2" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <p className="text-primary-foreground text-xl font-medium mb-1">{order.shop.name}</p>
                  <p className="text-primary-foreground">{dateInfo.date} às {dateInfo.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-white">{formatCurrency(order.total)}</p>
                  <p className="text-slate-300">Total do pedido</p>
                </div>
              </div>
            </div>
            
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-xs">
                    <PaymentStatusIcon className="h-6 w-6 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">STATUS PAGAMENTO</p>
                    <Badge className={`${paymentStatusInfo.color} border-0 px-3 py-1 rounded-xs font-semibold text-xs`}>
                      {paymentStatusInfo.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.payment_method === 'manual_pix' && order.payment_status === 'pending' && (
            <Card className="border-0 shadow-sm bg-white rounded-xs">
              <CardHeader className="bg-amber-50 border-b border-amber-200">
                <CardTitle className="flex items-center gap-3 text-amber-800">
                  <QrCode className="h-6 w-6" />
                  Pagamento PIX Pendente
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
                    {order.items.map((item, index) => (
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
                        {!order.withdrawal && (
                          <div className="flex justify-between text-slate-600">
                            <span>Taxa de entrega</span>
                            <span className="font-medium">{formatCurrency(deliveryFee)}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between text-xl font-bold text-slate-900">
                          <span>Total</span>
                          <span>{formatCurrency(order.total)}</span>
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