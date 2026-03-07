"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FileText, Download, Loader2 } from "lucide-react";
import AdminHeader from "@/components/admin/catalog-header";
import { useShop } from "@/hooks/use-shop";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/config";
import { API_ENDPOINTS } from "@/api/routes";
import { generateCatalogPdf } from "./generate-pdf";
import { toast } from "sonner";

export default function PdfCatalogPage() {
  const { shop, isLoading: shopLoading } = useShop();
  const [includePhotos, setIncludePhotos] = useState(false);
  const [includeDescriptions, setIncludeDescriptions] = useState(true);
  const [generating, setGenerating] = useState(false);

  const { data: catalogData, isLoading: catalogLoading } = useQuery({
    queryKey: ["catalog-groups-pdf"],
    queryFn: async () => {
      const response = await api.get(API_ENDPOINTS.CATALOG);
      return response.data;
    },
  });

  const isLoading = shopLoading || catalogLoading;

  const handleGenerate = async () => {
    if (!catalogData?.data || !shop) return;

    setGenerating(true);
    try {
      await generateCatalogPdf(
        {
          name: shop.name,
          cellphone: shop.cellphone,
          address: shop.address,
          email: shop.email,
          description: shop.description,
        },
        catalogData.data,
        { includePhotos, includeDescriptions }
      );
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar o PDF. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  const groupCount = catalogData?.data?.length || 0;
  const itemCount =
    catalogData?.data?.reduce((acc: number, group: any) => {
      const items = group.attributes?.items || group.attributes?.items?.data || [];
      return acc + (Array.isArray(items) ? items.length : 0);
    }, 0) || 0;

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 min-h-screen pb-20">
      <AdminHeader
        title="CARDAPIO EM PDF"
        description="Exporte seu catalogo completo como PDF profissional"
        className="mb-4"
      />

      <div className="w-full max-w-3xl mx-auto p-0 md:p-4 lg:p-6">
        <Card className="p-6 md:p-8 shadow-none border rounded-xs bg-white">
          <div className="flex flex-col gap-6">
            {/* Preview info */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <FileText className="h-10 w-10 text-purple-500 shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">
                  {shop?.name || "Carregando..."}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isLoading
                    ? "Carregando catalogo..."
                    : `${groupCount} grupos | ${itemCount} itens`}
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Opcoes do PDF</h4>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="descriptions" className="font-medium">
                    Incluir descricoes
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Adiciona a descricao de cada item no PDF
                  </p>
                </div>
                <Switch
                  id="descriptions"
                  checked={includeDescriptions}
                  onCheckedChange={setIncludeDescriptions}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="photos" className="font-medium">
                    Incluir fotos
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Adiciona as fotos dos itens (pode demorar mais)
                  </p>
                </div>
                <Switch
                  id="photos"
                  checked={includePhotos}
                  onCheckedChange={setIncludePhotos}
                />
              </div>
            </div>

            {/* Generate button */}
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 gap-2 text-base"
              onClick={handleGenerate}
              disabled={isLoading || generating || itemCount === 0}
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Gerar e baixar PDF
                </>
              )}
            </Button>

            {itemCount === 0 && !isLoading && (
              <p className="text-sm text-center text-muted-foreground">
                Nenhum item encontrado no catalogo. Adicione itens antes de gerar o PDF.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
