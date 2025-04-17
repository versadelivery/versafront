import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/app/components/ui/drawer'
import { X, Plus, Minus, ShoppingCart, CheckCircle, Pencil } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import Image from 'next/image'
import { Item } from '@/app/types/client-catalog'
import { useAuth } from '../../hooks/useClientAuth'
import { useRouter } from 'next/navigation'
import { useCart } from '../../hooks/useCart'
import { Badge } from '@/app/components/ui/badge'
import { ProductModal } from './product-modal'
import { useState } from 'react'

interface CartItem {
  id: string;
  quantity: number;
  product: Item;
  options?: {
    weight?: number;
    extras?: { id: string; name: string; price: number }[];
    prepareMethod?: string;
    steps?: Record<string, string>;
  };
}

export default function CartDrawer({ isCartOpen, setIsCartOpen, cartItems, allItems, updateCartItem }: { isCartOpen: boolean, setIsCartOpen: (open: boolean) => void, cartItems: CartItem[], allItems: Item[], updateCartItem: (productId: string, newQuantity: number) => void }) {
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { updateItemQuantity, removeFromCart } = useCart();
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    updateCartItem(itemId, newQuantity);
    
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateItemQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return;
    }

    const pathParts = window.location.pathname.split('/');
    const slug = pathParts.length > 2 ? pathParts[2] : '';
    
    if (isAuthenticated) {
      setIsCartOpen(false);
      router.push(`/catalog/${slug}/checkout`);
    } else {
      setIsCartOpen(false);
    }
  };

  const getProductPrice = (item: CartItem) => {
    if (!item.options) {
      return item.product.attributes.price_with_discount 
        ? parseFloat(item.product.attributes.price_with_discount)
        : parseFloat(item.product.attributes.price);
    }
    
    let price = item.product.attributes.price_with_discount 
      ? parseFloat(item.product.attributes.price_with_discount)
      : parseFloat(item.product.attributes.price);
    
    // Apply weight multiplier if exists
    if (item.options.weight) {
      price = price * item.options.weight;
    }
    
    // Add extras prices
    if (item.options.extras) {
      item.options.extras.forEach(extra => {
        price += extra.price;
      });
    }
    
    return price;
  };

  const getPrepareMethodName = (item: CartItem) => {
    if (!item.options?.prepareMethod) return null;
    return item.product.attributes.prepare_method?.data.find(
      (m: any) => m.id === item.options?.prepareMethod
    )?.attributes.name;
  };

  const getStepOptionName = (item: CartItem, stepId: string) => {
    if (!item.options?.steps) return null;
    const step = item.product.attributes.steps.data.find((s: any) => s.id === stepId);
    if (!step) return null;
    return step.attributes.options.data.find(
      (opt: any) => opt.id === item.options?.steps?.[stepId]
    )?.attributes.name;
  };

  const handleEditItem = (item: CartItem) => {
    setEditingItem(item);
  };

  const handleEditComplete = (options: any) => {
    if (editingItem) {
      const updatedItem = {
        ...editingItem,
        options: {
          ...editingItem.options,
          ...options
        }
      };
      
      // Atualizar o item no carrinho
      updateItemQuantity(editingItem.id, editingItem.quantity);
      setEditingItem(null);
    }
  };

  return (
    <>
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
                      const itemPrice = getProductPrice(cartItem);
                      const subtotal = itemPrice * cartItem.quantity;
                      const prepareMethodName = getPrepareMethodName(cartItem);

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
                              <p className="text-sm font-medium ml-2">R$ {itemPrice.toFixed(2)}</p>
                            </div>
                            
                            <div className="mt-1 text-xs text-muted-foreground space-y-1">
                              {/* Display weight if exists */}
                              {cartItem.options?.weight && (
                                <div className="flex items-center justify-between">
                                  <p className="text-sm">
                                    {cartItem.options.weight} {cartItem.product.attributes.unit_of_measurement}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleEditItem(cartItem)}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                              
                              {/* Display extras if exists */}
                              {cartItem.options?.extras && cartItem.options.extras.length > 0 && (
                                <div className="space-y-1">
                                  <p className="font-medium">Extras:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {cartItem.options.extras.map(extra => (
                                      <Badge key={extra.id} variant="outline" className="text-xs">
                                        + {extra.name} (R$ {extra.price.toFixed(2)})
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Display prepare method if exists */}
                              {prepareMethodName && (
                                <p className="text-sm">
                                  Preparo: {prepareMethodName}
                                </p>
                              )}
                              
                              {/* Display steps if exists */}
                              {cartItem.options?.steps && Object.keys(cartItem.options.steps).length > 0 && (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium">Opções:</p>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => handleEditItem(cartItem)}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <div className="space-y-1">
                                    {Object.entries(cartItem.options.steps).map(([stepId, optionId]) => {
                                      const stepName = cartItem.product.attributes.steps.data.find(
                                        (s: any) => s.id === stepId
                                      )?.attributes.name;
                                      const optionName = getStepOptionName(cartItem, stepId);
                                      
                                      return (
                                        <div key={stepId} className="flex justify-between text-xs">
                                          <span>{stepName}:</span>
                                          <span>{optionName}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 rounded-full"
                                  onClick={() => handleQuantityChange(cartItem.id, cartItem.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-medium w-6 text-center">{cartItem.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 rounded-full"
                                  onClick={() => handleQuantityChange(cartItem.id, cartItem.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleQuantityChange(cartItem.id, 0)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="mt-2 text-xs text-muted-foreground">
                              Subtotal: R$ {subtotal.toFixed(2)}
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
              <DrawerFooter className="border-t mt-auto mb-8">
                <div className="flex justify-between mb-4">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-medium">
                    R$ {cartItems.reduce((sum, item) => {
                      const itemPrice = getProductPrice(item);
                      return sum + (itemPrice * item.quantity);
                    }, 0).toFixed(2)}
                  </span>
                </div>
                <Button className="w-full" onClick={handleCheckout}>
                  Finalizar Compra
                </Button>
              </DrawerFooter>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {editingItem && (
        <ProductModal
          product={editingItem.product}
          isOpen={true}
          onClose={() => setEditingItem(null)}
          onAddToCart={(options) => handleEditComplete(options)}
        />
      )}
    </>
  )
}