import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deliveryOrdersService } from '@/services/delivery-orders-service'
import { toast } from 'sonner'

export function useDeliveryOrders() {
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['delivery-orders'],
    queryFn: () => deliveryOrdersService.getOrders(),
    refetchInterval: 30_000,
  })

  const updateStatus = useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string
      status: 'left_for_delivery' | 'delivered'
    }) => deliveryOrdersService.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] })
      toast.success('Pedido atualizado!')
    },
    onError: () => {
      toast.error('Erro ao atualizar pedido')
    },
  })

  const orders = data?.data ?? []
  const ready = orders.filter((o) => o.attributes.status === 'ready')
  const inTransit = orders.filter((o) => o.attributes.status === 'left_for_delivery')
  const delivered = orders.filter((o) => o.attributes.status === 'delivered')

  return {
    orders,
    ready,
    inTransit,
    delivered,
    isLoading,
    refetch,
    updateStatus: updateStatus.mutate,
    isUpdating: updateStatus.isPending,
  }
}
