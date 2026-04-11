"use client"

import { useState, useMemo } from "react"
import { RotateCcw, AlertTriangle, ShoppingCart, Truck, Store } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { validateOrder } from "@/lib/reorder-utils"
import { ReorderModal } from "@/components/reorder/reorder-modal"
import type { CustomerOrder } from "@/types/order"
import type { OrderValidation } from "@/lib/reorder-utils"

interface ReorderCardOrdersProps {
  order: CustomerOrder
}

function getShopSlugFromStorage(): string | null {
  try {
    return JSON.parse(localStorage.getItem("shop") || "{}")?.data?.attributes?.slug ?? null
  } catch {
    return null
  }
}

export default function ReorderCardOrders({ order }: ReorderCardOrdersProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const validation: OrderValidation = useMemo(() => validateOrder(order), [order])
  const { allAvailable, unavailableNames, validatedItems } = validation

  const shopName = order.attributes.shop.data.attributes.name
  const shopSlug = order.attributes.shop.data.attributes.slug
  const total = parseFloat(order.attributes.total_price ?? "0")
  const itemCount = order.attributes.items.data.length
  const orderItems = order.attributes.items.data

  const handleClick = () => {
    if (!allAvailable) return
    setModalOpen(true)
  }

  // Primary color for the card accent (first color of order)
  const accentColor = typeof window !== "undefined"
    ? (() => { try { return JSON.parse(localStorage.getItem("shop") || "{}")?.data?.attributes?.accent_color ?? null } catch { return null } })()
    : null

  const isDisabled = !allAvailable

  return (
    <>
      <div
        role={allAvailable ? "button" : undefined}
        tabIndex={allAvailable ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
        className={[
          "rounded-md overflow-hidden transition-all duration-200 border",
          allAvailable
            ? "cursor-pointer hover:shadow-md hover:border-gray-400 active:scale-[0.995]"
            : "cursor-not-allowed",
        ].join(" ")}
        style={{
          borderColor: allAvailable ? (accentColor ?? "#1B1B1B") : "#FECACA",
          backgroundColor: allAvailable ? "white" : "#FFF5F5",
        }}
      >
        {/* ── Header bar with accent color ── */}
        <div
          className="px-5 py-2.5 flex items-center justify-between"
          style={{
            backgroundColor: allAvailable ? (accentColor ?? "#1B1B1B") : "#FEE2E2",
          }}
        >
          <div className="flex items-center gap-2">
            {allAvailable ? (
              <RotateCcw className="w-4 h-4 text-white flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            )}
            <span className={`text-sm font-bold ${allAvailable ? "text-white" : "text-red-700"}`}>
              {allAvailable
                ? "Clique aqui para repetir seu último pedido"
                : `Pedido indisponível — ${unavailableNames.length === 1 ? `"${unavailableNames[0]}"` : `${unavailableNames.length} itens`} ${unavailableNames.length === 1 ? "está" : "estão"} fora do cardápio`}
            </span>
          </div>
          {allAvailable && (
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
            backgroundColor: allAvailable ? "#FAF9F7" : "#FFF5F5",
            borderColor: allAvailable ? "#E5E2DD" : "#FECACA",
          }}
        >
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 flex-shrink-0">
              {order.attributes.withdrawal ? <Store className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
              {order.attributes.withdrawal ? "Retirada" : "Entrega"}
            </span>
          </div>

          {allAvailable ? (
            <span className="text-sm font-semibold text-primary flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              Repetir pedido
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
