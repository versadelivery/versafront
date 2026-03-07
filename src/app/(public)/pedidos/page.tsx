'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { getOrdersByPhone } from "@/services/order-service";
import { CustomerOrder } from "@/types/order";
import { useCustomerOrdersWebSocket } from "@/hooks/use-customer-orders-websocket";
import { formatCurrency } from "@/lib/utils";
import {
  Truck,
  Store,
  CreditCard,
  ArrowRight,
  MapPin,
  ShoppingBag,
} from "lucide-react";
import PublicLoading from "@/components/public-loading";
import { Button } from "@/components/ui/button";
import PedidosHeader from "./pedidos-header";
import Link from "next/link";

const getPaymentMethodLabel = (method: string) => {
  const map: Record<string, string> = {
    credit: "Crédito",
    debit: "Débito",
    manual_pix: "PIX",
    cash: "Dinheiro",
  };
  return map[method] ?? method;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('pt-BR'),
    time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  };
};

const statusConfig: Record<string, { label: string; dot: string; border: string; text: string }> = {
  received:       { label: "Recebido",    dot: "bg-amber-400",   border: "border-amber-300",   text: "text-amber-700"  },
  accepted:       { label: "Aceito",      dot: "bg-blue-500",    border: "border-blue-300",    text: "text-blue-700"   },
  in_analysis:    { label: "Em análise",  dot: "bg-orange-400",  border: "border-orange-300",  text: "text-orange-700" },
  in_preparation: { label: "Preparando",  dot: "bg-orange-500",  border: "border-orange-300",  text: "text-orange-700" },
  ready:              { label: "Pronto",          dot: "bg-emerald-500", border: "border-emerald-300", text: "text-emerald-700"},
  left_for_delivery:  { label: "Saiu p/ entrega", dot: "bg-purple-500",  border: "border-purple-300",  text: "text-purple-700" },
  delivered:          { label: "Entregue",        dot: "bg-green-500",   border: "border-green-300",   text: "text-green-700"  },
  cancelled:      { label: "Cancelado",   dot: "bg-red-400",     border: "border-red-300",     text: "text-red-700"    },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, dot: "bg-gray-400", border: "border-gray-300", text: "text-gray-600" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border bg-white text-sm font-semibold ${cfg.border} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const { subscribeToOrders, isLoading: wsLoading } = useCustomerOrdersWebSocket();

  useEffect(() => {
    let phone: string | null = null;
    try {
      const stored = localStorage.getItem('customer_info');
      if (stored) {
        const info = JSON.parse(stored);
        if (info.phone) phone = info.phone.replace(/\D/g, '');
      }
    } catch {}
    if (!phone) phone = localStorage.getItem('guest_phone');

    if (!phone) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await getOrdersByPhone(phone!);
        if (response) {
          setOrders(response.data);
          setUnauthorized(false);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = subscribeToOrders((wsOrders: CustomerOrder[]) => {
      setOrders(wsOrders);
      setLoading(false);
    });

    const fallback = setTimeout(() => {
      if (wsLoading || loading) fetchOrders();
    }, 1000);

    return () => {
      unsubscribe();
      clearTimeout(fallback);
    };
  }, [subscribeToOrders, wsLoading]);

  const shopSlug = typeof window !== 'undefined'
    ? (() => { try { return JSON.parse(localStorage.getItem('shop') || '{}')?.data?.attributes?.slug; } catch { return null; } })()
    : null;

  const nav = (
    <PedidosHeader
      backHref={shopSlug ? `/${shopSlug}` : '/'}
      backLabel="Voltar ao cardápio"
    />
  );

  if (unauthorized) {
    return (
      <>
        {nav}
        <div className="h-[calc(100vh-4rem)] bg-[#FAF9F7] flex items-center justify-center px-4 py-12">
          <div className="text-center w-full max-w-sm">
            <div className="w-16 h-16 bg-[#F0EFEB] rounded-md flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-7 h-7 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Acompanhe seus pedidos</h2>
            <p className="text-sm text-muted-foreground mb-6">Informe seu telefone usado na compra para consultar seus pedidos.</p>

            <div className="p-4 bg-white border border-[#E5E2DD] rounded-md">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 text-left">Consultar por Telefone</p>
              <form
                className="flex flex-col gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const phone = (e.currentTarget.elements.namedItem('phone') as HTMLInputElement).value.replace(/\D/g, '');
                  if (phone.length >= 10) {
                    localStorage.setItem('guest_phone', phone);
                    localStorage.setItem('customer_info', JSON.stringify({ phone }));
                    window.location.reload();
                  }
                }}
              >
                <input
                  name="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
                <Button type="submit" className="w-full">
                  Buscar Pedidos
                </Button>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (loading || wsLoading) {
    return (
      <>
        {nav}
        <PublicLoading />
      </>
    );
  }

  if (orders.length === 0) {
    return (
      <>
        {nav}
        <div className="h-[calc(100vh-4rem)] bg-[#FAF9F7] flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-[#F0EFEB] rounded-md flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-7 h-7 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Nenhum pedido ainda</h2>
            <p className="text-sm text-muted-foreground mb-6">Seus pedidos aparecerão aqui após a primeira compra.</p>
            {shopSlug && (
              <Button asChild className="rounded-md">
                <Link href={`/${shopSlug}`}>Ver cardápio</Link>
              </Button>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {nav}
      <div className="min-h-screen bg-[#FAF9F7]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px] py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Meus Pedidos</h1>
            <p className="text-base text-muted-foreground mt-0.5">{orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} encontrado{orders.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="space-y-3">
            {orders.map((order) => {
              const date = formatDate(order.attributes.created_at);
              const total = order.attributes.total_price ? parseFloat(order.attributes.total_price) : 0;
              const itemCount = order.attributes.items.data.length;
              const shopName = order.attributes.shop.data.attributes.name;

              return (
                <div
                  key={order.id}
                  className="bg-white border border-[#E5E2DD] rounded-md overflow-hidden hover:border-gray-400 transition-all duration-200"
                >
                  <div className="flex items-start justify-between px-5 pt-4 pb-3 gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-foreground">#{order.attributes.id}</span>
                        <StatusBadge status={order.attributes.status} />
                      </div>
                      <p className="text-base font-medium text-foreground mt-0.5 truncate">{shopName}</p>
                      <p className="text-sm text-muted-foreground">{date.date} às {date.time}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-foreground">{formatCurrency(total)}</p>
                      <p className="text-sm text-muted-foreground">{itemCount} {itemCount === 1 ? 'item' : 'itens'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-5 py-3 bg-[#FAF9F7] border-t border-[#E5E2DD] gap-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground overflow-hidden">
                      <span className="flex items-center gap-1.5 flex-shrink-0">
                        {order.attributes.withdrawal
                          ? <Store className="w-4 h-4" />
                          : <Truck className="w-4 h-4" />
                        }
                        {order.attributes.withdrawal ? 'Retirada' : 'Entrega'}
                      </span>
                      <span className="flex items-center gap-1.5 flex-shrink-0">
                        <CreditCard className="w-4 h-4" />
                        {getPaymentMethodLabel(order.attributes.payment_method)}
                      </span>
                      {!order.attributes.withdrawal && order.attributes.address?.data?.attributes?.neighborhood && (
                        <span className="flex items-center gap-1.5 truncate hidden sm:flex">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{order.attributes.address.data.attributes.neighborhood}</span>
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-sm font-semibold text-primary hover:text-primary hover:bg-primary/5 flex-shrink-0 px-3 h-9"
                      onClick={() => router.push(`/pedidos/${order.id}`)}
                    >
                      Detalhes
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
