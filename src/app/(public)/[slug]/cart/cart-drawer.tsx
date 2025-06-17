"use client"

import { X, ShoppingCart, Scale, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useCart } from './cart-context'
import { formatPrice } from '../format-price'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useParams, useRouter } from 'next/navigation'
import { CartButton } from './cart-button'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { CatalogItem } from '../types'

interface CartItem extends CatalogItem {
  quantity: number
  weight?: number
  selectedExtras?: string[]
  selectedMethods?: string[]
  selectedOptions?: Record<string, string>
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
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const params = useParams()
  const slug = params.slug as string

  const handleCheckout = () => {
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
            <DrawerTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Meu Carrinho ({totalItems})
            </DrawerTitle>
          </DrawerHeader>

          {items.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Seu carrinho está vazio</h3>
              <p className="mt-1 text-gray-500">Adicione itens para continuar</p>
            </div>
          ) : (
            <>
              <ScrollArea className="h-[55vh] px-4">
                <div className="space-y-4">
                  {items.map((item) => {
                    const prepareMethodName = getPrepareMethodName(item)
                    const hasDiscount = item.attributes.price_with_discount !== null
                    const originalPrice = item.attributes.price
                    const discountedPrice = item.attributes.price_with_discount || originalPrice

                    return (
                      <div key={`${item.id}-${JSON.stringify(item.selectedExtras)}-${JSON.stringify(item.selectedMethods)}-${JSON.stringify(item.selectedOptions)}-${item.weight || ''}`} className="flex gap-4 pb-4 border-b">
                        <div className="w-20 h-20 bg-gray-100 rounded-xs overflow-hidden">
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
                        
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium line-clamp-1">{item.attributes.name}</h3>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

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
                                <Badge variant="outline" className="text-xs">
                                  {item.attributes.item_type === 'weight_per_kg' ? '/kg' : '/un'}
                                </Badge>
                              </>
                            ) : (
                              <>
                                <span className="text-sm font-medium text-primary">
                                  {formatPrice(originalPrice)}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {item.attributes.item_type === 'weight_per_kg' ? '/kg' : '/un'}
                                </Badge>
                              </>
                            )}
                          </div>

                          {item.weight && (
                            <div className="flex items-center gap-1 mt-1 text-sm text-white bg-primary/80 rounded-xs px-2 py-1 w-fit">
                              <Scale className="w-4 h-4" />
                              <span>{item.weight} {item.attributes.item_type === 'weight_per_kg' ? 'kg' : 'un'}</span>
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
                              <p className="text-xs font-medium text-gray-500 mb-1">Extras:</p>
                              <div className="flex flex-wrap gap-1">
                                {item.selectedExtras.map(extraId => {
                                  const extra = item.attributes.extra.data.find((e: any) => e.id === extraId)
                                  if (!extra) return null
                                  return (
                                    <Badge key={extraId} variant="outline" className="text-xs">
                                      + {extra.attributes.name} (R$ {parseFloat(extra.attributes.price).toFixed(2)})
                                    </Badge>
                                  )
                                })}
                              </div>
                            </div>
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
                              onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <Input 
                              type="number" 
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-12 h-8 mx-2 text-center"
                              min="1"
                            />
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
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
                  >
                    Finalizar Compra
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