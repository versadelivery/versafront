'use client';

import { Store, Truck } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useOrderTypeAvailability } from '@/hooks/use-order-type-availability';
import { OrderType, canTurnOff } from '@/lib/order-type-availability';

const OPTIONS: { type: OrderType; label: string; icon: typeof Truck }[] = [
  { type: 'delivery', label: 'Entrega', icon: Truck },
  { type: 'pickup', label: 'Retirada', icon: Store },
];

const LAST_ONE_HINT = 'Deixe pelo menos uma opção ligada';

// Liga/desliga entrega e retirada para os pedidos dos clientes. Salva na hora.
export function OrderTypeToggles({ className }: { className?: string }) {
  const { availability, isLoading, isSaving, setAvailable } = useOrderTypeAvailability();

  return (
    <div className={cn('grid grid-cols-2 gap-2', className)} role="group" aria-label="Atendimento aos clientes">
      {OPTIONS.map(({ type, label, icon: Icon }) => {
        const on = availability?.[type] ?? true;
        const blocked = !!availability && on && !canTurnOff(type, availability);
        const id = `order-type-${type}`;

        return (
          <label
            key={type}
            htmlFor={id}
            title={blocked ? LAST_ONE_HINT : undefined}
            className={cn(
              'flex items-center justify-between gap-3 rounded-md border px-3 py-2 transition-colors',
              on ? 'border-green-200 bg-green-50' : 'border-[#E5E2DD] bg-white',
              blocked ? 'cursor-not-allowed' : 'cursor-pointer'
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <Icon className={cn('h-4 w-4 shrink-0', on ? 'text-green-700' : 'text-muted-foreground')} aria-hidden />
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-tight text-gray-900">{label}</span>
                <span className={cn('block text-xs leading-tight', on ? 'text-green-700' : 'text-muted-foreground')}>
                  {on ? 'Ligada' : 'Desligada'}
                </span>
              </span>
            </span>
            <Switch
              id={id}
              checked={on}
              disabled={isLoading || isSaving || blocked}
              onCheckedChange={(checked) => setAvailable(type, checked)}
              aria-label={`${label}: ${on ? 'ligada' : 'desligada'}`}
            />
          </label>
        );
      })}
    </div>
  );
}
