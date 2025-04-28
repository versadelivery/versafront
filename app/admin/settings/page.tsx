"use client";

import ProtectedRoute from "@/app/components/protected-route";
import { Header } from "../../components/catalog/catalog-header";
import { AdminDashboardCard } from "@/app/components/admin/card";
import { Settings, Users, Bell, Link as LinkIcon, Truck, CreditCard } from "lucide-react";

const settingsCards = [
  {
    href: "/admin/settings/general",
    icon: Settings,
    title: "Informações Gerais",
    description: "Configure as configurações básicas do sistema",
    iconBgColor: "bg-blue-500"
  },
  {
    href: "/admin/settings/users",
    icon: Users,
    title: "Gerenciamento de Usuários",
    description: "Gerencie permissões e acessos dos usuários",
    iconBgColor: "bg-emerald-600"
  },
  {
    href: "/admin/settings/delivery",
    icon: Truck,
    title: "Taxas de Entrega",
    description: "Configure a taxa de entrega e as zonas de entrega",
    iconBgColor: "bg-red-500"
  },
  {
    href: "/admin/settings/payment",
    icon: CreditCard,
    title: "Meios de Pagamento",
    description: "Configure os meios de pagamento disponíveis",
    iconBgColor: "bg-purple-500"
  },
];

export default function SettingsPage() {
  return (
      <div className="w-full min-h-screen px-0 sm:px-8 lg:px-24">
        <Header 
          title="CONFIGURAÇÕES"
          description="Gerencie as configurações do sistema"
          
          />
        
        <div className="w-full mx-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {settingsCards.map((card, index) => (
              <div key={index}>
                <AdminDashboardCard actionIcon="settings" {...card} />
              </div>
            ))}
          </div>
        </div>
      </div>
  );
} 