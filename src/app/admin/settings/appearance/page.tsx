"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useShop } from "@/hooks/use-shop";
import { ShopAttributes } from "@/services/shop";
import {
  ArrowLeft,
  Palette,
  MessageSquare,
  Megaphone,
  LayoutGrid,
  LayoutList,
  Eye,
  Store,
  Clock,
  Truck,
  Receipt,
  Loader2,
} from "lucide-react";

const COLOR_PRESETS = [
  { label: "Padrão", header: "#FFFFFF", background: "#FAF9F7", group: "#FFFFFF", accent: "#16A34A" },
  { label: "Escuro", header: "#1F2937", background: "#111827", group: "#1F2937", accent: "#3B82F6" },
  { label: "Azul", header: "#1E40AF", background: "#EFF6FF", group: "#DBEAFE", accent: "#1E40AF" },
  { label: "Verde", header: "#166534", background: "#F0FDF4", group: "#DCFCE7", accent: "#166534" },
  { label: "Vermelho", header: "#991B1B", background: "#FEF2F2", group: "#FEE2E2", accent: "#991B1B" },
  { label: "Roxo", header: "#6B21A8", background: "#FAF5FF", group: "#F3E8FF", accent: "#6B21A8" },
];

type CatalogFormData = Pick<
  ShopAttributes,
  | "welcome_message"
  | "banner_text"
  | "banner_active"
  | "header_color"
  | "background_color"
  | "group_color"
  | "catalog_layout"
  | "accent_color"
>;

