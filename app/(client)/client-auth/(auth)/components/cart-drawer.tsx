import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer'
import { X, Plus, Minus, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Item } from '@/app/types/client-catalog'
import { useEffect } from 'react'

interface CartItem {
  id: string;
  quantity: number;
  product: Item;
}

export default function CartDrawer({ isCartOpen, setIsCartOpen, cartItems, allItems, updateCartItem }: { isCartOpen: boolean, setIsCartOpen: (open: boolean) => void, cartItems: CartItem[], allItems: Item[], updateCartItem: (productId: string, newQuantity: number) => void }) {
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  useEffect(() => {
    console.log(cartItems)
  }, [cartItems])

  return (
    <Drawer open={isCartOpen} onOpenChange={setIsCartOpen}>
      <DrawerContent className="h-[95vh] sm:h-[85vh] md:h-[80vh] transition-all duration-300 ease-in-out">
        <div className="mx-auto w-full max-w-md h-full flex flex-col">
          <DrawerHeader>
            <DrawerTitle className="text-center">Seu Carrinho</DrawerTitle>
            <DrawerDescription className="text-center">
              {cartItems.length === 0 ? 'Seu carrinho está vazio' : `${totalCartItems} ${totalCartItems === 1 ? 'item' : 'itens'}`}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 pb-0 flex-1 overflow-y-auto">
            <div className="space-y-6">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Adicione produtos ao seu carrinho</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((cartItem) => {
                    return (
                      <div key={cartItem.id} className="flex items-start gap-4 p-4 border-none rounded-lg bg-card shadow-lg hover:shadow-md transition-shadow">
                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                          {cartItem.product.attributes.image_url ? (
                            <Image
                              src={cartItem.product.attributes.image_url}
                              alt={cartItem.product.attributes.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 96px) 100vw, 96px"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full w-full bg-muted">
                              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          {cartItem.quantity > 1 && (
                            <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                              {cartItem.quantity}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <h3 className="text-sm font-medium truncate">{cartItem.product.attributes.name}</h3>
                            <p className="text-sm font-medium ml-2">R$ {parseFloat(cartItem.product.attributes.price).toFixed(2)}</p>
                          </div>
                          
                          <div className="mt-1 text-xs text-muted-foreground space-y-0.5">
                            {cartItem.product.attributes.description && (
                              <p className="line-clamp-2">{cartItem.product.attributes.description}</p>
                            )}
                            
                            <div className="flex flex-wrap gap-2 mt-1">
                              {cartItem.product.attributes.unit_of_measurement && (
                                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                  {cartItem.product.attributes.unit_of_measurement}
                                </span>
                              )}
                              
                              {cartItem.product.attributes.item_type && (
                                <span className="inline-flex items-center rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                                  {cartItem.product.attributes.item_type}
                                </span>
                              )}
                              
                              {cartItem.product.attributes.measure_interval && (
                                <span className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                                  {cartItem.product.attributes.measure_interval}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-full"
                                onClick={() => updateCartItem(cartItem.id, cartItem.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium w-6 text-center">{cartItem.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-full"
                                onClick={() => updateCartItem(cartItem.id, cartItem.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => updateCartItem(cartItem.id, 0)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="mt-2 text-xs text-muted-foreground">
                            Subtotal: R$ {(parseFloat(cartItem.product.attributes.price) * cartItem.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          
          {cartItems.length > 0 && (
            <DrawerFooter className="border-t mt-auto">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Subtotal</span>
                <span className="font-medium">
                  R$ {cartItems.reduce((sum, item) => {
                    return sum + (parseFloat(item.product.attributes.price) * item.quantity)
                  }, 0).toFixed(2)}
                </span>
              </div>
              <Button className="w-full">
                Finalizar Compra
              </Button>
            </DrawerFooter>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
