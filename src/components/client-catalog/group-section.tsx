"use client"

import { useState, useEffect, useCallback, memo } from 'react'
import { Group, Item } from '@/types/client-catalog'
import { ProductCard } from './product-card'
import { AnimatePresence, motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ProductModal } from './product-modal'

interface GroupSectionProps {
  group: Group
  onAddToCart: (id: string, options?: any) => void
  onToggleFavorite: (id: string) => void
}

export const GroupSection = memo(function GroupSection({ group, onAddToCart, onToggleFavorite }: GroupSectionProps) {
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [isExpanded, setIsExpanded] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Item | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const images = [
      group.image,
      ...group.items.map((item: Item) => item.attributes.image_url)
    ].filter(Boolean)

    if (images.length === 0) {
      setImagesLoaded(true)
      return
    }

    const loadImage = (src: string | null) => {
      if (!src) return
      const img = new Image()
      img.onload = () => {
        setLoadedImages(prev => {
          const newSet = new Set(prev)
          newSet.add(src)
          if (newSet.size === images.length) {
            setImagesLoaded(true)
          }
          return newSet
        })
      }
      img.src = src
    }

    images.forEach(loadImage)
  }, [group])

  const handleAddToCart = useCallback((product: Item) => {
    if (
      product.attributes.item_type !== 'weight' &&
      !product.attributes.extra?.data?.length &&
      !product.attributes.prepare_method?.data?.length &&
      !product.attributes.steps?.data?.length
    ) {
      onAddToCart(product.id)
    } else {
      setSelectedProduct(product)
      setIsModalOpen(true)
    }
  }, [onAddToCart])

  if (!imagesLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4 mt-4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
              <Skeleton className="h-6 w-1/3 mt-4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <section className="space-y-8">
      <div
        className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm cursor-pointer hover:scale-[1.01] transition-transform duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {group.image ? (
          <img
            src={group.image}
            alt={group.name}
            className="h-16 w-16 rounded-xl object-cover"
          />
        ) : (
          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <span className="text-primary/50 text-2xl font-bold">
              {group.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{group.name}</h3>
          <p className="text-gray-500">{group.description}</p>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-6 w-6 text-gray-400 transition-transform duration-200" />
        ) : (
          <ChevronDown className="h-6 w-6 text-gray-400 transition-transform duration-200" />
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {group.items.map((item: Item) => (
              <ProductCard
                key={item.id}
                product={item}
                onAddToCart={() => handleAddToCart(item)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddToCart={(options) => {
            onAddToCart(selectedProduct.id, options)
            setIsModalOpen(false)
          }}
        />
      )}
    </section>
  )
})
