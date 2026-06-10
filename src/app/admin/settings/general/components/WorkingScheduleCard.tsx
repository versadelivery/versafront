"use client";

import React, { useState, useRef } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown, ChevronUp, Pencil, Check, X, CopyCheck, ArrowDown } from "lucide-react";
import { WorkingSchedule, UpdateDayParams } from "../services/workingScheduleService";
import { DAY_LABELS } from "../hooks/useWorkingSchedules";

interface WorkingScheduleCardProps {
  schedule: WorkingSchedule;
  onToggleActive: (id: string, active: boolean) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
  onUpdateDays: (id: string, days: UpdateDayParams[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function WorkingScheduleCard({
  schedule,
  onToggleActive,
  onRename,
  onUpdateDays,
  onDelete,
}: WorkingScheduleCardProps) {
  const { id, attributes } = schedule;
  const [expanded, setExpanded] = useState(attributes.active);
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(attributes.name);
  const [isSavingDays, setIsSavingDays] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [localDays, setLocalDays] = useState(
    attributes.days.map((d) => ({ ...d.attributes, id: d.id }))
  );
  const [hasDayChanges, setHasDayChanges] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setExpanded(attributes.active);
  }, [attributes.active]);

  React.useEffect(() => {
    setLocalDays(attributes.days.map((d) => ({ ...d.attributes, id: d.id })));
    setHasDayChanges(false);
  }, [attributes.days]);

  const handleToggleActive = async (checked: boolean) => {
    setIsTogglingActive(true);
    try {
      await onToggleActive(id, checked);
    } finally {
      setIsTogglingActive(false);
    }
  };

  const handleRenameSubmit = async () => {
    if (nameInput.trim() && nameInput !== attributes.name) {
      await onRename(id, nameInput.trim());
    }
    setIsRenaming(false);
  };

  const handleRenameCancel = () => {
    setNameInput(attributes.name);
    setIsRenaming(false);
  };

  const handleDayToggle = (dayId: string, active: boolean) => {
    setLocalDays((prev) => prev.map((d) => (d.id === dayId ? { ...d, active } : d)));
    setHasDayChanges(true);
  };

  const handleDayTime = (dayId: string, field: "open" | "close", value: string) => {
    setLocalDays((prev) => prev.map((d) => (d.id === dayId ? { ...d, [field]: value } : d)));
    setHasDayChanges(true);
  };

  const handleCopyToAll = (dayId: string) => {
    const source = localDays.find((d) => d.id === dayId);
    if (!source) return;
    setLocalDays((prev) => prev.map((d) => ({ ...d, active: source.active, open: source.open, close: source.close })));
    setHasDayChanges(true);
  };

  const handleCopyDown = (dayId: string) => {
    const sourceIndex = localDays.findIndex((d) => d.id === dayId);
    if (sourceIndex === -1) return;
    const source = localDays[sourceIndex];
    setLocalDays((prev) =>
      prev.map((d, i) => i > sourceIndex ? { ...d, active: source.active, open: source.open, close: source.close } : d)
    );
    setHasDayChanges(true);
  };

  const handleSaveDays = async () => {
    setIsSavingDays(true);
    try {
      const days: UpdateDayParams[] = localDays.map((d) => ({
        id: d.id,
        day_of_week: d.day_of_week,
        active: d.active,
        open: d.open ?? "00:00",
        close: d.close ?? "00:00",
      }));
      await onUpdateDays(id, days);
      setHasDayChanges(false);
    } finally {
      setIsSavingDays(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border border-[#E5E2DD] rounded-lg overflow-hidden bg-white">
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Switch
          checked={attributes.active}
          onCheckedChange={handleToggleActive}
          disabled={isTogglingActive}
          className={attributes.active ? "data-[state=checked]:bg-green-500" : "data-[state=unchecked]:bg-gray-400"}
        />

        <div className="flex-1 flex items-center gap-2">
          {isRenaming ? (
            <>
              <Input
                ref={nameInputRef}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSubmit();
                  if (e.key === "Escape") handleRenameCancel();
                }}
                autoFocus
                className="h-8 text-sm max-w-[220px]"
              />
              <button onClick={handleRenameSubmit} className="text-green-600 hover:text-green-700 cursor-pointer">
                <Check className="h-4 w-4" />
              </button>
              <button onClick={handleRenameCancel} className="text-red-500 hover:text-red-600 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <span className="text-sm font-medium text-gray-900">{attributes.name}</span>
              <button
                onClick={() => { setIsRenaming(true); setNameInput(attributes.name); }}
                className="text-muted-foreground hover:text-gray-700 cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-muted-foreground hover:text-gray-700 cursor-pointer p-1"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-400 hover:text-red-600 cursor-pointer p-1 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Days section — mesmo layout da tabela antiga */}
      {expanded && (
        <div className="border-t border-[#E5E2DD] px-4 pt-2 pb-4">
          {/* Cabeçalho */}
          <div className="grid grid-cols-12 gap-4 items-center py-2 border-b border-[#E5E2DD]">
            <div className="col-span-2">
              <span className="text-sm font-medium text-muted-foreground">Dia</span>
            </div>
            <div className="col-span-2">
              <span className="text-sm font-medium text-muted-foreground">Status</span>
            </div>
            <div className="col-span-2">
              <span className="text-sm font-medium text-muted-foreground">Abertura</span>
            </div>
            <div className="col-span-2">
              <span className="text-sm font-medium text-muted-foreground">Fechamento</span>
            </div>
            <div className="col-span-4">
              <span className="text-sm font-medium text-muted-foreground">Ações</span>
            </div>
          </div>

          {/* Linhas dos dias */}
          <div className="divide-y divide-[#E5E2DD]">
            {localDays.map((day, index) => (
              <div key={day.id} className="grid grid-cols-12 gap-4 items-center py-3">
                <div className="col-span-2">
                  <span className="text-sm font-medium text-gray-900">{DAY_LABELS[day.day_of_week]}</span>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Switch
                    checked={day.active}
                    onCheckedChange={(checked) => handleDayToggle(day.id, checked)}
                  />
                  <span className={`text-sm ${day.active ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
                    {day.active ? "Aberto" : "Fechado"}
                  </span>
                </div>
                <div className="col-span-2">
                  <Input
                    type="time"
                    value={day.open ?? "00:00"}
                    onChange={(e) => handleDayTime(day.id, "open", e.target.value)}
                    disabled={!day.active}
                    className="h-9 text-sm rounded-md border-[#E5E2DD]"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="time"
                    value={day.close ?? "00:00"}
                    onChange={(e) => handleDayTime(day.id, "close", e.target.value)}
                    disabled={!day.active}
                    className="h-9 text-sm rounded-md border-[#E5E2DD]"
                  />
                </div>
                <div className="col-span-4 flex gap-2">
                  {index === 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyToAll(day.id)}
                      className="h-8 px-3 text-xs rounded-md border border-gray-300 cursor-pointer"
                      title="Copiar para todos os dias"
                    >
                      <CopyCheck className="h-3 w-3 mr-1" />
                      Copiar p/todos
                    </Button>
                  )}
                  {index < localDays.length - 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyDown(day.id)}
                      className="h-8 px-3 text-xs rounded-md border border-gray-300 cursor-pointer"
                      title="Copiar para os dias abaixo"
                    >
                      <ArrowDown className="h-3 w-3 mr-1" />
                      Copiar p/baixo
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hasDayChanges && (
            <div className="pt-4 flex items-center gap-4 border-t border-[#E5E2DD] mt-2">
              <Button
                onClick={handleSaveDays}
                disabled={isSavingDays}
                className="rounded-md bg-primary text-white hover:bg-primary/90"
              >
                {isSavingDays ? "Salvando..." : "Salvar Horários"}
              </Button>
              <span className="text-sm text-amber-600 font-medium">
                Você tem alterações não salvas
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
