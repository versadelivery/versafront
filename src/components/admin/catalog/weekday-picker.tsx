"use client";

import { cn } from "@/lib/utils";

export const WEEKDAYS = [
  { key: "sunday_active", label: "Dom" },
  { key: "monday_active", label: "Seg" },
  { key: "tuesday_active", label: "Ter" },
  { key: "wednesday_active", label: "Qua" },
  { key: "thursday_active", label: "Qui" },
  { key: "friday_active", label: "Sex" },
  { key: "saturday_active", label: "Sáb" },
] as const;

export type WeekdayKey = (typeof WEEKDAYS)[number]["key"];
export type WeekdayState = Record<WeekdayKey, boolean>;

export const ALL_WEEKDAYS = Object.fromEntries(WEEKDAYS.map(({ key }) => [key, true])) as WeekdayState;

// Dias liberados de um registro da API (campo ausente conta como liberado)
export const weekdaysFrom = (attributes?: Partial<Record<WeekdayKey, boolean>> | null): WeekdayState =>
  Object.fromEntries(WEEKDAYS.map(({ key }) => [key, attributes?.[key] !== false])) as WeekdayState;

// "Sáb" / "Seg, Qua" ou null quando está liberado todos os dias
export const weekdaysSummary = (attributes?: Partial<Record<WeekdayKey, boolean>> | null): string | null => {
  const state = weekdaysFrom(attributes);
  const active = WEEKDAYS.filter(({ key }) => state[key]);
  return active.length === WEEKDAYS.length ? null : active.map(({ label }) => label).join(", ");
};

export function WeekdayPicker({ value, onChange }: { value: WeekdayState; onChange: (next: WeekdayState) => void }) {
  const allActive = WEEKDAYS.every(({ key }) => value[key]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Disponibilidade Semanal</p>
        <button
          type="button"
          onClick={() => onChange(Object.fromEntries(WEEKDAYS.map(({ key }) => [key, !allActive])) as WeekdayState)}
          className="text-[10px] font-medium text-primary hover:underline uppercase tracking-tight"
        >
          {allActive ? "Desmarcar todos" : "Marcar todos"}
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map(({ key, label }) => {
          const isActive = value[key];
          return (
            <button
              key={key}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange({ ...value, [key]: !isActive })}
              className={cn(
                "cursor-pointer flex items-center justify-center py-3 rounded-xl border-2 transition-all duration-200",
                isActive ? "bg-primary border-primary shadow-sm" : "bg-transparent border-gray-100 border-dashed hover:border-gray-300",
              )}
            >
              <span className={cn("text-[10px] font-bold uppercase", isActive ? "text-white" : "text-gray-400")}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
