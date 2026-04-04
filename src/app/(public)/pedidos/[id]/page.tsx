'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClientOrderData } from "@/lib/client-cable";
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
  Star,
  Copy,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import PublicLoading from "@/components/public-loading";

const statusConfig: Record<string, { label: string; dot: string; border: string; text: string; description: string }> = {
  received:       { label: "Recebido",    dot: "bg-amber-400",   border: "border-amber-300",   text: "text-amber-700",   description: "Seu pedido foi recebido e será processado em breve." },
  accepted:       { label: "Aceito",      dot: "bg-blue-500",    border: "border-blue-300",    text: "text-blue-700",    description: "Seu pedido foi aceito e será preparado em breve." },
  in_analysis:    { label: "Em análise",  dot: "bg-orange-400",  border: "border-orange-300",  text: "text-orange-700",  description: "Estamos analisando seu pedido." },
  in_preparation: { label: "Preparando",  dot: "bg-orange-500",  border: "border-orange-300",  text: "text-orange-700",  description: "Seu pedido está sendo preparado com carinho." },
  ready:              { label: "Pronto",          dot: "bg-emerald-500", border: "border-emerald-300", text: "text-emerald-700", description: "Seu pedido está pronto!" },
  left_for_delivery:  { label: "Saiu p/ entrega", dot: "bg-purple-500",  border: "border-purple-300",  text: "text-purple-700",  description: "Seu pedido saiu para entrega!" },
  delivered:          { label: "Entregue",        dot: "bg-green-500",   border: "border-green-300",   text: "text-green-700",   description: "Pedido entregue. Bom apetite!" },
  cancelled:      { label: "Cancelado",   dot: "bg-red-400",     border: "border-red-300",     text: "text-red-700",     description: "Este pedido foi cancelado." },
};

