import { useQuery } from "@tanstack/react-query"
import { getSchedulingSlots } from "@/services/scheduling-service"

interface Options {
  shopId?: number | string
  withdrawal?: boolean
  admin?: boolean
  enabled?: boolean
}

// Horários mudam com o relógio (antecedência mínima): atualiza a cada minuto e ao voltar para a aba
export function useSchedulingSlots({ shopId, withdrawal, admin = false, enabled = true }: Options) {
  return useQuery({
    queryKey: ["scheduling-slots", shopId ?? "mine", withdrawal ?? "any", admin],
    queryFn: () => getSchedulingSlots({ shopId, withdrawal, admin }),
    enabled: enabled && (admin || shopId !== undefined),
    staleTime: 30_000,
    // trocar entre entrega e retirada não pode piscar o cartão de agendamento
    placeholderData: (previous) => previous,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })
}
