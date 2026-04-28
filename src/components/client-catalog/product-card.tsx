"use client"

import { memo, useState } from 'react'
import { Heart, ShoppingCart, Package, PlusCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Item } from '@/types/client-catalog'
import { ProductModal } from './product-modal'
import { fixImageUrl } from "@/utils/image-url";

interface ProductCardProps {
  product: Item
  onAddToCart: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export const ProductCard = memo(function ProductCard({ product, onAddToCart, onToggleFavorite }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const hasDiscount = product.attributes.price_with_discount !== null
  const hasExtras = product.attributes.extra.data.length > 0
  const hasSteps = product.attributes.steps.data.length > 0
  const hasWeight = product.attributes.item_type === 'weight'

  return (
    <>
      <div
        className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square overflow-hidden">
          {product.attributes.image_url ? (
            <img
              src={fixImageUrl(product.attributes.image_url) || ''}
              alt={product.attributes.name}
              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <span className="text-primary/50 text-4xl font-bold">
                {product.attributes.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {isHovered && (
            <div
              className="absolute inset-0 bg-black/20 flex items-center justify-center animate-in fade-in duration-200"
            >
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-white p-3 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform"
              >
                <ShoppingCart className="h-6 w-6 text-primary" />
              </button>
            </div>
          )}

          <div className="absolute top-2 right-2 flex flex-col gap-2">
            {hasDiscount && (
              <Badge variant="default" className="bg-red-500 hover:bg-red-600">
                {Math.round(((parseFloat(product.attributes.price) - parseFloat(product.attributes.price_with_discount!)) / parseFloat(product.attributes.price)) * 100)}% OFF
              </Badge>
            )}
            {hasExtras && (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                <PlusCircle className="h-3 w-3 mr-1" />
                Extras
              </Badge>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">{product.attributes.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">{product.attributes.description}</p>
            </div>
            <button
              onClick={() => onToggleFavorite(product.id)}
              className={`p-1 rounded-full transition-colors flex-shrink-0 hover:scale-110 active:scale-95 transition-transform ${
                product.isFavorite
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              <Heart className="h-5 w-5" fill={product.isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-lg font-semibold text-gray-900">
                R$ {hasDiscount ? product.attributes.price_with_discount : product.attributes.price}
              </p>
              {hasDiscount && (
                <p className="text-sm text-gray-500 line-through">
                  R$ {product.attributes.price}
                </p>
              )}
            </div>

            {hasSteps && (
              <Badge variant="secondary" className="text-xs">
                {product.attributes.steps.data.length} etapas
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            {hasWeight && (
              <>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span>
                    {product.attributes.min_weight} - {product.attributes.max_weight} {product.attributes.unit_of_measurement}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Intervalo: {product.attributes.measure_interval}</span>
                </div>
              </>
            )}
          </div>

          {hasExtras && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                {product.attributes.extra.data.length} opções de extras disponíveis
              </p>
            </div>
          )}
        </div>
      </div>

      <ProductModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={(options) => {
          onAddToCart(product.id)
          setIsModalOpen(false)
        }}
      />
    </>
  )
})
