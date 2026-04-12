"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft, FileText, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import api from "@/api/config";
import { API_ENDPOINTS } from "@/api/routes";

interface FiscalConfig {
  id: string;
  provider: string;
  company_id: string | null;
  ncm_default: string;
  tax_regime: string;
  environment: string;
  enabled: boolean;
}

export default function FiscalSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiToken, setShowApiToken] = useState(false);

  const [enabled, setEnabled] = useState(false);
  const [apiToken, setApiToken] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [ncmDefault, setNcmDefault] = useState("21069090");
  const [taxRegime, setTaxRegime] = useState("simples_nacional");
  const [environment, setEnvironment] = useState("sandbox");

  useEffect(() => {
    api.get(API_ENDPOINTS.FISCAL.CONFIG)
      .then((res) => {
        const attr = res.data?.data?.attributes ?? {};
        setEnabled(attr.enabled ?? false);
        setCompanyId(attr.company_id ?? "");
        setNcmDefault(attr.ncm_default ?? "21069090");
        setTaxRegime(attr.tax_regime ?? "simples_nacional");
        setEnvironment(attr.environment ?? "sandbox");
      })
      .catch(() => toast.error("Erro ao carregar configurações fiscais"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await api.put(API_ENDPOINTS.FISCAL.CONFIG, {
        enabled,
        api_token: apiToken || undefined,
        company_id: companyId,
        ncm_default: ncmDefault,
        tax_regime: taxRegime,
        environment,
      });
      toast.success("Configurações fiscais salvas");
      setApiToken("");
    } catch {
      toast.error("Erro ao salvar configurações fiscais");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/settings" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          <h1 className="text-xl font-semibold">Notas Fiscais (NF-e)</h1>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium">Emissão automática de NF-e</Label>
            <p className="text-sm text-muted-foreground">
              Emite NF-e automaticamente quando um pedido é entregue
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="environment">Ambiente</Label>
          <Select value={environment} onValueChange={setEnvironment}>
            <SelectTrigger id="environment">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sandbox">Sandbox (testes)</SelectItem>
              <SelectItem value="production">Produção</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="tax_regime">Regime Tributário</Label>
          <Select value={taxRegime} onValueChange={setTaxRegime}>
            <SelectTrigger id="tax_regime">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
              <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
              <SelectItem value="lucro_real">Lucro Real</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="company_id">Company ID (nfe.io)</Label>
          <Input
            id="company_id"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            placeholder="Ex: 5f9b3b3b1234567890abcdef"
          />
          <p className="text-xs text-muted-foreground">
            ID da sua empresa no painel nfe.io
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="api_token">API Key (nfe.io)</Label>
          <div className="relative">
            <Input
              id="api_token"
              type={showApiToken ? "text" : "password"}
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Deixe em branco para manter a chave atual"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowApiToken((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showApiToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Encontre sua API Key no painel nfe.io → Configurações → API Keys
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="ncm_default">NCM Padrão</Label>
          <Input
            id="ncm_default"
            value={ncmDefault}
            onChange={(e) => setNcmDefault(e.target.value)}
            placeholder="21069090"
            maxLength={8}
          />
          <p className="text-xs text-muted-foreground">
            Código NCM aplicado a todos os itens (padrão: 21069090 – preparações alimentícias)
          </p>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Salvar configurações
      </Button>
    </div>
  );
}
