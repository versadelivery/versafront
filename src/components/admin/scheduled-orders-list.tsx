"use client";

import React, { useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, Clock, Loader2, MapPin, Package, Phone, Rocket, Store, Truck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CancelOrderModal from "./cancel-order-modal";
import { formatDayLabel, inShopZone, todayInShopZone } from "@/lib/scheduling";
import { formatPrice } from "@/utils/format-price";

export interface ScheduledOrderRow {
  id: string;
  customerName: string;
  customerPhone?: string;
  amount: number;
  deliveryType: "delivery" | "pickup";
  paymentLabel?: string;
  scheduledFor: string; // ISO da API
  confirmed: boolean;
  itemsSummary: string;
  address?: string;
}

interface ScheduledOrdersListProps {
  orders: ScheduledOrderRow[];
  busyId: string | null;
  onConfirm: (orderId: string) => void;
  onRelease: (orderId: string) => void;
  onCancel: (orderId: string, reason: string, reasonType?: string) => void;
  onOpen: (orderId: string) => void;
}

// Aba "Agendados": pedidos esperando o horário combinado, por dia. Aceitar = confirmar (continua agendado);
// no horário o pedido entra sozinho como "Aceito"; "Liberar agora" antecipa e refaz o preço.
export default function ScheduledOrdersList({ orders, busyId, onConfirm, onRelease, onCancel, onOpen }: ScheduledOrdersListProps) {
  const [releaseTarget, setReleaseTarget] = useState<ScheduledOrderRow | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ScheduledOrderRow | null>(null);
  const today = useMemo(() => todayInShopZone(), []);

  const days = useMemo(() => {
    const groups = new Map<string, ScheduledOrderRow[]>();
    [...orders]
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
      .forEach((order) => {
        const { date } = inShopZone(order.scheduledFor);
        groups.set(date, [...(groups.get(date) ?? []), order]);
      });
    return Array.from(groups.entries());
  }, [orders]);

  if (orders.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-[#E5E2DD] bg-white px-4 py-14 text-center" data-testid="scheduled-empty">
        <CalendarClock className="mx-auto mb-3 h-8 w-8 text-gray-300" />
        <p className="text-sm font-medium text-gray-700">Nenhum pedido agendado</p>
        <p className="mt-1 text-sm text-muted-foreground">Os pedidos agendados aparecem aqui até o horário combinado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="scheduled-list">
      {days.map(([date, dayOrders]) => (
        <section key={date} className="space-y-3">
          <h3 className="flex items-center gap-2 font-tomato text-sm font-semibold text-gray-900">
            {formatDayLabel(date, today)}
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{dayOrders.length}</span>
          </h3>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {dayOrders.map((order) => {
              const busy = busyId === order.id;
              const { time } = inShopZone(order.scheduledFor);
              return (
                <article
                  key={order.id}
                  className="flex flex-col gap-3 rounded-md border border-[#E5E2DD] bg-white p-4"
                  data-testid={`scheduled-order-${order.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-xl font-bold tabular-nums text-gray-900">
                        <Clock className="h-4 w-4 text-primary" />
                        {time}
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpen(order.id)}
                        className="mt-0.5 block max-w-full cursor-pointer truncate text-left text-sm font-medium text-gray-800 hover:underline"
                      >
                        #{order.id} · {order.customerName}
                      </button>
                    </div>
                    <span
                      className={
                        order.confirmed
                          ? "shrink-0 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
                          : "shrink-0 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700"
                      }
                      data-testid="scheduled-state"
                    >
                      {order.confirmed ? "Confirmado" : "Aguardando aceite"}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      {order.deliveryType === "pickup" ? <Store className="h-4 w-4 shrink-0 text-primary" /> : <Truck className="h-4 w-4 shrink-0 text-primary" />}
                      {order.deliveryType === "pickup" ? "Retirada na loja" : "Entrega"}
                      {order.paymentLabel ? <span className="text-gray-400">· {order.paymentLabel}</span> : null}
                    </p>
                    {order.address && (
                      <p className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                        <span className="min-w-0 break-words">{order.address}</span>
                      </p>
                    )}
                    {order.customerPhone && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                        {order.customerPhone}
                      </p>
                    )}
                    <p className="flex items-start gap-2">
                      <Package className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                      <span className="min-w-0 break-words">{order.itemsSummary}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#E5E2DD] pt-3">
                    <p className="text-sm text-muted-foreground">Total hoje</p>
                    <p className="text-base font-bold text-gray-900">{formatPrice(order.amount)}</p>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-2">
                    {!order.confirmed ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={busy}
                        onClick={() => onConfirm(order.id)}
                        className="cursor-pointer bg-primary text-white hover:bg-primary/90"
                        data-testid="scheduled-confirm"
                      >
                        {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-4 w-4" />}
                        Aceitar
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => setReleaseTarget(order)}
                      className={`cursor-pointer ${order.confirmed ? "col-span-2" : ""}`}
                      data-testid="scheduled-release"
                    >
                      <Rocket className="mr-1.5 h-4 w-4" />
                      Liberar agora
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => setCancelTarget(order)}
                      className="col-span-2 cursor-pointer border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <XCircle className="mr-1.5 h-4 w-4" />
                      Cancelar pedido
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <AlertDialog open={!!releaseTarget} onOpenChange={(open) => !open && setReleaseTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Liberar o pedido agora?</AlertDialogTitle>
            <AlertDialogDescription>
              O pedido #{releaseTarget?.id} sai de Agendados e entra no painel como aceito, antes do horário combinado. O total é
              recalculado com os preços de hoje.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (releaseTarget) onRelease(releaseTarget.id);
                setReleaseTarget(null);
              }}
            >
              Liberar agora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {cancelTarget && (
        <CancelOrderModal
          open
          onOpenChange={(open) => !open && setCancelTarget(null)}
          orderId={cancelTarget.id}
          customerName={cancelTarget.customerName}
          onCancelOrder={(orderId, reason, justification) => {
            onCancel(orderId, justification ? `${reason} - ${justification}` : reason, reason);
            setCancelTarget(null);
          }}
        />
      )}
    </div>
  );
}
