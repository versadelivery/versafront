'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { getClientToken } from "@/lib/auth";
import { getCustomerOrders, getOrdersByPhone } from "@/services/order-service";
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

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  received:       { label: "Recebido",    dot: "bg-amber-400",   bg: "bg-amber-50",   text: "text-amber-700"  },
  accepted:       { label: "Aceito",      dot: "bg-blue-500",    bg: "bg-blue-50",    text: "text-blue-700"   },
  in_analysis:    { label: "Em análise",  dot: "bg-orange-400",  bg: "bg-orange-50",  text: "text-orange-700" },
  in_preparation: { label: "Preparando",  dot: "bg-orange-500",  bg: "bg-orange-50",  text: "text-orange-700" },
  ready:              { label: "Pronto",          dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700"},
  left_for_delivery:  { label: "Saiu p/ entrega", dot: "bg-purple-500",  bg: "bg-purple-50",  text: "text-purple-700" },
  delivered:          { label: "Entregue",        dot: "bg-green-500",   bg: "bg-green-50",   text: "text-green-700"  },
  cancelled:      { label: "Cancelado",   dot: "bg-red-400",     bg: "bg-red-50",     text: "text-red-700"    },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, dot: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
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
  const [guestPhone, setGuestPhone] = useState<string | null>(null);
  const { subscribeToOrders, isLoading: wsLoading } = useCustomerOrdersWebSocket();

  useEffect(() => {
    const token = getClientToken();
    const storedGuestPhone = localStorage.getItem('guest_phone');
    
    if (storedGuestPhone) {
      setGuestPhone(storedGuestPhone);
    }

    if (!token && !storedGuestPhone) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        let response;
        if (token) {
          response = await getCustomerOrders();
        } else if (storedGuestPhone) {
          response = await getOrdersByPhone(storedGuestPhone);
        }
        
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
        <div className="h-[calc(100vh-4rem)] bg-gray-50/40 flex items-center justify-center px-4 py-12">
          <div className="text-center w-full max-w-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-7 h-7 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Acompanhe seus pedidos</h2>
            <p className="text-sm text-muted-foreground mb-6">Entre na sua conta ou informe seu telefone usado na compra.</p>
            
            <div className="space-y-4">
              <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 text-left">Consultar por Telefone</p>
                <form 
                  className="flex flex-col gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const phone = (e.currentTarget.elements.namedItem('phone') as HTMLInputElement).value.replace(/\D/g, '');
                    if (phone.length >= 10) {
                      localStorage.setItem('guest_phone', phone);
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

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-50/40 px-2 text-muted-foreground">Ou acesse sua conta</span>
                </div>
              </div>

              <Button 
                variant="outline"
                onClick={() => router.push(`/auth/login?redirect=/pedidos`)} 
                className="w-full rounded-md"
              >
                Entrar na conta
              </Button>
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
        <div className="h-[calc(100vh-4rem)] bg-gray-50/40 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Carregando pedidos...</p>
          </div>
        </div>
      </>
    );
  }

  if (orders.length === 0) {
    return (
      <>
        {nav}
        <div className="h-[calc(100vh-4rem)] bg-gray-50/40 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-7 h-7 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Nenhum pedido ainda</h2>
            <p className="text-sm text-muted-foreground mb-6">Seus pedidos aparecerão aqui após a primeira compra.</p>
            {shopSlug && (
              <Button asChild className="rounded-full">
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
      <div className="min-h-screen bg-gray-50/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground">Meus Pedidos</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} encontrado{orders.length !== 1 ? 's' : ''}</p>
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
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-start justify-between px-5 pt-4 pb-3 gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-foreground">#{order.attributes.id}</span>
                        <StatusBadge status={order.attributes.status} />
                      </div>
                      <p className="text-sm font-medium text-foreground mt-0.5 truncate">{shopName}</p>
                      <p className="text-xs text-muted-foreground">{date.date} às {date.time}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold text-foreground">{formatCurrency(total)}</p>
                      <p className="text-xs text-muted-foreground">{itemCount} {itemCount === 1 ? 'item' : 'itens'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-5 py-3 bg-gray-50/70 border-t border-gray-100 gap-3">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground overflow-hidden">
                      <span className="flex items-center gap-1 flex-shrink-0">
                        {order.attributes.withdrawal
                          ? <Store className="w-3.5 h-3.5" />
                          : <Truck className="w-3.5 h-3.5" />
                        }
                        {order.attributes.withdrawal ? 'Retirada' : 'Entrega'}
                      </span>
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <CreditCard className="w-3.5 h-3.5" />
                        {getPaymentMethodLabel(order.attributes.payment_method)}
                      </span>
                      {!order.attributes.withdrawal && order.attributes.address?.data?.attributes?.neighborhood && (
                        <span className="flex items-center gap-1 truncate hidden sm:flex">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{order.attributes.address.data.attributes.neighborhood}</span>
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/5 flex-shrink-0 px-3 h-8"
                      onClick={() => router.push(`/pedidos/${order.id}`)}
                    >
                      Detalhes
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
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
