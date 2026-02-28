"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CreditCard, Wallet, QrCode } from "lucide-react";
import { usePayment } from "./usePayment";
import { AdjustmentType, ValueType } from "./payment-service";
import AdminHeader from "@/components/admin/catalog-header";

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
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

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
          name: "PIX",
          description: "Pagamento via PIX com chave cadastrada",
          icon: <QrCode className="w-5 h-5 text-primary" />,
          enabled: attrs.manual_pix,
          adjustmentType: attrs.manual_pix_adjustment_type || "none",
          adjustmentValue: attrs.manual_pix_adjustment_value || "0",
          valueType: attrs.manual_pix_value_type || "fixed"
        }
      ]);
    }
  }, [paymentMethodsData]);

  const handleTogglePaymentMethod = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(method =>
        method.id === id
          ? { ...method, enabled: !method.enabled }
          : method
      )
    );
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
          manual_pix: pix?.enabled || false,
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
          manual_pix_value_type: pix?.valueType || "fixed"
        }
      }
    });
  };

  const hasChanges = paymentMethodsData && paymentMethods.some(method => {
    const attrKey = idToAttributeKey[method.id as keyof typeof idToAttributeKey];
    const attrs = paymentMethodsData.data.attributes;
    if (method.enabled !== attrs[attrKey]) return true;

    const adjTypeKey = `${attrKey}_adjustment_type` as keyof typeof attrs;
    const adjValueKey = `${attrKey}_adjustment_value` as keyof typeof attrs;
    const valTypeKey = `${attrKey}_value_type` as keyof typeof attrs;

    if (method.adjustmentType !== (attrs[adjTypeKey] || "none")) return true;
    if (method.adjustmentValue !== (attrs[adjValueKey] || "0")) return true;
    if (method.valueType !== (attrs[valTypeKey] || "fixed")) return true;

    return false;
  });

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 min-h-screen pb-20">
      <AdminHeader
        title="CONFIGURAÇÕES DE PAGAMENTO"
        description="Gerencie os meios de pagamento disponíveis no seu estabelecimento"
        className="mb-4"
      />

      {isLoading && (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      )}

      {!isLoading && paymentMethods.length > 0 && (
        <div className="w-full max-w-7xl mx-auto p-0 md:p-4 lg:p-6 bg-white">
          <Card className="p-4 md:p-6 shadow-none border-none rounded-xs bg-white">
            <div className="space-y-6 md:space-y-8">
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {method.icon}
                        <div className="space-y-1">
                          <h3 className="font-medium">{method.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {method.description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={method.enabled}
                        onCheckedChange={() => handleTogglePaymentMethod(method.id)}
                        disabled={isUpdating}
                      />
                    </div>

                    {method.enabled && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <Select
                            value={method.adjustmentType}
                            onValueChange={(value) => handleAdjustmentTypeChange(method.id, value as AdjustmentType)}
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="w-full sm:w-[160px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(adjustmentTypeLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
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
                                className="w-full sm:w-[120px]"
                                placeholder="Valor"
                              />
                              <div className="flex rounded-md border border-gray-300 overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => handleValueTypeChange(method.id, "fixed")}
                                  disabled={isUpdating}
                                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                                    method.valueType === "fixed"
                                      ? "bg-primary text-white"
                                      : "bg-white text-gray-700 hover:bg-gray-100"
                                  }`}
                                >
                                  R$
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleValueTypeChange(method.id, "percentage")}
                                  disabled={isUpdating}
                                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                                    method.valueType === "percentage"
                                      ? "bg-primary text-white"
                                      : "bg-white text-gray-700 hover:bg-gray-100"
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
              </div>

              <Separator className="my-6 bg-gray-200 dark:bg-gray-800" />

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full sm:w-auto p-6 h-11 border-none shadow-xs rounded-xs hover:bg-gray-100"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={!hasChanges || isUpdating}
                  className="w-full sm:w-auto p-6 h-11 border-none shadow-xs rounded-xs hover:bg-primary/90"
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Salvar alterações"
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
