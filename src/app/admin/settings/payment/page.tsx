"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Loader2, CreditCard, Wallet, QrCode } from "lucide-react";
import { usePayment } from "./usePayment";
import AdminHeader from "@/components/admin/catalog-header";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

const idToAttributeKey = {
  cash: 'cash',
  credit_card: 'credit',
  debit_card: 'debit',
  pix: 'manual_pix'
} as const;

export default function PaymentSettingsPage() {
  const { paymentMethodsData, isLoading, updatePaymentMethodsMutation, isUpdating } = usePayment();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    if (paymentMethodsData) {
      setPaymentMethods([
        {
          id: "cash",
          name: "Dinheiro",
          description: "Pagamento em espécie no momento da entrega",
          icon: <Wallet className="w-5 h-5 text-primary" />,
          enabled: paymentMethodsData.data.attributes.cash
        },
        {
          id: "credit_card",
          name: "Cartão de Crédito",
          description: "Pagamento com cartão de crédito na maquininha",
          icon: <CreditCard className="w-5 h-5 text-primary" />,
          enabled: paymentMethodsData.data.attributes.credit
        },
        {
          id: "debit_card",
          name: "Cartão de Débito",
          description: "Pagamento com cartão de débito na maquininha",
          icon: <CreditCard className="w-5 h-5 text-primary" />,
          enabled: paymentMethodsData.data.attributes.debit
        },
        {
          id: "pix",
          name: "PIX",
          description: "Pagamento via PIX com chave cadastrada",
          icon: <QrCode className="w-5 h-5 text-primary" />,
          enabled: paymentMethodsData.data.attributes.manual_pix
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

  const handleSaveSettings = async () => {
    if (!paymentMethodsData) return;
    await updatePaymentMethodsMutation.mutateAsync({
      data: {
        id: paymentMethodsData.data.id,
        type: "shop_payment_config",
        attributes: {
          cash: paymentMethods.find(method => method.id === "cash")?.enabled || false,
          credit: paymentMethods.find(method => method.id === "credit_card")?.enabled || false,
          debit: paymentMethods.find(method => method.id === "debit_card")?.enabled || false,
          manual_pix: paymentMethods.find(method => method.id === "pix")?.enabled || false
        }
      }
    });
  };

  const hasChanges = paymentMethodsData && paymentMethods.some(method => {
    const attributeKey = idToAttributeKey[method.id as keyof typeof idToAttributeKey];
    return method.enabled !== paymentMethodsData.data.attributes[attributeKey];
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
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
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