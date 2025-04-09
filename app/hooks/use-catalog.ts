import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { Group } from '../types/client-catalog'
import { notFound, useRouter } from 'next/navigation'
import { ShopResponse } from '../types/client-catalog'

export function useCatalog(slug: string) {
  const router = useRouter()

  return useQuery<Group[]>({
    queryKey: ['catalog', slug],
    queryFn: async () => {
      try {
        const { data } = await api.get<ShopResponse>(`/customers/shops/${slug}`)
        
        if (!data?.data?.attributes?.catalog_groups?.data) {
          notFound()
        }

        return data.data.attributes.catalog_groups.data.map(group => ({
          id: group.id,
          type: group.type,
          name: group.attributes.name,
          description: group.attributes.description,
          image: group.attributes.image_url || '',
          order: group.attributes.priority,
          isActive: true,
          items: group.attributes.items.map(item => ({
            id: item.data.id,
            type: item.data.type,
            attributes: {
              name: item.data.attributes.name,
              description: item.data.attributes.description,
              item_type: item.data.attributes.item_type,
              unit_of_measurement: item.data.attributes.unit_of_measurement,
              price: item.data.attributes.price,
              price_with_discount: item.data.attributes.price_with_discount,
              measure_interval: item.data.attributes.measure_interval,
              min_weight: item.data.attributes.min_weight,
              max_weight: item.data.attributes.max_weight,
              priority: item.data.attributes.priority,
              image_url: item.data.attributes.image_url,
              extra: item.data.attributes.extra,
              prepare_method: item.data.attributes.prepare_method,
              steps: item.data.attributes.steps
            },
            isFavorite: false
          }))
        }))
      } catch (error) {
        console.error('Error fetching catalog:', error)
        router.push('/catalog/not-found')
        notFound()
      }
    },
    enabled: !!slug,
    retry: false
  })
} 