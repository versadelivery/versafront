"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AdminDashboardCard } from "@/components/admin/card";
import { settingsCards } from "./utils";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header admin padrao */}
      <div className="bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">Voltar</span>
              </Link>
              <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
              <h1 className="text-base sm:text-lg font-bold text-gray-900">Configurações</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Conteudo */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {settingsCards.map((card, index) => (
            <AdminDashboardCard key={index} actionIcon="settings" {...card} />
          ))}
        </div>
      </div>
    </div>
  );
}
