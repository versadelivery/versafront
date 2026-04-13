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
  /** Vindo da API após GET/PUT — indica se há chave salva (o valor nunca é enviado). */
  webhook_hmac_set?: boolean;
}

export default function FiscalSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiToken, setShowApiToken] = useState(false);
  const [showWebhookHmac, setShowWebhookHmac] = useState(false);

  const [enabled, setEnabled] = useState(false);
  const [apiToken, setApiToken] = useState("");
  const [webhookHmac, setWebhookHmac] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [ncmDefault, setNcmDefault] = useState("21069090");
  const [taxRegime, setTaxRegime] = useState("simples_nacional");
  const [environment, setEnvironment] = useState("sandbox");
  const [webhookHmacSet, setWebhookHmacSet] = useState(false);
  const [buyerCityIbge, setBuyerCityIbge] = useState("");
  const [buyerCityName, setBuyerCityName] = useState("");
  const [buyerStateUf, setBuyerStateUf] = useState("");
  const [buyerPostal, setBuyerPostal] = useState("");
  const [buyerCpf, setBuyerCpf] = useState("");
  const [buyerConsumidorCpfSet, setBuyerConsumidorCpfSet] = useState(false);

  async function loadFiscalConfig() {
    const res = await api.get(API_ENDPOINTS.FISCAL.CONFIG);
    const attr = res.data?.data?.attributes ?? {};
    setEnabled(attr.enabled ?? false);
    setCompanyId(attr.company_id ?? "");
    setNcmDefault(attr.ncm_default ?? "21069090");
    setTaxRegime(attr.tax_regime ?? "simples_nacional");
    setEnvironment(attr.environment ?? "sandbox");
    setWebhookHmacSet(Boolean(attr.webhook_hmac_set));
    setBuyerCityIbge(attr.buyer_address_city_ibge_code ?? "");
    setBuyerCityName(attr.buyer_address_city_name ?? "");
    setBuyerStateUf(attr.buyer_address_state ?? "");
    setBuyerPostal(attr.buyer_address_postal_code ?? "");
    setBuyerConsumidorCpfSet(Boolean(attr.buyer_consumidor_cpf_set));
    setBuyerCpf("");
  }

  useEffect(() => {
    loadFiscalConfig()
      .catch(() => toast.error("Erro ao carregar configurações fiscais"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const apiTokenTrimmed = apiToken.trim();
      const webhookHmacTrimmed = webhookHmac.trim();
      const buyerCpfTrimmed = buyerCpf.trim();
      const res = await api.put(API_ENDPOINTS.FISCAL.CONFIG, {
        enabled,
        api_token: apiTokenTrimmed ? apiTokenTrimmed : undefined,
        webhook_hmac: webhookHmacTrimmed ? webhookHmacTrimmed : undefined,
        company_id: companyId,
        ncm_default: ncmDefault,
        tax_regime: taxRegime,
        environment,
        buyer_address_city_ibge_code: buyerCityIbge.trim() || undefined,
        buyer_address_city_name: buyerCityName.trim() || undefined,
        buyer_address_state: buyerStateUf.trim() || undefined,
        buyer_address_postal_code: buyerPostal.trim() || undefined,
        buyer_consumidor_cpf: buyerCpfTrimmed ? buyerCpfTrimmed : undefined,
      });
      const saved = Boolean(res.data?.data?.attributes?.webhook_hmac_set);
      setWebhookHmacSet(saved);
      toast.success("Configurações fiscais salvas");
      setApiToken("");
      setWebhookHmac("");
      setBuyerCpf("");
      await loadFiscalConfig();
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
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            <h1 className="text-xl font-semibold">Notas Fiscais (NF-e)</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Configuração da integração com a nfe.io. O histórico das notas emitidas fica em outra tela.
          </p>
        </div>
      </div>

      <Link
        href="/admin/financeiro/notas-fiscais"
        className="block rounded-lg border border-indigo-200 bg-indigo-50/60 px-4 py-3 text-sm text-indigo-950 hover:bg-indigo-50 transition-colors"
      >
        <span className="font-medium">Ver histórico de NF-e emitidas</span>
        <span className="block text-xs text-indigo-900/80 mt-1">
          Lista de pedidos com nota (pendente, processando, emitida ou erro). É aqui que você acompanha após marcar um pedido como entregue.
        </span>
      </Link>

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
          <Label htmlFor="webhook_hmac">Chave HMAC do webhook (nfe.io)</Label>
          <div className="relative">
            <Input
              id="webhook_hmac"
              type={showWebhookHmac ? "text" : "password"}
              value={webhookHmac}
              onChange={(e) => setWebhookHmac(e.target.value)}
              placeholder="Deixe em branco para manter a chave atual"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowWebhookHmac((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showWebhookHmac ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Chave HMAC gerada ao cadastrar o webhook no painel nfe.io. URL do webhook: <code className="bg-muted px-1 rounded">/webhooks/nfe_io</code>
          </p>
          <p className="text-xs text-muted-foreground mt-1" data-testid="webhook-hmac-status">
            {webhookHmacSet
              ? "Status no servidor: chave HMAC cadastrada."
              : "Status no servidor: nenhuma chave HMAC cadastrada ainda."}
          </p>
        </div>

        <div className="space-y-3 rounded-md border border-dashed p-3 bg-muted/30">
          <p className="text-sm font-medium">Comprador na NF-e (cidade / CEP)</p>
          <p className="text-xs text-muted-foreground">
            O endereço de entrega do pedido entra na rua quando existir. Cidade, UF e CEP aqui são usados quando o pedido não tem CEP cadastrado. Se vazio, usamos Fortaleza/CE como referência apenas para a API aceitar o payload.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <Label htmlFor="buyer_ibge">Código IBGE da cidade</Label>
              <Input
                id="buyer_ibge"
                value={buyerCityIbge}
                onChange={(e) => setBuyerCityIbge(e.target.value)}
                placeholder="Ex: 2304400"
                maxLength={7}
              />
            </div>
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <Label htmlFor="buyer_city">Nome da cidade</Label>
              <Input
                id="buyer_city"
                value={buyerCityName}
                onChange={(e) => setBuyerCityName(e.target.value)}
                placeholder="Ex: Fortaleza"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="buyer_uf">UF</Label>
              <Input
                id="buyer_uf"
                value={buyerStateUf}
                onChange={(e) => setBuyerStateUf(e.target.value.toUpperCase())}
                placeholder="CE"
                maxLength={2}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="buyer_cep">CEP (8 dígitos)</Label>
              <Input
                id="buyer_cep"
                value={buyerPostal}
                onChange={(e) => setBuyerPostal(e.target.value)}
                placeholder="60160196"
                maxLength={9}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="buyer_cpf">CPF padrão do comprador (opcional)</Label>
            <Input
              id="buyer_cpf"
              type="password"
              value={buyerCpf}
              onChange={(e) => setBuyerCpf(e.target.value)}
              placeholder="Deixe em branco para usar CPF técnico interno ou para manter o atual"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              {buyerConsumidorCpfSet
                ? "Há um CPF padrão salvo no servidor. Informe de novo apenas para trocar."
                : "Sem CPF aqui, o sistema envia um CPF válido só para homologação/testes até você configurar o documento real do cliente."}
            </p>
          </div>
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
