"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, QrCode, Copy, Check } from "lucide-react";
import AdminHeader from "@/components/admin/catalog-header";
import { useShop } from "@/hooks/use-shop";
import { toast } from "sonner";

export default function QRCodePage() {
  const { shop, isLoading } = useShop();
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const shopDomain = process.env.NEXT_PUBLIC_SHOP_DOMAIN || (typeof window !== "undefined" ? window.location.origin : "");
  const catalogUrl = shop?.slug ? `${shopDomain}/${shop.slug}` : "";

  const handleDownloadPng = () => {
    const tempCanvas = document.createElement("canvas");
    const size = 1024;
    tempCanvas.width = size;
    tempCanvas.height = size;

    const sourceCanvas = canvasRef.current?.querySelector("canvas");
    if (!sourceCanvas) return;

    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(sourceCanvas, 0, 0, size, size);

    const link = document.createElement("a");
    link.download = `qrcode-${shop?.slug || "cardapio"}.png`;
    link.href = tempCanvas.toDataURL("image/png");
    link.click();
  };

  const handleDownloadSvg = () => {
    const svgElement = svgRef.current?.querySelector("svg");
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.download = `qrcode-${shop?.slug || "cardapio"}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(catalogUrl);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar link");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full px-0 sm:px-4 lg:px-6 min-h-screen pb-20">
        <AdminHeader title="QR CODE DO CARDAPIO" description="Carregando..." className="mb-4" />
      </div>
    );
  }

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 min-h-screen pb-20">
      <AdminHeader
        title="QR CODE DO CARDAPIO"
        description="Gere QR Codes para impressao em materiais de divulgacao"
        className="mb-4"
      />

      <div className="w-full max-w-3xl mx-auto p-0 md:p-4 lg:p-6">
        <Card className="p-6 md:p-8 shadow-none border rounded-xs bg-white">
          <div className="flex flex-col items-center gap-6">
            {/* QR Code Preview */}
            <div
              ref={canvasRef}
              className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-200"
            >
              <QRCodeCanvas
                value={catalogUrl}
                size={256}
                level="H"
                marginSize={2}
                bgColor="#FFFFFF"
                fgColor="#000000"
              />
            </div>

            {/* Shop name */}
            <p className="text-lg font-semibold text-center text-foreground">
              {shop?.name}
            </p>

            {/* URL display */}
            <div className="w-full max-w-md flex gap-2">
              <Input
                value={catalogUrl}
                readOnly
                className="h-11 text-sm text-muted-foreground bg-muted/50"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={handleCopyUrl}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Download buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-11 gap-2"
                onClick={handleDownloadPng}
              >
                <Download className="h-4 w-4" />
                Baixar PNG (1024x1024)
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-11 gap-2"
                onClick={handleDownloadSvg}
              >
                <Download className="h-4 w-4" />
                Baixar SVG (vetorial)
              </Button>
            </div>

            {/* Hidden SVG for export */}
            <div ref={svgRef} className="hidden">
              <QRCodeSVG
                value={catalogUrl}
                size={1024}
                level="H"
                marginSize={2}
                bgColor="#FFFFFF"
                fgColor="#000000"
              />
            </div>

            {/* Tip */}
            <div className="w-full max-w-md bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <QrCode className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Dica de uso</p>
                  <p>
                    Imprima o QR Code em cartoes de visita, embalagens, panfletos
                    ou adesivos. Seus clientes podem escanear com a camera do
                    celular para acessar seu cardapio online.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

