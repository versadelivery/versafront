"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart, Plus, Minus, Trash2, Search,
  CreditCard, MapPin, User, Package, Settings2,
} from "lucide-react";
import { useCatalogGroup } from "@/hooks/useCatalogGroup";
import Image from "next/image";
import { toast } from "sonner";
import { formatPrice } from "@/utils/format-price";
import { createPDVOrder } from "@/services/order-service";
import { useAdminActionCable } from "@/lib/admin-cable";
import { useShop } from "@/hooks/use-shop";
import { ItemOptionsDialog } from "./item-options-dialog";
import AdminHeader from "@/components/admin/catalog-header";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  selectedExtras?: { id: string; name: string; price: number }[];
  selectedMethods?: { id: string; name: string }[];
  selectedStepOptions?: Record<string, { optionId: string; optionName: string }>;
  selectedSharedComplements?: { id: string; name: string; price: number }[];
  totalPrice: number;
  observation?: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
  city: string;
  zipCode: string;
  complement?: string;
  reference?: string;
}

export default function PDVPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartIdCounter, setCartIdCounter] = useState(0);
  const [optionsItem, setOptionsItem] = useState<any>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    address: "",
    neighborhood: "",
    city: "",
    zipCode: "",
    complement: "",
    reference: "",
  });
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "pix">("card");
  const [changeAmount, setChangeAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const { shop } = useShop();
  const shopId = shop?.id;

  const { catalog, isLoading } = useCatalogGroup();
  const { subscribeToAdminOrders } = useAdminActionCable();

  useEffect(() => {
    const unsubscribe = subscribeToAdminOrders(() => {});
    return () => { if (unsubscribe) unsubscribe(); };
  }, [subscribeToAdminOrders]);

  // Filtrar catálogo
  const filteredCatalog =
    catalog?.data
      ?.map((group: any) => ({
        ...group,
        attributes: {
          ...group.attributes,
          items:
            group.attributes.items?.filter(
              (item: any) =>
                item.attributes?.name
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                item.attributes?.description
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase())
            ) ?? [],
        },
      }))
      .filter((group: any) => {
        if (selectedGroupId && group.id !== selectedGroupId) return false;
        return group.attributes.items.length > 0;
      }) ?? [];

  const allGroups = catalog?.data ?? [];

  const formatPhone = (value: string) => {
    const n = value.replace(/\D/g, "");
    if (n.length <= 10)
      return n.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
    return n.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  };

  const formatCEP = (value: string) => {
    const n = value.replace(/\D/g, "");
    return n.replace(/(\d{5})(\d{0,3})/, "$1-$2").replace(/-$/, "");
  };

  const cartTotal = cart.reduce((t, item) => t + item.totalPrice, 0);

  // Clique no item — abre modal se tiver opções, senão adiciona direto
  const handleItemClick = (item: any) => {
    const attrs = item.attributes;
    const hasExtras = (attrs.extra?.data?.length ?? 0) > 0;
    const hasMethods = (attrs.prepare_method?.data?.length ?? 0) > 0;
    const hasSteps = (attrs.steps?.data?.length ?? 0) > 0;
    const hasSharedComplements = (attrs.shared_complements?.data?.length ?? 0) > 0;

    if (hasExtras || hasMethods || hasSteps || hasSharedComplements) {
      setOptionsItem(item);
    } else {
      addToCart(item);
    }
  };

  // Adicionar ao carrinho — aceita opções de personalização
  const addToCart = (
    item: any,
    options?: {
      extrasPrice?: number;
      complementsPrice?: number;
      observation?: string;
      selectedExtras?: { id: string; name: string; price: number }[];
      selectedMethods?: { id: string; name: string }[];
      selectedOptions?: Record<string, { optionId: string; optionName: string }>;
      selectedSharedComplements?: { id: string; name: string; price: number }[];
    }
  ) => {
    const attrs = item.attributes;
    const hasDiscount =
      attrs.price_with_discount && attrs.price_with_discount !== attrs.price;
    const basePrice = hasDiscount
      ? parseFloat(attrs.price_with_discount)
      : parseFloat(attrs.price);
    const unitPrice = basePrice + (options?.extrasPrice ?? 0) + (options?.complementsPrice ?? 0);

    const cartItem: CartItem = {
      id: `${item.id}-${cartIdCounter}`,
      name: attrs.name,
      price: unitPrice,
      quantity: 1,
      image_url: attrs.image_url,
      totalPrice: unitPrice,
      selectedExtras: options?.selectedExtras,
      selectedMethods: options?.selectedMethods,
      selectedStepOptions: options?.selectedOptions,
      selectedSharedComplements: options?.selectedSharedComplements,
      observation: options?.observation,
    };

    setCartIdCounter((prev) => prev + 1);
    setCart((prev) => [...prev, cartItem]);
    toast.success(`${attrs.name} adicionado ao carrinho`);
  };

  const handleOptionsAddToCart = (options: {
    extrasPrice: number;
    complementsPrice: number;
    observation: string;
    selectedExtras: { id: string; name: string; price: number }[];
    selectedMethods: { id: string; name: string }[];
    selectedOptions: Record<string, { optionId: string; optionName: string }>;
    selectedSharedComplements: { id: string; name: string; price: number }[];
  }) => {
    if (optionsItem) addToCart(optionsItem, options);
    setOptionsItem(null);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) { removeFromCart(itemId); return; }
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity: newQuantity, totalPrice: item.price * newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => setCart([]);

  const processOrder = async () => {
    if (cart.length === 0) { toast.error("Adicione itens ao carrinho"); return; }

    if (orderType === "delivery" && (!customerInfo.name || !customerInfo.phone || !customerInfo.address)) {
      toast.error("Preencha as informações de entrega"); return;
    }
    if (orderType === "pickup" && (!customerInfo.name || !customerInfo.phone)) {
      toast.error("Preencha o nome e telefone do cliente"); return;
    }

    if (paymentMethod === "cash" && changeAmount) {
      const changeValue = parseFloat(changeAmount);
      if (changeValue < cartTotal) {
        toast.error("O valor do troco deve ser maior ou igual ao total do pedido");
        return;
      }
    }

    setIsProcessingOrder(true);
    try {
      const orderData = {
        order: {
          shop_id: Number(shopId) || 0,
          withdrawal: orderType === "pickup",
          payment_method:
            paymentMethod === "cash"
              ? ("cash" as const)
              : paymentMethod === "card"
              ? ("credit" as const)
              : ("manual_pix" as const),
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone.replace(/\D/g, ""),
          address: {
            address: customerInfo.address,
            neighborhood: customerInfo.neighborhood,
            complement: customerInfo.complement,
            reference: customerInfo.reference,
          },
          items: cart.map((item) => ({
            catalog_item_id: parseInt(item.id.split("-")[0]),
            quantity: item.quantity,
            observation: item.observation || notes || undefined,
            extras_ids: item.selectedExtras?.map((e) => e.id) || [],
            prepare_methods_ids: item.selectedMethods?.map((m) => m.id) || [],
            steps: item.selectedStepOptions
              ? Object.entries(item.selectedStepOptions).map(([stepId, opt]) => ({
                  catalog_item_step_id: stepId,
                  catalog_item_step_option_id: opt.optionId,
                }))
              : [],
            selected_shared_complements_ids: item.selectedSharedComplements?.map((c) => c.id) || [],
          })),
        },
      };

      const result = await createPDVOrder(orderData);
      if (result) {
        toast.success("Pedido criado com sucesso!");
        clearCart();
        setCustomerInfo({ name: "", phone: "", address: "", neighborhood: "", city: "", zipCode: "", complement: "", reference: "" });
        setNotes("");
        setChangeAmount("");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Erro ao processar pedido";
      toast.error(errorMessage);
    } finally {
      setIsProcessingOrder(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <AdminHeader title="Ponto de Venda (PDV)" description="Gerencie seus pedidos e vendas" className="!px-2" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Catálogo ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Catálogo de Produtos
              </CardTitle>

              {/* Busca e filtros */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e: any) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  )}
                </div>

                {allGroups.length > 1 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Filtrar por categoria:</Label>
                      {selectedGroupId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedGroupId(null)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Limpar filtro
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant={selectedGroupId === null ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedGroupId(null)}
                        className="h-8"
                      >
                        Todas as categorias
                        <Badge variant="secondary" className="ml-2">
                          {allGroups.reduce(
                            (t: number, g: any) => t + (g.attributes.items?.length ?? 0),
                            0
                          )}
                        </Badge>
                      </Button>
                      {allGroups.map((group: any) => (
                        <Button
                          key={group.id}
                          variant={selectedGroupId === group.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedGroupId(group.id)}
                          className="h-8"
                        >
                          {group.attributes.name}
                          <Badge variant="secondary" className="ml-2">
                            {group.attributes.items?.length ?? 0}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {(searchTerm || selectedGroupId) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Filtros ativos:</span>
                    {searchTerm && (
                      <Badge variant="outline" className="gap-1">
                        Busca: "{searchTerm}"
                        <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-foreground">×</button>
                      </Badge>
                    )}
                    {selectedGroupId && (
                      <Badge variant="outline" className="gap-1">
                        Categoria: {allGroups.find((g: any) => g.id === selectedGroupId)?.attributes?.name}
                        <button onClick={() => setSelectedGroupId(null)} className="ml-1 hover:text-foreground">×</button>
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Carregando produtos...</p>
                </div>
              ) : filteredCatalog.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-lg">
                    {searchTerm ? "Nenhum produto encontrado" : "Nenhum produto disponível"}
                  </p>
                  {searchTerm && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Tente buscar por outro termo ou limpe o filtro
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  {filteredCatalog.map((group: any) => (
                    <div key={group.id} className="space-y-4">
                      {/* Cabeçalho do grupo */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <h3 className="text-lg sm:text-xl font-semibold text-primary">
                            {group.attributes.name}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {group.attributes.items.length}{" "}
                            {group.attributes.items.length === 1 ? "produto" : "produtos"}
                          </Badge>
                        </div>
                        {group.attributes.description && (
                          <p className="text-sm text-muted-foreground sm:max-w-md">
                            {group.attributes.description}
                          </p>
                        )}
                      </div>

                      {/* Grid de itens */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                        {group.attributes.items.map((item: any) => {
                          const attrs = item.attributes;
                          const hasDiscount =
                            attrs.price_with_discount &&
                            attrs.price_with_discount !== attrs.price;
                          const hasOptions =
                            (attrs.extra?.data?.length ?? 0) > 0 ||
                            (attrs.prepare_method?.data?.length ?? 0) > 0 ||
                            (attrs.steps?.data?.length ?? 0) > 0 ||
                            (attrs.shared_complements?.data?.length ?? 0) > 0;

                          return (
                            <Card
                              key={item.id}
                              className="overflow-hidden hover:shadow-lg transition-all duration-200 group"
                            >
                              <div className="aspect-video relative bg-gray-100">
                                {attrs.image_url ? (
                                  <Image
                                    src={attrs.image_url}
                                    alt={attrs.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                )}

                                {/* Tags */}
                                <div className="absolute top-2 left-2 flex flex-col gap-0.5">
                                  {attrs.new_tag && (
                                    <span className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                                      NOVO!
                                    </span>
                                  )}
                                  {attrs.best_seller_tag && (
                                    <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                                      + VENDIDO
                                    </span>
                                  )}
                                  {attrs.highlight && (
                                    <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                                      DESTAQUE
                                    </span>
                                  )}
                                  {attrs.promotion_tag && !attrs.price_with_discount && (
                                    <span className="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                                      PROMOÇÃO
                                    </span>
                                  )}
                                </div>

                                {hasDiscount && (
                                  <div className="absolute top-2 right-2">
                                    <Badge variant="destructive">PROMOÇÃO</Badge>
                                  </div>
                                )}

                                {/* Indicador de opções */}
                                {hasOptions && (
                                  <div className="absolute bottom-2 right-2">
                                    <span className="bg-black/60 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                      <Settings2 className="h-2.5 w-2.5" />
                                      Personalizável
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="p-4 space-y-3">
                                <div>
                                  <h4 className="font-semibold text-lg mb-1 line-clamp-2">
                                    {attrs.name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {attrs.description}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex flex-col">
                                    {hasDiscount ? (
                                      <>
                                        <span className="text-sm text-muted-foreground line-through">
                                          {formatPrice(parseFloat(attrs.price))}
                                        </span>
                                        <span className="font-bold text-lg text-green-600">
                                          {formatPrice(parseFloat(attrs.price_with_discount))}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="font-bold text-lg text-primary">
                                        {formatPrice(parseFloat(attrs.price))}
                                      </span>
                                    )}
                                  </div>

                                  <Button
                                    onClick={() => handleItemClick(item)}
                                    className="h-9 px-3 gap-1.5 shrink-0"
                                    size="sm"
                                  >
                                    {hasOptions ? (
                                      <>
                                        <Settings2 className="h-3.5 w-3.5" />
                                        Personalizar
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="h-3.5 w-3.5" />
                                        Adicionar
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Carrinho e Pedido ────────────────────────── */}
        <div className="space-y-6">
          {/* Carrinho */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrinho
                  {cart.length > 0 && (
                    <Badge variant="secondary">{cart.reduce((t, i) => t + i.quantity, 0)}</Badge>
                  )}
                </div>
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground font-medium">Carrinho vazio</p>
                  <p className="text-sm text-muted-foreground">Adicione produtos para começar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {item.image_url && (
                          <div className="w-11 h-11 relative flex-shrink-0 rounded-md overflow-hidden">
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm leading-tight">{item.name}</p>

                          {/* Extras selecionados */}
                          {item.selectedExtras && item.selectedExtras.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.selectedExtras.map((e) => (
                                <Badge key={e.id} variant="secondary" className="text-[10px] h-4 px-1">
                                  {e.name}
                                  {e.price > 0 && ` +${formatPrice(e.price)}`}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Métodos selecionados */}
                          {item.selectedMethods && item.selectedMethods.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.selectedMethods.map((m) => (
                                <Badge key={m.id} variant="outline" className="text-[10px] h-4 px-1">
                                  {m.name}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Opções de steps */}
                          {item.selectedStepOptions && Object.keys(item.selectedStepOptions).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.values(item.selectedStepOptions).map((opt, i) => (
                                <Badge key={i} variant="outline" className="text-[10px] h-4 px-1">
                                  {opt.optionName}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Complementos compartilhados */}
                          {item.selectedSharedComplements && item.selectedSharedComplements.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.selectedSharedComplements.map((c) => (
                                <Badge key={c.id} variant="secondary" className="text-[10px] h-4 px-1">
                                  {c.name}
                                  {c.price > 0 && ` +${formatPrice(c.price)}`}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Observação */}
                          {item.observation && (
                            <p className="text-[11px] text-muted-foreground mt-1 italic">
                              "{item.observation}"
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatPrice(item.price)} × {item.quantity}
                            </span>
                            <span className="font-semibold text-sm text-primary">
                              {formatPrice(item.totalPrice)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-7 w-7 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-5 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-7 w-7 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="bg-gray-50 p-3 rounded-lg space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-lg text-primary">{formatPrice(cartTotal)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tipo de Pedido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Tipo de Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={orderType}
                onValueChange={(v: "delivery" | "pickup") => setOrderType(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">Entrega</SelectItem>
                  <SelectItem value="pickup">Retirada</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Dados do cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {orderType === "delivery" ? "Dados de Entrega" : "Dados do Cliente"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm">Nome</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e: any) => setCustomerInfo((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Nome do cliente"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm">Telefone</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e: any) =>
                      setCustomerInfo((p) => ({ ...p, phone: formatPhone(e.target.value) }))
                    }
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                </div>
              </div>

              {orderType === "delivery" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-sm">Endereço</Label>
                    <Input
                      id="address"
                      value={customerInfo.address}
                      onChange={(e: any) => setCustomerInfo((p) => ({ ...p, address: e.target.value }))}
                      placeholder="Rua, número"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="neighborhood" className="text-sm">Bairro</Label>
                      <Input
                        id="neighborhood"
                        value={customerInfo.neighborhood}
                        onChange={(e: any) => setCustomerInfo((p) => ({ ...p, neighborhood: e.target.value }))}
                        placeholder="Bairro"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-sm">Cidade</Label>
                      <Input
                        id="city"
                        value={customerInfo.city}
                        onChange={(e: any) => setCustomerInfo((p) => ({ ...p, city: e.target.value }))}
                        placeholder="Cidade"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="zipCode" className="text-sm">CEP</Label>
                      <Input
                        id="zipCode"
                        value={customerInfo.zipCode}
                        onChange={(e: any) =>
                          setCustomerInfo((p) => ({ ...p, zipCode: formatCEP(e.target.value) }))
                        }
                        placeholder="00000-000"
                        maxLength={9}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="complement" className="text-sm">Complemento</Label>
                      <Input
                        id="complement"
                        value={customerInfo.complement}
                        onChange={(e: any) => setCustomerInfo((p) => ({ ...p, complement: e.target.value }))}
                        placeholder="Apt, bloco"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reference" className="text-sm">Referência</Label>
                    <Input
                      id="reference"
                      value={customerInfo.reference}
                      onChange={(e: any) => setCustomerInfo((p) => ({ ...p, reference: e.target.value }))}
                      placeholder="Ponto de referência"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Método de Pagamento</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(v: "cash" | "card" | "pix") => setPaymentMethod(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Cartão</SelectItem>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === "cash" && (() => {
                const changeValue = changeAmount ? parseFloat(changeAmount) : 0;
                const isChangeInvalid = !!changeAmount && changeValue < cartTotal;
                const changeBack = changeValue - cartTotal;
                return (
                  <div className="space-y-1.5">
                    <Label htmlFor="change" className="text-sm">Troco para</Label>
                    <Input
                      id="change"
                      type="number"
                      step="0.01"
                      value={changeAmount}
                      onChange={(e: any) => setChangeAmount(e.target.value)}
                      placeholder="0.00"
                      className={isChangeInvalid ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {isChangeInvalid ? (
                      <p className="text-sm text-red-500">
                        Valor deve ser maior que o total do pedido
                      </p>
                    ) : changeAmount && cartTotal > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Troco: {formatPrice(changeBack)}
                      </p>
                    ) : null}
                  </div>
                );
              })()}

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-sm">Observações gerais</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e: any) => setNotes(e.target.value)}
                  placeholder="Observações gerais do pedido..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Finalizar */}
          <Button
            onClick={processOrder}
            disabled={cart.length === 0 || isProcessingOrder}
            className="w-full h-12 text-base font-semibold gap-2"
            size="lg"
          >
            <ShoppingCart className="h-5 w-5" />
            {isProcessingOrder
              ? "Processando..."
              : `Finalizar Pedido — ${formatPrice(cartTotal)}`}
          </Button>
        </div>
      </div>

      {/* Modal de opções do item */}
      <ItemOptionsDialog
        item={optionsItem}
        open={optionsItem !== null}
        onClose={() => setOptionsItem(null)}
        onAddToCart={handleOptionsAddToCart}
      />
    </div>
  );
}
