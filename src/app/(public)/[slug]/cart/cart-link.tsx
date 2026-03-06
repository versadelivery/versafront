"use client"

import { ShoppingCart } from 'lucide-react'
import { useCart } from './cart-context'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export function CartLink() {
  const { totalItems } = useCart()
  const params = useParams()
  const slug = params.slug as string

  return (
    <>
      {/* Desktop */}
      <Link
        href={`/${slug}/carrinho`}
        className="hidden md:flex items-center gap-2 border border-[#E5E2DD] rounded-md text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-all duration-150 relative h-10 px-4 text-sm font-medium"
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
        className="md:hidden flex items-center justify-center h-10 w-10 border border-[#E5E2DD] rounded-md text-gray-500 hover:text-gray-900 hover:border-gray-400 relative transition-all duration-150"
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
