"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { RotateCcw, AlertTriangle, ShoppingCart, Truck, Store, Clock } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { validateOrder } from "@/lib/reorder-utils"
import { ReorderModal } from "@/components/reorder/reorder-modal"
import { fetchShopBySlug } from "@/app/(public)/[slug]/slug-service"
import type { CustomerOrder } from "@/types/order"
import type { OrderValidation } from "@/lib/reorder-utils"

interface ReorderCardOrdersProps {
  order: CustomerOrder
}

export default function ReorderCardOrders({ order }: ReorderCardOrdersProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const shopSlug = order.attributes.shop.data.attributes.slug

  // Busca dados frescos do catálogo da loja — garante disponibilidade em tempo real
  const { data: shopData } = useQuery({
    queryKey: ["shop", shopSlug],
    queryFn: () => fetchShopBySlug(shopSlug),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  })

  // Status da loja: aberta ou fechada (vem do mesmo shopData, atualizado a cada 60s)
  const shopIsOpen = shopData?.data?.attributes?.shop_status?.is_open ?? true

  // Recomputa disponibilidade toda vez que o catálogo ou o pedido mudar
  const validation: OrderValidation = useMemo(
    () => validateOrder(order, shopData),
    [order, shopData],
  )

  const { allAvailable, unavailableNames, validatedItems } = validation

  // Só permite repetir quando todos os itens estão disponíveis E a loja está aberta
  const canReorder = allAvailable && shopIsOpen

  const shopName = order.attributes.shop.data.attributes.name
  const total = parseFloat(order.attributes.total_price ?? "0")
  const itemCount = order.attributes.items.data.length
  const orderItems = order.attributes.items.data

  const accentColor = shopData?.data?.attributes?.accent_color ?? null

  const handleClick = () => {
    if (!canReorder) return
    setModalOpen(true)
  }

  // Determina aparência com base no estado
  const headerBg = canReorder
    ? (accentColor ?? "#1B1B1B")
    : !shopIsOpen
      ? "#FEF3C7"
      : "#FEE2E2"
  const borderColor = canReorder
    ? (accentColor ?? "#1B1B1B")
    : !shopIsOpen
      ? "#FDE68A"
      : "#FECACA"
  const cardBg = canReorder ? "white" : !shopIsOpen ? "#FFFBEB" : "#FFF5F5"

  return (
    <>
      <div
        role={canReorder ? "button" : undefined}
        tabIndex={canReorder ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
        className={[
          "rounded-md overflow-hidden transition-all duration-200 border",
          canReorder
            ? "cursor-pointer hover:shadow-md hover:border-gray-400 active:scale-[0.995]"
            : "cursor-not-allowed",
        ].join(" ")}
        style={{ borderColor, backgroundColor: cardBg }}
      >
        {/* ── Header bar with accent color ── */}
        <div
          className="px-5 py-2.5 flex items-center justify-between"
          style={{ backgroundColor: headerBg }}
        >
          <div className="flex items-center gap-2">
            {canReorder ? (
              <RotateCcw className="w-4 h-4 text-white flex-shrink-0" />
            ) : !shopIsOpen ? (
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            )}
            <span className={`text-sm font-bold ${canReorder ? "text-white" : !shopIsOpen ? "text-amber-800" : "text-red-700"}`}>
              {canReorder
                ? "Clique aqui para repetir seu último pedido"
                : !shopIsOpen
                  ? "Loja fechada — não é possível fazer pedidos agora"
                  : `Pedido indisponível — ${unavailableNames.length === 1 ? `"${unavailableNames[0]}"` : `${unavailableNames.length} itens`} ${unavailableNames.length === 1 ? "está" : "estão"} fora do cardápio`}
            </span>
          </div>
          {canReorder && (
            <ShoppingCart className="w-4 h-4 text-white opacity-75 flex-shrink-0" />
          )}
        </div>

        {/* ── Body: order info ── */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3 gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-base font-bold text-foreground">#{order.attributes.id}</span>
              <span className="text-sm text-muted-foreground">·</span>
              <span className="text-sm font-medium text-muted-foreground">{shopName}</span>
            </div>

            {/* Items preview */}
            <p className="text-sm text-muted-foreground line-clamp-1">
              {orderItems
                .map((i) => {
                  const name = i.attributes.catalog_item?.data?.attributes?.name ?? "Item"
                  const validated = validatedItems.find((v) => v.orderItem.id === i.id)
                  return validated?.isAvailable ? name : `${name} ✗`
                })
                .join(", ")}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-foreground">{formatCurrency(total)}</p>
            <p className="text-sm text-muted-foreground">
              {itemCount} {itemCount === 1 ? "item" : "itens"}
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="flex items-center justify-between px-5 py-3 border-t gap-3"
          style={{
            backgroundColor: canReorder ? "#FAF9F7" : !shopIsOpen ? "#FFFBEB" : "#FFF5F5",
            borderColor: canReorder ? "#E5E2DD" : !shopIsOpen ? "#FDE68A" : "#FECACA",
          }}
        >
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 flex-shrink-0">
              {order.attributes.withdrawal ? <Store className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
              {order.attributes.withdrawal ? "Retirada" : "Entrega"}
            </span>
          </div>

          {canReorder ? (
            <span className="text-sm font-semibold text-primary flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              Repetir pedido
            </span>
          ) : !shopIsOpen ? (
            <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Loja fechada
            </span>
          ) : (
            <span className="text-xs text-red-500 font-medium">Indisponível</span>
          )}
        </div>
      </div>

      <ReorderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        order={order}
        validation={validation}
        shopSlug={shopSlug}
        accentColor={accentColor}
      />
    </>
  )
}
