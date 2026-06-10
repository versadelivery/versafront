"use client"

import { useShopStatus } from '../hooks/useShopStatus';

interface ShopStatusProps {
  shopStatusData?: {
    is_open: boolean;
    today_open?: string | null;
    today_close?: string | null;
    current_time?: string;
    timezone?: string;
  };
  shopScheduleConfig?: any;
  isDarkHeader?: boolean;
}

export default function ShopStatus({ shopStatusData, shopScheduleConfig, isDarkHeader = false }: ShopStatusProps) {
  const { shopStatus, loading } = useShopStatus({
    initialShopStatus: shopStatusData,
    shopScheduleConfig,
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

  const openBorder  = isDarkHeader ? '#86EFAC' : '#22C55E';
  const openText    = isDarkHeader ? '#86EFAC' : '#16A34A';
  const closedBorder = isDarkHeader ? '#FCA5A5' : '#EF4444';
  const closedText   = isDarkHeader ? '#FCA5A5' : '#DC2626';
  const mutedColor   = isDarkHeader ? 'rgba(255,255,255,0.6)' : undefined;

  return (
    <span
      className="border-l-2 pl-2.5 text-sm font-semibold"
      style={{
        borderColor: shopStatus.isOpen ? openBorder : closedBorder,
        color: shopStatus.isOpen ? openText : closedText,
      }}
    >
      {shopStatus.isOpen ? 'Aberto' : 'Fechado'}
      {shopStatus.isOpen && shopStatus.todayClose && (
        <span className="font-normal ml-1" style={{ opacity: 0.8, color: mutedColor }}>
          · Fecha às {shopStatus.todayClose}
        </span>
      )}
      {!shopStatus.isOpen && shopStatus.todayOpen && (
        <span className="font-normal ml-1" style={{ opacity: 0.8, color: mutedColor }}>
          · Abre às {shopStatus.todayOpen}
        </span>
      )}
    </span>
  );
}
