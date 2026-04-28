"use client"

import { useShopStatus } from '../hooks/useShopStatus';

interface ShopStatusProps {
  shopStatusData?: {
    is_open: boolean;
    current_time?: string;
    timezone?: string;
  };
  shopScheduleConfig?: any;
  isDarkHeader?: boolean;
}

export default function ShopStatus({ shopStatusData, shopScheduleConfig, isDarkHeader = false }: ShopStatusProps) {
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

  return (
    <span
      className="border-l-2 pl-2.5 text-sm font-semibold"
      style={{
        borderColor: shopStatus.isOpen ? openBorder : closedBorder,
        color: shopStatus.isOpen ? openText : closedText,
      }}
    >
      {shopStatus.isOpen ? 'Aberto' : 'Fechado'}
      {!shopStatus.isOpen && shopStatus.nextOpenTime && (
        <span className="font-normal ml-1" style={{ opacity: 0.8, color: mutedText }}>
          · Abre às {shopStatus.nextOpenTime}
        </span>
      )}
    </span>
  );
}
