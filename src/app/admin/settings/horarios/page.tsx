"use client";

import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import ScheduleSettings from "../general/components/ScheduleSettings";

// Página exclusiva do horário de funcionamento (antes ficava no fim de Configurações Gerais)
export default function HorariosPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="bg-white border-b border-[#E5E2DD] sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-2 sm:gap-4">
            <Link
              href="/admin/settings"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:block">Voltar</span>
            </Link>
            <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
            <h1 className="truncate font-tomato text-sm sm:text-lg font-bold text-gray-900">Horário de Funcionamento</h1>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <h2 className="font-tomato text-base font-semibold text-gray-900">Dias e horários</h2>
          </div>
          <div className="px-5 py-5">
            <ScheduleSettings />
          </div>
        </div>
      </div>
    </div>
  );
}
