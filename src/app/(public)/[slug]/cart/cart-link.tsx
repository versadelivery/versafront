"use client"

import { ShoppingCart } from 'lucide-react'
import { useCart } from './cart-context'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export function CartLink({ isDarkHeader = false }: { isDarkHeader?: boolean }) {
  const { totalItems } = useCart()
  const params = useParams()
  const slug = params.slug as string

  const borderStyle = isDarkHeader ? 'rgba(255,255,255,0.25)' : '#E5E2DD'
  const textStyle = isDarkHeader ? 'rgba(255,255,255,0.85)' : undefined

  return (
    <>
      {/* Desktop */}
      <Link
        href={`/${slug}/carrinho`}
        className="hidden md:flex items-center gap-2 rounded-md transition-all duration-150 relative h-10 px-4 text-sm font-medium cursor-pointer"
        style={{
          borderWidth: '1px',
          borderColor: borderStyle,
          color: textStyle || '#374151',
        }}
      >
        <ShoppingCart className="h-5 w-5" />
        <span>Carrinho</span>
        {totalItems > 0 && (
          <span className="ml-0.5 rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center bg-primary text-white text-[10px] font-bold">
            {totalItems}
          </span>
        )}
      </Link>

      {/* Mobile */}
      <Link
        href={`/${slug}/carrinho`}
        className="md:hidden flex items-center justify-center h-10 w-10 rounded-md relative transition-all duration-150 cursor-pointer"
        style={{
          borderWidth: '1px',
          borderColor: borderStyle,
          color: textStyle || '#6B7280',
        }}
      >
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute rounded-full -top-1.5 -right-1.5 h-[18px] w-[18px] flex items-center justify-center bg-primary text-white text-[9px] font-bold">
            {totalItems}
          </span>
        )}
      </Link>
    </>
  )
}
