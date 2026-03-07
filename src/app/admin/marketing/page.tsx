"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Ticket, QrCode, FileText, Star } from "lucide-react";
import AdminHeader from "@/components/admin/catalog-header";

const marketingModules = [
  {
    title: "Cupons de Desconto",
    description: "Crie e gerencie cupons promocionais para seus clientes",
    href: "/admin/marketing/coupons",
    icon: Ticket,
    iconBgColor: "bg-emerald-500",
  },
  {
    title: "QR Code do Cardapio",
    description: "Gere QR Codes para impressao em materiais de divulgacao",
    href: "/admin/marketing/qrcode",
    icon: QrCode,
    iconBgColor: "bg-blue-500",
  },
  {
    title: "Cardapio em PDF",
    description: "Exporte seu catalogo completo como PDF profissional",
    href: "/admin/marketing/pdf-catalog",
    icon: FileText,
    iconBgColor: "bg-purple-500",
  },
  {
    title: "Avaliacoes",
    description: "Veja as avaliacoes dos seus clientes sobre os pedidos",
    href: "/admin/marketing/reviews",
    icon: Star,
    iconBgColor: "bg-yellow-500",
  },
];

export default function MarketingPage() {
  const router = useRouter();

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 min-h-screen pb-20">
      <AdminHeader
        title="MARKETING"
        description="Ferramentas de marketing para impulsionar suas vendas"
        className="mb-4"
      />

      <div className="w-full max-w-7xl mx-auto p-0 md:p-4 lg:p-6 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:p-0">
          {marketingModules.map((module) => (
            <Card
              key={module.href}
              className="p-6 cursor-pointer hover:shadow-md transition-shadow border hover:border-emerald-200"
              onClick={() => router.push(module.href)}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${module.iconBgColor} rounded-lg flex items-center justify-center shrink-0`}>
                  <module.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-tomato font-semibold text-foreground text-lg">{module.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
