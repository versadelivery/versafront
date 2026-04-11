"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { MonthlyCharge } from "../services/billingService";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  charge: MonthlyCharge | null;
}

export default function PaymentModal({
  isOpen,
  onClose,
  charge,
}: PaymentModalProps) {
  const [copied, setCopied] = useState(false);

  if (!charge) return null;

  const { attributes } = charge;
  const chargeAmount = parseFloat(attributes.charge_amount);

  const handleCopyPix = async () => {
    if (!attributes.asaas_pix_code) return;

    try {
      await navigator.clipboard.writeText(attributes.asaas_pix_code);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Erro ao copiar código");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-tomato flex items-center gap-2">
            Pagamento - {attributes.reference_period}
            <Badge
              variant={
                attributes.status === "overdue" ? "destructive" : "secondary"
              }
            >
              {attributes.status_description}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(chargeAmount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Vencimento</p>
                  <p
                    className={`font-medium ${
                      attributes.is_overdue ? "text-red-500" : ""
                    }`}
                  >
                    {formatDate(attributes.due_date)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {attributes.tier_description}
              </p>
            </CardContent>
          </Card>

          {/* Se já pago */}
          {attributes.status === "paid" && (
            <Card className="border-green-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">
                    Pagamento confirmado em {formatDate(attributes.paid_at!)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* PIX */}
          {attributes.status !== "paid" && chargeAmount > 0 && (
            <div className="space-y-4">
              {attributes.asaas_pix_code ? (
                <>
                  <div className="flex justify-center p-4 bg-white rounded-lg border">
                    <QRCodeSVG
                      value={attributes.asaas_pix_code}
                      size={200}
                      level="M"
                    />
                  </div>
                  <Button
                    onClick={handleCopyPix}
                    className="w-full"
                    variant={copied ? "secondary" : "default"}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar código PIX
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Escaneie o QR Code ou copie o código para pagar via PIX
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8" />
                  <p>PIX não disponível para esta cobrança</p>
                </div>
              )}
            </div>
          )}

          {/* Tier gratuito */}
          {chargeAmount === 0 && attributes.status !== "paid" && (
            <Card className="border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-blue-700">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">
                    Você está no tier gratuito! Não há cobrança este mês.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Link para fatura */}
          {attributes.asaas_invoice_url && (
            <Button variant="outline" asChild className="w-full">
              <a
                href={attributes.asaas_invoice_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver fatura completa
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
