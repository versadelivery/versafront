"use client";

import { ShoppingBag, Timer, Truck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsers } from "@/app/admin/settings/users/hooks/useUsers";
import { ShopSettingCard, useShopDraft } from "@/components/admin/shop-setting-card";

// Cada card salva só os próprios campos da loja.

export function AutoAcceptCard() {
  const { ready, draft, set, dirty, saving, save } = useShopDraft((s) => ({ auto_accept_orders: s.auto_accept_orders ?? false }));
  if (!ready) return null;
  return (
    <ShopSettingCard icon={ShoppingBag} title="Pedidos" dirty={dirty} saving={saving} onSave={() => save()}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <Label htmlFor="auto_accept_orders" className="text-sm font-medium">Aceitar pedidos automaticamente</Label>
          <p className="text-sm text-muted-foreground mt-0.5">
            Quando ativado, novos pedidos serão aceitos automaticamente sem necessidade de confirmação manual
          </p>
        </div>
        <Switch id="auto_accept_orders" checked={draft.auto_accept_orders ?? false} onCheckedChange={(v) => set({ auto_accept_orders: v })} />
      </div>
    </ShopSettingCard>
  );
}

export function AutoOpenCashCard() {
  const { ready, draft, set, dirty, saving, save } = useShopDraft((s) => ({
    auto_open_cash_register: s.auto_open_cash_register ?? false,
    auto_open_cash_register_time: s.auto_open_cash_register_time ?? null,
  }));
  if (!ready) return null;
  const on = draft.auto_open_cash_register ?? false;
  const submit = () => {
    if (on && !draft.auto_open_cash_register_time) return toast.error("Informe o horário de abertura");
    save();
  };
  return (
    <ShopSettingCard icon={Wallet} title="Abertura automática" dirty={dirty} saving={saving} onSave={submit}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <Label htmlFor="auto_open_cash_register" className="text-sm font-medium">Abrir caixa automaticamente</Label>
          <p className="text-sm text-muted-foreground mt-0.5">
            Quando ativado, o caixa será aberto automaticamente no horário configurado todos os dias
          </p>
        </div>
        <Switch
          id="auto_open_cash_register"
          checked={on}
          onCheckedChange={(v) => set({ auto_open_cash_register: v, ...(!v && { auto_open_cash_register_time: null }) })}
        />
      </div>
      {on && (
        <div className="pt-3 border-t border-[#E5E2DD] space-y-1.5">
          <Label htmlFor="auto_open_cash_register_time" className="text-sm font-medium">
            Horário de abertura <span className="text-red-500">*</span>
          </Label>
          <Input
            id="auto_open_cash_register_time"
            type="time"
            value={draft.auto_open_cash_register_time || ""}
            onChange={(e) => set({ auto_open_cash_register_time: e.target.value })}
            className="h-10 w-40 rounded-md border-[#E5E2DD]"
          />
        </div>
      )}
    </ShopSettingCard>
  );
}

export function DefaultDelivererCard() {
  const { ready, draft, set, dirty, saving, save } = useShopDraft((s) => ({ default_delivery_person_id: s.default_delivery_person_id ?? null }));
  const { users, loading } = useUsers();
  if (!ready) return null;
  const deliveryPeople = users.filter((u: any) => u.attributes?.role === "delivery_man");
  const value = draft.default_delivery_person_id ? String(draft.default_delivery_person_id) : "none";
  return (
    <ShopSettingCard
      icon={Truck}
      title="Entregador Padrão"
      description="Selecione o entregador que será pré-selecionado automaticamente ao despachar pedidos. O admin pode trocar antes de confirmar."
      dirty={dirty}
      saving={saving}
      onSave={() => save()}
    >
      <div className="max-w-md space-y-1.5">
        <Label className="text-sm font-medium">Entregador</Label>
        <Select value={value} onValueChange={(v) => set({ default_delivery_person_id: v === "none" ? null : v })} disabled={loading}>
          <SelectTrigger className="h-10 w-full text-sm border-[#E5E2DD] rounded-md bg-white cursor-pointer">
            <SelectValue placeholder="Nenhum (selecionar manualmente)" />
          </SelectTrigger>
          <SelectContent className="rounded-md border-[#E5E2DD]">
            <SelectItem value="none">Nenhum (selecionar manualmente)</SelectItem>
            {deliveryPeople.map((person: any) => (
              <SelectItem key={person.id} value={String(person.id)}>{person.attributes.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {loading && <p className="text-xs text-muted-foreground">Carregando entregadores...</p>}
      </div>
    </ShopSettingCard>
  );
}

export function EstimatedTimeCard() {
  const { ready, draft, set, dirty, saving, save } = useShopDraft((s) => ({
    estimated_prep_time: s.estimated_prep_time ?? 30,
    estimated_delivery_time: s.estimated_delivery_time ?? 40,
  }));
  if (!ready) return null;
  const field = (key: "estimated_prep_time" | "estimated_delivery_time", label: string, hint: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
      <Input
        id={key}
        type="number"
        min={1}
        max={240}
        value={draft[key] ?? ""}
        onChange={(e) => set({ [key]: e.target.value === "" ? undefined : parseInt(e.target.value) })}
        className="h-10 w-32 rounded-md border-[#E5E2DD]"
      />
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
  const submit = () => {
    const { estimated_prep_time: prep, estimated_delivery_time: delivery } = draft;
    if (!prep || !delivery) return toast.error("Informe os dois tempos (em minutos)");
    save();
  };
  return (
    <ShopSettingCard
      icon={Timer}
      title="Tempo Estimado"
      description="Defina o tempo médio de preparo e entrega. Esses valores são usados no cronômetro do painel de pedidos e exibidos ao cliente."
      dirty={dirty}
      saving={saving}
      onSave={submit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {field("estimated_prep_time", "Tempo de preparo (minutos)", "Usado no cronômetro do painel e KDS")}
        {field("estimated_delivery_time", "Tempo de entrega (minutos)", "Exibido ao cliente no checkout e acompanhamento")}
      </div>
    </ShopSettingCard>
  );
}
