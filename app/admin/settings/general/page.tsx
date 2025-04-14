"use client";

import { useState } from "react";
import { Header } from "../../catalog/components/catalog-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageIcon, Upload, MapPin, Phone, Mail, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function GeneralSettingsPage() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6">
      <Header 
        title="CONFIGURAÇÕES GERAIS"
        description="Configure as informações básicas do seu estabelecimento"
        className="mb-4 -mt-12"
      />
      
      <div className="w-full max-w-7xl mx-auto p-0 md:p-4 lg:p-6 bg-white">
        <Card className="p-4 md:p-6 shadow-none border-none rounded-xs bg-white">
          <form className="space-y-6 md:space-y-8">
            <div className="space-y-6 md:space-y-8">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                <div className="flex-shrink-0">
                  <Label className="block mb-2 text-sm font-medium text-muted-foreground">
                    Logo do Estabelecimento
                  </Label>
                  <div className="relative group">
                    <div className="w-40 h-40 rounded-xs bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-none overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:border-primary">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          className="w-full h-full object-cover"
                        />
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

                {/* Business Info Section */}
                <div className="flex-1 space-y-6">
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-muted-foreground">
                      Nome do Estabelecimento
                    </Label>
                    <Input 
                      id="name" 
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
                className="w-full sm:w-auto px-6 h-11 border-none"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="w-full sm:w-auto px-6 h-11 bg-primary hover:bg-primary/90"
              >
                Salvar alterações
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}