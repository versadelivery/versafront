"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { API_BASE_URL } from "@/api/routes";
import { getSuperAdminToken } from "@/lib/auth";
import { BillingTier, formatTierRevenue } from "@/services/billing-tiers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function BillingTiersEditor() {
  const [tiers, setTiers] = useState<BillingTier[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/super_admins/billing_tiers`, {
      headers: { Authorization: `Bearer ${getSuperAdminToken()}` },
    })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setTiers(data.tiers))
      .catch(() => toast.error("Não foi possível carregar as faixas"));
  }, []);

  const updateTier = (index: number, field: keyof BillingTier, value: string) => {
    setTiers((current) => current.map((tier, tierIndex) => tierIndex === index
      ? { ...tier, [field]: field === "name" || field === "color" ? value : value === "" ? null : Number(value) }
      : tier));
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/super_admins/billing_tiers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getSuperAdminToken()}` },
        body: JSON.stringify({ tiers }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao salvar as faixas");
      setTiers(data.tiers);
      toast.success("Faixas de mensalidade atualizadas");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar as faixas");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Faixas de mensalidade</CardTitle>
          <CardDescription>Os novos valores serão usados nas próximas cobranças e exibidos aos lojistas.</CardDescription>
        </div>
        <Button onClick={save} disabled={saving || tiers.length === 0}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvando..." : "Salvar faixas"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="hidden grid-cols-[120px_1fr_1fr_1fr] gap-3 px-1 text-xs font-medium text-gray-500 md:grid">
          <span>Faixa</span><span>Faturamento inicial</span><span>Faturamento final</span><span>Mensalidade</span>
        </div>
        {tiers.map((tier, index) => (
          <div key={tier.key} className="grid gap-3 rounded-lg border p-3 md:grid-cols-[120px_1fr_1fr_1fr] md:items-center">
            <div className="flex items-center gap-2 font-medium">
              <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: tier.color }} />
              {tier.name}
            </div>
            <Input type="number" min={0} step="0.01" value={tier.min_revenue} onChange={(event) => updateTier(index, "min_revenue", event.target.value)} aria-label={`Início da faixa ${tier.name}`} />
            <Input type="number" min={0} step="0.01" value={tier.max_revenue ?? ""} disabled={index === tiers.length - 1} placeholder={index === tiers.length - 1 ? "Sem limite" : undefined} onChange={(event) => updateTier(index, "max_revenue", event.target.value)} aria-label={`Fim da faixa ${tier.name}`} />
            <Input type="number" min={0} step="0.01" value={tier.amount} onChange={(event) => updateTier(index, "amount", event.target.value)} aria-label={`Mensalidade da faixa ${tier.name}`} />
            <p className="text-xs text-gray-500 md:col-start-2 md:col-span-3">{formatTierRevenue(tier)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
