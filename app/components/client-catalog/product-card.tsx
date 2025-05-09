"use client"

import { useState } from 'react'
import { Heart, ShoppingCart, Package, PlusCircle } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { Item } from '@/app/types/client-catalog'
import { ProductModal } from './product-modal'

interface ProductCardProps {
  product: Item
  onAddToCart: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export function ProductCard({ product, onAddToCart, onToggleFavorite }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const hasDiscount = product.attributes.price_with_discount !== null
  const hasExtras = product.attributes.extra.data.length > 0
  const hasSteps = product.attributes.steps.data.length > 0
  const hasWeight = product.attributes.item_type === 'weight'

  return (
    <>
      <motion.div 
        className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -5 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative aspect-square overflow-hidden">
          {product.attributes.image_url ? (
            <motion.img
              src={product.attributes.image_url}
              alt={product.attributes.name}
              className="h-full w-full object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <motion.div
              className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"
              animate={{
                background: [
                  'linear-gradient(45deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.1))',
                  'linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.2))',
                  'linear-gradient(45deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.1))',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <span className="text-primary/50 text-4xl font-bold">
                {product.attributes.name.charAt(0).toUpperCase()}
              </span>
            </motion.div>
          )}
          
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/20 flex items-center justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white p-3 rounded-full shadow-lg"
                >
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

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
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggleFavorite(product.id)}
              className={`p-1 rounded-full transition-colors flex-shrink-0 ${
                product.isFavorite
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              <Heart className="h-5 w-5" fill={product.isFavorite ? 'currentColor' : 'none'} />
            </motion.button>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <motion.p 
                className="text-lg font-semibold text-gray-900"
                whileHover={{ scale: 1.05 }}
              >
                R$ {hasDiscount ? product.attributes.price_with_discount : product.attributes.price}
              </motion.p>
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
      </motion.div>

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
} 