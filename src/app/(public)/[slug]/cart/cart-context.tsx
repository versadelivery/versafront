"use client"

import { createContext, useContext, useState, useMemo, useCallback, ReactNode, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CatalogItem } from '../types'

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

interface CartContextType {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateItemQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  clearAllCarts: () => void
  getCurrentShopSlug: () => string
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function arraysEqual(a?: string[], b?: string[]): boolean {
  if (!a && !b) return true
  if (!a || !b) return false
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

function optionsEqual(a?: Record<string, string>, b?: Record<string, string>): boolean {
  if (!a && !b) return true
  if (!a || !b) return false
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  for (const key of keysA) {
    if (a[key] !== b[key]) return false
  }
  return true
}

export function CartProvider({ children }: { children: ReactNode }) {
  const params = useParams()
  const slug = params.slug as string

  const migrateCartIds = (cartItems: CartItem[]) =>
    cartItems.map(item => item.cartId ? item : { ...item, cartId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}` })

  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const cartKey = `cart_${slug}`
      const savedCart = localStorage.getItem(cartKey)
      return savedCart ? migrateCartIds(JSON.parse(savedCart)) : []
    }
    return []
  })

  useEffect(() => {
    if (slug) {
      const cartKey = `cart_${slug}`
      localStorage.setItem(cartKey, JSON.stringify(items))
    }
  }, [items, slug])

  // Carregar carrinho quando o slug mudar
  useEffect(() => {
    if (slug && typeof window !== 'undefined') {
      const cartKey = `cart_${slug}`
      const savedCart = localStorage.getItem(cartKey)
      const cartData = savedCart ? migrateCartIds(JSON.parse(savedCart)) : []
      setItems(cartData)
    }
  }, [slug])

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )
  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.totalPrice, 0),
    [items]
  )

  const generateCartId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  const addItem = useCallback((newItem: CartItem) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.id === newItem.id &&
        arraysEqual(item.selectedExtras, newItem.selectedExtras) &&
        optionsEqual(item.selectedOptions, newItem.selectedOptions) &&
        arraysEqual(item.selectedSharedComplements, newItem.selectedSharedComplements) &&
        item.weight === newItem.weight
      )
      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
          totalPrice: updatedItems[existingItemIndex].totalPrice + newItem.totalPrice
        }
        return updatedItems
      }

      return [...prevItems, { ...newItem, cartId: newItem.cartId || generateCartId() }]
    })
  }, [])

  const removeItem = useCallback((cartId: string) => {
    setItems(prevItems => {
      // Tenta remover por cartId primeiro; fallback para id (compatibilidade com itens antigos)
      const byCartId = prevItems.filter(item => item.cartId !== cartId)
      if (byCartId.length < prevItems.length) return byCartId
      return prevItems.filter(item => item.id !== cartId)
    })
  }, [])

  const updateItemQuantity = useCallback((cartId: string, quantity: number) => {
    if (quantity < 1) return

    setItems(prevItems =>
      prevItems.map(item =>
        (item.cartId === cartId || item.id === cartId)
          ? {
              ...item,
              quantity,
              totalPrice: (item.totalPrice / item.quantity) * quantity
            }
          : item
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const clearAllCarts = useCallback(() => {
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('cart_')) {
          localStorage.removeItem(key)
        }
      })
      setItems([])
    }
  }, [])

  const getCurrentShopSlug = useCallback(() => {
    return slug || ''
  }, [slug])

  const value = useMemo(() => ({
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    clearAllCarts,
    getCurrentShopSlug
  }), [items, totalItems, totalPrice, addItem, removeItem, updateItemQuantity, clearCart, clearAllCarts, getCurrentShopSlug])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
