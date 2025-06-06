"use client";

import AdminHeader from "@/components/admin/catalog-header";
import { AdminDashboardCard } from "@/components/admin/card";
import { settingsCards } from "./utils";

export default function SettingsPage() {
  return (
      <div className="w-full min-h-screen px-0 sm:px-8 lg:px-24">
        <AdminHeader
          title="CONFIGURAÇÕES"
          description="Gerencie as configurações do sistema"
        />
        
        <div className="w-full mx-auto p-4">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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