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
      <span className="border-l-2 border-gray-300 pl-2.5 text-sm font-medium text-gray-400">
        Verificando...
      </span>
    );
  }

  return (
    <span className={`border-l-2 pl-2.5 text-sm font-semibold ${
      shopStatus.isOpen
        ? 'border-green-500 text-green-600'
        : 'border-red-500 text-red-600'
    }`}>
      {shopStatus.isOpen ? 'Aberto' : 'Fechado'}
      {!shopStatus.isOpen && shopStatus.nextOpenTime && (
        <span className="font-normal ml-1 opacity-80">· Abre às {shopStatus.nextOpenTime}</span>
      )}
    </span>
  );
}
