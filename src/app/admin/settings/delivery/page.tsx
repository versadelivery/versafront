"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/catalog-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { ArrowUp, ArrowDown, Edit, Trash2, Plus, CheckCircle2, Clock, Truck, DollarSign, Package, Gift, AlertCircle, MapPin, Building2, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { Switch } from "@/components/ui/switch";
import { useDelivery } from "@/hooks/use-delivery";
import { Loader2 } from "lucide-react";

type Neighborhood = {
  id: string;
  name: string;
  value: number;
  hasFreeDelivery: boolean;
  freeDeliveryThreshold: number;
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
  const [errors, setErrors] = useState<{
    fixedFee?: string;
    freeDeliveryThreshold?: string;
    neighborhoodValue?: string;
    neighborhoodFreeDeliveryThreshold?: string;
  }>({});

  useEffect(() => {
    if (deliveryConfig) {
      setDeliveryType(deliveryConfig.delivery_fee_kind);
      setFixedFee(deliveryConfig.amount?.toString() || "");
      setHasFreeDelivery(deliveryConfig.min_value_free_delivery !== null);
      setFreeDeliveryThreshold(deliveryConfig.min_value_free_delivery?.toString() || "");
      setMinOrderValue(deliveryConfig.minimum_order_value?.toString() || "");
    }
  }, [deliveryConfig]);

  const handleBulkAdjust = (type: "increase" | "decrease") => {
    const adjustValue = parseFloat(bulkAdjustValue) || 0;
    const adjusted = neighborhoods?.map((n) => ({
      ...n,
      amount: type === "increase" ? n.amount + adjustValue : n.amount - adjustValue,
    })) || [];
    
    adjusted.forEach(neighborhood => {
      updateNeighborhood({ 
        id: neighborhood.id, 
        data: { amount: neighborhood.amount } 
      });
    });
    
    setBulkAdjustValue("");
  };

  const handleAddNeighborhood = () => {
    if (!currentNeighborhood) return;

    const newErrors: typeof errors = {};
    
    if (currentNeighborhood.hasFreeDelivery && currentNeighborhood.freeDeliveryThreshold <= currentNeighborhood.value) {
      newErrors.neighborhoodFreeDeliveryThreshold = "O valor mínimo para frete grátis deve ser maior que o valor da taxa";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEditing && currentNeighborhood.id) {
      updateNeighborhood({
        id: currentNeighborhood.id,
        data: {
          name: currentNeighborhood.name,
          amount: currentNeighborhood.value,
          min_value_free_delivery: currentNeighborhood.hasFreeDelivery ? currentNeighborhood.freeDeliveryThreshold : null
        }
      });
    } else {
      createNeighborhood({
        name: currentNeighborhood.name,
        amount: currentNeighborhood.value,
        min_value_free_delivery: currentNeighborhood.hasFreeDelivery ? currentNeighborhood.freeDeliveryThreshold : null
      });
    }
    resetForm();
  };

  const handleEditNeighborhood = (neighborhood: Neighborhood) => {
    setCurrentNeighborhood(neighborhood);
    setIsEditing(true);
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
  };

  const handleSaveDeliveryConfig = () => {
    const newErrors: typeof errors = {};
    
    if (hasFreeDelivery && parseFloat(freeDeliveryThreshold) <= parseFloat(fixedFee)) {
      newErrors.freeDeliveryThreshold = "O valor mínimo para frete grátis deve ser maior que o valor da taxa";
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 min-h-screen pb-20">
      <AdminHeader
        title="CONFIGURAÇÕES DE ENTREGA"
        description="Configure as taxas e regras de entrega do seu estabelecimento"
        className="mb-4"
      />

      <div className="w-full max-w-7xl mx-auto p-0 md:p-4 lg:p-6 bg-white">
        <Card className="p-4 md:p-6 shadow-none border-none rounded-xs bg-white">
          <div className="space-y-8 md:space-y-10">
            {/* Valor Mínimo do Pedido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Valor Mínimo do Pedido</h3>
                    <p className="text-sm text-muted-foreground font-medium">Define o valor total mínimo para que o cliente consiga finalizar um pedido</p>
                  </div>
                </div>
                <div className="max-w-xs pl-11">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                      R$
                    </span>
                    <Input
                      id="minOrderValue"
                      value={minOrderValue}
                      onChange={(e) => setMinOrderValue(e.target.value)}
                      placeholder="0,00"
                      className="h-12 text-base border-gray-300 focus:ring-primary pl-10 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-100" />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="w-full max-w-md">
                <Label className="text-muted-foreground">Tipo de Taxa de Entrega</Label>
                <Select value={deliveryType} onValueChange={setDeliveryType}>
                  <SelectTrigger className="h-12 text-base border-gray-300 dark:border-gray-700 focus:ring-primary mt-1">
                    <SelectValue placeholder="Selecione o tipo de taxa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Taxa de Entrega Fixa</SelectItem>
                    <SelectItem value="per_neighborhood">Taxa por Bairro</SelectItem>
                    <SelectItem value="to_be_agreed">Taxa a combinar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {deliveryType === "per_neighborhood" && (
                <Button
                  onClick={() => {
                    setCurrentNeighborhood({
                      id: "",
                      name: "",
                      value: 0,
                      hasFreeDelivery: false,
                      freeDeliveryThreshold: 0
                    });
                    setIsDialogOpen(true);
                  }}
                  className="h-11 p-6 bg-primary hover:bg-primary/90 border-none shadow-xs rounded-xs"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Bairro
                </Button>
              )}
            </div>

            {deliveryType === "fixed" ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Truck className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-medium">Taxa de Entrega Fixa</h3>
                    <p className="text-sm text-muted-foreground">Configure o valor fixo cobrado para todas as entregas</p>
                  </div>
                </div>

                <div className="space-y-1 max-w-md">
                  <Label htmlFor="fixedFee" className="text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Valor da Taxa Fixa
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      R$&nbsp;
                    </span>
                    <Input
                      id="fixedFee"
                      value={fixedFee}
                      onChange={(e) => setFixedFee(e.target.value)}
                      placeholder=" 0,00"
                      className="h-12 text-base border-gray-300 dark:border-gray-700 focus-visible:ring-primary pl-12"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <Gift className="w-5 h-5 text-primary" />
                      <div className="space-y-1">
                        <Label htmlFor="freeDelivery" className="text-sm font-medium">Taxa Gratuita</Label>
                        <p className="text-sm text-muted-foreground">
                          Ative para oferecer taxa gratuita a partir de um valor mínimo
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
                    <div className="space-y-2 pl-1">
                      <Label htmlFor="freeDeliveryThreshold" className="text-sm font-medium flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Valor Mínimo para Taxa Gratuita
                      </Label>
                      <div className="space-y-1">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            R$&nbsp;
                          </span>
                          <Input
                            id="freeDeliveryThreshold"
                            type="number"
                            value={freeDeliveryThreshold}
                            onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                            placeholder=" Ex: 50,00"
                            className="h-11 pl-12"
                          />
                        </div>
                        {errors.freeDeliveryThreshold && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.freeDeliveryThreshold}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Info className="w-4 h-4" />
                          A taxa de entrega será gratuita quando o valor do pedido for igual ou maior que este valor
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : deliveryType === "to_be_agreed" ? (
              <div className="p-4 bg-gray-50 rounded-xs border border-gray-200">
                <p className="text-muted-foreground">
                  O valor da entrega será combinado diretamente com o cliente.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-medium">Taxa por Bairro</h3>
                    <p className="text-sm text-muted-foreground">Configure valores diferentes de taxa de entrega para cada bairro</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-end gap-4">
                  <div className="flex-1">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <ArrowUp className="w-4 h-4" />
                      Aumentar/Diminuir todos os bairros em R$
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        value={bulkAdjustValue}
                        onChange={(e) => setBulkAdjustValue(e.target.value)}
                        placeholder="0,00"
                        className="h-12 text-base border-gray-300 dark:border-gray-700 focus-visible:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleBulkAdjust("increase")}
                      className="h-12 gap-2 p-6 border-none shadow-xs rounded-xs hover:bg-gray-100"
                    >
                      <ArrowUp className="w-4 h-4" />
                      Aumentar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleBulkAdjust("decrease")}
                      className="h-12 gap-2 p-6 border-none shadow-xs rounded-xs hover:bg-gray-100"
                    >
                      <ArrowDown className="w-4 h-4" />
                      Diminuir
                    </Button>
                  </div>
                </div>

                <div className="rounded-xs border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-800">
                      <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableHead className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Bairro
                          </div>
                        </TableHead>
                        <TableHead className="font-medium">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Valor
                          </div>
                        </TableHead>
                        <TableHead className="font-medium">
                          <div className="flex items-center gap-2">
                            <Gift className="w-4 h-4" />
                            Taxa Gratuita
                          </div>
                        </TableHead>
                        <TableHead className="text-right font-medium">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {neighborhoods?.map((neighborhood) => (
                        <TableRow 
                          key={neighborhood.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <TableCell className="font-medium">{neighborhood.name}</TableCell>
                          <TableCell className="font-medium">R$ {neighborhood.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            {neighborhood.min_value_free_delivery !== null 
                              ? <span className="inline-flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="w-4 h-4" />
                                  A partir de R$ {neighborhood.min_value_free_delivery.toFixed(2)}
                                </span>
                              : <span className="text-muted-foreground inline-flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  Não
                                </span>
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditNeighborhood({
                                  id: neighborhood.id,
                                  name: neighborhood.name,
                                  value: neighborhood.amount,
                                  hasFreeDelivery: neighborhood.min_value_free_delivery !== null,
                                  freeDeliveryThreshold: neighborhood.min_value_free_delivery || 0
                                })}
                                className="hover:bg-gray-100 dark:hover:bg-gray-800"
                              >
                                <Edit className="w-4 h-4 text-muted-foreground" />
                              </Button>
                              <Button
                                variant="ghost"
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
                                className="hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
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
                onClick={handleSaveDeliveryConfig}
                disabled={isUpdating}
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

      <Dialog open={isDialogOpen} onOpenChange={resetForm}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {isEditing ? "Editar Bairro" : "Cadastrar Novo Bairro"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="neighborhoodName" className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Nome do Bairro
              </Label>
              <Input
                id="neighborhoodName"
                value={currentNeighborhood?.name || ""}
                onChange={(e) =>
                  setCurrentNeighborhood({
                    ...currentNeighborhood!,
                    name: e.target.value,
                  })
                }
                placeholder="Ex: Centro"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhoodValue" className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Valor da Entrega
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$&nbsp;
                </span>
                <Input
                  id="neighborhoodValue"
                  type="number"
                  value={currentNeighborhood?.value || ""}
                  onChange={(e) =>
                    setCurrentNeighborhood({
                      ...currentNeighborhood!,
                      value: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder=" Ex: 10,00"
                  className="h-11 pl-12"
                />
              </div>
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Gift className="w-5 h-5 text-primary" />
                  <div className="space-y-1">
                    <Label htmlFor="freeDelivery" className="text-sm font-medium">Taxa Gratuita</Label>
                    <p className="text-sm text-muted-foreground">
                      Ative para oferecer taxa gratuita a partir de um valor mínimo
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
                      freeDeliveryThreshold: checked ? (currentNeighborhood?.freeDeliveryThreshold || 50) : 0
                    });
                  }}
                />
              </div>
              
              {currentNeighborhood?.hasFreeDelivery && (
                <div className="space-y-2 pl-1">
                  <Label htmlFor="freeDeliveryThreshold" className="text-sm font-medium flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Valor Mínimo para Taxa Gratuita
                  </Label>
                  <div className="space-y-1">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        R$&nbsp;
                      </span>
                      <Input
                        id="freeDeliveryThreshold"
                        type="number"
                        value={currentNeighborhood?.freeDeliveryThreshold || ""}
                        onChange={(e) =>
                          setCurrentNeighborhood({
                            ...currentNeighborhood!,
                            freeDeliveryThreshold: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder=" Ex: 50,00"
                        className="h-11 pl-12"
                      />
                    </div>
                    {errors.neighborhoodFreeDeliveryThreshold && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.neighborhoodFreeDeliveryThreshold}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Info className="w-4 h-4" />
                      A taxa de entrega será gratuita quando o valor do pedido for igual ou maior que este valor
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={resetForm}
              className="h-11 px-6"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddNeighborhood}
              disabled={isUpdating}
              className="h-11 px-6 bg-primary hover:bg-primary/90"
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