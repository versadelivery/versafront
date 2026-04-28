"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Copy, CheckCircle, ArrowLeft, Bell, Code } from "lucide-react";
import { toast } from "sonner";
import { buildWhatsAppOrderMessage } from "@/utils/whatsapp-template";

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
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header admin padrão */}
      <div className="bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16">
            <div className="flex items-center gap-4">
              <a
                href="/admin/settings"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">Voltar</span>
              </a>
              <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
              <h1 className="font-tomato text-base sm:text-lg font-bold text-gray-900">
                Notificações WhatsApp
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6 space-y-6 max-w-3xl">
        {/* Preview do template */}
        <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <h2 className="font-tomato text-base font-semibold text-gray-900">Preview do Template</h2>
          </div>
          <div className="px-5 py-5 space-y-4">
            <p className="text-sm text-muted-foreground">
              Esta é a mensagem que será enviada ao cliente quando o status do pedido for atualizado.
            </p>

            <div className="bg-[#e9fbe5] border border-green-400 rounded-md px-4 py-3 font-mono text-sm whitespace-pre-wrap text-gray-800">
              {previewMessage}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2 rounded-md border border-gray-300 cursor-pointer"
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
          </div>
        </div>

        {/* Variáveis disponíveis */}
        <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
            <Code className="h-4 w-4 text-primary" />
            <h2 className="font-tomato text-base font-semibold text-gray-900">Variáveis do Template</h2>
          </div>
          <div className="px-5 py-5">
            <div className="space-y-2.5">
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
                  <code className="bg-[#F0EFEB] px-2 py-0.5 rounded-md text-sm font-mono">{key}</code>
                  <span className="text-sm text-muted-foreground">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
