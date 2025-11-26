"use client"

import { useShopStatus } from '../hooks/useShopStatus';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-gray-500/20 text-gray-100 border border-gray-400/30">
        <Clock className="w-4 h-4 animate-pulse" />
        <span>Verificando...</span>
      </div>
    );
  }

  return (
    <motion.div 
      className="flex flex-col gap-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Status Atual */}
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
        shopStatus.isOpen 
          ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
          : 'bg-red-500/20 text-red-100 border border-red-400/30'
      }`}>
        {shopStatus.isOpen ? (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Aberto agora</span>
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4" />
            <span>Fechado</span>
            {shopStatus.nextOpenTime && (
              <span className="text-xs opacity-80">
                • Abre às {shopStatus.nextOpenTime}
              </span>
            )}
          </>
        )}
      </div>

      {/* Horário de Hoje */}
      {shopStatus.todaySchedule && (
        <div className="flex items-center gap-2 text-white/80">
          <Clock className="w-3 h-3" />
          <span className="text-xs">
            {shopStatus.todaySchedule.active 
              ? `Hoje: ${shopStatus.todaySchedule.open} às ${shopStatus.todaySchedule.close}`
              : 'Fechado hoje'
            }
          </span>
        </div>
      )}
    </motion.div>
  );
}
