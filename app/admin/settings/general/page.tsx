"use client";

import { useState, useEffect } from "react";
import { Header } from "../../../components/catalog/catalog-header";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { ImageIcon, Upload, MapPin, Phone, Mail, Globe } from "lucide-react";
import { Separator } from "@/app/components/ui/separator";
import { useShop } from "../../../hooks/use-shop";
import { ShopAttributes } from "@/app/services/shop";

export default function GeneralSettingsPage() {
  const { shop, isLoading, updateShop, isUpdating } = useShop();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ShopAttributes>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [initialData, setInitialData] = useState<Partial<ShopAttributes>>({});

  useEffect(() => {
    if (shop && !isLoading) {
      const initial = {
        name: shop.name || "",
        description: shop.description || "",
        cellphone: shop.cellphone || "",
        address: shop.address || "",
        image: null
      };
      setInitialData(initial);
      setFormData(initial);
      setLogoPreview(shop.image_url || null);
    }
  }, [shop, isLoading]);

  useEffect(() => {
    if (initialData && formData) {
      const changesDetected = Object.keys(formData).some(key => {
        if (key === 'image') {
          return formData.image !== null;
        }
        return formData[key as keyof typeof formData] !== initialData[key as keyof typeof initialData];
      });
      setHasChanges(changesDetected);
    }
  }, [formData, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hasChanges) return;
    
    updateShop(formData);
  };

  const handleCancel = () => {
    setFormData(initialData);
    setLogoPreview(shop?.image_url || null);
    setHasChanges(false);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6">
      <Header 
        title="CONFIGURAÇÕES GERAIS"
        description="Configure as informações básicas do seu estabelecimento"
        className="mb-4 -mt-12"
      />
      
      <div className="w-full max-w-7xl mx-auto p-0 md:p-4 lg:p-6 bg-white">
        <Card className="p-4 md:p-6 shadow-none border-none rounded-xs bg-white">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="space-y-6 md:space-y-8">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                <div className="flex-shrink-0">
                  <Label className="block mb-2 text-sm font-medium text-muted-foreground">
                    Logo do Estabelecimento
                  </Label>
                  <div className="relative group">
                    <div className="w-40 h-40 rounded-xs bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-none overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:border-primary relative">
                      {logoPreview ? (
                        <>
                          <img 
                            src={logoPreview} 
                            alt="Logo preview" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                            <ImageIcon className="w-8 h-8 mb-2 text-white" />
                            <span className="text-xs text-white">
                              Clique para trocar
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                          <ImageIcon className="w-8 h-8 mb-2 text-gray-400 group-hover:text-primary" />
                          <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-primary">
                            Clique para enviar
                          </span>
                        </div>
                      )}
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Upload className="w-3 h-3" />
                      <span>Formatos: PNG, JPG</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-muted-foreground">
                      Nome do Estabelecimento
                    </Label>
                    <Input 
                      id="name" 
                      name="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      placeholder="Grata Pizza" 
                      className="h-12 text-base border-gray-300 dark:border-gray-700 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="description" className="text-muted-foreground placeholder:text-foreground/40">
                      Descrição
                    </Label>
                    <Textarea 
                      id="description" 
                      name="description"
                      value={formData.description || ""}
                      onChange={handleInputChange}
                      placeholder="As melhores pizzas artesanais da cidade"
                      className="min-h-24 text-base border-gray-300 dark:border-gray-700 focus-visible:ring-primary placeholder:text-foreground/40"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Uma breve descrição que aparecerá para seus clientes
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-6 bg-gray-200 dark:bg-gray-800" />

              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Informações de Contato
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      Telefone
                    </Label>
                    <Input 
                      id="phone" 
                      name="cellphone"
                      value={formData.cellphone || ""}
                      onChange={handleInputChange}
                      placeholder="(11) 99999-9999" 
                      className="h-12 pl-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="address" className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      Endereço
                    </Label>
                    <Input 
                      id="address" 
                      name="address"
                      value={formData.address || ""}
                      onChange={handleInputChange}
                      placeholder="Major Barreto, 1602" 
                      className="h-12 pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6 bg-gray-200 dark:bg-gray-800" />

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                type="button" 
                onClick={handleCancel}
                className="w-full sm:w-auto px-6 h-11 border-none"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!hasChanges || isUpdating}
                className={`w-full sm:w-auto px-6 h-11 bg-primary hover:bg-primary/90 ${
                  !hasChanges ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isUpdating ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}