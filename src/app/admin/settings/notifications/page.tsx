"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/catalog-header";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useShop } from "@/hooks/use-shop";
import { Loader2 } from "lucide-react";
import { DEFAULT_WHATSAPP_ORDER_TEMPLATE } from "@/lib/build-whatsapp-order-message";

const PLACEHOLDERS = [
  { key: "{mensagem_principal}", desc: "Frase conforme status (aceito / em preparo / pronto para entrega / saiu / entregue)" },
  { key: "{nome_loja}", desc: "Nome da loja (maiúsculas)" },
  { key: "{link_acompanhar}", desc: "Link para o cliente acompanhar o pedido" },
  { key: "{senha}", desc: "Senha do pedido (últimos 2 dígitos do ID)" },
  { key: "{numero_pedido}", desc: "Número do pedido" },
  { key: "{data_hora}", desc: "Data e hora do pedido" },
  { key: "{tipo_pedido}", desc: "Delivery ou Retirada na loja" },
  { key: "{estimativa}", desc: "Estimativa de tempo (ex: 25 - 45 minutos)" },
  { key: "{nome_cliente}", desc: "Nome do cliente" },
  { key: "{fone_cliente}", desc: "Telefone do cliente" },
  { key: "{endereco}", desc: "Endereço (rua, número)" },
  { key: "{bairro}", desc: "Bairro" },
  { key: "{complemento}", desc: "Complemento" },
  { key: "{referencia}", desc: "Ponto de referência" },
  { key: "{itens_detalhados}", desc: "Lista dos itens com quantidade e valor" },
  { key: "{itens_resumo}", desc: "Mesmo que itens_detalhados" },
  { key: "{itens_total}", desc: "Subtotal dos itens (R$)" },
  { key: "{entrega}", desc: "Taxa de entrega (R$)" },
  { key: "{total}", desc: "Total do pedido (R$)" },
  { key: "{pagamento}", desc: "Forma de pagamento" },
  { key: "{chave_pix}", desc: "Chave PIX (quando for PIX)" },
  { key: "{chave_pix_linha}", desc: "Linha completa Pagamento + Chave PIX" },
  { key: "{link_repetir}", desc: "Link para repetir o pedido" },
  { key: "{desconto}", desc: "Desconto (se houver)" },
  { key: "{cupom}", desc: "Cupom aplicado (se houver)" },
  { key: "{pontos_ganhos}", desc: "Pontos ganhos (se houver)" },
];

export default function NotificationsSettingsPage() {
  const { shop, isLoading, updateShop, isUpdating } = useShop();
  const [template, setTemplate] = useState("");
  const [initialTemplate, setInitialTemplate] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (shop && !isLoading) {
      const value = shop.whatsapp_order_confirmation_template ?? "";
      setTemplate(value);
      setInitialTemplate(value);
    }
  }, [shop, isLoading]);

  useEffect(() => {
    setHasChanges(template !== initialTemplate);
  }, [template, initialTemplate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;
    updateShop({ whatsapp_order_confirmation_template: template });
    setInitialTemplate(template);
  };

  if (isLoading) {
    return (
      <div className="w-full px-0 sm:px-4 lg:px-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6">
      <AdminHeader
        title="NOTIFICAÇÕES"
        description="Template da mensagem enviada pela loja ao cliente via WhatsApp (botão na tela de pedidos)"
        className="mb-4"
      />

      <div className="w-full max-w-7xl mx-auto p-0 md:p-4 lg:p-6 bg-white">
        <Card className="p-4 md:p-6 shadow-none border-none rounded-xs bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="template" className="text-muted-foreground">
                Modelo da mensagem de confirmação (pedido aceito)
              </Label>
              <Textarea
                id="template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                placeholder={DEFAULT_WHATSAPP_ORDER_TEMPLATE}
                className="min-h-[180px] text-base border-gray-300 dark:border-gray-700 focus-visible:ring-primary resize-y"
              />
              <p className="text-xs text-muted-foreground">
                Use os placeholders abaixo; eles serão substituídos pelos dados do pedido. Se deixar em branco, será usado um texto padrão.
              </p>
            </div>

            <div className="rounded-md border border-gray-200 dark:border-gray-800 p-4 bg-muted/30">
              <p className="text-sm font-medium text-foreground mb-2">Placeholders disponíveis</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {PLACEHOLDERS.map(({ key, desc }) => (
                  <li key={key}>
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{key}</code> — {desc}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="submit"
                disabled={!hasChanges || isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