export default function AppearanceSettingsPage() {
  const { shop, isLoading, updateShop, isUpdating } = useShop();
  const [formData, setFormData] = useState<CatalogFormData>({
    welcome_message: "",
    banner_text: "",
    banner_active: false,
    header_color: "#FFFFFF",
    background_color: "#FAF9F7",
    group_color: "#FFFFFF",
    catalog_layout: "list",
    accent_color: "#16A34A",
  });
  const [initialData, setInitialData] = useState<CatalogFormData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (shop && !isLoading && !isUpdating) {
      const initial: CatalogFormData = {
        welcome_message: shop.welcome_message || "",
        banner_text: shop.banner_text || "",
        banner_active: shop.banner_active ?? false,
        header_color: shop.header_color || "#FFFFFF",
        background_color: shop.background_color || "#FAF9F7",
        group_color: shop.group_color || "#FFFFFF",
        catalog_layout: shop.catalog_layout || "list",
        accent_color: shop.accent_color || "#16A34A",
      };

      if (!initialData || (initialData as any)._slug !== shop.slug) {
        setInitialData({ ...initial, _slug: shop.slug } as any);
        setFormData(initial);
      } else {
        setInitialData({ ...initial, _slug: shop.slug } as any);
      }
    }
  }, [shop, isLoading, isUpdating]);

  useEffect(() => {
    if (initialData && formData) {
      const changed = (Object.keys(formData) as (keyof CatalogFormData)[]).some(
        (key) => formData[key] !== (initialData as any)[key]
      );
      setHasChanges(changed);
    }
  }, [formData, initialData]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hasChanges) return;
    updateShop(formData as Partial<ShopAttributes>);
  };

  const handleCancel = () => {
    if (initialData) {
      const { _slug, ...rest } = initialData as any;
      setFormData(rest);
    }
    setHasChanges(false);
  };

  const applyPreset = (preset: (typeof COLOR_PRESETS)[number]) => {
    setFormData((prev) => ({
      ...prev,
      header_color: preset.header,
      background_color: preset.background,
      group_color: preset.group,
      accent_color: preset.accent,
    }));
  };

  const isDarkHeader = useMemo(() => {
    const hex = formData.header_color || "#FFFFFF";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return r * 0.299 + g * 0.587 + b * 0.114 < 128;
  }, [formData.header_color]);

  const isDarkGroup = useMemo(() => {
    const hex = formData.group_color || "#FFFFFF";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return r * 0.299 + g * 0.587 + b * 0.114 < 128;
  }, [formData.group_color]);

  const isDarkAccent = useMemo(() => {
    const hex = formData.accent_color || "#16A34A";
    if (!hex.startsWith('#') || hex.length < 7) return true;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return r * 0.299 + g * 0.587 + b * 0.114 < 128;
  }, [formData.accent_color]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
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
              <h1 className="font-tomato text-base sm:text-lg font-bold text-gray-900">
                Aparência do Cardápio
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Form - left side */}
          <div className="xl:col-span-3">
            <form id="appearance-settings-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Cores */}
              <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <h2 className="font-tomato text-base font-semibold text-gray-900">Cores do Cardápio</h2>
                </div>
                <div className="px-5 py-5 space-y-5">
                  {/* Presets */}
                  <div>
                    <Label className="text-sm font-medium mb-2.5 block">Temas Prontos</Label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => applyPreset(preset)}
                          className="flex items-center gap-2 px-3 py-2 rounded-md border border-[#E5E2DD] hover:border-primary transition-colors text-sm"
                        >
                          <div className="flex gap-0.5">
                            <div
                              className="w-4 h-4 rounded-full border border-gray-200"
                              style={{ backgroundColor: preset.header }}
                            />
                            <div
                              className="w-4 h-4 rounded-full border border-gray-200"
                              style={{ backgroundColor: preset.background }}
                            />
                            <div
                              className="w-4 h-4 rounded-full border border-gray-200"
                              style={{ backgroundColor: preset.group }}
                            />
                            <div
                              className="w-4 h-4 rounded-full border border-gray-200"
                              style={{ backgroundColor: preset.accent }}
                            />
                          </div>
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom colors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="header_color" className="text-sm font-medium">
                        Cor do Header
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="header_color"
                          value={formData.header_color || "#FFFFFF"}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, header_color: e.target.value }))
                          }
                          className="w-10 h-10 rounded-md border border-[#E5E2DD] cursor-pointer p-0.5"
                        />
                        <Input
                          value={formData.header_color || "#FFFFFF"}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, header_color: e.target.value }))
                          }
                          className="h-10 flex-1 rounded-md border-[#E5E2DD] font-mono text-sm"
                          maxLength={7}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="background_color" className="text-sm font-medium">
                        Cor de Fundo
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="background_color"
                          value={formData.background_color || "#FAF9F7"}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, background_color: e.target.value }))
                          }
                          className="w-10 h-10 rounded-md border border-[#E5E2DD] cursor-pointer p-0.5"
                        />
                        <Input
                          value={formData.background_color || "#FAF9F7"}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, background_color: e.target.value }))
                          }
                          className="h-10 flex-1 rounded-md border-[#E5E2DD] font-mono text-sm"
                          maxLength={7}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="group_color" className="text-sm font-medium">
                        Cor dos Grupos
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="group_color"
                          value={formData.group_color || "#FFFFFF"}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, group_color: e.target.value }))
                          }
                          className="w-10 h-10 rounded-md border border-[#E5E2DD] cursor-pointer p-0.5"
                        />
                        <Input
                          value={formData.group_color || "#FFFFFF"}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, group_color: e.target.value }))
                          }
                          className="h-10 flex-1 rounded-md border-[#E5E2DD] font-mono text-sm"
                          maxLength={7}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="accent_color" className="text-sm font-medium">
                        Cor de Destaque
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="accent_color"
                          value={formData.accent_color || "#16A34A"}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, accent_color: e.target.value }))
                          }
                          className="w-10 h-10 rounded-md border border-[#E5E2DD] cursor-pointer p-0.5"
                        />
                        <Input
                          value={formData.accent_color || "#16A34A"}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, accent_color: e.target.value }))
                          }
                          className="h-10 flex-1 rounded-md border-[#E5E2DD] font-mono text-sm"
                          maxLength={7}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Botões de categorias e destaques
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout */}
              <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-primary" />
                  <h2 className="font-tomato text-base font-semibold text-gray-900">Layout do Cardápio</h2>
                </div>
                <div className="px-5 py-5">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, catalog_layout: "list" }))}
                      className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-md border-2 transition-colors cursor-pointer ${
                        formData.catalog_layout === "list"
                          ? "border-primary bg-white"
                          : "border-[#E5E2DD] hover:border-gray-300"
                      }`}
                    >
                      <LayoutList className="w-8 h-8 text-gray-600" />
                      <span className="text-sm font-medium">Lista</span>
                      <span className="text-xs text-muted-foreground text-center">
                        Itens em linhas com foto lateral
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, catalog_layout: "grid" }))}
                      className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-md border-2 transition-colors cursor-pointer ${
                        formData.catalog_layout === "grid"
                          ? "border-primary bg-white"
                          : "border-[#E5E2DD] hover:border-gray-300"
                      }`}
                    >
                      <LayoutGrid className="w-8 h-8 text-gray-600" />
                      <span className="text-sm font-medium">Grade</span>
                      <span className="text-xs text-muted-foreground text-center">
                        Itens em cards com foto grande
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Welcome message */}
              <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <h2 className="font-tomato text-base font-semibold text-gray-900">Mensagem de Boas-vindas</h2>
                </div>
                <div className="px-5 py-5 space-y-3">
                  <Textarea
                    value={formData.welcome_message || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, welcome_message: e.target.value }))
                    }
                    placeholder="Bem-vindo ao nosso cardápio! Confira nossas promoções do dia 🎉"
                    className="min-h-28 text-base rounded-md border-[#E5E2DD] focus-visible:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta mensagem aparecerá no topo do seu cardápio público. Aceita emojis e quebras de linha.
                  </p>
                </div>
              </div>

              {/* Banner */}
              <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-primary" />
                  <h2 className="font-tomato text-base font-semibold text-gray-900">Banner Promocional</h2>
                </div>
                <div className="px-5 py-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="banner_active" className="text-sm font-medium">
                        Ativar banner no topo
                      </Label>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Exibe uma faixa promocional fixa no topo do cardápio
                      </p>
                    </div>
                    <Switch
                      id="banner_active"
                      checked={formData.banner_active ?? false}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, banner_active: checked }))
                      }
                    />
                  </div>
                  {formData.banner_active && (
                    <div className="pt-3 border-t border-[#E5E2DD] space-y-1.5">
                      <Label htmlFor="banner_text" className="text-sm font-medium">
                        Texto do Banner
                      </Label>
                      <Input
                        id="banner_text"
                        value={formData.banner_text || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, banner_text: e.target.value }))
                        }
                        placeholder="Frete grátis acima de R$50!"
                        maxLength={120}
                        className="h-10 text-base rounded-md border-[#E5E2DD] focus-visible:ring-primary"
                      />
                      <p className="text-xs text-muted-foreground">
                        Texto curto e direto. Máximo de 120 caracteres.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {/* Botões de ação */}
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleCancel}
                  className="w-full sm:w-auto h-10 rounded-md border border-gray-300 cursor-pointer hover:bg-[#FAF9F7]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!hasChanges || isUpdating}
                  className="w-full sm:w-auto h-10 rounded-md bg-primary hover:bg-primary/90 text-white border border-gray-300 cursor-pointer text-base font-semibold"
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Salvar alterações"
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Preview - right side */}
          <div className="xl:col-span-2">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Preview</span>
              </div>
              <div
                className="rounded-lg border border-[#E5E2DD] overflow-hidden shadow-sm"
                style={{ maxHeight: "70vh", overflowY: "auto" }}
              >
                {/* Banner preview */}
                {formData.banner_active && formData.banner_text && (
                  <div
                    className="px-4 py-2 text-center text-sm font-medium"
                    style={{
                      backgroundColor: formData.header_color || "#FFFFFF",
                      color: isDarkHeader ? "#FFFFFF" : "#1F2937",
                      borderBottom: "1px solid rgba(0,0,0,0.1)",
                    }}
                  >
                    {formData.banner_text}
                  </div>
                )}

                {/* Header preview */}
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{
                    backgroundColor: formData.header_color || "#FFFFFF",
                    borderBottom: "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{ color: isDarkHeader ? "#FFFFFF" : "#1F2937" }}
                  >
                    {shop?.name || "Sua Loja"}
                  </span>
                  <div className="flex gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: isDarkHeader
                          ? "rgba(255,255,255,0.15)"
                          : "rgba(0,0,0,0.05)",
                      }}
                    >
                      <Store
                        className="w-3 h-3"
                        style={{ color: isDarkHeader ? "#FFFFFF" : "#6B7280" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Shop info preview */}
                <div
                  className="px-4 py-3"
                  style={{
                    backgroundColor: formData.header_color || "#FFFFFF",
                    borderBottom: "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-md flex items-center justify-center"
                      style={{
                        backgroundColor: isDarkHeader
                          ? "rgba(255,255,255,0.1)"
                          : "#F0EFEB",
                      }}
                    >
                      <Store
                        className="w-5 h-5"
                        style={{ color: isDarkHeader ? "#FFFFFF" : "#9CA3AF" }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-sm font-bold uppercase"
                        style={{ color: isDarkHeader ? "#FFFFFF" : "#111827" }}
                      >
                        {shop?.name || "Sua Loja"}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: isDarkHeader ? "rgba(255,255,255,0.7)" : "#6B7280" }}
                      >
                        Aberto agora
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex gap-4 mt-3 pt-3"
                    style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
                  >
                    {[
                      { icon: Clock, label: "30-45 min" },
                      { icon: Truck, label: "R$ 5,00" },
                      { icon: Receipt, label: "R$ 20,00" },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <Icon
                          className="w-3 h-3"
                          style={{ color: isDarkHeader ? "rgba(255,255,255,0.5)" : "#9CA3AF" }}
                        />
                        <span
                          className="text-xs font-medium"
                          style={{ color: isDarkHeader ? "#FFFFFF" : "#111827" }}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Body preview */}
                <div
                  className="px-4 py-4 space-y-3"
                  style={{ backgroundColor: formData.background_color || "#FAF9F7" }}
                >
                  {/* Welcome message */}
                  {formData.welcome_message && (
                    <div
                      className="rounded-md px-3 py-2.5 text-sm"
                      style={{
                        backgroundColor: formData.group_color || "#FFFFFF",
                        color: isDarkGroup ? "#FFFFFF" : "#374151",
                        border: `1px solid ${isDarkGroup ? "rgba(255,255,255,0.1)" : "#E5E2DD"}`,
                      }}
                    >
                      <p className="whitespace-pre-line text-xs">{formData.welcome_message}</p>
                    </div>
                  )}

                  {/* Categories nav mockup */}
                  <div className="flex gap-2 overflow-hidden">
                    {["Destaques", "Pizzas", "Bebidas"].map((cat, i) => (
                      <div
                        key={cat}
                        className="px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium"
                        style={{
                          backgroundColor: i === 2 ? (formData.accent_color || "#16A34A") : "transparent",
                          color: i === 2
                            ? (isDarkAccent ? "#FFFFFF" : "#111827")
                            : (isDarkGroup ? "rgba(255,255,255,0.6)" : "#6B7280"),
                          border: i === 2
                            ? `1px solid ${formData.accent_color || "#16A34A"}`
                            : `1px solid ${isDarkGroup ? "rgba(255,255,255,0.2)" : "#E5E2DD"}`,
                        }}
                      >
                        {cat}
                      </div>
                    ))}
                  </div>

                  {/* Product items mockup */}
                  <div>
                    <p
                      className="text-xs font-bold mb-2 uppercase tracking-wide"
                      style={{ color: isDarkGroup ? "#FFFFFF" : "#374151" }}
                    >
                      Destaques
                    </p>
                    {formData.catalog_layout === "grid" ? (
                      <div className="grid grid-cols-2 gap-2">
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className="rounded-md overflow-hidden"
                            style={{
                              backgroundColor: formData.group_color || "#FFFFFF",
                              border: `1px solid ${isDarkGroup ? "rgba(255,255,255,0.1)" : "#E5E2DD"}`,
                            }}
                          >
                            <div
                              className="w-full h-16"
                              style={{
                                backgroundColor: isDarkGroup
                                  ? "rgba(255,255,255,0.05)"
                                  : "#F0EFEB",
                              }}
                            />
                            <div className="p-2">
                              <div
                                className="h-2 rounded-full w-3/4 mb-1"
                                style={{
                                  backgroundColor: isDarkGroup
                                    ? "rgba(255,255,255,0.15)"
                                    : "#E5E2DD",
                                }}
                              />
                              <div
                                className="h-2 rounded-full w-1/2"
                                style={{
                                  backgroundColor: isDarkGroup
                                    ? "rgba(255,255,255,0.1)"
                                    : "#F0EFEB",
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-2.5 rounded-md"
                            style={{
                              backgroundColor: formData.group_color || "#FFFFFF",
                              border: `1px solid ${isDarkGroup ? "rgba(255,255,255,0.1)" : "#E5E2DD"}`,
                            }}
                          >
                            <div className="flex-1">
                              <div
                                className="h-2 rounded-full w-3/4 mb-1.5"
                                style={{
                                  backgroundColor: isDarkGroup
                                    ? "rgba(255,255,255,0.15)"
                                    : "#E5E2DD",
                                }}
                              />
                              <div
                                className="h-2 rounded-full w-1/2"
                                style={{
                                  backgroundColor: isDarkGroup
                                    ? "rgba(255,255,255,0.1)"
                                    : "#F0EFEB",
                                }}
                              />
                            </div>
                            <div
                              className="w-12 h-12 rounded-md flex-shrink-0"
                              style={{
                                backgroundColor: isDarkGroup
                                  ? "rgba(255,255,255,0.05)"
                                  : "#F0EFEB",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
