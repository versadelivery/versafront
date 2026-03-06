"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  CheckCircle2,
  Clock,
  Truck,
  DollarSign,
  Package,
  Gift,
  AlertCircle,
  MapPin,
  Building2,
  Info,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { Switch } from "@/components/ui/switch";
import { useDelivery } from "@/hooks/use-delivery";
import { toast } from "sonner";
import { deliveryService } from "@/services/delivery-service";
import { useQueryClient } from "@tanstack/react-query";

type Neighborhood = {
  id: string;
  name: string;
  value: number;
  hasFreeDelivery: boolean;
  freeDeliveryThreshold: number;
};

const blockInvalidChars = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (['-', '+', '=', '*', '&', '/', 'e', 'E'].includes(e.key)) {
    e.preventDefault();
  }
};

export default function DeliverySettingsPage() {
  const {
    deliveryConfig,
    neighborhoods,
    isLoading,
    updateDeliveryConfig,
    createNeighborhood,
    updateNeighborhood,
    deleteNeighborhood,
    isUpdating
  } = useDelivery();
  const queryClient = useQueryClient();

  const [deliveryType, setDeliveryType] = useState<string>("to_be_agreed");
  const [fixedFee, setFixedFee] = useState<string>("");
  const [hasFreeDelivery, setHasFreeDelivery] = useState<boolean>(false);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<string>("");
  const [bulkAdjustValue, setBulkAdjustValue] = useState<string>("");
  const [minOrderValue, setMinOrderValue] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentNeighborhood, setCurrentNeighborhood] = useState<Neighborhood | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [errors, setErrors] = useState<{
    fixedFee?: string;
    freeDeliveryThreshold?: string;
    minOrderValue?: string;
    neighborhoodName?: string;
    neighborhoodValue?: string;
    neighborhoodFreeDeliveryThreshold?: string;
  }>({});
  const [savedDeliveryType, setSavedDeliveryType] = useState<string>("to_be_agreed");

  useEffect(() => {
    if (deliveryConfig) {
      const kind = deliveryConfig.delivery_fee_kind;
      setDeliveryType(kind);
      setSavedDeliveryType(kind);
      setFixedFee(deliveryConfig.amount?.toString() || "");
      setHasFreeDelivery(deliveryConfig.min_value_free_delivery !== null);
      setFreeDeliveryThreshold(deliveryConfig.min_value_free_delivery?.toString() || "");
      setMinOrderValue(deliveryConfig.minimum_order_value?.toString() || "");
    }
  }, [deliveryConfig]);

  const handleBulkAdjust = async (type: "increase" | "decrease") => {
    const adjustValue = parseFloat(bulkAdjustValue) || 0;
    if (adjustValue <= 0 || !neighborhoods?.length) return;

    setIsBulkUpdating(true);
    try {
      const updates = neighborhoods.map((n) => ({
        id: n.id,
        amount: Math.max(0, type === "increase" ? n.amount + adjustValue : n.amount - adjustValue),
      }));

      await Promise.all(
        updates.map(u => deliveryService.updateNeighborhood(u.id, { amount: u.amount }))
      );
      queryClient.invalidateQueries({ queryKey: ["delivery-config"] });
      toast.success(`Valores ${type === "increase" ? "aumentados" : "diminuidos"} com sucesso!`);
    } catch {
      toast.error("Erro ao atualizar valores dos bairros");
    } finally {
      setIsBulkUpdating(false);
      setBulkAdjustValue("");
    }
  };

  const handleAddNeighborhood = () => {
    if (!currentNeighborhood) return;

    const newErrors: typeof errors = {};

    if (!currentNeighborhood.name.trim()) {
      newErrors.neighborhoodName = "Nome do bairro e obrigatorio";
    }

    if (currentNeighborhood.hasFreeDelivery) {
      if (!currentNeighborhood.freeDeliveryThreshold || currentNeighborhood.freeDeliveryThreshold <= 0) {
        newErrors.neighborhoodFreeDeliveryThreshold = "Valor minimo para taxa gratuita e obrigatorio";
      }
    } else {
      if (!currentNeighborhood.value) {
        newErrors.neighborhoodValue = "Valor da entrega e obrigatorio";
      } else if (currentNeighborhood.value < 0) {
        newErrors.neighborhoodValue = "Valor nao pode ser negativo";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const onSuccess = () => {
      resetForm();
    };

    const onError = (error: any) => {
      const msg = error?.message || '';
      if (msg.toLowerCase().includes('name') || msg.toLowerCase().includes('nome') || msg.toLowerCase().includes('already') || msg.toLowerCase().includes('já')) {
        setErrors({ neighborhoodName: "Ja existe um bairro com este nome" });
      } else {
        toast.error(isEditing ? "Erro ao atualizar bairro" : "Erro ao criar bairro");
      }
    };

    const amount = currentNeighborhood.hasFreeDelivery ? 0 : currentNeighborhood.value;

    if (isEditing && currentNeighborhood.id) {
      updateNeighborhood({
        id: currentNeighborhood.id,
        data: {
          name: currentNeighborhood.name,
          amount,
          min_value_free_delivery: currentNeighborhood.hasFreeDelivery ? currentNeighborhood.freeDeliveryThreshold : null
        }
      }, { onSuccess, onError });
    } else {
      createNeighborhood({
        name: currentNeighborhood.name,
        amount,
        min_value_free_delivery: currentNeighborhood.hasFreeDelivery ? currentNeighborhood.freeDeliveryThreshold : null
      }, { onSuccess, onError });
    }
  };

  const handleEditNeighborhood = (neighborhood: Neighborhood) => {
    const autoFree = neighborhood.value === 0 && !neighborhood.hasFreeDelivery;
    setCurrentNeighborhood({
      ...neighborhood,
      hasFreeDelivery: autoFree || neighborhood.hasFreeDelivery,
      freeDeliveryThreshold: autoFree ? (neighborhood.freeDeliveryThreshold || 50) : neighborhood.freeDeliveryThreshold,
    });
    setIsEditing(true);
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleDeleteNeighborhood = async () => {
    if (!currentNeighborhood?.id) return;
    deleteNeighborhood(currentNeighborhood.id);
    setIsDeleteDialogOpen(false);
  };

  const resetForm = () => {
    setCurrentNeighborhood(null);
    setIsEditing(false);
    setIsDialogOpen(false);
    setErrors({});
  };

  const handleOpenNewNeighborhood = () => {
    setCurrentNeighborhood({
      id: "",
      name: "",
      value: 0,
      hasFreeDelivery: false,
      freeDeliveryThreshold: 0
    });
    setErrors({});
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleSaveDeliveryConfig = () => {
    const newErrors: typeof errors = {};

    const minVal = parseFloat(minOrderValue);
    if (minOrderValue && minVal < 0) {
      newErrors.minOrderValue = "Valor minimo nao pode ser negativo";
    }

    if (deliveryType === "fixed") {
      const feeVal = parseFloat(fixedFee);
      if (fixedFee && feeVal < 0) {
        newErrors.fixedFee = "Taxa nao pode ser negativa";
      }
    }

    if (hasFreeDelivery && parseFloat(freeDeliveryThreshold) <= parseFloat(fixedFee)) {
      newErrors.freeDeliveryThreshold = "O valor minimo para frete gratis deve ser maior que o valor da taxa";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateDeliveryConfig({
      delivery_fee_kind: deliveryType as "to_be_agreed" | "fixed" | "per_neighborhood",
      amount: parseFloat(fixedFee) || 0,
      min_value_free_delivery: hasFreeDelivery ? parseFloat(freeDeliveryThreshold) : null,
      minimum_order_value: parseFloat(minOrderValue) || 0
    });
  };

  const handleCancelConfig = () => {
    if (deliveryConfig) {
      setDeliveryType(savedDeliveryType);
      setFixedFee(deliveryConfig.amount?.toString() || "");
      setHasFreeDelivery(deliveryConfig.min_value_free_delivery !== null);
      setFreeDeliveryThreshold(deliveryConfig.min_value_free_delivery?.toString() || "");
      setMinOrderValue(deliveryConfig.minimum_order_value?.toString() || "");
    }
    setErrors({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header admin padrao */}
      <div className="bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a
                href="/admin/settings"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">Voltar</span>
              </a>
              <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
              <h1 className="text-base sm:text-lg font-bold text-gray-900">
                Configuracoes de Entrega
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Valor Minimo do Pedido */}
        <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-gray-900">Valor Minimo do Pedido</h2>
          </div>
          <div className="px-5 py-5">
            <p className="text-sm text-muted-foreground mb-4">
              Define o valor total minimo para que o cliente consiga finalizar um pedido
            </p>
            <div className="max-w-xs">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                  R$
                </span>
                <Input
                  id="minOrderValue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={minOrderValue}
                  onChange={(e) => {
                    setMinOrderValue(e.target.value);
                    if (errors.minOrderValue) setErrors(prev => ({ ...prev, minOrderValue: "" }));
                  }}
                  onKeyDown={blockInvalidChars}
                  placeholder="0,00"
                  className={`h-10 text-sm border-[#E5E2DD] rounded-md bg-white pl-10 font-semibold ${errors.minOrderValue ? "border-red-400" : ""}`}
                />
              </div>
              {errors.minOrderValue && (
                <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.minOrderValue}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tipo de Taxa de Entrega */}
        <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold text-gray-900">Taxa de Entrega</h2>
            </div>
            {deliveryType === "per_neighborhood" && (
              <Button
                onClick={handleOpenNewNeighborhood}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 rounded-md h-9 text-sm border border-gray-300 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Bairro
              </Button>
            )}
          </div>
          <div className="px-5 py-5 space-y-6">
            <div className="max-w-md">
              <Label className="text-sm font-medium mb-1.5 block">Tipo de Taxa</Label>
              <Select value={deliveryType} onValueChange={setDeliveryType}>
                <SelectTrigger className="h-10 text-sm border-[#E5E2DD] rounded-md bg-white cursor-pointer">
                  <SelectValue placeholder="Selecione o tipo de taxa" />
                </SelectTrigger>
                <SelectContent className="rounded-md border-[#E5E2DD]">
                  <SelectItem value="fixed">Taxa de Entrega Fixa</SelectItem>
                  <SelectItem value="per_neighborhood">Taxa por Bairro</SelectItem>
                  <SelectItem value="to_be_agreed">Taxa a combinar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {deliveryType === "fixed" ? (
              <div className="space-y-5">
                <div className="flex items-center gap-3 p-4 bg-[#FAF9F7] rounded-md border border-[#E5E2DD]">
                  <Truck className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Configure o valor fixo cobrado para todas as entregas
                  </p>
                </div>

                <div className="space-y-1.5 max-w-md">
                  <Label htmlFor="fixedFee" className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5" />
                    Valor da Taxa Fixa
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      R$
                    </span>
                    <Input
                      id="fixedFee"
                      type="number"
                      step="0.01"
                      min="0"
                      value={fixedFee}
                      onChange={(e) => {
                        setFixedFee(e.target.value);
                        if (errors.fixedFee) setErrors(prev => ({ ...prev, fixedFee: "" }));
                      }}
                      onKeyDown={blockInvalidChars}
                      placeholder="0,00"
                      className={`h-10 text-sm border-[#E5E2DD] rounded-md bg-white pl-10 ${errors.fixedFee ? "border-red-400" : ""}`}
                    />
                  </div>
                  {errors.fixedFee && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.fixedFee}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#FAF9F7] rounded-md border border-[#E5E2DD]">
                    <div className="flex items-center gap-3">
                      <Gift className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="space-y-0.5">
                        <Label htmlFor="freeDelivery" className="text-sm font-medium">Taxa Gratuita</Label>
                        <p className="text-sm text-muted-foreground">
                          Ative para oferecer taxa gratuita a partir de um valor minimo
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="freeDelivery"
                      checked={hasFreeDelivery}
                      onCheckedChange={setHasFreeDelivery}
                    />
                  </div>

                  {hasFreeDelivery && (
                    <div className="space-y-1.5 pl-1">
                      <Label htmlFor="freeDeliveryThreshold" className="text-sm font-medium flex items-center gap-2">
                        <Package className="w-3.5 h-3.5" />
                        Valor Minimo para Taxa Gratuita
                      </Label>
                      <div className="space-y-1.5 max-w-md">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            R$
                          </span>
                          <Input
                            id="freeDeliveryThreshold"
                            type="number"
                            step="0.01"
                            min="0"
                            value={freeDeliveryThreshold}
                            onChange={(e) => {
                              setFreeDeliveryThreshold(e.target.value);
                              if (errors.freeDeliveryThreshold) setErrors(prev => ({ ...prev, freeDeliveryThreshold: "" }));
                            }}
                            onKeyDown={blockInvalidChars}
                            placeholder="Ex: 50,00"
                            className={`h-10 text-sm border-[#E5E2DD] rounded-md bg-white pl-10 ${errors.freeDeliveryThreshold ? "border-red-400" : ""}`}
                          />
                        </div>
                        {errors.freeDeliveryThreshold && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.freeDeliveryThreshold}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 flex-shrink-0" />
                          A taxa de entrega sera gratuita quando o valor do pedido for igual ou maior que este valor
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : deliveryType === "to_be_agreed" ? (
              <div className="p-4 bg-[#FAF9F7] rounded-md border border-[#E5E2DD]">
                <p className="text-sm text-muted-foreground">
                  O valor da entrega sera combinado diretamente com o cliente.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-3 p-4 bg-[#FAF9F7] rounded-md border border-[#E5E2DD]">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Configure valores diferentes de taxa de entrega para cada bairro
                  </p>
                </div>

                {/* Ajuste em massa */}
                <div className="flex flex-col md:flex-row md:items-end gap-3">
                  <div className="flex-1 max-w-md">
                    <Label className="text-sm font-medium flex items-center gap-2 mb-1.5">
                      <ArrowUp className="w-3.5 h-3.5" />
                      Aumentar/Diminuir todos os bairros em R$
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={bulkAdjustValue}
                      onChange={(e) => setBulkAdjustValue(e.target.value)}
                      onKeyDown={blockInvalidChars}
                      placeholder="0,00"
                      className="h-10 text-sm border-[#E5E2DD] rounded-md bg-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleBulkAdjust("increase")}
                      disabled={isBulkUpdating}
                      className="h-10 gap-2 rounded-md border border-gray-300 cursor-pointer hover:bg-[#FAF9F7]"
                    >
                      {isBulkUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
                      Aumentar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleBulkAdjust("decrease")}
                      disabled={isBulkUpdating}
                      className="h-10 gap-2 rounded-md border border-gray-300 cursor-pointer hover:bg-[#FAF9F7]"
                    >
                      {isBulkUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDown className="w-4 h-4" />}
                      Diminuir
                    </Button>
                  </div>
                </div>

                {/* Tabela de bairros */}
                <div className="rounded-md border border-[#E5E2DD] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#FAF9F7]">
                        <TableHead className="font-semibold text-foreground py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5" />
                            Bairro
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-foreground py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-3.5 h-3.5" />
                            Valor
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-foreground py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Gift className="w-3.5 h-3.5" />
                            Taxa Gratuita
                          </div>
                        </TableHead>
                        <TableHead className="text-right font-semibold text-foreground py-3 text-sm">Acoes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {neighborhoods?.map((neighborhood) => (
                        <TableRow
                          key={neighborhood.id}
                          className="border-b border-[#E5E2DD] hover:bg-[#FAF9F7]"
                        >
                          <TableCell className="font-medium text-sm py-3">
                            <span className="block max-w-[200px] truncate">{neighborhood.name}</span>
                          </TableCell>
                          <TableCell className="font-medium text-sm py-3">
                            R$ {neighborhood.amount.toFixed(2).replace('.', ',')}
                          </TableCell>
                          <TableCell className="text-sm py-3">
                            {neighborhood.min_value_free_delivery !== null
                              ? <span className="inline-flex items-center gap-1.5 text-green-700">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  A partir de R$ {neighborhood.min_value_free_delivery.toFixed(2).replace('.', ',')}
                                </span>
                              : <span className="text-muted-foreground inline-flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5" />
                                  Nao
                                </span>
                            }
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <div className="flex justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEditNeighborhood({
                                  id: neighborhood.id,
                                  name: neighborhood.name,
                                  value: neighborhood.amount,
                                  hasFreeDelivery: neighborhood.min_value_free_delivery !== null,
                                  freeDeliveryThreshold: neighborhood.min_value_free_delivery || 0
                                })}
                                className="h-8 w-8 rounded-md border border-gray-300 cursor-pointer hover:bg-[#FAF9F7]"
                              >
                                <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setCurrentNeighborhood({
                                    id: neighborhood.id,
                                    name: neighborhood.name,
                                    value: neighborhood.amount,
                                    hasFreeDelivery: neighborhood.min_value_free_delivery !== null,
                                    freeDeliveryThreshold: neighborhood.min_value_free_delivery || 0
                                  });
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="h-8 w-8 rounded-md border border-gray-300 cursor-pointer hover:bg-red-600 hover:text-white"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botoes de acao */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={handleCancelConfig}
            className="w-full sm:w-auto h-10 rounded-md border border-gray-300 cursor-pointer hover:bg-[#FAF9F7]"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSaveDeliveryConfig}
            disabled={isUpdating}
            className="w-full sm:w-auto h-10 rounded-md bg-primary hover:bg-primary/90 text-white border border-gray-300 cursor-pointer text-base font-semibold"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Salvar alteracoes"
            )}
          </Button>
        </div>
      </div>

      {/* Dialog de bairro */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-md p-0 rounded-md border-[#E5E2DD] gap-0">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E5E2DD] flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#F0EFEB] flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-gray-900">
                {isEditing ? "Editar Bairro" : "Cadastrar Novo Bairro"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {isEditing ? "Atualize as informacoes do bairro" : "Preencha os dados do bairro"}
              </DialogDescription>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 bg-[#FAF9F7] space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="neighborhoodName" className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5" />
                Nome do Bairro
              </Label>
              <Input
                id="neighborhoodName"
                value={currentNeighborhood?.name || ""}
                onChange={(e) => {
                  setCurrentNeighborhood({
                    ...currentNeighborhood!,
                    name: e.target.value,
                  });
                  if (errors.neighborhoodName) setErrors(prev => ({ ...prev, neighborhoodName: "" }));
                }}
                placeholder="Ex: Centro"
                className={`h-10 text-sm rounded-md border-[#E5E2DD] bg-white ${errors.neighborhoodName ? "border-red-400" : ""}`}
              />
              {errors.neighborhoodName && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.neighborhoodName}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="neighborhoodValue" className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" />
                Valor da Entrega
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  R$
                </span>
                <Input
                  id="neighborhoodValue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={currentNeighborhood?.hasFreeDelivery ? "0" : (currentNeighborhood?.value || "")}
                  onChange={(e) => {
                    setCurrentNeighborhood({
                      ...currentNeighborhood!,
                      value: parseFloat(e.target.value) || 0,
                    });
                    if (errors.neighborhoodValue) setErrors(prev => ({ ...prev, neighborhoodValue: "" }));
                  }}
                  onKeyDown={blockInvalidChars}
                  disabled={currentNeighborhood?.hasFreeDelivery}
                  placeholder="Ex: 10,00"
                  className={`h-10 text-sm pl-10 rounded-md border-[#E5E2DD] bg-white ${errors.neighborhoodValue ? "border-red-400" : ""} ${currentNeighborhood?.hasFreeDelivery ? "opacity-50 cursor-not-allowed" : ""}`}
                />
              </div>
              {errors.neighborhoodValue && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.neighborhoodValue}
                </p>
              )}
            </div>

            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between p-4 bg-white rounded-md border border-[#E5E2DD]">
                <div className="flex items-center gap-3">
                  <Gift className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="space-y-0.5">
                    <Label htmlFor="freeDelivery" className="text-sm font-medium">Taxa Gratuita</Label>
                    <p className="text-sm text-muted-foreground">
                      Ative para oferecer taxa gratuita a partir de um valor minimo
                    </p>
                  </div>
                </div>
                <Switch
                  id="freeDelivery"
                  checked={currentNeighborhood?.hasFreeDelivery || false}
                  onCheckedChange={(checked) => {
                    setCurrentNeighborhood({
                      ...currentNeighborhood!,
                      hasFreeDelivery: checked,
                      value: checked ? 0 : currentNeighborhood!.value,
                      freeDeliveryThreshold: checked ? (currentNeighborhood?.freeDeliveryThreshold || 50) : 0
                    });
                    if (checked && errors.neighborhoodValue) {
                      setErrors(prev => ({ ...prev, neighborhoodValue: "" }));
                    }
                  }}
                />
              </div>

              {currentNeighborhood?.hasFreeDelivery && (
                <div className="space-y-1.5">
                  <Label htmlFor="freeDeliveryThreshold" className="text-sm font-medium flex items-center gap-2">
                    <Package className="w-3.5 h-3.5" />
                    Valor Minimo para Taxa Gratuita
                  </Label>
                  <div className="space-y-1.5">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        R$
                      </span>
                      <Input
                        id="freeDeliveryThreshold"
                        type="number"
                        step="0.01"
                        min="0"
                        value={currentNeighborhood?.freeDeliveryThreshold || ""}
                        onChange={(e) => {
                          setCurrentNeighborhood({
                            ...currentNeighborhood!,
                            freeDeliveryThreshold: parseFloat(e.target.value) || 0,
                          });
                          if (errors.neighborhoodFreeDeliveryThreshold) setErrors(prev => ({ ...prev, neighborhoodFreeDeliveryThreshold: "" }));
                        }}
                        onKeyDown={blockInvalidChars}
                        placeholder="Ex: 50,00"
                        className={`h-10 text-sm pl-10 rounded-md border-[#E5E2DD] bg-white ${errors.neighborhoodFreeDeliveryThreshold ? "border-red-400" : ""}`}
                      />
                    </div>
                    {errors.neighborhoodFreeDeliveryThreshold && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.neighborhoodFreeDeliveryThreshold}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 flex-shrink-0" />
                      A taxa de entrega sera gratuita quando o valor do pedido for igual ou maior que este valor
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-[#E5E2DD]">
            <Button
              variant="outline"
              onClick={resetForm}
              className="flex-1 h-10 rounded-md border border-gray-300 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddNeighborhood}
              disabled={isUpdating}
              className="flex-1 h-10 rounded-md bg-primary hover:bg-primary/90 text-white border border-gray-300 cursor-pointer text-base font-semibold"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                isEditing ? "Salvar" : "Cadastrar"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmation
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteNeighborhood}
        isLoading={isUpdating}
        type="bairro"
      />
    </div>
  );
}
