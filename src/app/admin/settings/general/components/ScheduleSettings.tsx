"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { useWorkingSchedules } from "../hooks/useWorkingSchedules";
import { WorkingScheduleCard } from "./WorkingScheduleCard";

export default function ScheduleSettings() {
  const {
    schedules,
    loading,
    createSchedule,
    toggleActive,
    renameSchedule,
    updateDays,
    deleteSchedule,
  } = useWorkingSchedules();

  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 leading-relaxed">
          Horários de Funcionamento
        </h3>
        <Button
          onClick={async () => {
            setIsCreating(true);
            try {
              await createSchedule("Novo Horário");
            } finally {
              setIsCreating(false);
            }
          }}
          disabled={isCreating}
          size="sm"
          variant="outline"
          className="h-9 gap-1.5 border-[#E5E2DD] hover:bg-gray-50 text-xs font-medium px-4"
        >
          <Plus className="h-4 w-4" />
          {isCreating ? "Criando..." : "Criar Novo Horário"}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-[64px] w-full rounded-lg" />
          <Skeleton className="h-[64px] w-full rounded-lg" />
        </div>
      ) : schedules.length > 0 ? (
        <div className="grid gap-4">
          {schedules.map((schedule) => (
            <WorkingScheduleCard
              key={schedule.id}
              schedule={schedule}
              onToggleActive={toggleActive}
              onRename={renameSchedule}
              onUpdateDays={updateDays}
              onDelete={deleteSchedule}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 border-2 border-dashed border-[#E5E2DD] rounded-xl text-center bg-gray-50/30">
          <p className="text-muted-foreground text-sm">
            Nenhum horário configurado. Crie um para definir quando sua loja está aberta.
          </p>
        </div>
      )}
    </div>
  );
}
