"use client";

import { AdminBanner } from "@/components/admin/admin-banner";
import { UrlCard } from "@/components/admin/url-card";
import { AdminDashboardCard } from "@/components/admin/card";
import { dashboardCards } from "./utils";
import bannerImg from "../../../public/img/hero-admin.jpg";
import { useShop } from "@/hooks/use-shop";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { useSchedule, WeekSchedule } from "@/app/admin/settings/general/hooks/useSchedule";

const PRICING_TIERS = [
  ['Verde', 'Até R$ 799,99', 'Grátis'],
  ['Amarelo', 'R$ 800 a R$ 2.999,99', 'R$ 29/mês'],
  ['Azul', 'R$ 3.000 a R$ 7.999,99', 'R$ 59/mês'],
  ['Branco', 'R$ 8.000 a R$ 19.999,99', 'R$ 99/mês'],
  ['Prata', 'R$ 20.000 a R$ 49.999,99', 'R$ 149/mês'],
  ['Ouro', 'R$ 50.000 a R$ 119.999,99', 'R$ 219/mês'],
  ['Black', 'A partir de R$ 120.000', 'R$ 299/mês'],
] as const;

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
  const yesterdayKey = dayKeys[(new Date().getDay() + 6) % 7] as keyof WeekSchedule;
  const todaySchedule = schedule ? schedule[todayKey] : null;
  const yesterdaySchedule = schedule ? schedule[yesterdayKey] : null;
  const isActiveToday = !!(todaySchedule && todaySchedule.active);

  // Calcular se a loja está aberta agora baseado no horário (aproximação para o admin)
  const isWithinHours = () => {
    // Pegar horário de Brasília para consistência com o backend
    const now = new Date();
    const brasiliaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const currentMinutes = brasiliaTime.getHours() * 60 + brasiliaTime.getMinutes();

    // Verifica o horário de hoje
    if (todaySchedule && todaySchedule.active) {
      const [openH, openM] = todaySchedule.open.split(':').map(Number);
      const [closeH, closeM] = todaySchedule.close.split(':').map(Number);
      const openMinutes = openH * 60 + openM;
      const closeMinutes = closeH * 60 + closeM;
      if (closeMinutes < openMinutes) {
        if (currentMinutes >= openMinutes) return true;
      } else {
        if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) return true;
      }
    }

    // Verifica se o horário de ontem cruzava meia-noite e ainda estamos dentro
    if (yesterdaySchedule && yesterdaySchedule.active) {
      const [yOpenH, yOpenM] = yesterdaySchedule.open.split(':').map(Number);
      const [yCloseH, yCloseM] = yesterdaySchedule.close.split(':').map(Number);
      const yOpenMinutes = yOpenH * 60 + yOpenM;
      const yCloseMinutes = yCloseH * 60 + yCloseM;
      if (yCloseMinutes < yOpenMinutes && currentMinutes <= yCloseMinutes) {
        return true;
      }
    }

    return false;
  };

  // O status do servidor é a fonte de verdade usada para aceitar pedidos.
  // O cálculo local fica apenas como fallback enquanto a loja ainda carrega.
  const isReallyOpenNow = shop?.shop_status?.is_open ?? isWithinHours();

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
                <div className={`w-2 h-2 rounded-full ${isReallyOpenNow ? 'bg-green-500' : isActiveToday ? 'bg-orange-500' : 'bg-red-500'}`} />
                <p className="text-sm font-semibold">
                  {loadingSchedule || !schedule
                    ? 'Carregando...'
                    : isReallyOpenNow
                      ? 'Aberta agora'
                      : isActiveToday
                        ? 'Fechada (fora do horário)'
                        : 'Fechada hoje'}
                </p>
              </div>
              {!loadingSchedule && (todaySchedule || (isReallyOpenNow && yesterdaySchedule)) && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {(() => {
                    if (isReallyOpenNow && !isActiveToday && yesterdaySchedule?.active) {
                      return `${yesterdaySchedule.open} às ${yesterdaySchedule.close}`;
                    }
                    if (isReallyOpenNow && isActiveToday && todaySchedule) {
                      const now = new Date();
                      const brasiliaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
                      const currentMinutes = brasiliaTime.getHours() * 60 + brasiliaTime.getMinutes();
                      const [openH, openM] = todaySchedule.open.split(':').map(Number);
                      if (currentMinutes < openH * 60 + openM && yesterdaySchedule?.active) {
                        return `${yesterdaySchedule.open} às ${yesterdaySchedule.close}`;
                      }
                      return `${todaySchedule.open} às ${todaySchedule.close}`;
                    }
                    if (isActiveToday && todaySchedule) return `${todaySchedule.open} às ${todaySchedule.close}`;
                    return 'Dia desativado';
                  })()}
                </p>
              )}
              {shop?.billing_status && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: shop.billing_status.color }}
                    aria-hidden="true"
                  />
                  Faixa: <span className="font-medium text-foreground">{shop.billing_status.name}</span>
                  {' - '}
                  {shop.billing_status.amount === 0
                    ? 'Grátis'
                    : `R$ ${shop.billing_status.amount}/mês`}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="Ver tabela de faixas de preço"
                        className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="end" className="bg-background text-foreground border border-border p-3 shadow-lg">
                      <div className="w-[280px]">
                        <p className="font-semibold text-sm mb-2">Faixas de mensalidade</p>
                        <div className="space-y-1.5">
                          {PRICING_TIERS.map(([name, revenue, price]) => (
                            <div key={name} className="grid grid-cols-[64px_1fr_auto] gap-2 text-[11px] items-center">
                              <span className="font-medium">{name}</span>
                              <span className="text-muted-foreground">{revenue}</span>
                              <span className="font-medium whitespace-nowrap">{price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
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
