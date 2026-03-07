"use client"

import { X, ShoppingCart, Scale, Utensils, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useCart } from './cart-context'
import { formatPrice } from '../format-price'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useParams, useRouter } from 'next/navigation'
import { CartButton } from './cart-button'
import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { CatalogItem } from '../types'
import { useShopStatusContext } from '@/contexts/ShopStatusContext'
import { useClient } from '../client-context'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CartItem extends CatalogItem {
  quantity: number
  weight?: number
  selectedExtras?: string[]
  selectedMethods?: string[]
  selectedOptions?: Record<string, string>
  selectedSharedComplements?: string[]
  totalPrice: number
}

export function CartDrawer() {
  const { 
    items, 
    totalItems, 
    totalPrice, 
    removeItem, 
    updateItemQuantity,
    clearCart
  } = useCart()
  const { isOpen: isShopOpen, loading: shopStatusLoading } = useShopStatusContext()
  const { shop: contextShop } = useClient()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const params = useParams()
  const slug = params.slug as string

  // Construir set de IDs disponíveis (ativo + grupo ativo + dia da semana)
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
    if (availableItemIds.size === 0) return false // shop data not loaded yet
    return !availableItemIds.has(String(item.id))
  }

  const hasUnavailableItems = items.some(item => isItemUnavailable(item))

  const handleCheckout = () => {
    if (!isShopOpen) return
    if (hasUnavailableItems) {
      toast.error('Remova os itens indisponíveis antes de continuar.')
      return
    }
    router.push(`/${slug}/conferir`)
  }

  const getPrepareMethodName = (item: CartItem) => {
    if (!item.selectedMethods || !item.selectedMethods.length) return null
    const method = item.attributes.prepare_method.data.find(
      (m: any) => m.id === item.selectedMethods![0]
    )
    return method?.attributes.name
  }

  const getStepOptionName = (item: CartItem, stepId: string) => {
    if (!item.selectedOptions || !item.selectedOptions[stepId]) return null
    const step = item.attributes.steps.data.find((s: any) => s.id === stepId)
    if (!step) return null
    return step.attributes.options.data.find(
      (opt: any) => opt.id === item.selectedOptions![stepId]
    )?.attributes.name
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <div className={`relative cursor-pointer ${isOpen ? 'hidden' : 'block'}`}>
          <CartButton />
        </div>
      </DrawerTrigger>
      
      <DrawerContent className="max-h-[90vh] pb-6">
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader className="text-left px-4 pt-4">
            <DrawerTitle className="font-tomato flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Meu Carrinho ({totalItems})
            </DrawerTitle>
          </DrawerHeader>

          {items.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="font-tomato text-lg font-medium text-gray-900">Seu carrinho está vazio</h3>
              <p className="mt-1 text-gray-500">Adicione itens para continuar</p>
            </div>
          ) : (
            <>
              <ScrollArea className="h-[55vh] px-4">
                <div className="space-y-4">
                  {items.map((item) => {
                    if (!item.attributes || isItemUnavailable(item)) {
                      return (
                        <div key={item.cartId} className="flex items-center gap-3 pb-4 border-b">
                          <div className="flex-1">
                            <p className="text-sm text-red-500 font-medium">
                              {item.attributes ? `"${item.attributes.name}" indisponível` : 'Item removido do catálogo'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.attributes ? 'Este item foi desativado ou não está disponível hoje.' : 'Este item não está mais disponível.'}
                            </p>
                          </div>
                          <button onClick={() => removeItem(item.cartId)} className="text-red-400 hover:text-red-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    }
                    const prepareMethodName = getPrepareMethodName(item)
                    const hasDiscount = item.attributes.price_with_discount !== null && Number(item.attributes.price_with_discount) < Number(item.attributes.price)
                    const originalPrice = item.attributes.price
                    const discountedPrice = item.attributes.price_with_discount || originalPrice
                    const isWeight = item.attributes.item_type === 'weight_per_kg' || item.attributes.item_type === 'weight_per_g'
                    const weightUnit = item.attributes.item_type === 'weight_per_g' ? 'g' : 'kg'

                    return (
                      <div key={item.cartId} className="flex gap-4 pb-4 border-b">
                        <div className="w-20 h-20 bg-gray-100 rounded-xs overflow-hidden flex-shrink-0">
                          {item.attributes.image_url ? (
                            <img
                              src={item.attributes.image_url}
                              alt={item.attributes.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <span className="text-gray-400 text-xs">Sem imagem</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <h3 className="font-medium line-clamp-1">{item.attributes.name}</h3>
                            <button
                              onClick={() => removeItem(item.cartId)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {isWeight && item.weight ? (
                            <>
                              {/* Preço total em destaque */}
                              <p className="text-sm font-bold text-primary mt-1">
                                {formatPrice(item.totalPrice)}
                              </p>
                              {/* Detalhamento: peso × preço unitário */}
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.weight} {weightUnit} × {hasDiscount ? (
                                  <>
                                    <span className="line-through">{formatPrice(originalPrice)}</span>
                                    {' '}<span className="text-green-600 font-medium">{formatPrice(discountedPrice)}</span>
                                  </>
                                ) : (
                                  formatPrice(originalPrice)
                                )}
                                /{weightUnit}
                              </p>
                            </>
                          ) : (
                            <div className="flex items-center gap-2 mt-1">
                              {hasDiscount ? (
                                <>
                                  <span className="text-sm line-through text-gray-500">
                                    {formatPrice(originalPrice)}
                                  </span>
                                  <span className="text-sm font-medium text-green-600">
                                    {formatPrice(discountedPrice)}
                                  </span>
                                  <Badge variant="secondary" className="text-xs">
                                    {Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)}% OFF
                                  </Badge>
                                </>
                              ) : (
                                <span className="text-sm font-medium text-primary">
                                  {formatPrice(originalPrice)}
                                </span>
                              )}
                            </div>
                          )}

                          {prepareMethodName && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-500 mb-1">Modos de preparo:</p>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Utensils className="w-4 h-4" />
                                <span>{prepareMethodName}</span>
                              </div>
                            </div>
                          )}
                          
                          {item.selectedExtras && item.selectedExtras.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-500 mb-1">Adicionais:</p>
                              <div className="flex flex-wrap gap-1">
                                {item.selectedExtras.map(extraId => {
                                  const extra = item.attributes.extra.data.find((e: any) => e.id === extraId)
                                  if (!extra) return null
                                  return (
                                    <Badge key={extraId} variant="outline" className="text-xs">
                                      + {extra.attributes.name} ({formatPrice(parseFloat(extra.attributes.price))})
                                    </Badge>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {item.selectedSharedComplements && item.selectedSharedComplements.length > 0 && (
                            <>
                              {item.attributes.shared_complements?.data?.map((group: any) => {
                                const selectedFromGroup = item.selectedSharedComplements!.filter(optionId =>
                                  group.attributes.options.some((o: any) => o.id.toString() === optionId.toString())
                                )
                                if (selectedFromGroup.length === 0) return null
                                return (
                                  <div key={group.id} className="mt-2">
                                    <p className="text-xs font-medium text-gray-500 mb-1">{group.attributes.name}:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {selectedFromGroup.map((optionId: string) => {
                                        const opt = group.attributes.options.find((o: any) => o.id.toString() === optionId.toString())
                                        if (!opt) return null
                                        return (
                                          <Badge key={optionId} variant="outline" className="text-xs">
                                            + {opt.name} ({formatPrice(Number(opt.price))})
                                          </Badge>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )
                              })}
                            </>
                          )}
                          
                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-500 mb-1">Opções:</p>
                              <div className="space-y-1">
                                {Object.entries(item.selectedOptions).map(([stepId, optionId]) => {
                                  const stepName = item.attributes.steps.data.find(
                                    (s: any) => s.id === stepId
                                  )?.attributes.name
                                  const optionName = getStepOptionName(item, stepId)
                                  
                                  return (
                                    <div key={stepId} className="flex justify-between text-xs">
                                      <span className="text-gray-600">{stepName}:</span>
                                      <span>{optionName}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center mt-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => updateItemQuantity(item.cartId, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <Input 
                              type="number" 
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.cartId, parseInt(e.target.value) || 1)}
                              className="w-12 h-8 mx-2 text-center"
                              min="1"
                            />
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => updateItemQuantity(item.cartId, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>

                          <div className="mt-2 text-sm font-medium">
                            Subtotal: {formatPrice(item.totalPrice)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t bg-white sticky bottom-0 z-10">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Total</span>
                  <span className="font-bold">{formatPrice(totalPrice)}</span>
                </div>
                
                {!isShopOpen && !shopStatusLoading && (
                  <Alert className="mb-4 border-amber-200 bg-amber-50">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      Loja fechada no momento. Você pode adicionar itens ao carrinho, mas não pode finalizar a compra.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={clearCart}
                  >
                    Limpar
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleCheckout}
                    disabled={!isShopOpen || shopStatusLoading || hasUnavailableItems}
                  >
                    {!isShopOpen && !shopStatusLoading ? 'Loja Fechada' : hasUnavailableItems ? 'Remova itens indisponíveis' : 'Finalizar Compra'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}