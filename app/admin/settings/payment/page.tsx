"use client";

import { useState } from "react";
import { Header } from "../../../components/catalog/catalog-header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";
import { Switch } from "@/app/components/ui/switch";
import { Loader2, CreditCard, Wallet, QrCode, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export default function PaymentSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "cash",
      name: "Dinheiro",
      description: "Pagamento em espécie no momento da entrega",
      icon: <Wallet className="w-5 h-5 text-primary" />,
      enabled: true
    },
    {
      id: "credit_card",
      name: "Cartão de Crédito",
      description: "Pagamento com cartão de crédito na maquininha",
      icon: <CreditCard className="w-5 h-5 text-primary" />,
      enabled: true
    },
    {
      id: "debit_card",
      name: "Cartão de Débito",
      description: "Pagamento com cartão de débito na maquininha",
      icon: <CreditCard className="w-5 h-5 text-primary" />,
      enabled: true
    },
    {
      id: "pix",
      name: "PIX",
      description: "Pagamento via PIX com chave cadastrada",
      icon: <QrCode className="w-5 h-5 text-primary" />,
      enabled: true
    }
  ]);

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
    setIsLoading(true);
    try {
      // TODO: Implementar chamada à API para salvar as configurações
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Simulando sucesso
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 min-h-screen pb-20">
      <Header
        title="CONFIGURAÇÕES DE PAGAMENTO"
        description="Gerencie os meios de pagamento disponíveis no seu estabelecimento"
        className="mb-4"
      />

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
                type="submit"
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="w-full sm:w-auto p-6 h-11 border-none shadow-xs rounded-xs hover:bg-primary/90"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Salvar alterações"
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 