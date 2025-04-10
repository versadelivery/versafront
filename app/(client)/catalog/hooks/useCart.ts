import { useCartStore, CartItem } from '../store/cart.store'

export function useCart() {
  const store = useCartStore()

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    store.addItem({ ...item, quantity: 1 })
  }

  const removeFromCart = (itemId: string) => {
    store.removeItem(itemId)
  }

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      store.removeItem(itemId)
      return
    }
    store.updateQuantity(itemId, quantity)
  }

  return {
    items: store.items,
    total: store.total,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart: store.clearCart,
    itemCount: store.items.reduce((total, item) => total + item.quantity, 0)
  }
} 