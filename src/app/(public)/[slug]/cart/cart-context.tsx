"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CatalogItem } from '../types'

interface CartItem extends CatalogItem {
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

export function CartProvider({ children }: { children: ReactNode }) {
  const params = useParams()
  const slug = params.slug as string

  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const cartKey = `cart_${slug}`
      const savedCart = localStorage.getItem(cartKey)
      return savedCart ? JSON.parse(savedCart) : []
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
      const cartData = savedCart ? JSON.parse(savedCart) : []
      setItems(cartData)
    }
  }, [slug])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0)

  const addItem = (newItem: CartItem) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.id === newItem.id && 
        JSON.stringify(item.selectedExtras) === JSON.stringify(newItem.selectedExtras) &&
        JSON.stringify(item.selectedOptions) === JSON.stringify(newItem.selectedOptions) &&
        JSON.stringify(item.selectedSharedComplements) === JSON.stringify(newItem.selectedSharedComplements)
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
      
      return [...prevItems, newItem]
    })
  }

  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id))
  }

  const updateItemQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id
          ? {
              ...item,
              quantity,
              totalPrice: (item.totalPrice / item.quantity) * quantity
            }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const clearAllCarts = () => {
    if (typeof window !== 'undefined') {
      // Remove todos os carrinhos do localStorage
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('cart_')) {
          localStorage.removeItem(key)
        }
      })
      setItems([])
    }
  }

  const getCurrentShopSlug = () => {
    return slug || ''
  }

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        clearAllCarts,
        getCurrentShopSlug
      }}
    >
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