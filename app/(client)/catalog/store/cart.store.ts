import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  total: number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const currentItems = get().items
        const existingItem = currentItems.find((i) => i.id === item.id)

        if (existingItem) {
          set({
            items: currentItems.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          })
        } else {
          set({ items: [...currentItems, { ...item, quantity: 1 }] })
        }
      },
      removeItem: (itemId) => {
        set({ items: get().items.filter((item) => item.id !== itemId) })
      },
      updateQuantity: (itemId, quantity) => {
        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        })
      },
      clearCart: () => {
        set({ items: [] })
      },
      get total() {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'cart-storage',
    }
  )
) 