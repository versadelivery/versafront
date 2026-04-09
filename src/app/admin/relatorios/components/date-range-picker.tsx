"use client";

import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (startDate: Date, endDate: Date) => void;
}

const presets = [
  {
    label: "Últimos 7 dias",
    getValue: () => ({
      start: subDays(new Date(), 6),
      end: new Date(),
    }),
  },
  {
    label: "Últimos 30 dias",
    getValue: () => ({
      start: subDays(new Date(), 29),
      end: new Date(),
    }),
  },
  {
    label: "Este mês",
    getValue: () => ({
      start: startOfMonth(new Date()),
      end: new Date(),
    }),
  },
  {
    label: "Mês passado",
    getValue: () => {
      const lastMonth = subMonths(new Date(), 1);
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
      };
    },
  },
];

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
}: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start text-left font-normal">
            <CalendarDays className="mr-2 h-4 w-4" />
            {format(startDate, "dd/MM/yyyy", { locale: ptBR })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            className="capitalize"
            locale={ptBR}
            mode="single"
            selected={startDate}
            onSelect={(date) => {
              if (date) onChange(date, endDate);
            }}
            disabled={(date) => date > endDate || date > new Date()}
          />
        </PopoverContent>
      </Popover>

      <span className="text-muted-foreground text-sm">até</span>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start text-left font-normal">
            <CalendarDays className="mr-2 h-4 w-4" />
            {format(endDate, "dd/MM/yyyy", { locale: ptBR })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            className="capitalize"
            locale={ptBR}
            mode="single"
            selected={endDate}
            onSelect={(date) => {
              if (date) onChange(startDate, date);
            }}
            disabled={(date) => date < startDate || date > new Date()}
          />
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap gap-1 ml-2">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant="ghost"
            size="sm"
            onClick={() => {
              const { start, end } = preset.getValue();
              onChange(start, end);
            }}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
