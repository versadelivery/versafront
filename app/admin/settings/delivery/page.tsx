"use client";

import { useState } from "react";
import { Header } from "../../catalog/components/catalog-header";
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
import { ArrowUp, ArrowDown, Edit, Trash2, Plus, CheckCircle2, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { Switch } from "@/components/ui/switch";

type Neighborhood = {
  id: string;
  name: string;
  value: number;
  city: string;
  estimate: number;
  hasFreeDelivery: boolean;
  freeDeliveryThreshold: number;
};

export default function DeliverySettingsPage() {
  const [deliveryType, setDeliveryType] = useState<string>("fixed");
  const [fixedFee, setFixedFee] = useState<string>("");
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([
    { 
      id: "1", 
      name: "Centro", 
      value: 10, 
      city: "Itapajé", 
      estimate: 30,
      hasFreeDelivery: true,
      freeDeliveryThreshold: 50
    },
    { 
      id: "2", 
      name: "Vila Fonseca", 
      value: 12, 
      city: "Itapajé", 
      estimate: 35,
      hasFreeDelivery: false,
      freeDeliveryThreshold: 0
    },
    { 
      id: "3", 
      name: "Frade", 
      value: 15, 
      city: "Itapajé", 
      estimate: 40,
      hasFreeDelivery: true,
      freeDeliveryThreshold: 70
    },
  ]);
  const [bulkAdjustValue, setBulkAdjustValue] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentNeighborhood, setCurrentNeighborhood] = useState<Neighborhood | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBulkAdjust = (type: "increase" | "decrease") => {
    const adjustValue = parseFloat(bulkAdjustValue) || 0;
    const adjusted = neighborhoods.map((n) => ({
      ...n,
      value: type === "increase" ? n.value + adjustValue : n.value - adjustValue,
    }));
    setNeighborhoods(adjusted);
    setBulkAdjustValue("");
  };

  const handleAddNeighborhood = () => {
    if (isEditing && currentNeighborhood) {
      setNeighborhoods(neighborhoods.map(n => 
        n.id === currentNeighborhood.id ? currentNeighborhood : n
      ));
    } else {
      setNeighborhoods([
        ...neighborhoods,
        { 
          ...currentNeighborhood!, 
          id: (neighborhoods.length + 1).toString(),
          hasFreeDelivery: currentNeighborhood?.hasFreeDelivery || false,
          freeDeliveryThreshold: currentNeighborhood?.freeDeliveryThreshold || 0
        },
      ]);
    }
    resetForm();
  };

  const handleEditNeighborhood = (neighborhood: Neighborhood) => {
    setCurrentNeighborhood(neighborhood);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteNeighborhood = async () => {
    if (!currentNeighborhood) return;
    
    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNeighborhoods(neighborhoods.filter((n) => n.id !== currentNeighborhood.id));
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setCurrentNeighborhood(null);
    setIsEditing(false);
    setIsDialogOpen(false);
  };

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 h-screen">
      <Header
        title="CONFIGURAÇÕES DE ENTREGA"
        description="Configure as taxas e regras de entrega do seu estabelecimento"
        className="mb-4 -mt-12"
      />

      <div className="w-full max-w-7xl mx-auto p-0 md:p-4 lg:p-6 bg-white">
        <Card className="p-4 md:p-6 shadow-none border-none rounded-xs bg-white">
          <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="w-full md:w-auto">
                <Label className="text-muted-foreground">Tipo de Taxa de Entrega</Label>
                <Select value={deliveryType} onValueChange={setDeliveryType}>
                  <SelectTrigger className="h-12 text-base border-gray-300 dark:border-gray-700 focus:ring-primary mt-1">
                    <SelectValue placeholder="Selecione o tipo de taxa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Taxa de Entrega Fixa</SelectItem>
                    <SelectItem value="neighborhood">Taxa por Bairro</SelectItem>
                    <SelectItem value="negotiable">Taxa a combinar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {deliveryType === "neighborhood" && (
                <Button
                  onClick={() => {
                    setCurrentNeighborhood({
                      id: "",
                      name: "",
                      value: 0,
                      city: "Itapajé",
                      estimate: 0,
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
              <div className="space-y-1 max-w-md">
                <Label htmlFor="fixedFee" className="text-muted-foreground">
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
                    className="h-12 text-base border-gray-300 dark:border-gray-700 focus-visible:ring-primary pl-8"
                  />
                </div>
              </div>
            ) : deliveryType === "negotiable" ? (
              <div className="p-4 bg-gray-50 rounded-xs border border-gray-200">
                <p className="text-muted-foreground">
                  O valor da entrega será combinado diretamente com o cliente.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end gap-4">
                  <div className="flex-1">
                    <Label className="text-muted-foreground">
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
                        <TableHead className="font-medium">Bairro</TableHead>
                        <TableHead className="font-medium">Valor</TableHead>
                        <TableHead className="font-medium">Frete Grátis</TableHead>
                        <TableHead className="font-medium">Estimativa</TableHead>
                        <TableHead className="font-medium">Cidade</TableHead>
                        <TableHead className="text-right font-medium">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {neighborhoods.map((neighborhood) => (
                        <TableRow 
                          key={neighborhood.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <TableCell className="font-medium">{neighborhood.name}</TableCell>
                          <TableCell className="font-medium">R$ {neighborhood.value.toFixed(2)}</TableCell>
                          <TableCell>
                            {neighborhood.hasFreeDelivery 
                              ? <span className="inline-flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="w-4 h-4" />
                                  A partir de R$ {neighborhood.freeDeliveryThreshold.toFixed(2)}
                                </span>
                              : <span className="text-muted-foreground">Não</span>
                            }
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              {neighborhood.estimate} min
                            </span>
                          </TableCell>
                          <TableCell>{neighborhood.city}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditNeighborhood(neighborhood)}
                                className="hover:bg-gray-100 dark:hover:bg-gray-800"
                              >
                                <Edit className="w-4 h-4 text-muted-foreground" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setCurrentNeighborhood(neighborhood);
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
                className="w-full sm:w-auto p-6 h-11 border-none shadow-xs rounded-xs hover:bg-primary/90"
              >
                Salvar alterações
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={resetForm}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {isEditing ? "Editar Bairro" : "Cadastrar Novo Bairro"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="neighborhoodName" className="text-sm font-medium">Nome do Bairro</Label>
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
              <Label htmlFor="neighborhoodValue" className="text-sm font-medium">Valor da Entrega</Label>
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
              <div className="flex items-center justify-between p-4 bg-gray-200 dark:bg-gray-800 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="freeDelivery" className="text-sm font-medium">Frete Grátis</Label>
                  <p className="text-sm text-muted-foreground">
                    Ative para oferecer frete grátis a partir de um valor mínimo
                  </p>
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
                  <Label htmlFor="freeDeliveryThreshold" className="text-sm font-medium">Valor Mínimo para Frete Grátis</Label>
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
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhoodCity" className="text-sm font-medium">Cidade</Label>
              <Input
                id="neighborhoodCity"
                value={currentNeighborhood?.city || ""}
                onChange={(e) =>
                  setCurrentNeighborhood({
                    ...currentNeighborhood!,
                    city: e.target.value,
                  })
                }
                placeholder="Ex: Itapajé"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhoodEstimate" className="text-sm font-medium">Estimativa de Entrega</Label>
              <div className="relative">
                <Input
                  id="neighborhoodEstimate"
                  type="number"
                  value={currentNeighborhood?.estimate || ""}
                  onChange={(e) =>
                    setCurrentNeighborhood({
                      ...currentNeighborhood!,
                      estimate: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Ex: 30"
                  className="h-11"
                />
                <span className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  minutos
                </span>
              </div>
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
              className="h-11 px-6 bg-primary hover:bg-primary/90"
            >
              {isEditing ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmation
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteNeighborhood}
        isLoading={isDeleting}
        type="bairro"
      />
    </div>
  );
}