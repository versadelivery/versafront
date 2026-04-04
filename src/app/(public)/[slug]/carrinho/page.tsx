"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Clock, Utensils, ShoppingCart, ChevronDown } from "lucide-react"
import { useCart } from "../cart/cart-context"
import { useClient } from "../client-context"
import { useShopStatusContext } from "@/contexts/ShopStatusContext"
import { formatPrice } from "../format-price"
import { CatalogItem } from "../types"
import Link from "next/link"
import Image from "next/image"
import favicon from "@/public/logo/favicon.svg"
import logoInlineBlack from "@/public/logo/logo-inline-black.svg"

interface CartItem extends CatalogItem {
  cartId: string
  quantity: number
  weight?: number
  selectedExtras?: string[]
  selectedMethods?: string[]
  selectedOptions?: Record<string, string>
  selectedSharedComplements?: string[]
  totalPrice: number
}

type DetailSection = { label: string; items: { name: string; price?: number }[] }

export default function CartPage() {
  const {
    items,
    totalItems,
    totalPrice,
    removeItem,
    updateItemQuantity,
    clearCart,
  } = useCart()
  const { isOpen: isShopOpen, loading: shopStatusLoading } = useShopStatusContext()
  const { shop: contextShop } = useClient()
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const minimumOrderValue = Number(contextShop?.data?.attributes?.shop_delivery_config?.data?.attributes?.minimum_order_value) || 0
  const isBelowMinOrder = minimumOrderValue > 0 && totalPrice < minimumOrderValue

  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const toggleExpand = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const availableItemIds = useMemo(() => {
    const ids = new Set<string>()
    if (!contextShop) return ids
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
    const todayDayKey = `${dayKeys[new Date().getDay()]}_active`
    const groups = contextShop.data?.attributes?.catalog_groups
    const groupList = Array.isArray(groups) ? groups : (groups?.data ?? [])
    groupList.forEach((g: any) => {
      if (g.attributes?.active === false) return
      const items = Array.isArray(g.attributes?.items) ? g.attributes.items : (g.attributes?.items?.data ?? [])
      items.forEach((i: any) => {
        const item = i.data ?? i
        if (!item?.id) return
        const attrs = item.attributes ?? item
        if (attrs.active === false) return
        if (attrs[todayDayKey] === false) return
        ids.add(String(item.id))
      })
    })
    return ids
  }, [contextShop])

  const isItemUnavailable = (item: CartItem) => {
    if (!item.attributes) return true
    if (availableItemIds.size === 0) return false
    return !availableItemIds.has(String(item.id))
  }

  const hasUnavailableItems = items.some(item => isItemUnavailable(item))

  const handleCheckout = () => {
    if (!isShopOpen) return
    if (hasUnavailableItems) return
    router.push(`/${slug}/conferir`)
  }

  const getItemDetails = (item: CartItem): DetailSection[] => {
    const sections: DetailSection[] = []

    if (item.selectedMethods?.length) {
      const list: { name: string }[] = []
      item.selectedMethods.forEach(methodId => {
        const method = item.attributes.prepare_method.data.find((m: any) => m.id === methodId)
        if (method) list.push({ name: method.attributes.name })
      })
      if (list.length) sections.push({ label: 'Preparo', items: list })
    }

    if (item.selectedExtras?.length) {
      const list: { name: string; price?: number }[] = []
      item.selectedExtras.forEach(extraId => {
        const extra = item.attributes.extra.data.find((e: any) => e.id === extraId)
        if (extra) {
          const price = parseFloat(extra.attributes.price)
          list.push({ name: extra.attributes.name, price: price > 0 ? price : undefined })
        }
      })
      if (list.length) sections.push({ label: 'Adicionais', items: list })
    }

    if (item.selectedSharedComplements?.length) {
      item.attributes.shared_complements?.data?.forEach((group: any) => {
        const selected = item.selectedSharedComplements!.filter(optionId =>
          group.attributes.options.some((o: any) => o.id.toString() === optionId.toString())
        )
        if (selected.length === 0) return
        const list = selected.map((optionId: string) => {
          const opt = group.attributes.options.find((o: any) => o.id.toString() === optionId.toString())
          if (!opt) return null
          const price = Number(opt.price)
          return { name: opt.name, price: price > 0 ? price : undefined }
        }).filter(Boolean) as { name: string; price?: number }[]
        if (list.length) sections.push({ label: group.attributes.name, items: list })
      })
    }

    if (item.selectedOptions && Object.keys(item.selectedOptions).length > 0) {
      Object.entries(item.selectedOptions).forEach(([stepId]) => {
        const step = item.attributes.steps.data.find((s: any) => s.id === stepId)
        if (!step) return
        const option = step.attributes.options.data.find(
          (opt: any) => opt.id === item.selectedOptions![stepId]
        )
        if (option) {
          const price = parseFloat(option.attributes.price || '0')
          sections.push({
            label: step.attributes.name,
            items: [{ name: option.attributes.name, price: price > 0 ? price : undefined }]
          })
        }
      })
    }

    return sections
  }

  const isWeight = (item: CartItem) =>
    item.attributes.item_type === 'weight_per_kg' || item.attributes.item_type === 'weight_per_g'

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href={`/${slug}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mr-auto cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:block">Continuar comprando</span>
            </Link>
            <Link href={`/${slug}`} className="md:hidden cursor-pointer">
              <Image src={favicon} alt="Versa" width={90} height={90} priority />
            </Link>
            <Link href={`/${slug}`} className="hidden md:block cursor-pointer">
              <Image src={logoInlineBlack} alt="Versa" width={180} height={56} priority />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="font-tomato text-3xl sm:text-4xl font-bold text-gray-900 mb-8 sm:mb-10">
          Carrinho
        </h1>

        {items.length === 0 ? (
          <div className="p-12 sm:p-20 text-center">
            <div className="w-20 h-20 rounded-md flex items-center justify-center mx-auto mb-5">
              <ShoppingCart className="w-9 h-9 text-gray-300" />
            </div>
            <h2 className="font-tomato text-xl font-bold text-gray-900 mb-2">Seu carrinho está vazio</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Explore nosso cardápio e adicione itens ao seu carrinho
            </p>
            <Link
              href={`/${slug}`}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium text-sm px-8 py-3.5 rounded-md transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Explorar cardápio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-10 items-start">
            {/* Left: Cart items */}
            <div>
              <div className="bg-white border border-[#E5E2DD] rounded-md overflow-hidden">
                <div className="divide-y divide-[#E5E2DD]">
                  {(items as CartItem[]).map((item) => {
                    const unavailable = isItemUnavailable(item)
                    const details = !unavailable ? getItemDetails(item) : []
                    const weightBased = !unavailable && isWeight(item)
                    const weightUnit = item.attributes?.item_type === 'weight_per_g' ? 'g' : 'kg'
                    const hasDetails = details.length > 0 || weightBased
                    const isExpanded = expanded.has(item.cartId)

                    const attrs = item.attributes
                    const hasDiscount = !!attrs?.price_with_discount &&
                      Number(attrs.price_with_discount) < Number(attrs.price)
                    const unitPrice = hasDiscount ? Number(attrs.price_with_discount) : Number(attrs?.price ?? 0)

                    if (unavailable) {
                      return (
                        <div key={item.cartId} className="px-5 sm:px-6 py-4 bg-red-50/60">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-red-600">
                                {attrs ? `"${attrs.name}" indisponível` : 'Item removido do catálogo'}
                              </p>
                              <p className="text-xs text-red-400 mt-0.5">
                                {attrs ? 'Desativado ou indisponível hoje.' : 'Não está mais disponível.'}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.cartId)}
                              className="text-sm text-red-600 hover:text-red-800 font-medium flex-shrink-0 cursor-pointer"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div key={item.cartId} className="px-5 sm:px-6 py-4">
                        {/* Row: image + info + price */}
                        <div className="flex items-start gap-3.5">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#F0EFEB] rounded-md overflow-hidden flex-shrink-0">
                            {attrs.image_url ? (
                              <img src={attrs.image_url} alt={attrs.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Utensils className="w-5 h-5 text-gray-300" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="font-medium text-gray-900 text-sm leading-snug truncate">
                                  {attrs.name}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {weightBased && item.weight
                                    ? `${item.weight} ${weightUnit} × ${formatPrice(unitPrice)}/${weightUnit}`
                                    : `${item.quantity}× ${formatPrice(unitPrice)}`}
                                  {hasDiscount && (
                                    <span className="ml-1.5 text-gray-400 line-through">{formatPrice(Number(attrs.price))}</span>
                                  )}
                                </p>
                              </div>
                              <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                                {formatPrice(item.totalPrice)}
                              </span>
                            </div>

                            {/* Actions row */}
                            <div className="flex items-center justify-between mt-2.5">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center border border-[#E5E2DD] rounded-md">
                                  <button
                                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-l-md transition-colors disabled:opacity-30 cursor-pointer"
                                    onClick={() => updateItemQuantity(item.cartId, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                  >
                                    <span className="text-base leading-none">−</span>
                                  </button>
                                  <span className="w-8 text-center font-semibold text-sm text-gray-900">
                                    {item.quantity}
                                  </span>
                                  <button
                                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-r-md transition-colors cursor-pointer"
                                    onClick={() => updateItemQuantity(item.cartId, item.quantity + 1)}
                                  >
                                    <span className="text-base leading-none">+</span>
                                  </button>
                                </div>
                                <button
                                  onClick={() => removeItem(item.cartId)}
                                  className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer"
                                >
                                  Remover
                                </button>
                              </div>
                              {hasDetails && (
                                <button
                                  onClick={() => toggleExpand(item.cartId)}
                                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                >
                                  {isExpanded ? 'Ocultar' : 'Detalhes'}
                                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded details panel */}
                        {isExpanded && hasDetails && (
                          <div className="mt-3 sm:ml-[74px] bg-[#FAF9F7] border border-[#E5E2DD] rounded-md px-4 py-3 space-y-2.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Preço unitário</span>
                              <div className="flex items-center gap-1.5">
                                {hasDiscount && (
                                  <span className="text-gray-400 line-through">{formatPrice(Number(attrs.price))}</span>
                                )}
                                <span className="font-medium text-gray-900">{formatPrice(unitPrice)}</span>
                                {hasDiscount && (
                                  <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                    -{Math.round(((Number(attrs.price) - unitPrice) / Number(attrs.price)) * 100)}%
                                  </span>
                                )}
                              </div>
                            </div>

                            {weightBased && item.weight && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Peso</span>
                                <span className="font-medium text-gray-900">{item.weight} {weightUnit}</span>
                              </div>
                            )}

                            {!weightBased && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Quantidade</span>
                                <span className="font-medium text-gray-900">{item.quantity}</span>
                              </div>
                            )}

                            {details.map((section, i) => (
                              <div key={i}>
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{section.label}</p>
                                <div className="flex flex-wrap gap-1">
                                  {section.items.map((detail, j) => (
                                    <span key={j} className="inline-flex items-center text-xs bg-white border border-[#E5E2DD] text-gray-700 px-2 py-0.5 rounded-md">
                                      {detail.name}
                                      {detail.price != null && detail.price > 0 && (
                                        <span className="ml-1 text-gray-400">+{formatPrice(detail.price)}</span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}

                            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E5E2DD]">
                              <span className="font-medium text-gray-700">Total do item</span>
                              <span className="font-bold text-gray-900">{formatPrice(item.totalPrice)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={clearCart}
                  className="text-sm text-gray-500 underline underline-offset-2 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Limpar carrinho
                </button>
              </div>
            </div>

            {/* Right: Summary */}
            <div className="lg:sticky lg:top-20">
              {!isShopOpen && !shopStatusLoading && (
                <div className="bg-amber-50 border border-amber-200 rounded-md px-5 py-4 flex items-start gap-3 mb-4">
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Loja fechada no momento. Você pode adicionar itens ao carrinho, mas não pode finalizar a compra.
                  </p>
                </div>
              )}

              <div className="bg-white border border-[#E5E2DD] rounded-md overflow-hidden">
                <div className="divide-y divide-[#E5E2DD]">
                  <div className="flex justify-between items-center px-5 py-4">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="text-sm font-medium text-gray-900">{formatPrice(totalPrice)}</span>
                  </div>
                  {minimumOrderValue > 0 && (
                    <div className="flex justify-between items-center px-5 py-4">
                      <span className="text-sm text-gray-600">Pedido mínimo (entrega)</span>
                      <span className={`text-sm font-medium ${isBelowMinOrder ? 'text-red-500' : 'text-green-600'}`}>
                        {formatPrice(minimumOrderValue)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center px-5 py-4">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <span className="text-base font-bold text-gray-900">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              <div className="relative group mt-4">
                <button
                  onClick={handleCheckout}
                  disabled={!isShopOpen || shopStatusLoading || hasUnavailableItems}
                  className="w-full h-13 bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-base rounded-md transition-colors flex items-center justify-center cursor-pointer"
                >
                  {!isShopOpen && !shopStatusLoading
                    ? 'Loja Fechada'
                    : hasUnavailableItems
                    ? 'Remova itens indisponíveis'
                    : 'Finalizar Compra'}
                </button>
              </div>

              <Link
                href={`/${slug}`}
                className="w-full mt-3 h-12 border border-[#E5E2DD] rounded-md hover:border-gray-400 text-gray-700 font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Continuar comprando
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
