"use client"

import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from './cart-context'

interface CartButtonProps {
  variant?: 'header' | 'floating'
}

export function CartButton({ variant = 'header' }: CartButtonProps) {
  const { totalItems } = useCart()

  return (
    <>
      {/* Desktop */}
      <Button
        variant="outline"
        className="hidden md:flex items-center gap-2 border-gray-200 text-foreground hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 relative h-9 px-3 rounded-lg"
      >
        <ShoppingCart className="h-4 w-4" />
        <span className="text-sm font-medium">Carrinho</span>
        {totalItems > 0 && (
          <span className="ml-0.5 h-5 min-w-5 px-1 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
            {totalItems}
          </span>
        )}
      </Button>

      {/* Mobile Header */}
      {variant === 'header' && (
        <Button
          variant="outline"
          size="icon"
          className="md:hidden h-9 w-9 rounded-lg border-gray-200 text-muted-foreground hover:text-foreground hover:bg-gray-50 relative"
        >
          <ShoppingCart className="h-4 w-4" />
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-primary text-white text-[9px] font-bold">
              {totalItems}
            </span>
          )}
        </Button>
      )}

      {/* Mobile Floating */}
      {variant === 'floating' && (
        <Button
          variant="default"
          size="icon"
          className="md:hidden fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-colors"
        >
          <ShoppingCart className="h-6 w-6 text-white" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-white text-primary text-[10px] font-bold">
              {totalItems}
            </span>
          )}
        </Button>
      )}
    </>
  )
}
