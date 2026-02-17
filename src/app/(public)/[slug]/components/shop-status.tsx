"use client"

import { useShopStatus } from '../hooks/useShopStatus';

interface ShopStatusProps {
  shopStatusData?: {
    is_open: boolean;
    current_time?: string;
    timezone?: string;
  };
  shopScheduleConfig?: any;
}

export default function ShopStatus({ shopStatusData, shopScheduleConfig }: ShopStatusProps) {
  const { shopStatus, loading } = useShopStatus({
    initialShopStatus: shopStatusData,
    shopScheduleConfig: shopScheduleConfig
  });

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
        Verificando...
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
      shopStatus.isOpen
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-600'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
        shopStatus.isOpen ? 'bg-green-500' : 'bg-red-500'
      }`} />
      {shopStatus.isOpen ? 'Aberto' : 'Fechado'}
      {!shopStatus.isOpen && shopStatus.nextOpenTime && (
        <span className="font-normal opacity-80">· Abre às {shopStatus.nextOpenTime}</span>
      )}
    </span>
  );
}
