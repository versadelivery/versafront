"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CreditCard, Wallet, QrCode, ArrowLeft, Percent, Zap, Eye, EyeOff, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { usePayment } from "./usePayment";
import { AdjustmentType, ValueType } from "./payment-service";
import { useShop } from "@/hooks/use-shop";
import Link from "next/link";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  adjustmentType: AdjustmentType;
  adjustmentValue: string;
  valueType: ValueType;
}

interface AsaasPixConfig {
  enabled: boolean;
  apiKey: string;
  webhookToken: string;
  document: string;
  adjustmentType: AdjustmentType;
  adjustmentValue: string;
  valueType: ValueType;
  expirationMinutes: string;
}

const idToAttributeKey = {
  cash: 'cash',
  credit_card: 'credit',
  debit_card: 'debit',
  pix: 'manual_pix'
} as const;

const adjustmentTypeLabels: Record<AdjustmentType, string> = {
  none: "Nenhum",
  discount: "Desconto",
  surcharge: "Acréscimo"
};

export default function PaymentSettingsPage() {
  const { paymentMethodsData, isLoading, updatePaymentMethodsMutation, isUpdating } = usePayment();
  const { shop } = useShop();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [serviceFee, setServiceFee] = useState({ enabled: false, percentage: "10" });
  const [asaasPix, setAsaasPix] = useState<AsaasPixConfig>({
    enabled: false,
    apiKey: '',
    webhookToken: '',
    document: '',
    adjustmentType: 'none',
    adjustmentValue: '0',
    valueType: 'fixed',
    expirationMinutes: '30',
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhookToken, setShowWebhookToken] = useState(false);

  useEffect(() => {
    if (paymentMethodsData) {
      const attrs = paymentMethodsData.data.attributes;
      setPaymentMethods([
        {
          id: "cash",
          name: "Dinheiro",
          description: "Pagamento em espécie no momento da entrega",
          icon: <Wallet className="w-5 h-5 text-primary" />,
          enabled: attrs.cash,
          adjustmentType: attrs.cash_adjustment_type || "none",
          adjustmentValue: attrs.cash_adjustment_value || "0",
          valueType: attrs.cash_value_type || "fixed"
        },
        {
          id: "credit_card",
          name: "Cartão de Crédito",
          description: "Pagamento com cartão de crédito na maquininha",
          icon: <CreditCard className="w-5 h-5 text-primary" />,
          enabled: attrs.credit,
          adjustmentType: attrs.credit_adjustment_type || "none",
          adjustmentValue: attrs.credit_adjustment_value || "0",
          valueType: attrs.credit_value_type || "fixed"
        },
        {
          id: "debit_card",
          name: "Cartão de Débito",
          description: "Pagamento com cartão de débito na maquininha",
          icon: <CreditCard className="w-5 h-5 text-primary" />,
          enabled: attrs.debit,
          adjustmentType: attrs.debit_adjustment_type || "none",
          adjustmentValue: attrs.debit_adjustment_value || "0",
          valueType: attrs.debit_value_type || "fixed"
        },
        {
          id: "pix",
          name: "PIX Manual",
          description: "Cliente envia comprovante para o estabelecimento",
          icon: <QrCode className="w-5 h-5 text-primary" />,
          // if asaas_pix is active, manual_pix is forced off
          enabled: attrs.asaas_pix ? false : attrs.manual_pix,
          adjustmentType: attrs.manual_pix_adjustment_type || "none",
          adjustmentValue: attrs.manual_pix_adjustment_value || "0",
          valueType: attrs.manual_pix_value_type || "fixed"
        }
      ]);
      setServiceFee({
        enabled: attrs.service_fee_enabled ?? false,
        percentage: attrs.service_fee_percentage ?? "10",
      });
      setAsaasPix({
        enabled: attrs.asaas_pix ?? false,
        apiKey: attrs.asaas_api_key ?? '',
        webhookToken: attrs.asaas_webhook_token ?? '',
        document: attrs.asaas_document ?? '',
        adjustmentType: attrs.asaas_pix_adjustment_type ?? 'none',
        adjustmentValue: attrs.asaas_pix_adjustment_value ?? '0',
        valueType: attrs.asaas_pix_value_type ?? 'fixed',
        expirationMinutes: String(attrs.asaas_pix_expiration_minutes ?? 30),
      });
    }
  }, [paymentMethodsData]);

  const handleTogglePaymentMethod = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(method =>
        method.id === id ? { ...method, enabled: !method.enabled } : method
      )
    );
  };

  const handleToggleAsaasPix = (enabled: boolean) => {
    setAsaasPix(prev => ({ ...prev, enabled }));
    // when enabling asaas_pix, disable manual_pix
    if (enabled) {
      setPaymentMethods(prev =>
        prev.map(m => m.id === 'pix' ? { ...m, enabled: false } : m)
      );
    }
  };

  const handleToggleManualPix = (id: string) => {
    if (id !== 'pix') {
      handleTogglePaymentMethod(id);
      return;
    }
    const current = paymentMethods.find(m => m.id === 'pix');
    const willEnable = !current?.enabled;
    if (willEnable && asaasPix.enabled) {
      // disable asaas_pix when enabling manual_pix
      setAsaasPix(prev => ({ ...prev, enabled: false }));
    }
    handleTogglePaymentMethod(id);
  };

  const handleAdjustmentTypeChange = (id: string, value: AdjustmentType) => {
    setPaymentMethods(prev =>
      prev.map(method =>
        method.id === id
          ? { ...method, adjustmentType: value, adjustmentValue: value === "none" ? "0" : method.adjustmentValue }
          : method
      )
    );
  };

  const handleAdjustmentValueChange = (id: string, value: string) => {
    setPaymentMethods(prev =>
      prev.map(method =>
        method.id === id ? { ...method, adjustmentValue: value } : method
      )
    );
  };

  const handleValueTypeChange = (id: string, value: ValueType) => {
    setPaymentMethods(prev =>
      prev.map(method =>
        method.id === id ? { ...method, valueType: value } : method
      )
    );
  };

  const handleSaveSettings = async () => {
    if (!paymentMethodsData) return;

    const getMethod = (id: string) => paymentMethods.find(m => m.id === id);
    const cash = getMethod("cash");
    const credit = getMethod("credit_card");
    const debit = getMethod("debit_card");
    const pix = getMethod("pix");

    await updatePaymentMethodsMutation.mutateAsync({
      data: {
        id: paymentMethodsData.data.id,
        type: "shop_payment_config",
        attributes: {
          cash: cash?.enabled || false,
          credit: credit?.enabled || false,
          debit: debit?.enabled || false,
          manual_pix: asaasPix.enabled ? false : (pix?.enabled || false),
          cash_adjustment_type: cash?.adjustmentType || "none",
          cash_adjustment_value: cash?.adjustmentValue || "0",
          cash_value_type: cash?.valueType || "fixed",
          debit_adjustment_type: debit?.adjustmentType || "none",
          debit_adjustment_value: debit?.adjustmentValue || "0",
          debit_value_type: debit?.valueType || "fixed",
          credit_adjustment_type: credit?.adjustmentType || "none",
          credit_adjustment_value: credit?.adjustmentValue || "0",
          credit_value_type: credit?.valueType || "fixed",
          manual_pix_adjustment_type: pix?.adjustmentType || "none",
          manual_pix_adjustment_value: pix?.adjustmentValue || "0",
          manual_pix_value_type: pix?.valueType || "fixed",
          service_fee_enabled: serviceFee.enabled,
          service_fee_percentage: serviceFee.percentage,
          asaas_pix: asaasPix.enabled,
          asaas_api_key: asaasPix.apiKey || null,
          asaas_webhook_token: asaasPix.webhookToken || null,
          asaas_document: asaasPix.document || null,
          asaas_pix_adjustment_type: asaasPix.adjustmentType,
          asaas_pix_adjustment_value: asaasPix.adjustmentValue,
          asaas_pix_value_type: asaasPix.valueType,
          asaas_pix_expiration_minutes: parseInt(asaasPix.expirationMinutes) || 30,
        }
      }
    });
  };

  const hasChanges = paymentMethodsData && (() => {
    const attrs = paymentMethodsData.data.attributes;

    if (serviceFee.enabled !== (attrs.service_fee_enabled ?? false)) return true;
    if (String(serviceFee.percentage) !== String(attrs.service_fee_percentage ?? "10")) return true;

    if (asaasPix.enabled !== (attrs.asaas_pix ?? false)) return true;
    if (asaasPix.apiKey !== (attrs.asaas_api_key ?? '')) return true;
    if (asaasPix.webhookToken !== (attrs.asaas_webhook_token ?? '')) return true;
  if (asaasPix.document !== (attrs.asaas_document ?? '')) return true;
    if (asaasPix.adjustmentType !== (attrs.asaas_pix_adjustment_type ?? 'none')) return true;
    if (asaasPix.adjustmentValue !== (attrs.asaas_pix_adjustment_value ?? '0')) return true;
    if (asaasPix.valueType !== (attrs.asaas_pix_value_type ?? 'fixed')) return true;
    if (asaasPix.expirationMinutes !== String(attrs.asaas_pix_expiration_minutes ?? 30)) return true;

    return paymentMethods.some(method => {
      const attrKey = idToAttributeKey[method.id as keyof typeof idToAttributeKey];
      if (method.enabled !== attrs[attrKey]) return true;
      const adjTypeKey = `${attrKey}_adjustment_type` as keyof typeof attrs;
      const adjValueKey = `${attrKey}_adjustment_value` as keyof typeof attrs;
      const valTypeKey = `${attrKey}_value_type` as keyof typeof attrs;
      if (method.adjustmentType !== (attrs[adjTypeKey] || "none")) return true;
      if (method.adjustmentValue !== (attrs[adjValueKey] || "0")) return true;
      if (method.valueType !== (attrs[valTypeKey] || "fixed")) return true;
      return false;
    });
  })();

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const webhookUrl = shop?.id
    ? `${process.env.NEXT_PUBLIC_API_URL || 'https://api.versaapp.com.br'}/webhooks/asaas/orders/${shop.id}`
    : '';

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header admin padrao */}
      <div className="bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/settings"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">Voltar</span>
              </Link>
              <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
              <h1 className="font-tomato text-base sm:text-lg font-bold text-gray-900">Meios de Pagamento</h1>
            </div>
            <Button
              type="button"
              onClick={handleSaveSettings}
              disabled={!hasChanges || isUpdating}
              className="rounded-md border border-gray-300 cursor-pointer bg-primary text-white hover:bg-primary/90 text-sm"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Conteudo */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Taxa de Servico */}
            <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Percent className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-tomato text-base font-semibold text-gray-900">Taxa de Serviço</h3>
                    <p className="text-sm text-muted-foreground">
                      Aplicada automaticamente ao fechar comandas de mesa
                    </p>
                  </div>
                </div>
                <Switch
                  checked={serviceFee.enabled}
                  onCheckedChange={(checked) => setServiceFee(prev => ({ ...prev, enabled: checked }))}
                  disabled={isUpdating}
                />
              </div>
              {serviceFee.enabled && (
                <div className="px-5 py-4 border-t border-[#E5E2DD] bg-[#FAF9F7]">
                  <div className="flex items-center gap-3">
                    <Label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Percentual
                    </Label>
                    <div className="relative w-[120px]">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={serviceFee.percentage}
                        onChange={(e) => setServiceFee(prev => ({ ...prev, percentage: e.target.value }))}
                        disabled={isUpdating}
                        className="rounded-md border-[#E5E2DD] bg-white pr-8"
                        placeholder="10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Metodos padrao */}
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden"
              >
                <div className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {method.icon}
                    <div>
                      <h3 className="font-tomato text-base font-semibold text-gray-900">{method.name}</h3>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                      {method.id === 'pix' && asaasPix.enabled && (
                        <p className="text-xs text-amber-600 mt-0.5">Desativado — PIX Automático está ativo</p>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={method.enabled}
                    onCheckedChange={() => handleToggleManualPix(method.id)}
                    disabled={isUpdating || (method.id === 'pix' && asaasPix.enabled)}
                  />
                </div>

                {method.enabled && (
                  <div className="px-5 py-4 border-t border-[#E5E2DD] bg-[#FAF9F7]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <Select
                        value={method.adjustmentType}
                        onValueChange={(value) => handleAdjustmentTypeChange(method.id, value as AdjustmentType)}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="w-full sm:w-[160px] rounded-md border-[#E5E2DD] bg-white cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-md border border-[#E5E2DD]">
                          {Object.entries(adjustmentTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {method.adjustmentType !== "none" && (
                        <>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={method.adjustmentValue}
                            onChange={(e) => handleAdjustmentValueChange(method.id, e.target.value)}
                            disabled={isUpdating}
                            className="w-full sm:w-[120px] rounded-md border-[#E5E2DD] bg-white"
                            placeholder="Valor"
                          />
                          <div className="flex rounded-md border border-[#E5E2DD] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleValueTypeChange(method.id, "fixed")}
                              disabled={isUpdating}
                              className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                                method.valueType === "fixed"
                                  ? "bg-primary text-white"
                                  : "bg-white text-gray-700 hover:bg-[#F0EFEB]"
                              }`}
                            >
                              R$
                            </button>
                            <button
                              type="button"
                              onClick={() => handleValueTypeChange(method.id, "percentage")}
                              disabled={isUpdating}
                              className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                                method.valueType === "percentage"
                                  ? "bg-primary text-white"
                                  : "bg-white text-gray-700 hover:bg-[#F0EFEB]"
                              }`}
                            >
                              %
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* PIX Automatico (ASAAS) */}
            <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-tomato text-base font-semibold text-gray-900">PIX Automático (ASAAS)</h3>
                    <p className="text-sm text-muted-foreground">
                      Gera QR Code PIX automaticamente via sua conta ASAAS
                    </p>
                    {asaasPix.enabled && paymentMethods.find(m => m.id === 'pix')?.enabled && (
                      <p className="text-xs text-amber-600 mt-0.5">PIX Manual será desativado ao salvar</p>
                    )}
                  </div>
                </div>
                <Switch
                  checked={asaasPix.enabled}
                  onCheckedChange={handleToggleAsaasPix}
                  disabled={isUpdating}
                />
              </div>

              {asaasPix.enabled && (
                <div className="px-5 py-5 border-t border-[#E5E2DD] bg-[#FAF9F7] space-y-4">
                  {/* API Key */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      API Key do ASAAS <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value={asaasPix.apiKey}
                        onChange={(e) => setAsaasPix(prev => ({ ...prev, apiKey: e.target.value }))}
                        disabled={isUpdating}
                        placeholder="$aact_..."
                        className="rounded-md border-[#E5E2DD] bg-white pr-10 font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700 cursor-pointer"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Webhook Token */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Token do Webhook
                    </Label>
                    <div className="relative">
                      <Input
                        type={showWebhookToken ? "text" : "password"}
                        value={asaasPix.webhookToken}
                        onChange={(e) => setAsaasPix(prev => ({ ...prev, webhookToken: e.target.value }))}
                        disabled={isUpdating}
                        placeholder="Token secreto para validar webhooks"
                        className="rounded-md border-[#E5E2DD] bg-white pr-10 font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowWebhookToken(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700 cursor-pointer"
                      >
                        {showWebhookToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Documento CPF/CNPJ */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      CPF / CNPJ da loja <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={asaasPix.document}
                      onChange={(e) => setAsaasPix(prev => ({ ...prev, document: e.target.value }))}
                      disabled={isUpdating}
                      placeholder="00.000.000/0001-00"
                      className="rounded-md border-[#E5E2DD] bg-white"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Usado para identificar sua loja no ASAAS. Não é solicitado ao cliente.
                    </p>
                  </div>

                  {/* Webhook URL */}
                  {webhookUrl && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" />
                        URL do Webhook (configure no painel ASAAS)
                      </Label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-white border border-[#E5E2DD] rounded-md px-3 py-2 text-gray-700 break-all">
                          {webhookUrl}
                        </code>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0 rounded-md border-[#E5E2DD] cursor-pointer"
                          onClick={() => navigator.clipboard.writeText(webhookUrl)}
                        >
                          Copiar
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Expiracao */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Expiração do PIX (minutos)
                    </Label>
                    <div className="relative w-[120px]">
                      <Input
                        type="number"
                        min="5"
                        max="1440"
                        value={asaasPix.expirationMinutes}
                        onChange={(e) => setAsaasPix(prev => ({ ...prev, expirationMinutes: e.target.value }))}
                        disabled={isUpdating}
                        className="rounded-md border-[#E5E2DD] bg-white"
                      />
                    </div>
                  </div>

                  {/* Ajuste de preco */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Ajuste de preço</Label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <Select
                        value={asaasPix.adjustmentType}
                        onValueChange={(v) => setAsaasPix(prev => ({
                          ...prev,
                          adjustmentType: v as AdjustmentType,
                          adjustmentValue: v === 'none' ? '0' : prev.adjustmentValue
                        }))}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="w-full sm:w-[160px] rounded-md border-[#E5E2DD] bg-white cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-md border border-[#E5E2DD]">
                          {Object.entries(adjustmentTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {asaasPix.adjustmentType !== 'none' && (
                        <>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={asaasPix.adjustmentValue}
                            onChange={(e) => setAsaasPix(prev => ({ ...prev, adjustmentValue: e.target.value }))}
                            disabled={isUpdating}
                            className="w-full sm:w-[120px] rounded-md border-[#E5E2DD] bg-white"
                            placeholder="Valor"
                          />
                          <div className="flex rounded-md border border-[#E5E2DD] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setAsaasPix(prev => ({ ...prev, valueType: 'fixed' }))}
                              disabled={isUpdating}
                              className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                                asaasPix.valueType === 'fixed'
                                  ? 'bg-primary text-white'
                                  : 'bg-white text-gray-700 hover:bg-[#F0EFEB]'
                              }`}
                            >
                              R$
                            </button>
                            <button
                              type="button"
                              onClick={() => setAsaasPix(prev => ({ ...prev, valueType: 'percentage' }))}
                              disabled={isUpdating}
                              className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                                asaasPix.valueType === 'percentage'
                                  ? 'bg-primary text-white'
                                  : 'bg-white text-gray-700 hover:bg-[#F0EFEB]'
                              }`}
                            >
                              %
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
