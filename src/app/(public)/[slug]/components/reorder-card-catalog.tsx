"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { RotateCcw, AlertTriangle, ArrowRight } from "lucide-react"
import { getOrdersByPhone } from "@/services/order-service"
import { useClient } from "../client-context"
import { formatPrice } from "../format-price"
import { getTextColors } from "../theme-utils"
import { validateOrder } from "@/lib/reorder-utils"
import { ReorderModal } from "@/components/reorder/reorder-modal"
import type { CustomerOrder } from "@/types/order"

interface ReorderCardCatalogProps {
  accentColor?: string | null
}

function getPhone(): string | null {
  try {
    const stored = localStorage.getItem("customer_info")
    if (stored) {
      const info = JSON.parse(stored)
      return info.phone?.replace(/\D/g, "") || null
    }
  } catch {}
  return localStorage.getItem("guest_phone")
}

export default function ReorderCardCatalog({ accentColor }: ReorderCardCatalogProps) {
  const { shop } = useClient()
  const [modalOpen, setModalOpen] = useState(false)

  const shopId = shop?.data?.id
  const shopSlug = shop?.data?.attributes?.slug
  const cardColor = accentColor || "#1B1B1B"
  const theme = useMemo(() => getTextColors(cardColor), [cardColor])

  // Busca pedidos do cliente — atualiza a cada 60s e ao focar a janela
  const phone = typeof window !== "undefined" ? getPhone() : null

  const { data: ordersData } = useQuery({
    queryKey: ["customer-orders", phone],
    queryFn: () => getOrdersByPhone(phone!),
    enabled: !!phone && !!shopId,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  })

  // Último pedido não cancelado desta loja
  const lastOrder: CustomerOrder | null = useMemo(() => {
    if (!ordersData?.data || !shopId) return null
    const shopOrders = ordersData.data.filter(
      (o) => o.attributes.shop.data.id === shopId && o.attributes.status !== "cancelled",
    )
    if (shopOrders.length === 0) return null
    return shopOrders.sort(
      (a, b) => new Date(b.attributes.created_at).getTime() - new Date(a.attributes.created_at).getTime(),
    )[0]
  }, [ordersData, shopId])

  // Validação reativa: recomputa sempre que o shop (React Query) ou o pedido mudar
  const validation = useMemo(() => {
    if (!lastOrder) return null
    return validateOrder(lastOrder, shop)
  }, [lastOrder, shop])

  if (!lastOrder || !validation || !shopSlug) return null

  const { allAvailable, unavailableNames, validatedItems } = validation
  const orderItems = lastOrder.attributes.items?.data ?? []
  const total = parseFloat(lastOrder.attributes.total_items_price ?? "0")
  const itemCount = orderItems.length
  const firstImage = validatedItems.find(
    (v) => v.orderItem.attributes.catalog_item?.data?.attributes?.image_url,
  )?.orderItem.attributes.catalog_item?.data?.attributes?.image_url

  const itemsLabel =
    orderItems
      .slice(0, 3)
      .map((i) => i.attributes.catalog_item?.data?.attributes?.name ?? "Item")
      .join(" · ") + (itemCount > 3 ? ` +${itemCount - 3}` : "")

  return (
    <>
      <div
        role={allAvailable ? "button" : undefined}
        tabIndex={allAvailable ? 0 : undefined}
        onClick={() => allAvailable && setModalOpen(true)}
        onKeyDown={(e) => e.key === "Enter" && allAvailable && setModalOpen(true)}
        className={[
          "relative flex flex-row rounded-md overflow-hidden mb-0 transition-all duration-200",
          "h-[96px] sm:h-[112px]",
          allAvailable
            ? "cursor-pointer hover:shadow-md hover:brightness-95 active:scale-[0.99]"
            : "cursor-not-allowed opacity-70",
        ].join(" ")}
        style={{ backgroundColor: cardColor, border: `1px solid ${theme.border}` }}
      >
        {/* ── Conteúdo esquerdo ── */}
        <div className="flex flex-col justify-between p-3 sm:p-4 flex-1 min-w-0 gap-1">

          {/* Label */}
          <div className="flex items-center gap-1.5">
            <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" style={{ color: theme.textMuted }} />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest" style={{ color: theme.textMuted }}>
              Repetir último pedido
            </span>
          </div>

          {/* Nomes dos itens */}
          <p className="text-xs sm:text-sm font-medium leading-snug line-clamp-1" style={{ color: theme.text }}>
            {itemsLabel}
          </p>

          {/* Rodapé */}
          <div className="flex items-center justify-between gap-2">
            {allAvailable ? (
              <span className="text-xs sm:text-sm font-bold flex items-center gap-1" style={{ color: theme.text }}>
                Ver e pedir novamente
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </span>
            ) : (
              <span className="text-[10px] sm:text-xs font-semibold flex items-center gap-1 text-amber-300">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                {unavailableNames.length === 1 ? "1 item indisponível" : `${unavailableNames.length} itens indisponíveis`}
              </span>
            )}
            <span className="text-xs sm:text-sm font-bold tabular-nums flex-shrink-0" style={{ color: theme.text }}>
              {formatPrice(total)}
            </span>
          </div>
        </div>

        {/* ── Imagem direita ── */}
        <div
          className="relative w-20 sm:w-28 flex-shrink-0 overflow-hidden"
          style={{ backgroundColor: theme.subtleBg }}
        >
          {firstImage ? (
            <img src={firstImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <RotateCcw className="w-8 h-8 opacity-20" style={{ color: theme.text }} />
            </div>
          )}
          {!allAvailable && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span className="text-[9px] sm:text-[10px] text-white font-semibold text-center leading-tight px-1">
                Indisponível
              </span>
            </div>
          )}
        </div>
      </div>

      <ReorderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        order={lastOrder}
        validation={validation}
        shopSlug={shopSlug}
        accentColor={accentColor}
      />
    </>
  )
}
