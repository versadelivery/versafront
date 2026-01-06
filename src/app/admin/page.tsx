"use client";

import { AdminBanner } from "@/components/admin/admin-banner";
import { UrlCard } from "@/components/admin/url-card";
import { AdminDashboardCard } from "@/components/admin/card";
import { dashboardCards } from "./utils";
import bannerImg from "../../../public/img/hero-admin.jpg";
import { useShop } from "@/hooks/use-shop";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSchedule, WeekSchedule } from "@/app/admin/settings/general/hooks/useSchedule";

export default function AdminDashboard() {
  const { shop, isLoading } = useShop();
  const { schedule, loading: loadingSchedule, isUpdating: isUpdatingSchedule, updateSchedule } = useSchedule();
  const [isToggling, setIsToggling] = useState(false);

  const dayKeys = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday'
  ] as const;

  const todayKey = dayKeys[new Date().getDay()] as keyof WeekSchedule;
  const todaySchedule = schedule ? schedule[todayKey] : null;
  const isActiveToday = !!(todaySchedule && todaySchedule.active);

  // Calcular se a loja está aberta agora baseado no horário (aproximação para o admin)
  const isWithinHours = () => {
    if (!todaySchedule || !todaySchedule.active) return false;
    
    // Pegar horário de Brasília para consistência com o backend
    const now = new Date();
    const brasiliaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const currentMinutes = brasiliaTime.getHours() * 60 + brasiliaTime.getMinutes();
    
    const [openH, openM] = todaySchedule.open.split(':').map(Number);
    const [closeH, closeM] = todaySchedule.close.split(':').map(Number);
    
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    
    if (closeMinutes < openMinutes) { // Atravessa meia-noite
      return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
    }
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  };

  const isReallyOpenNow = isWithinHours();

  const toggleTodayOpen = async () => {
    if (!schedule) return;
    setIsToggling(true);
    try {
      const newSchedule = {
        ...schedule,
        [todayKey]: { ...schedule[todayKey], active: !isActiveToday }
      };
      await updateSchedule(newSchedule as any);
    } catch (err) {
      console.error('Erro ao atualizar status da loja', err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <AdminBanner bannerImg={bannerImg}>
        {/* Overlay control placed over the banner for stronger visual hierarchy */}
        <div className="absolute right-6 top-6 z-30">
          <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 shadow-md border border-border flex items-center gap-3">
            <div className="min-w-[120px]">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isActiveToday ? (isReallyOpenNow ? 'bg-green-500' : 'bg-orange-500') : 'bg-red-500'}`} />
                <p className="text-sm font-semibold">
                  {loadingSchedule || !schedule 
                    ? 'Carregando...' 
                    : isActiveToday 
                      ? (isReallyOpenNow ? 'Aberta agora' : 'Fechada (fora do horário)') 
                      : 'Fechada hoje'}
                </p>
              </div>
              {!loadingSchedule && todaySchedule && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isActiveToday 
                    ? `${todaySchedule.open} às ${todaySchedule.close}`
                    : 'Dia desativado'}
                </p>
              )}
            </div>
            <Button
              size="sm"
              variant={isActiveToday ? 'destructive' : 'default'}
              className={isActiveToday ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              onClick={toggleTodayOpen}
              disabled={loadingSchedule || isUpdatingSchedule || isToggling}
            >
              {isToggling || isUpdatingSchedule ? '...' : isActiveToday ? 'Desativar Hoje' : 'Ativar Hoje'}
            </Button>
          </div>
        </div>
      </AdminBanner>
      <div className="max-w-2xl mx-auto px-4 -mt-10 z-20 relative border-none">
        <UrlCard
          url={`${process.env.NEXT_PUBLIC_SHOP_DOMAIN}/${shop?.slug}`}
          isLoading={isLoading}
        />
      </div>
      <div className="max-w-full mx-auto py-6 px-2 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {dashboardCards.map((card, index) => (
            <div key={index}>
              <AdminDashboardCard {...card} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}