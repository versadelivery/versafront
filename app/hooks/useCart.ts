import { useCart as useCartContext, CartItem } from '@/app/contexts/CartContext'

export function useCart() {
  const cart = useCartContext()

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    cart.addItem({ ...item, quantity: 1 })
  }

  const removeFromCart = (itemId: string) => {
    cart.removeItem(itemId)
  }

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      cart.removeItem(itemId)
      return
    }
    cart.updateQuantity(itemId, quantity)
  }

  return {
    items: cart.items,
    total: cart.total,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart: cart.clearCart,
    itemCount: cart.items.reduce((total, item) => total + item.quantity, 0)
  }
} 