const paymentConfig: Record<string, { label: string; icon: React.ElementType }> = {
  credit:     { label: "Cartão de Crédito", icon: CreditCard },
  debit:      { label: "Cartão de Débito",  icon: CreditCard },
  manual_pix: { label: "PIX",               icon: QrCode     },
  asaas_pix:  { label: "PIX",               icon: QrCode     },
  cash:       { label: "Dinheiro",          icon: Wallet     },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, dot: "bg-gray-400", border: "border-gray-300", text: "text-gray-600" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border bg-white text-sm font-semibold ${cfg.border} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E5E2DD] rounded-md overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#E5E2DD] bg-[#FAF9F7]">
        <p className="text-base font-semibold text-foreground">{title}</p>
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
  const [orderData, setOrderData] = useState<ClientOrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pixCopied, setPixCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${baseUrl}/orders/${id}`, {
          headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }
        });
        if (!res.ok) throw new Error('Pedido não encontrado');
        const json = await res.json();
        const orderPayload = json?.data ?? json;
        setOrderData(orderPayload);
        setIsLoading(false);
        setError(null);
      } catch (err) {
        setError('Não foi possível carregar o pedido.');
        setIsLoading(false);
      }
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [id]);

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
        <PublicLoading />
      </>
    );
  }

  if (error || !orderData) {
    return (
      <>
        {nav}
        <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <p className="text-sm text-muted-foreground mb-4">
              {error ?? 'Pedido não encontrado.'}
            </p>
            <Button onClick={() => router.push('/pedidos')} variant="outline" className="rounded-md">
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
      price_with_discount: item.attributes?.price_with_discount ? parseFloat(item.attributes.price_with_discount) : null,
      quantity: item.attributes?.quantity ?? 0,
      weight: item.attributes?.weight ? parseFloat(item.attributes.weight) : null,
      item_type: item.attributes?.item_type ?? 'unit',
      total_price: item.attributes?.total_price ? parseFloat(item.attributes.total_price) : null,
      observation: item.attributes?.observation ?? '',
      image: item.attributes?.catalog_item?.data?.attributes?.image_url ?? '',
      complements: item.attributes?.complements ?? [],
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
    discount_amount: parseFloat((orderData.attributes as any).discount_amount ?? '0'),
    payment_adjustment_amount: parseFloat((orderData.attributes as any).payment_adjustment_amount ?? '0'),
    coupon_code: (orderData.attributes as any).coupon_code ?? null,
    asaas_pix_code: (orderData.attributes as any).asaas_pix_code ?? null,
    asaas_pix_expires_at: (orderData.attributes as any).asaas_pix_expires_at ?? null,
    paid_at: (orderData.attributes as any).paid_at ?? null,
  };

  const statusCfg = statusConfig[order.status] ?? statusConfig.received;
  const PaymentIcon = (paymentConfig[order.payment_method] ?? paymentConfig.cash).icon;
  const paymentLabel = (paymentConfig[order.payment_method] ?? paymentConfig.cash).label;
  const dateInfo = formatDate(order.date);
  const subtotal = order.items.reduce((s: number, i: any) => s + (i.total_price ?? i.price * i.quantity), 0);
  const deliveryFee = order.withdrawal ? 0 : order.delivery_fee;
  const discountAmount = order.discount_amount ?? 0;
  const paymentAdjustment = order.payment_adjustment_amount ?? 0;
  const total = Math.max(subtotal + deliveryFee - discountAmount + paymentAdjustment, 0);

  const handleWhatsApp = (context?: 'pix') => {
    if (!order.shop.phone) return;
    const msg = context === 'pix'
      ? encodeURIComponent(`Olá! Fiz um pedido #${order.id} via PIX mas não recebi o código para pagamento. Pode me ajudar?`)
      : encodeURIComponent(`Olá! Tenho uma dúvida sobre o pedido #${order.id}.`);
    window.open(`https://wa.me/${order.shop.phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
  };

  return (
    <>
      {nav}
      <div className="min-h-screen bg-[#FAF9F7]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px] py-8">

          {/* Order header */}
          <div className="bg-white border border-[#E5E2DD] rounded-md p-5 sm:p-6 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="font-tomato text-xl font-bold text-foreground">Pedido #{order.id}</h1>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-base font-medium text-foreground">{order.shop.name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{dateInfo.date} às {dateInfo.time}</p>
                {statusCfg.description && (
                  <p className="text-sm text-muted-foreground mt-2 italic">{statusCfg.description}</p>
                )}
              </div>
              <div className="sm:text-right pt-3 sm:pt-0 border-t border-[#E5E2DD] sm:border-0">
                <p className="text-2xl font-bold text-foreground">{formatCurrency(total)}</p>
                <p className="text-sm text-muted-foreground">Total do pedido</p>
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
                            className="w-14 h-14 rounded-md object-cover flex-shrink-0 bg-[#F0EFEB]"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-md bg-[#F0EFEB] flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-base font-semibold text-foreground leading-snug">{item.name}</p>
                            <p className="text-base font-bold text-foreground flex-shrink-0">
                              {formatCurrency(item.total_price ?? item.price * item.quantity)}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {item.weight && (item.item_type === 'weight_per_kg' || item.item_type === 'weight_per_g')
                              ? `${item.weight} ${item.item_type === 'weight_per_g' ? 'g' : 'kg'} × ${formatCurrency(item.price_with_discount ?? item.price)}/${item.item_type === 'weight_per_g' ? 'g' : 'kg'}`
                              : `${item.quantity}× ${formatCurrency(item.price_with_discount ?? item.price)}`
                            }
                          </p>
                          {item.observation && (
                            <p className="text-sm text-muted-foreground italic mt-1">"{item.observation}"</p>
                          )}
                          {item.complements && item.complements.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.complements.map((comp: any) => (
                                <span key={comp.id} className="text-sm bg-white border border-[#E5E2DD] text-gray-600 px-2 py-0.5 rounded-md">
                                  + {comp.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {idx < order.items.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-5 pt-4 border-t border-[#E5E2DD] space-y-2">
                  <div className="flex justify-between text-base text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {!order.withdrawal && deliveryFee > 0 && (
                    <div className="flex justify-between text-base text-muted-foreground">
                      <span>Taxa de entrega</span>
                      <span>{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}
                  {order.coupon_code && discountAmount > 0 && (
                    <div className="flex justify-between text-base text-green-600">
                      <span>Cupom ({order.coupon_code})</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  {paymentAdjustment !== 0 && (
                    <div className={`flex justify-between text-base ${paymentAdjustment < 0 ? 'text-green-600' : 'text-orange-600'}`}>
                      <span>{paymentAdjustment < 0 ? 'Desc.' : 'Acresc.'} {paymentLabel}</span>
                      <span>
                        {paymentAdjustment < 0 ? '-' : '+'}{formatCurrency(Math.abs(paymentAdjustment))}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-foreground pt-1 border-t border-[#E5E2DD]">
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
                      <p className="text-base font-medium text-foreground">{order.shop.name}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">Retire no estabelecimento quando estiver pronto.</p>
                    </div>
                  </div>
                </InfoCard>
              ) : (
                <InfoCard title="Endereço de entrega">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-base space-y-0.5">
                      <p className="font-medium text-foreground">{order.address.address}</p>
                      {order.address.neighborhood && (
                        <p className="text-muted-foreground">{order.address.neighborhood}</p>
                      )}
                      {order.address.complement && (
                        <p className="text-muted-foreground">{order.address.complement}</p>
                      )}
                      {order.address.reference && (
                        <p className="text-sm text-muted-foreground mt-1">Ref: {order.address.reference}</p>
                      )}
                    </div>
                  </div>
                </InfoCard>
              )}

              {/* PIX Manual */}
              {order.payment_method === 'manual_pix' && (
                <InfoCard title="Pagamento PIX">
                  <p className="text-sm text-muted-foreground mb-3">
                    Envie o comprovante de pagamento ao estabelecimento.
                  </p>
                  {order.shop.phone && (
                    <Button
                      onClick={() => handleWhatsApp()}
                      size="sm"
                      className="w-full rounded-md bg-green-600 hover:bg-green-700 text-white gap-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Enviar comprovante (WhatsApp)
                    </Button>
                  )}
                </InfoCard>
              )}

              {/* PIX Automatico (ASAAS) — pago */}
              {order.payment_method === 'asaas_pix' && order.paid_at && (
                <InfoCard title="Pagamento PIX">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-semibold">Pagamento confirmado!</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Pago em {new Date(order.paid_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </InfoCard>
              )}

              {/* PIX Automatico (ASAAS) — aguardando pagamento */}
              {order.payment_method === 'asaas_pix' && order.asaas_pix_code && !order.paid_at && (
                <InfoCard title="Pague via PIX">
                  <div className="space-y-3">
                    {order.asaas_pix_expires_at && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Expira às {new Date(order.asaas_pix_expires_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    <div className="bg-[#FAF9F7] border border-[#E5E2DD] rounded-md p-3">
                      <p className="text-xs font-mono text-gray-700 break-all leading-relaxed select-all">
                        {order.asaas_pix_code}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={pixCopied ? "outline" : "default"}
                      className="w-full rounded-md gap-2 cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(order.asaas_pix_code!)
                        setPixCopied(true)
                        setTimeout(() => setPixCopied(false), 2500)
                      }}
                    >
                      {pixCopied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-green-600">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copiar código PIX
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Use <strong>PIX Copia e Cola</strong> no app do seu banco. Confirmação automática.
                    </p>
                  </div>
                </InfoCard>
              )}

              {/* PIX Automatico (ASAAS) — código não gerado */}
              {order.payment_method === 'asaas_pix' && !order.asaas_pix_code && !order.paid_at && order.status !== 'cancelled' && (
                <InfoCard title="Pagamento PIX">
                  <p className="text-sm text-muted-foreground mb-3">
                    Houve um problema ao gerar o código PIX. Entre em contato com a loja para combinar o pagamento.
                  </p>
                  {order.shop.phone && (
                    <Button
                      onClick={() => handleWhatsApp('pix')}
                      size="sm"
                      className="w-full rounded-md bg-green-600 hover:bg-green-700 text-white gap-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Falar com a loja (WhatsApp)
                    </Button>
                  )}
                </InfoCard>
              )}

              {/* Contacts */}
              <InfoCard title="Contato">
                <div className="space-y-3 text-base">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1.5">Estabelecimento</p>
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
                        <p className="text-sm font-semibold text-muted-foreground mb-1.5">Cliente</p>
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

              {/* Review button */}
              {order.status === 'delivered' && (
                <div className="bg-white border border-[#E5E2DD] rounded-md p-5">
                  <div className="text-center">
                    <Star className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="font-semibold text-foreground mb-1">Como foi seu pedido?</p>
                    <p className="text-sm text-muted-foreground mb-4">Sua opinião nos ajuda a melhorar!</p>
                    <Button asChild className="w-full rounded-md bg-amber-500 hover:bg-amber-600 text-white">
                      <Link href={`/avaliar/${order.id}`}>
                        Avaliar pedido
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
