"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShop } from "@/hooks/use-shop";
import { useAuthContext } from "@/contexts/auth-context";
import { hasPermission } from "@/lib/permissions";
import type { ShopAttributes } from "@/services/shop";

type Draft = Partial<ShopAttributes>;

// Rascunho de alguns campos da loja, com salvamento próprio (só envia o que mudou).
export function useShopDraft(initial: (shop: ShopAttributes) => Draft) {
  const { shop, isLoading, updateShop, isUpdating } = useShop();
  const { user } = useAuthContext();
  const [base, setBase] = useState<Draft | null>(null);
  const [draft, setDraft] = useState<Draft>({});

  useEffect(() => {
    if (!shop) return;
    const next = initial(shop as unknown as ShopAttributes);
    setBase(next);
    setDraft(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop]);

  const changed = Object.keys(draft).filter((k) => draft[k as keyof Draft] !== base?.[k as keyof Draft]);
  const save = (extra?: Draft) => {
    const payload: Draft = { ...extra };
    changed.forEach((k) => ((payload as Record<string, unknown>)[k] = draft[k as keyof Draft]));
    updateShop(payload);
  };

  return {
    // salvar a loja exige settings.manage: sem a permissão o card nem aparece
    ready: !isLoading && !!base && hasPermission(user, "settings.manage"),
    draft,
    set: (patch: Draft) => setDraft((prev) => ({ ...prev, ...patch })),
    dirty: changed.length > 0,
    saving: isUpdating,
    save,
    reset: () => base && setDraft(base),
  };
}

interface ShopSettingCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  children: ReactNode;
}

export function ShopSettingCard({ icon: Icon, title, description, dirty, saving, onSave, children }: ShopSettingCardProps) {
  return (
    <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="font-tomato text-base font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="px-5 py-5 space-y-4">
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {children}
        <div className="flex justify-end pt-1">
          <Button type="button" disabled={!dirty || saving} onClick={onSave} className="rounded-md bg-primary text-white hover:bg-primary/90 text-sm cursor-pointer">
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
