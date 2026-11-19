"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useCodeCheck } from "@/hooks/useCodeCheck";
import { WEEKDAYS, WeekdayState } from "./weekday-picker";

interface ItemWeekdaysProps {
  value: WeekdayState;
  onChange: (next: WeekdayState) => void;
  barcode: string;
  scaleCode: string;
  sharedCode: boolean;
  exceptId?: string;
}

// Calendário compartilhado: itens com o mesmo código não vendem no mesmo dia.
// Dia ocupado por outro item fica bloqueado aqui e só volta quando o outro item liberar.
export function ItemWeekdays({ value, onChange, barcode, scaleCode, sharedCode, exceptId }: ItemWeekdaysProps) {
  const { takenDays } = useCodeCheck({ barcode, scaleCode, exceptId, sharedCode });
  const taken = sharedCode ? takenDays : {};
  const freeKeys = WEEKDAYS.filter(({ key }) => !taken[key]);
  const allFreeActive = freeKeys.every(({ key }) => value[key]);
  const hasTaken = freeKeys.length < WEEKDAYS.length;

  // dia que acabou de ficar ocupado por outro item sai da seleção
  useEffect(() => {
    if (WEEKDAYS.some(({ key }) => taken[key] && value[key])) {
      onChange(Object.fromEntries(WEEKDAYS.map(({ key }) => [key, taken[key] ? false : value[key]])) as WeekdayState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [takenDays, sharedCode]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Disponibilidade Semanal</p>
        <button
          type="button"
          onClick={() => onChange(Object.fromEntries(WEEKDAYS.map(({ key }) => [key, taken[key] ? false : !allFreeActive])) as WeekdayState)}
          className="text-[10px] font-medium text-primary hover:underline uppercase tracking-tight"
        >
          {allFreeActive ? "Desmarcar todos" : "Marcar todos"}
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map(({ key, label }) => {
          const owner = taken[key];
          const isActive = value[key] && !owner;
          return (
            <button
              key={key}
              type="button"
              disabled={!!owner}
              aria-pressed={isActive}
              title={owner ? `Em uso pelo item "${owner}"` : undefined}
              onClick={() => onChange({ ...value, [key]: !value[key] })}
              className={cn(
                "flex items-center justify-center py-3 rounded-xl border-2 transition-all duration-200",
                owner ? "cursor-not-allowed bg-muted/40 border-gray-100 opacity-60" : "cursor-pointer",
                !owner && (isActive ? "bg-primary border-primary shadow-sm" : "bg-transparent border-gray-100 border-dashed hover:border-gray-300"),
              )}
            >
              <span className={cn("text-[10px] font-bold uppercase", isActive ? "text-white" : "text-gray-400", owner && "line-through")}>{label}</span>
            </button>
          );
        })}
      </div>
      {hasTaken && (
        <p className="text-xs text-muted-foreground" role="note">
          Dias riscados já são usados por outro item com o mesmo código ({[...new Set(Object.values(taken))].join(", ")}). Para liberar, desmarque o dia nesse item.
        </p>
      )}
    </div>
  );
}
