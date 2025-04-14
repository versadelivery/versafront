"use client";

import ProtectedRoute from "@/components/protected-route";
import { Header } from "../catalog/components/catalog-header";
import { AdminDashboardCard } from "@/components/admin/card";
import { Settings, Users, Bell, Link as LinkIcon } from "lucide-react";

const settingsCards = [
  {
    href: "/admin/settings/general",
    icon: Settings,
    title: "Configurações Gerais",
    description: "Configure as configurações básicas do sistema",
    iconBgColor: "bg-blue-500"
  },
  {
    href: "/admin/settings/users",
    icon: Users,
    title: "Configurações de Usuários",
    description: "Gerencie permissões e acessos dos usuários",
    iconBgColor: "bg-emerald-600"
  },
  {
    href: "/admin/settings/notifications",
    icon: Bell,
    title: "Configurações de Notificações",
    description: "Configure as notificações do sistema",
    iconBgColor: "bg-purple-500"
  },
  {
    href: "/admin/settings/integrations",
    icon: LinkIcon,
    title: "Configurações de Integração",
    description: "Gerencie integrações com outros sistemas",
    iconBgColor: "bg-yellow-500"
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