"use client";

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Um só botão de salvar por tela. Cada formulário da página se registra com useSaveBar();
// no celular aparece UMA barra flutuante embaixo (salva tudo que mudou), no desktop os
// botões "Cancelar / Salvar" ficam no canto superior direito (<SaveActions /> no cabeçalho).

interface Entry {
  dirty: boolean;
  saving: boolean;
  onSave: () => void | Promise<unknown>;
  onCancel?: () => void;
}

interface SaveBarContextValue {
  entries: Record<string, Entry>;
  upsert: (id: string, entry: Entry) => void;
  remove: (id: string) => void;
  actionsMounted: number;
  setActionsMounted: (fn: (n: number) => number) => void;
}

const SaveBarContext = createContext<SaveBarContextValue | null>(null);

export function SaveBarProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [actionsMounted, setActionsMounted] = useState(0);

  const upsert = useCallback((id: string, entry: Entry) => {
    setEntries((prev) => {
      const old = prev[id];
      if (old && old.dirty === entry.dirty && old.saving === entry.saving && old.onSave === entry.onSave && old.onCancel === entry.onCancel) return prev;
      return { ...prev, [id]: entry };
    });
  }, []);
  const remove = useCallback((id: string) => {
    setEntries((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ entries, upsert, remove, actionsMounted, setActionsMounted }),
    [entries, upsert, remove, actionsMounted]
  );
  const hasEntries = Object.keys(entries).length > 0;

  return (
    <SaveBarContext.Provider value={value}>
      {children}
      {hasEntries && (
        <>
          <div className="h-28 md:hidden" aria-hidden /> {/* folga para a barra não cobrir o fim da página */}
          <FloatingSaveBar />
        </>
      )}
    </SaveBarContext.Provider>
  );
}

function useSaveState() {
  const ctx = useContext(SaveBarContext);
  const list = Object.values(ctx?.entries ?? {});
  const dirtyEntries = list.filter((e) => e.dirty);
  const saving = list.some((e) => e.saving);
  const saveAll = async () => {
    for (const entry of dirtyEntries) await entry.onSave();
  };
  const cancelAll = () => dirtyEntries.forEach((e) => e.onCancel?.());
  return {
    registered: list.length > 0,
    dirty: dirtyEntries.length > 0,
    saving,
    canCancel: dirtyEntries.some((e) => e.onCancel),
    saveAll,
    cancelAll,
  };
}

// Registra o formulário da tela. `onSave` e `onCancel` podem mudar a cada render.
export function useSaveBar({ dirty, saving, onSave, onCancel }: Entry) {
  const ctx = useContext(SaveBarContext);
  const id = useId();
  const latest = useRef({ onSave, onCancel });
  latest.current = { onSave, onCancel };
  const upsert = ctx?.upsert;
  const remove = ctx?.remove;
  const hasCancel = !!onCancel;

  // funções estáveis: o estado do contexto só muda quando dirty/saving mudam
  const stableSave = useCallback(() => latest.current.onSave(), []);
  const stableCancel = useMemo(() => (hasCancel ? () => latest.current.onCancel?.() : undefined), [hasCancel]);

  useEffect(() => {
    upsert?.(id, { dirty, saving, onSave: stableSave, onCancel: stableCancel });
  }, [id, dirty, saving, stableSave, stableCancel, upsert]);
  useEffect(() => () => remove?.(id), [id, remove]);
}

// A tela já tem <SaveActions /> no cabeçalho? Então os cards não mostram botão próprio no desktop.
export function useHasHeaderActions() {
  return (useContext(SaveBarContext)?.actionsMounted ?? 0) > 0;
}

const saveLabel = (saving: boolean, long = true) => (saving ? "Salvando..." : long ? "Salvar alterações" : "Salvar");

// Desktop: canto superior direito do cabeçalho. Some no celular (lá vale a barra flutuante).
export function SaveActions({ className }: { className?: string }) {
  const { dirty, saving, canCancel, saveAll, cancelAll } = useSaveState();
  const setActionsMounted = useContext(SaveBarContext)?.setActionsMounted;
  useEffect(() => {
    setActionsMounted?.((n) => n + 1);
    return () => setActionsMounted?.((n) => n - 1);
  }, [setActionsMounted]);
  return (
    <div className={cn("hidden shrink-0 items-center gap-2 md:flex", className)} data-testid="save-actions">
      {canCancel && (
        <Button variant="outline" type="button" disabled={!dirty || saving} onClick={cancelAll} className="rounded-md border border-gray-300 cursor-pointer text-sm">
          Cancelar
        </Button>
      )}
      <Button
        type="button"
        disabled={!dirty || saving}
        onClick={saveAll}
        className="rounded-md border border-gray-300 cursor-pointer bg-primary text-white hover:bg-primary/90 text-sm"
      >
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        {saveLabel(saving)}
      </Button>
    </div>
  );
}

// Celular: uma barra só, na largura da tela, acima dos botões de navegação do aparelho.
function FloatingSaveBar() {
  const { dirty, saving, saveAll } = useSaveState();
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E5E2DD] bg-[#FAF9F7]/95 px-4 pt-3 backdrop-blur md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      data-testid="floating-save-bar"
    >
      <div className="mx-auto max-w-3xl space-y-1.5">
        {dirty && !saving && <p className="text-center text-xs font-medium text-amber-600">Você tem alterações não salvas</p>}
        <Button type="button" disabled={!dirty || saving} onClick={saveAll} className="h-12 w-full cursor-pointer text-base">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saveLabel(saving)}
        </Button>
      </div>
    </div>
  );
}
