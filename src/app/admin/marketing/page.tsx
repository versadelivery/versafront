"use client";

import { Ticket, QrCode, FileText, Star, ArrowLeft } from "lucide-react";
import { AdminDashboardCard } from "@/components/admin/card";

const marketingModules = [
  {
    title: "Cupons de Desconto",
    description: "Crie e gerencie cupons promocionais para seus clientes",
    href: "/admin/marketing/coupons",
    icon: Ticket,
    iconBgColor: "bg-emerald-500",
  },
  {
    title: "QR Code do Cardápio",
    description: "Gere QR Codes para impressão em materiais de divulgação",
    href: "/admin/marketing/qrcode",
    icon: QrCode,
    iconBgColor: "bg-blue-500",
  },
  {
    title: "Cardápio em PDF",
    description: "Exporte seu catálogo completo como PDF profissional",
    href: "/admin/marketing/pdf-catalog",
    icon: FileText,
    iconBgColor: "bg-purple-500",
  },
  {
    title: "Avaliações",
    description: "Veja as avaliações dos seus clientes sobre os pedidos",
    href: "/admin/marketing/reviews",
    icon: Star,
    iconBgColor: "bg-yellow-500",
  },
];

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a href="/admin" className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">Voltar</span>
              </a>
              <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
              <h1 className="font-tomato text-base sm:text-lg font-bold text-gray-900">Marketing</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {marketingModules.map((module) => (
            <AdminDashboardCard key={module.href} {...module} />
          ))}
        </div>
      </div>
    </div>
  );
}
