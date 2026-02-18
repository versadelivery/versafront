'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getClientToken } from "@/lib/auth";
import { useClientActionCable, ClientOrderData } from "@/lib/client-cable";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PedidosHeader from "../pedidos-header";
import {
  Truck,
  Store,
  CreditCard,
  Wallet,
  QrCode,
  MapPin,
  Phone,
  ExternalLink,
  Package,
  User,
} from "lucide-react";

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string; description: string }> = {
  received:       { label: "Recebido",    dot: "bg-amber-400",   bg: "bg-amber-50",   text: "text-amber-700",   description: "Seu pedido foi recebido e será processado em breve." },
  accepted:       { label: "Aceito",      dot: "bg-blue-500",    bg: "bg-blue-50",    text: "text-blue-700",    description: "Seu pedido foi aceito e será preparado em breve." },
  in_analysis:    { label: "Em análise",  dot: "bg-orange-400",  bg: "bg-orange-50",  text: "text-orange-700",  description: "Estamos analisando seu pedido." },
  in_preparation: { label: "Preparando",  dot: "bg-orange-500",  bg: "bg-orange-50",  text: "text-orange-700",  description: "Seu pedido está sendo preparado com carinho." },
  ready:          { label: "Pronto",      dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", description: "Seu pedido está pronto!" },
  delivered:      { label: "Entregue",    dot: "bg-green-500",   bg: "bg-green-50",   text: "text-green-700",   description: "Pedido entregue. Bom apetite!" },
  cancelled:      { label: "Cancelado",   dot: "bg-red-400",     bg: "bg-red-50",     text: "text-red-700",     description: "Este pedido foi cancelado." },
};

const paymentConfig: Record<string, { label: string; icon: React.ElementType }> = {
  credit:     { label: "Cartão de Crédito", icon: CreditCard },
  debit:      { label: "Cartão de Débito",  icon: CreditCard },
  manual_pix: { label: "PIX",               icon: QrCode     },
  cash:       { label: "Dinheiro",          icon: Wallet     },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, dot: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('pt-BR'),
    time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  };
};

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const { subscribeToOrder, disconnect } = useClientActionCable(id);
  const [orderData, setOrderData] = useState<ClientOrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getClientToken();
    if (!token) {
      router.push(`/auth/login?redirect=/pedidos/${id}`);
      return;
    }

    if (!id) return;

    const unsubscribe = subscribeToOrder((data: ClientOrderData) => {
      setOrderData(data);
      setIsLoading(false);
      setError(null);
    });

    return () => {
      if (unsubscribe) unsubscribe();
      disconnect();
    };
  }, [id, subscribeToOrder, disconnect, router]);

  const shopSlug = typeof window !== 'undefined'
    ? (() => { try { return JSON.parse(localStorage.getItem('shop') || '{}')?.data?.attributes?.slug; } catch { return null; } })()
    : null;

  const nav = (
    <PedidosHeader backHref="/pedidos" backLabel="Meus Pedidos" />
  );

  if (isLoading) {
    return (
      <>
        {nav}
        <div className="min-h-screen bg-gray-50/40 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Carregando pedido...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !orderData) {
    return (
      <>
        {nav}
        <div className="min-h-screen bg-gray-50/40 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <p className="text-sm text-muted-foreground mb-4">
              {error ?? 'Pedido não encontrado.'}
            </p>
            <Button onClick={() => router.push('/pedidos')} variant="outline" className="rounded-full">
              Ver todos os pedidos
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Normalise data
  const order = {
    id: orderData.attributes.id?.toString() ?? id,
    date: orderData.attributes.created_at ?? new Date().toISOString(),
    status: orderData.attributes.status ?? 'received',
    withdrawal: orderData.attributes.withdrawal ?? false,
    payment_method: orderData.attributes.payment_method ?? 'cash',
    delivery_fee: parseFloat(orderData.attributes.delivery_fee ?? '0'),
    items: (orderData.attributes.items?.data ?? []).map((item: any) => ({
      id: item.id ?? '',
      name: item.attributes?.catalog_item?.data?.attributes?.name ?? 'Item',
      price: parseFloat(item.attributes?.price ?? '0'),
      quantity: item.attributes?.quantity ?? 0,
      observation: item.attributes?.observation ?? '',
      image: item.attributes?.catalog_item?.data?.attributes?.image_url ?? '',
    })),
    shop: {
      name: orderData.attributes.shop?.data?.attributes?.name ?? '—',
      phone: orderData.attributes.shop?.data?.attributes?.cellphone ?? '',
    },
    customer: {
      name: orderData.attributes.customer?.data?.attributes?.name ?? '—',
      phone: orderData.attributes.customer?.data?.attributes?.cellphone ?? '',
    },
    address: {
      address: orderData.attributes.address?.data?.attributes?.address ?? '',
      neighborhood: (orderData.attributes.address?.data?.attributes?.shop_delivery_neighborhood as any)?.data?.attributes?.name
                    ?? orderData.attributes.address?.data?.attributes?.neighborhood ?? '',
      complement: orderData.attributes.address?.data?.attributes?.complement ?? '',
      reference: orderData.attributes.address?.data?.attributes?.reference ?? '',
    },
  };

  const statusCfg = statusConfig[order.status] ?? statusConfig.received;
  const PaymentIcon = (paymentConfig[order.payment_method] ?? paymentConfig.cash).icon;
  const paymentLabel = (paymentConfig[order.payment_method] ?? paymentConfig.cash).label;
  const dateInfo = formatDate(order.date);
  const subtotal = order.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
  const deliveryFee = order.withdrawal ? 0 : order.delivery_fee;
  const total = subtotal + deliveryFee;

  const handleWhatsApp = () => {
    if (!order.shop.phone) return;
    const msg = encodeURIComponent(`Olá! Tenho uma dúvida sobre o pedido #${order.id}.`);
    window.open(`https://wa.me/${order.shop.phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
  };

  return (
    <>
      {nav}
      <div className="min-h-screen bg-gray-50/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-8">

          {/* Order header */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-lg font-bold text-foreground">Pedido #{order.id}</h1>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-sm font-medium text-foreground">{order.shop.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{dateInfo.date} às {dateInfo.time}</p>
                {statusCfg.description && (
                  <p className="text-xs text-muted-foreground mt-2 italic">{statusCfg.description}</p>
                )}
              </div>
              <div className="sm:text-right pt-3 sm:pt-0 border-t border-gray-100 sm:border-0">
                <p className="text-2xl font-bold text-foreground">{formatCurrency(total)}</p>
                <p className="text-xs text-muted-foreground">Total do pedido</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-wrap gap-5 text-sm">
              <div className="flex items-center gap-2">
                <PaymentIcon className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">{paymentLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                {order.withdrawal
                  ? <Store className="w-4 h-4 text-primary" />
                  : <Truck className="w-4 h-4 text-primary" />
                }
                <span className="text-foreground font-medium">
                  {order.withdrawal ? 'Retirada na loja' : 'Entrega'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Items */}
            <div className="lg:col-span-2">
              <InfoCard title="Itens do pedido">
                <div className="space-y-4">
                  {order.items.map((item: any, idx: number) => (
                    <div key={item.id}>
                      <div className="flex gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-foreground leading-snug">{item.name}</p>
                            <p className="text-sm font-bold text-foreground flex-shrink-0">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.quantity}× {formatCurrency(item.price)}
                          </p>
                          {item.observation && (
                            <p className="text-xs text-muted-foreground italic mt-1">"{item.observation}"</p>
                          )}
                        </div>
                      </div>
                      {idx < order.items.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {!order.withdrawal && deliveryFee > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Taxa de entrega</span>
                      <span>{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-foreground pt-1 border-t border-gray-100">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </InfoCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Address / Pickup */}
              {order.withdrawal ? (
                <InfoCard title="Retirada na loja">
                  <div className="flex items-start gap-2">
                    <Store className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{order.shop.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Retire no estabelecimento quando estiver pronto.</p>
                    </div>
                  </div>
                </InfoCard>
              ) : (
                <InfoCard title="Endereço de entrega">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm space-y-0.5">
                      <p className="font-medium text-foreground">{order.address.address}</p>
                      {order.address.neighborhood && (
                        <p className="text-muted-foreground">{order.address.neighborhood}</p>
                      )}
                      {order.address.complement && (
                        <p className="text-muted-foreground">{order.address.complement}</p>
                      )}
                      {order.address.reference && (
                        <p className="text-xs text-muted-foreground mt-1">Ref: {order.address.reference}</p>
                      )}
                    </div>
                  </div>
                </InfoCard>
              )}

              {/* PIX */}
              {order.payment_method === 'manual_pix' && (
                <InfoCard title="Pagamento PIX">
                  <p className="text-xs text-muted-foreground mb-3">
                    Envie o comprovante de pagamento ao estabelecimento.
                  </p>
                  {order.shop.phone && (
                    <Button
                      onClick={handleWhatsApp}
                      size="sm"
                      className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white gap-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Enviar comprovante (WhatsApp)
                    </Button>
                  )}
                </InfoCard>
              )}

              {/* Contacts */}
              <InfoCard title="Contato">
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">Estabelecimento</p>
                    <p className="font-medium text-foreground">{order.shop.name}</p>
                    {order.shop.phone && (
                      <p className="text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5" />
                        {order.shop.phone}
                      </p>
                    )}
                  </div>
                  {order.customer.name && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1.5">Cliente</p>
                        <p className="font-medium text-foreground flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          {order.customer.name}
                        </p>
                        {order.customer.phone && (
                          <p className="text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3.5 h-3.5" />
                            {order.customer.phone}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </InfoCard>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
