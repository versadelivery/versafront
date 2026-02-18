"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { buildWhatsAppOrderMessage } from "@/utils/whatsapp-template";

// =============================================================================
// PREVIEW DO TEMPLATE
// =============================================================================

const PREVIEW_ORDER = {
  orderId: "1234",
  customerName: "João Silva",
  status: "em_preparo",
  items: [
    { name: "Pizza Margherita", quantity: 1, totalPrice: 45.9 },
    { name: "Refrigerante 2L", quantity: 2, totalPrice: 14.0, observation: "gelado" },
  ],
  paymentMethod: "manual_pix",
  deliveryType: "delivery" as const,
  total: 59.9,
};

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export default function NotificationsPage() {
  const [copied, setCopied] = useState(false);

  const previewMessage = buildWhatsAppOrderMessage(PREVIEW_ORDER);

  const handleCopy = () => {
    navigator.clipboard.writeText(previewMessage).then(() => {
      setCopied(true);
      toast.success("Template copiado!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notificações WhatsApp</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure e visualize o template de mensagem enviado aos clientes via WhatsApp.
        </p>
      </div>

      {/* Preview do template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Preview do Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Esta é a mensagem que será enviada ao cliente quando o status do pedido for atualizado.
          </p>

          {/* Bolha de WhatsApp */}
          <div className="bg-[#e9fbe5] border border-green-200 rounded-xl px-4 py-3 font-mono text-sm whitespace-pre-wrap text-gray-800 shadow-sm">
            {previewMessage}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar template
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Variáveis disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Variáveis do Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {[
              { key: "orderId", desc: "Número do pedido" },
              { key: "customerName", desc: "Nome do cliente" },
              { key: "status", desc: "Status atual do pedido" },
              { key: "items", desc: "Lista de itens do pedido" },
              { key: "total", desc: "Valor total do pedido" },
              { key: "paymentMethod", desc: "Forma de pagamento" },
              { key: "deliveryType", desc: "Tipo de entrega (delivery/pickup)" },
            ].map(({ key, desc }) => (
              <div key={key} className="flex items-center gap-3">
                <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">{key}</code>
                <span className="text-muted-foreground">{desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
