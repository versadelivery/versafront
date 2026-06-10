"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle2, XCircle, RotateCcw, ShoppingCart } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { useCart } from "@/app/(public)/[slug]/cart/cart-context"
import type { OrderValidation } from "@/lib/reorder-utils"
import type { CustomerOrder } from "@/types/order"

interface ReorderModalProps {
  open: boolean
  onClose: () => void
  order: CustomerOrder
  validation: OrderValidation
  shopSlug: string
  accentColor?: string | null
}

export function ReorderModal({
  open,
  onClose,
  order,
  validation,
  shopSlug,
  accentColor,
}: ReorderModalProps) {
  const router = useRouter()
  const { clearCart, addItem } = useCart()
  const [isConfirming, setIsConfirming] = useState(false)
  const { validatedItems, allAvailable, cartItems } = validation

  const handleConfirm = () => {
    setIsConfirming(true)

    // Atualiza o estado do CartContext (não só o localStorage)
    clearCart()
    cartItems.forEach((item) => addItem(item))

    toast.success(
      `${cartItems.length} ${cartItems.length === 1 ? "item adicionado" : "itens adicionados"} ao carrinho!`,
    )
    onClose()
    router.push(`/${shopSlug}/conferir`)
  }

  const total = parseFloat(order.attributes.total_items_price ?? "0")
  const btnStyle = accentColor ? { backgroundColor: accentColor, borderColor: accentColor } : {}

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-4">
          <DialogTitle className="flex items-center gap-2 font-tomato text-lg">
            <RotateCcw className="w-5 h-5 text-primary flex-shrink-0" />
            Repetir pedido #{order.attributes.id}
          </DialogTitle>
        </DialogHeader>

        <Separator />

        {/* Items list */}
        <div className="px-5 py-4 space-y-3 max-h-[50vh] overflow-y-auto">
          {validatedItems.map(({ orderItem, isAvailable }) => {
            const attrs = orderItem.attributes
            const name = attrs.catalog_item?.data?.attributes?.name ?? "Item"
            const image = attrs.catalog_item?.data?.attributes?.image_url
            const isWeight = attrs.item_type === "weight_per_kg" || attrs.item_type === "weight_per_g"
            const unit = attrs.item_type === "weight_per_g" ? "g" : "kg"
            const qty = isWeight && attrs.weight
              ? `${attrs.weight} ${unit}`
              : `${attrs.quantity}×`

            return (
              <div key={orderItem.id} className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 flex-shrink-0 rounded-md overflow-hidden border border-[#E5E2DD] ${
                    !isAvailable ? "opacity-40" : ""
                  }`}
                >
                  {image ? (
                    <img src={image} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#F0EFEB] flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium leading-snug truncate ${
                      !isAvailable ? "line-through text-gray-400" : "text-gray-900"
                    }`}
                  >
                    {qty} {name}
                  </p>

                  {/* Detalhes do item */}
                  {isAvailable && (
                    <div className="mt-1 space-y-0.5">
                      {attrs.selected_prepare_methods && attrs.selected_prepare_methods.length > 0 && (
                        <p className="text-xs text-gray-500">
                          Preparo: {attrs.selected_prepare_methods.map((m) => m.name).join(", ")}
                        </p>
                      )}
                      {attrs.selected_steps && attrs.selected_steps.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {attrs.selected_steps.map((s, i) => (
                            <span key={i} className="text-xs text-gray-500">
                              {s.step_name}: {s.option_name}
                            </span>
                          ))}
                        </div>
                      )}
                      {attrs.selected_extras && attrs.selected_extras.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {attrs.selected_extras.map((e, i) => (
                            <span key={i} className="text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              + {e.name}
                            </span>
                          ))}
                        </div>
                      )}
                      {attrs.complements && attrs.complements.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {attrs.complements.map((c, i) => (
                            <span key={i} className="text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              + {c.name}
                            </span>
                          ))}
                        </div>
                      )}
                      {attrs.observation && (
                        <p className="text-xs text-gray-400 italic">"{attrs.observation}"</p>
                      )}
                    </div>
                  )}

                  {!isAvailable && (
                    <p className="text-xs text-red-500 mt-0.5">Indisponível no momento</p>
                  )}
                </div>

                <div className="flex-shrink-0 flex items-center gap-2">
                  <span
                    className={`text-sm font-medium tabular-nums ${
                      !isAvailable ? "text-gray-400 line-through" : "text-gray-900"
                    }`}
                  >
                    {formatCurrency(parseFloat(attrs.total_price))}
                  </span>
                  {isAvailable ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <Separator />

        <div className="px-5 py-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total do pedido</span>
            <span className="text-base font-bold text-gray-900 tabular-nums">
              {formatCurrency(total)}
            </span>
          </div>

          {!allAvailable && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5">
              <p className="text-xs font-medium text-red-700">
                Um ou mais itens estão indisponíveis no momento. O pedido não pode ser repetido.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              className="flex-1 gap-2"
              style={allAvailable ? btnStyle : {}}
              disabled={!allAvailable || isConfirming}
              onClick={handleConfirm}
            >
              {isConfirming ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
              Prosseguir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
