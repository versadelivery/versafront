import { useCallback, useEffect, useState } from "react";

export interface ShopStatus {
  isOpen: boolean;
  todayOpen: string | null;
  todayClose: string | null;
}

interface UseShopStatusOptions {
  initialShopStatus?: {
    is_open: boolean;
    today_open?: string | null;
    today_close?: string | null;
    current_time?: string;
    timezone?: string;
  };
  shopScheduleConfig?: any;
}

export function useShopStatus(options?: UseShopStatusOptions) {
  const [shopStatus, setShopStatus] = useState<ShopStatus>({
    isOpen: options?.initialShopStatus?.is_open ?? false,
    todayOpen: options?.initialShopStatus?.today_open ?? null,
    todayClose: options?.initialShopStatus?.today_close ?? null,
  });
  const [loading] = useState(false);

  useEffect(() => {
    if (options?.initialShopStatus === undefined) return;

    setShopStatus({
      isOpen: options.initialShopStatus.is_open,
      todayOpen: options.initialShopStatus.today_open ?? null,
      todayClose: options.initialShopStatus.today_close ?? null,
    });
  }, [
    options?.initialShopStatus?.is_open,
    options?.initialShopStatus?.today_open,
    options?.initialShopStatus?.today_close,
  ]);

  const refetch = useCallback(() => undefined, []);

  return { shopStatus, loading, refetch };
}
