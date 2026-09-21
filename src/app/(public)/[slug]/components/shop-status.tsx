"use client"

import { useState } from 'react';
import { Clock3, Info, X } from 'lucide-react';
import { useShopStatus } from '../hooks/useShopStatus';

interface ShopStatusProps {
  shopStatusData?: {
    is_open: boolean;
    current_time?: string;
    timezone?: string;
  };
  shopScheduleConfig?: Record<string, string | boolean | null>;
  isDarkHeader?: boolean;
}

export default function ShopStatus({ shopStatusData, shopScheduleConfig, isDarkHeader = false }: ShopStatusProps) {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const { shopStatus, loading } = useShopStatus({
    initialShopStatus: shopStatusData,
    shopScheduleConfig: shopScheduleConfig
  });

  if (loading) {
    return (
      <span
        className="border-l-2 pl-2.5 text-sm font-medium"
        style={{
          borderColor: isDarkHeader ? 'rgba(255,255,255,0.3)' : '#D1D5DB',
          color: isDarkHeader ? 'rgba(255,255,255,0.5)' : '#9CA3AF',
        }}
      >
        Verificando...
      </span>
    );
  }

  const openBorder = isDarkHeader ? '#86EFAC' : '#22C55E';
  const openText = isDarkHeader ? '#86EFAC' : '#16A34A';
  const closedBorder = isDarkHeader ? '#FCA5A5' : '#EF4444';
  const closedText = isDarkHeader ? '#FCA5A5' : '#DC2626';
  const mutedText = isDarkHeader ? 'rgba(255,255,255,0.6)' : undefined;
  const days = [
    ['sunday', 'Domingo'], ['monday', 'Segunda-feira'], ['tuesday', 'Terça-feira'],
    ['wednesday', 'Quarta-feira'], ['thursday', 'Quinta-feira'], ['friday', 'Sexta-feira'],
    ['saturday', 'Sábado'],
  ] as const;
  const todayLabel = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: 'America/Sao_Paulo' }).format(new Date());
  const schedule = shopScheduleConfig || {};
  const formatDay = (day: typeof days[number][0]) => {
    const active = schedule[`${day}_active`];
    const open = schedule[`${day}_open`]?.toString().slice(-5);
    const close = schedule[`${day}_close`]?.toString().slice(-5);
    return active && open && close ? `${open} às ${close}` : 'Fechado';
  };

  return (
    <>
      <div className="flex items-center gap-2 border-l-2 pl-2.5" style={{ borderColor: shopStatus.isOpen ? openBorder : closedBorder }}>
        <div className="text-sm font-semibold" style={{ color: shopStatus.isOpen ? openText : closedText }}>
          <span>{shopStatus.isOpen ? 'Aberto agora' : 'Fechado agora'}</span>
          <span className="ml-1 font-normal" style={{ color: mutedText || '#6B7280' }}>
            · {todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1)}
            {shopStatus.todaySchedule?.active && shopStatus.todaySchedule.open && shopStatus.todaySchedule.close
              ? ` ${shopStatus.todaySchedule.open} às ${shopStatus.todaySchedule.close}`
              : ' · sem atendimento'}
          </span>
        </div>
        <button
          type="button"
          title="Ver horário completo"
          aria-label="Ver horário completo da loja"
          onClick={() => setIsScheduleOpen(true)}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-black/10"
          style={{ color: mutedText || '#6B7280' }}
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      {isScheduleOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4" onClick={() => setIsScheduleOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="shop-hours-title" className="w-full max-w-sm rounded-2xl bg-white p-5 text-gray-900 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock3 className="h-5 w-5 text-emerald-600" />
                <h2 id="shop-hours-title" className="text-lg font-semibold">Horário de funcionamento</h2>
              </div>
              <button type="button" aria-label="Fechar horário" onClick={() => setIsScheduleOpen(false)} className="rounded-full p-1 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-1">
              {days.map(([key, label]) => {
                const isToday = label.toLowerCase() === todayLabel.toLowerCase() || (key === todayLabel.toLowerCase().split('-')[0]);
                return (
                  <div key={key} className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm ${isToday ? 'bg-emerald-50 font-semibold text-emerald-800' : 'text-gray-600'}`}>
                    <span>{label}{isToday ? ' (hoje)' : ''}</span>
                    <span>{formatDay(key)}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-gray-400">Horários no fuso de Brasília (GMT-3).</p>
          </div>
        </div>
      )}
    </>
  );
}
