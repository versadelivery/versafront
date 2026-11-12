"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarDays, Clock } from "lucide-react"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  describeSchedule,
  formatDayLabel,
  formatSlotTime,
  isSlotAvailable,
  pickDayChips,
  todayInShopZone,
  type SchedulingSlots,
} from "@/lib/scheduling"

interface SchedulePickerProps {
  slots: SchedulingSlots
  /** horário escolhido (ISO da API) ou null */
  value: string | null
  onChange: (iso: string | null) => void
  /** PDV/painel: mostra os dias mais agendados como atalhos (vem da API só para a equipe) */
  showPopular?: boolean
  idPrefix?: string
}

const toIso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

const chipClass = (selected: boolean) =>
  cn(
    "shrink-0 rounded-md border px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
    selected
      ? "border-primary bg-primary/10 text-primary font-semibold"
      : "border-[#E5E2DD] bg-white text-gray-700 hover:border-primary/40"
  )

// Escolha de dia (atalhos + calendário) e horário. Só mostra o que a API ofereceu; não recalcula regra de funcionamento.
export function SchedulePicker({ slots, value, onChange, showPopular = false, idPrefix = "schedule" }: SchedulePickerProps) {
  const today = useMemo(() => todayInShopZone(), [])
  const [selectedDay, setSelectedDay] = useState<string | null>(value ? value.slice(0, 10) : null)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const dayMap = useMemo(() => new Map(slots.days.map((day) => [day.date, day])), [slots.days])
  const popular = showPopular ? slots.popular_dates : []
  const chips = useMemo(() => pickDayChips(slots.days, popular, 5), [slots.days, popular])
  const popularCount = useMemo(() => new Map(popular.map((entry) => [entry.date, entry.count])), [popular])
  const timesOfDay = selectedDay ? dayMap.get(selectedDay)?.slots ?? [] : []

  // A lista muda com o relógio: se o horário escolhido deixou de existir, limpa a escolha
  useEffect(() => {
    if (value && !isSlotAvailable(slots.days, value)) onChange(null)
    if (selectedDay && !dayMap.has(selectedDay)) setSelectedDay(null)
  }, [slots.days, value, selectedDay, dayMap, onChange])

  const pickDay = (date: string) => {
    if (date !== selectedDay) onChange(null)
    setSelectedDay(date)
  }

  const availableDates = useMemo(() => new Set(slots.days.map((day) => day.date)), [slots.days])
  const firstDate = slots.days[0]?.date
  const lastDate = slots.days[slots.days.length - 1]?.date
  const toDate = (iso: string) => new Date(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)))

  if (slots.days.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-[#E5E2DD] bg-[#FAF9F7] px-4 py-6 text-center text-sm text-muted-foreground" data-testid="schedule-empty">
        Não há horários disponíveis para agendar no momento.
      </p>
    )
  }

  const calendarChipSelected = !!selectedDay && !chips.some((chip) => chip.date === selectedDay)

  return (
    <div className="space-y-4" data-testid="schedule-picker">
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-800">
          {popular.length > 0 ? "Dias mais agendados" : "Dia"}
        </p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Escolha o dia">
          {chips.map((day) => (
            <button
              key={day.date}
              type="button"
              id={`${idPrefix}-day-${day.date}`}
              aria-pressed={selectedDay === day.date}
              onClick={() => pickDay(day.date)}
              className={chipClass(selectedDay === day.date)}
            >
              {formatDayLabel(day.date, today)}
              {popularCount.has(day.date) && (
                <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-xs text-primary">
                  {popularCount.get(day.date)}
                </span>
              )}
            </button>
          ))}

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button type="button" className={cn(chipClass(calendarChipSelected), "inline-flex items-center gap-1.5")}>
                <CalendarDays className="h-4 w-4" />
                {calendarChipSelected && selectedDay ? formatDayLabel(selectedDay, today) : "Outra data"}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto max-w-[calc(100vw-2rem)] p-0">
              <Calendar
                mode="single"
                locale={ptBR}
                selected={selectedDay ? toDate(selectedDay) : undefined}
                defaultMonth={toDate(selectedDay ?? firstDate)}
                startMonth={toDate(firstDate)}
                endMonth={toDate(lastDate)}
                disabled={(date) => !availableDates.has(toIso(date))}
                onSelect={(date) => {
                  if (!date) return
                  pickDay(toIso(date))
                  setCalendarOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <p className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
          <Clock className="h-4 w-4 text-primary" />
          Horário
        </p>
        {selectedDay ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6" role="group" aria-label="Escolha o horário">
            {timesOfDay.map((iso) => (
              <button
                key={iso}
                type="button"
                aria-pressed={value === iso}
                onClick={() => onChange(iso)}
                className={cn(chipClass(value === iso), "w-full text-center tabular-nums")}
              >
                {formatSlotTime(iso)}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Escolha um dia para ver os horários.</p>
        )}
      </div>

      {value && (
        <p className="rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary" data-testid="schedule-summary">
          Agendado para {describeSchedule(value)}
        </p>
      )}
    </div>
  )
}
