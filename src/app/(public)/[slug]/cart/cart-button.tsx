"use client"

import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from './cart-context'
import { Badge } from '@/components/ui/badge'

interface CartButtonProps {
  variant?: 'header' | 'floating'
}

export function CartButton({ variant = 'header' }: CartButtonProps) {
  const { totalItems } = useCart()

  return (
    <>
      {/* Desktop Version */}
      <Button 
        variant="outline" 
        className="hidden md:flex w-full bg-transparent border-white text-white hover:bg-white hover:text-black text-lg font-semibold py-5 px-8 rounded-xs shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 group"
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="font-semibold">Carrinho</span>
        {totalItems > 0 && (
          <Badge className="h-5 w-5 flex items-center justify-center p-0 rounded-full">
            {totalItems}
          </Badge>
        )}
      </Button>

      {/* Mobile Header Version */}
      {variant === 'header' && (
        <Button 
          variant="default" 
          size="icon"
          className="md:hidden h-10 w-10 rounded-lg bg-primary hover:bg-primary/90 transition-colors relative"
        >
          <ShoppingCart className="h-5 w-5 text-white" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-white text-primary border-2 border-primary text-[10px] font-bold">
              {totalItems}
            </Badge>
          )}
        </Button>
      )}

      {/* Mobile Floating Version */}
      {variant === 'floating' && (
        <Button 
          variant="default" 
          size="icon"
          className="md:hidden fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-colors"
        >
          <ShoppingCart className="h-6 w-6 text-white" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-white text-primary">
              {totalItems}
            </Badge>
          )}
        </Button>
      )}
    </>
  )
}