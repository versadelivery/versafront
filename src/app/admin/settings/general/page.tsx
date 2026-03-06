"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageIcon, Upload, MapPin, Phone, Mail, ShoppingBag, Wallet, Settings, Clock, ArrowLeft, Timer } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useShop } from "@/hooks/use-shop";
import { ShopAttributes } from "@/services/shop";
import ScheduleSettings from "./components/ScheduleSettings";
import { usePhoneMask } from "@/hooks/use-phone-mask";
import Link from "next/link";

export default function GeneralSettingsPage() {
  const { shop, isLoading, updateShop, isUpdating } = useShop();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ShopAttributes>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [initialData, setInitialData] = useState<Partial<ShopAttributes>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { formatPhone } = usePhoneMask();

  useEffect(() => {
    if (shop && !isLoading && !isUpdating) {
      const initial = {
        name: shop.name || "",
        description: shop.description || "",
        cellphone: shop.cellphone || "",
        address: shop.address || "",
        email: shop.email || "",
        slug: shop.slug,
        image: null,
        auto_accept_orders: shop.auto_accept_orders ?? false,
        auto_open_cash_register: shop.auto_open_cash_register ?? false,
        auto_open_cash_register_time: shop.auto_open_cash_register_time ?? null,
        estimated_prep_time: shop.estimated_prep_time ?? 30,
        estimated_delivery_time: shop.estimated_delivery_time ?? 40
      };

      if (!(initialData as any).slug || (initialData as any).slug !== shop.slug) {
        setInitialData(initial);
        setFormData(initial);
      } else {
        setInitialData(initial);
      }

      setLogoPreview(shop.image_url || null);
    }
  }, [shop, isLoading, isUpdating]);

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
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, cellphone: formatted }));
    if (fieldErrors.cellphone) {
      setFieldErrors(prev => ({ ...prev, cellphone: "" }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      errors.name = "Nome do estabelecimento é obrigatório";
    }

    if (formData.cellphone) {
      const digits = formData.cellphone.replace(/\D/g, '');
      if (digits.length > 0 && (digits.length < 10 || digits.length > 11)) {
        errors.cellphone = "Telefone deve ter formato (XX) XXXX-XXXX ou (XX) XXXXX-XXXX";
      }
    }

    if (formData.auto_open_cash_register && !formData.auto_open_cash_register_time) {
      errors.auto_open_cash_register_time = "Horário é obrigatório quando a abertura automática está ativa";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hasChanges) return;
    if (!validateForm()) return;

    updateShop(formData);
  };

  const handleCancel = () => {
    setFormData(initialData);
    setLogoPreview(shop?.image_url || null);
    setHasChanges(false);
    setFieldErrors({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Carregando...</div>
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
              <Link
                href="/admin/settings"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">Voltar</span>
              </Link>
              <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
              <h1 className="text-base sm:text-lg font-bold text-gray-900">Configurações Gerais</h1>
            </div>
            {/* Botoes de acao */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={handleCancel}
                className="rounded-md border border-gray-300 cursor-pointer text-sm"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={!hasChanges || isUpdating}
                onClick={() => {
                  const form = document.getElementById('general-settings-form') as HTMLFormElement;
                  form?.requestSubmit();
                }}
                className="rounded-md border border-gray-300 cursor-pointer bg-primary text-white hover:bg-primary/90 text-sm"
              >
                {isUpdating ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteudo */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form id="general-settings-form" onSubmit={handleSubmit} className="space-y-5">

          {/* SectionCard: Informacoes do Estabelecimento */}
          <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold text-gray-900">Informações do Estabelecimento</h2>
            </div>
            <div className="px-5 py-5">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Logo */}
                <div className="flex-shrink-0">
                  <Label className="block mb-2 text-sm font-medium text-muted-foreground">
                    Logo do Estabelecimento
                  </Label>
                  <div className="relative group">
                    <div className="w-36 h-36 rounded-md bg-[#F0EFEB] border border-[#E5E2DD] overflow-hidden flex items-center justify-center transition-colors group-hover:border-primary relative">
                      {logoPreview ? (
                        <>
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                            <ImageIcon className="w-6 h-6 mb-1.5 text-white" />
                            <span className="text-xs text-white">Clique para trocar</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                          <ImageIcon className="w-6 h-6 mb-1.5 text-gray-400 group-hover:text-primary" />
                          <span className="text-xs text-muted-foreground group-hover:text-primary">
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

                {/* Nome e Descricao */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Nome do Estabelecimento <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      placeholder="Grata Pizza"
                      className={`h-10 text-base rounded-md border-[#E5E2DD] focus-visible:ring-primary ${fieldErrors.name ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                    />
                    {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Descrição
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description || ""}
                      onChange={handleInputChange}
                      placeholder="As melhores pizzas artesanais da cidade"
                      className="min-h-24 text-base rounded-md border-[#E5E2DD] focus-visible:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                      Uma breve descrição que aparecerá para seus clientes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SectionCard: Informacoes de Contato */}
          <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold text-gray-900">Informações de Contato</h2>
            </div>
            <div className="px-5 py-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    name="cellphone"
                    value={formData.cellphone || ""}
                    onChange={handlePhoneChange}
                    placeholder="(11) 99999-9999"
                    className={`h-10 rounded-md border-[#E5E2DD] ${fieldErrors.cellphone ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                  />
                  {fieldErrors.cellphone && <p className="text-xs text-red-500">{fieldErrors.cellphone}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    Endereço
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address || ""}
                    onChange={handleInputChange}
                    maxLength={70}
                    placeholder="Major Barreto, 1602"
                    className="h-10 rounded-md border-[#E5E2DD]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    E-mail de Contato
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    placeholder="contato@sualoja.com"
                    className="h-10 rounded-md border-[#E5E2DD]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SectionCard: Pedidos */}
          <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold text-gray-900">Pedidos</h2>
            </div>
            <div className="px-5 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <Label htmlFor="auto_accept_orders" className="text-sm font-medium">
                      Aceitar pedidos automaticamente
                    </Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Quando ativado, novos pedidos serão aceitos automaticamente sem necessidade de confirmação manual
                    </p>
                  </div>
                </div>
                <Switch
                  id="auto_accept_orders"
                  checked={formData.auto_accept_orders ?? false}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, auto_accept_orders: checked }))
                  }
                />
              </div>
            </div>
          </div>

          {/* SectionCard: Tempo Estimado */}
          <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
              <Timer className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold text-gray-900">Tempo Estimado</h2>
            </div>
            <div className="px-5 py-5">
              <p className="text-sm text-muted-foreground mb-4">
                Defina o tempo medio de preparo e entrega. Esses valores sao usados no cronometro do painel de pedidos e exibidos ao cliente.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="estimated_prep_time" className="text-sm font-medium">
                    Tempo de preparo (minutos)
                  </Label>
                  <Input
                    id="estimated_prep_time"
                    name="estimated_prep_time"
                    type="number"
                    min={1}
                    max={240}
                    value={formData.estimated_prep_time ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, estimated_prep_time: val === '' ? undefined : parseInt(val) }));
                    }}
                    className="h-10 w-32 rounded-md border-[#E5E2DD]"
                  />
                  <p className="text-xs text-muted-foreground">Usado no cronometro do painel e KDS</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="estimated_delivery_time" className="text-sm font-medium">
                    Tempo de entrega (minutos)
                  </Label>
                  <Input
                    id="estimated_delivery_time"
                    name="estimated_delivery_time"
                    type="number"
                    min={1}
                    max={240}
                    value={formData.estimated_delivery_time ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, estimated_delivery_time: val === '' ? undefined : parseInt(val) }));
                    }}
                    className="h-10 w-32 rounded-md border-[#E5E2DD]"
                  />
                  <p className="text-xs text-muted-foreground">Exibido ao cliente no checkout e acompanhamento</p>
                </div>
              </div>
            </div>
          </div>

          {/* SectionCard: Caixa */}
          <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold text-gray-900">Caixa</h2>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <Label htmlFor="auto_open_cash_register" className="text-sm font-medium">
                      Abrir caixa automaticamente
                    </Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Quando ativado, o caixa será aberto automaticamente no horário configurado todos os dias
                    </p>
                  </div>
                </div>
                <Switch
                  id="auto_open_cash_register"
                  checked={formData.auto_open_cash_register ?? false}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({
                      ...prev,
                      auto_open_cash_register: checked,
                      ...(!checked && { auto_open_cash_register_time: null })
                    }));
                    if (!checked && fieldErrors.auto_open_cash_register_time) {
                      setFieldErrors(prev => ({ ...prev, auto_open_cash_register_time: "" }));
                    }
                  }}
                />
              </div>
              {formData.auto_open_cash_register && (
                <div className="ml-0 pt-3 border-t border-[#E5E2DD] space-y-1.5">
                  <Label htmlFor="auto_open_cash_register_time" className="text-sm font-medium">
                    Horário de abertura <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="auto_open_cash_register_time"
                    name="auto_open_cash_register_time"
                    type="time"
                    value={formData.auto_open_cash_register_time || ""}
                    onChange={handleInputChange}
                    className={`h-10 w-40 rounded-md border-[#E5E2DD] ${fieldErrors.auto_open_cash_register_time ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                  />
                  {fieldErrors.auto_open_cash_register_time && (
                    <p className="text-xs text-red-500">{fieldErrors.auto_open_cash_register_time}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SectionCard: Horario de Funcionamento */}
          <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold text-gray-900">Horário de Funcionamento</h2>
            </div>
            <div className="px-5 py-5">
              <ScheduleSettings />
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
