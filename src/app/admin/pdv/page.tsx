"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart, Plus, Minus, Trash2, Search,
  CreditCard, MapPin, User, Package, Settings2,
  Tag, X, CheckCircle2, Loader2, UtensilsCrossed, ArrowLeft,
} from "lucide-react";
import { useCatalogGroup } from "@/hooks/useCatalogGroup";
import Image from "next/image";
import { toast } from "sonner";
import { formatPrice } from "@/utils/format-price";
import { createPDVOrder } from "@/services/order-service";
import { validateCoupon, ValidateCouponData } from "@/services/coupon-validate-service";
import { useAdminActionCable } from "@/lib/admin-cable";
import { useShop } from "@/hooks/use-shop";
import { usePayment } from "@/app/admin/settings/payment/usePayment";
import { useDelivery } from "@/hooks/use-delivery";
import { ItemOptionsDialog } from "./item-options-dialog";
import { tableService, Table, TableSession, CloseTableSessionPayload } from "@/app/admin/mesas/services/table-service";
import CloseTableModal from "@/app/admin/mesas/components/close-table-modal";

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
  weight?: number;
  itemType?: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
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
    complement: "",
    reference: "",
  });
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit" | "debit" | "pix">("credit");
  const [changeAmount, setChangeAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<ValidateCouponData | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [tables, setTables] = useState<Table[]>([]);
  const [openSessions, setOpenSessions] = useState<TableSession[]>([]);
  const [selectedTableSessionId, setSelectedTableSessionId] = useState<string | null>(null);
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string>("");
  const { shop } = useShop();
  const shopId = shop?.id;
  const { paymentMethodsData } = usePayment();
  const { deliveryConfig } = useDelivery();

  const { catalog, isLoading } = useCatalogGroup();
  const { subscribeToAdminOrders } = useAdminActionCable();

  useEffect(() => {
    const unsubscribe = subscribeToAdminOrders(() => {});
    return () => { if (unsubscribe) unsubscribe(); };
  }, [subscribeToAdminOrders]);

  useEffect(() => {
    const fetchTablesAndSessions = async () => {
      try {
        const [tablesRes, sessionsRes] = await Promise.all([
          tableService.getTables(),
          tableService.getTableSessions({ status: "open" }),
        ]);
        setTables(tablesRes.data);
        setOpenSessions(sessionsRes.data);
      } catch {
        // silently fail — tables are optional
      }
    };
    fetchTablesAndSessions();
  }, []);

  // Filtrar catálogo — somente itens e grupos ativos
  const filteredCatalog =
    catalog?.data
      ?.filter((group: any) => group.attributes.active !== false)
      .map((group: any) => ({
        ...group,
        attributes: {
          ...group.attributes,
          items:
            group.attributes.items?.filter(
              (item: any) =>
                item.attributes?.active !== false &&
                (item.attributes?.name
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                item.attributes?.description
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase()))
            ) ?? [],
        },
      }))
      .filter((group: any) => {
        if (selectedGroupId && group.id !== selectedGroupId) return false;
        return group.attributes.items.length > 0;
      }) ?? [];

  const allGroups = (catalog?.data ?? []).filter(
    (group: any) =>
      group.attributes.active !== false &&
      group.attributes.items?.some((item: any) => item.attributes?.active !== false)
  );

  const formatPhone = (value: string) => {
    const n = value.replace(/\D/g, "");
    if (n.length <= 10)
      return n.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
    return n.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  };

  const cartTotal = cart.reduce((t, item) => t + item.totalPrice, 0);

  const isPerNeighborhood = deliveryConfig?.delivery_fee_kind === "per_neighborhood";
  const neighborhoods = deliveryConfig?.neighborhoods ?? [];

  const calculateDeliveryFee = (): number => {
    if (orderType !== "delivery" || !!selectedTableSessionId) return 0;
    if (deliveryConfig?.delivery_fee_kind === "fixed") {
      const minFree = deliveryConfig.min_value_free_delivery ?? 0;
      if (minFree > 0 && cartTotal >= minFree) return 0;
      return deliveryConfig.amount ?? 0;
    }
    if (isPerNeighborhood && selectedNeighborhoodId) {
      const nb = neighborhoods.find((n) => n.id === selectedNeighborhoodId);
      if (!nb) return 0;
      const minFree = nb.min_value_free_delivery ?? 0;
      if (minFree > 0 && cartTotal >= minFree) return 0;
      return nb.amount ?? 0;
    }
    return 0;
  };

  const deliveryFee = calculateDeliveryFee();
  const minimumOrderValue = deliveryConfig?.minimum_order_value ?? 0;

  const pdvPaymentMethodToApi = (m: "cash" | "credit" | "debit" | "pix") =>
    m === "cash" ? "cash" : m === "pix" ? "manual_pix" : m;

  const calculatePdvPaymentAdjustment = (): number => {
    const attrs = paymentMethodsData?.data?.attributes;
    if (!attrs) return 0;
    const attrKey = pdvPaymentMethodToApi(paymentMethod);
    const adjType = attrs[`${attrKey}_adjustment_type` as keyof typeof attrs] as string;
    if (!adjType || adjType === "none") return 0;
    const adjValue = parseFloat(String(attrs[`${attrKey}_adjustment_value` as keyof typeof attrs] || "0"));
    const valType = attrs[`${attrKey}_value_type` as keyof typeof attrs] as string;
    if (adjValue <= 0) return 0;
    const amount = valType === "percentage" ? cartTotal * (adjValue / 100) : adjValue;
    return adjType === "discount" ? -amount : amount;
  };

  const paymentAdjustment = calculatePdvPaymentAdjustment();

  const getPaymentMethodLabel = (m: "cash" | "credit" | "debit" | "pix") =>
    m === "cash" ? "Dinheiro" : m === "credit" ? "Crédito" : m === "debit" ? "Débito" : "PIX";

  // Clique no item — abre modal se tiver opções ou for peso, senão adiciona direto
  const handleItemClick = (item: any) => {
    const attrs = item.attributes;
    const hasExtras = (attrs.extra?.data?.length ?? 0) > 0;
    const hasMethods = (attrs.prepare_method?.data?.length ?? 0) > 0;
    const hasSteps = (attrs.steps?.data?.length ?? 0) > 0;
    const hasSharedComplements = (attrs.shared_complements?.data?.length ?? 0) > 0;
    const isWeightBased = attrs.item_type === 'weight_per_kg' || attrs.item_type === 'weight_per_g';

    if (hasExtras || hasMethods || hasSteps || hasSharedComplements || isWeightBased) {
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
      weight?: number;
    }
  ) => {
    const attrs = item.attributes;
    const hasDiscount =
      attrs.price_with_discount && attrs.price_with_discount !== attrs.price;
    const basePrice = hasDiscount
      ? parseFloat(attrs.price_with_discount)
      : parseFloat(attrs.price);
    const extrasPrice = options?.extrasPrice ?? 0;
    const complementsPrice = options?.complementsPrice ?? 0;
    const isWeightBased = attrs.item_type === 'weight_per_kg' || attrs.item_type === 'weight_per_g';
    const itemWeight = options?.weight;
    const unitPrice = isWeightBased && itemWeight
      ? basePrice * itemWeight + extrasPrice + complementsPrice
      : basePrice + extrasPrice + complementsPrice;
    const finalTotal = unitPrice;

    const cartItem: CartItem = {
      id: `${item.id}-${cartIdCounter}`,
      name: attrs.name,
      price: unitPrice,
      quantity: 1,
      image_url: attrs.image_url,
      totalPrice: finalTotal,
      selectedExtras: options?.selectedExtras,
      selectedMethods: options?.selectedMethods,
      selectedStepOptions: options?.selectedOptions,
      selectedSharedComplements: options?.selectedSharedComplements,
      observation: options?.observation,
      ...(isWeightBased && itemWeight && { weight: itemWeight, itemType: attrs.item_type }),
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
    weight?: number;
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

  const [openingTableId, setOpeningTableId] = useState<string | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const handleSelectTableSession = (sessionId: string | null) => {
    setSelectedTableSessionId(sessionId);
    if (sessionId) {
      const session = openSessions.find((s) => s.id === sessionId);
      if (session?.attributes.customer_name) {
        setCustomerInfo((prev) => ({ ...prev, name: session.attributes.customer_name || "" }));
      }
    } else {
      setCustomerInfo((prev) => ({ ...prev, name: "" }));
    }
  };

  const handleOpenSession = async (tableId: string) => {
    setOpeningTableId(tableId);
    try {
      const result = await tableService.openTableSession({ table_id: tableId });
      const newSession = result.data;
      setOpenSessions((prev) => [...prev, newSession]);
      setSelectedTableSessionId(newSession.id);
      toast.success(`Comanda aberta para Mesa ${newSession.attributes.table_number}`);
    } catch {
      toast.error("Erro ao abrir comanda");
    } finally {
      setOpeningTableId(null);
    }
  };

  const handleCloseSession = async (id: string, data: CloseTableSessionPayload) => {
    await tableService.closeTableSession(id, data);
    setSelectedTableSessionId(null);
    toast.success("Comanda fechada com sucesso!");
    const [t, s] = await Promise.all([
      tableService.getTables(),
      tableService.getTableSessions({ status: "open" }),
    ]);
    setTables(t.data);
    setOpenSessions(s.data);
  };

  const isTableOrder = !!selectedTableSessionId;
  const isBelowMinOrder = orderType === "delivery" && !isTableOrder && minimumOrderValue > 0 && cartTotal < minimumOrderValue;
  const selectedSession = isTableOrder ? openSessions.find((s) => s.id === selectedTableSessionId) : null;
  const selectedTable = selectedSession
    ? tables.find((t) => t.attributes.number === selectedSession.attributes.table_number)
    : null;

  const clearCart = () => {
    setCart([]);
    handleRemoveCoupon();
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !shopId) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const response = await validateCoupon(couponCode.trim(), Number(shopId));
      const couponData = response.data.attributes;
      setAppliedCoupon(couponData);
      toast.success("Cupom aplicado!");
    } catch (error: any) {
      const msg = error.response?.data?.error || "Cupom inválido";
      setCouponError(msg);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    setCouponError("");
  };

  // Recalcular desconto do cupom quando o carrinho muda
  useEffect(() => {
    if (!appliedCoupon) { setCouponDiscount(0); return; }
    let discount = 0;
    if (appliedCoupon.discount_type === "fixed_value") {
      discount = Math.min(parseFloat(appliedCoupon.value), cartTotal);
    } else {
      discount = cartTotal * (parseFloat(appliedCoupon.value) / 100);
    }
    setCouponDiscount(discount);
  }, [cartTotal, appliedCoupon]);

  const orderTotal = Math.max(cartTotal - couponDiscount + paymentAdjustment + deliveryFee, 0);

  // Métodos de pagamento disponíveis (dinâmico baseado na config da loja)
  const availablePaymentMethods = (() => {
    const attrs = paymentMethodsData?.data?.attributes;
    const methods: { value: "cash" | "credit" | "debit" | "pix"; label: string }[] = [];
    if (!attrs) return [{ value: "credit" as const, label: "Crédito" }, { value: "debit" as const, label: "Débito" }, { value: "cash" as const, label: "Dinheiro" }, { value: "pix" as const, label: "PIX" }];
    if (attrs.credit) methods.push({ value: "credit", label: "Crédito" });
    if (attrs.debit) methods.push({ value: "debit", label: "Débito" });
    if (attrs.cash) methods.push({ value: "cash", label: "Dinheiro" });
    if (attrs.manual_pix) methods.push({ value: "pix", label: "PIX" });
    return methods;
  })();

  // Garantir que o método de pagamento selecionado está disponível
  useEffect(() => {
    if (availablePaymentMethods.length > 0 && !availablePaymentMethods.some(m => m.value === paymentMethod)) {
      setPaymentMethod(availablePaymentMethods[0].value);
    }
  }, [paymentMethodsData]);

  const getAdjustmentLabel = (m: "cash" | "credit" | "debit" | "pix"): string => {
    const attrs = paymentMethodsData?.data?.attributes;
    if (!attrs) return "";
    const attrKey = pdvPaymentMethodToApi(m);
    const adjType = attrs[`${attrKey}_adjustment_type` as keyof typeof attrs] as string;
    if (!adjType || adjType === "none") return "";
    const adjValue = parseFloat(String(attrs[`${attrKey}_adjustment_value` as keyof typeof attrs] || "0"));
    const valType = attrs[`${attrKey}_value_type` as keyof typeof attrs] as string;
    if (adjValue <= 0) return "";
    const sign = adjType === "discount" ? "-" : "+";
    if (valType === "percentage") return ` (${sign}${adjValue}%)`;
    return ` (${sign}R$ ${adjValue.toFixed(2).replace(".", ",")})`;
  };

  const phoneValidationRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

  const processOrder = async () => {
    if (cart.length === 0) { toast.error("Adicione itens ao carrinho"); return; }

    if (availablePaymentMethods.length === 0) {
      toast.error("Configure pelo menos um método de pagamento nas configurações");
      return;
    }

    if (!isTableOrder) {
      const errors: Record<string, string> = {};
      const trimmedName = customerInfo.name.trim();

      if (!trimmedName) {
        errors.name = "Nome é obrigatório";
      }

      if (!customerInfo.phone) {
        errors.phone = "Telefone é obrigatório";
      } else if (!phoneValidationRegex.test(customerInfo.phone)) {
        errors.phone = "Telefone inválido. Use o formato (XX) XXXXX-XXXX";
      }

      if (orderType === "delivery") {
        if (!customerInfo.address.trim()) {
          errors.address = "Endereço é obrigatório";
        }
        if (isPerNeighborhood) {
          if (!selectedNeighborhoodId) {
            errors.neighborhood = "Selecione um bairro";
          }
        } else {
          if (!customerInfo.neighborhood.trim()) {
            errors.neighborhood = "Bairro é obrigatório";
          }
        }
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        toast.error("Preencha os campos obrigatórios");
        return;
      }

      setCustomerInfo((p) => ({ ...p, name: trimmedName }));
    }

    if (isBelowMinOrder) {
      toast.error(`Valor mínimo para entrega: ${formatPrice(minimumOrderValue)}`);
      return;
    }

    if (appliedCoupon) {
      const minOrder = parseFloat(appliedCoupon.minimum_order_value) || 0;
      if (minOrder > 0 && cartTotal < minOrder) {
        toast.error(`Valor mínimo do pedido para o cupom: ${formatPrice(minOrder)}`);
        return;
      }
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
      const selectedSession = openSessions.find((s) => s.id === selectedTableSessionId);
      const orderData = {
        order: {
          shop_id: Number(shopId) || 0,
          withdrawal: isTableOrder ? true : orderType === "pickup",
          payment_method:
            paymentMethod === "pix" ? ("manual_pix" as const) : (paymentMethod as "cash" | "credit" | "debit"),
          customer_name: isTableOrder
            ? (selectedSession?.attributes.customer_name || `Mesa ${selectedSession?.attributes.table_number}`)
            : customerInfo.name.trim(),
          customer_phone: isTableOrder ? undefined : customerInfo.phone.replace(/\D/g, "") || undefined,
          ...(appliedCoupon && { coupon_code: appliedCoupon.code }),
          ...(selectedTableSessionId && { table_session_id: Number(selectedTableSessionId) }),
          address: {
            address: isTableOrder ? "" : customerInfo.address,
            neighborhood: isTableOrder ? "" : (isPerNeighborhood
              ? (neighborhoods.find((n) => n.id === selectedNeighborhoodId)?.name ?? "")
              : customerInfo.neighborhood),
            complement: isTableOrder ? "" : customerInfo.complement,
            reference: isTableOrder ? "" : customerInfo.reference,
            ...(isPerNeighborhood && selectedNeighborhoodId && !isTableOrder && {
              shop_delivery_neighborhood_id: Number(selectedNeighborhoodId),
            }),
          },
          items: cart.map((item) => ({
            catalog_item_id: parseInt(item.id.split("-")[0]),
            quantity: item.quantity,
            ...(item.weight && { weight: item.weight }),
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
        setNotes("");
        setChangeAmount("");
        handleRemoveCoupon();
        setFormErrors({});
        if (!isTableOrder) {
          setCustomerInfo({ name: "", phone: "", address: "", neighborhood: "", complement: "", reference: "" });
          setSelectedNeighborhoodId("");
          setSelectedTableSessionId(null);
        }
        // Refresh tables and sessions after order creation
        Promise.all([
          tableService.getTables(),
          tableService.getTableSessions({ status: "open" }),
        ]).then(([t, s]) => { setTables(t.data); setOpenSessions(s.data); }).catch(() => {});
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Erro ao processar pedido";
      toast.error(errorMessage);
    } finally {
      setIsProcessingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16">
            <div className="flex items-center gap-4">
              <a
                href="/admin"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">Voltar</span>
              </a>
              <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
              <h1 className="font-tomato text-base sm:text-lg font-bold text-gray-900">
                Ponto de Venda (PDV)
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Catálogo ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E2DD]">
              <h2 className="font-tomato flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
                <Package className="h-5 w-5 text-primary" />
                Catálogo de Produtos
              </h2>

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
                        className="h-8 border border-gray-300 cursor-pointer"
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
                          className="h-8 border border-gray-300 cursor-pointer"
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
            </div>

            <div className="px-5 py-4">
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
                          <h3 className="font-tomato text-lg sm:text-xl font-semibold text-primary">
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
                            <div
                              key={item.id}
                              className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden transition-all duration-200 group"
                            >
                              <div className="aspect-video relative bg-[#F0EFEB]">
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
                                    <span className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap">
                                      NOVO!
                                    </span>
                                  )}
                                  {attrs.best_seller_tag && (
                                    <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap">
                                      + VENDIDO
                                    </span>
                                  )}
                                  {attrs.highlight && (
                                    <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap">
                                      DESTAQUE
                                    </span>
                                  )}
                                  {attrs.promotion_tag && !attrs.price_with_discount && (
                                    <span className="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap">
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
                                    <span className="bg-black/60 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-1">
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
                                    className="h-9 px-3 gap-1.5 shrink-0 border border-gray-300 cursor-pointer"
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
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Carrinho e Pedido ────────────────────────── */}
        <div className="space-y-6">
          {/* Carrinho */}
          <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center justify-between">
              <h2 className="font-tomato flex items-center gap-2 text-base font-semibold text-gray-900">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Carrinho
                {cart.length > 0 && (
                  <Badge variant="secondary">{cart.reduce((t, i) => t + i.quantity, 0)}</Badge>
                )}
              </h2>
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-[#FAF9F7] cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="px-5 py-4">
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
                        className="flex items-start gap-3 p-3 border border-[#E5E2DD] rounded-md hover:bg-[#FAF9F7] transition-colors"
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

                          {/* Peso (itens por kg/g) */}
                          {item.weight && item.itemType && (
                            <p className="text-[11px] text-muted-foreground mt-1">
                              {item.weight} {item.itemType === 'weight_per_g' ? 'g' : 'kg'} × {formatPrice(item.price)}/{item.itemType === 'weight_per_g' ? 'g' : 'kg'}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            {item.weight && item.itemType ? (
                              <span className="text-xs text-muted-foreground">
                                {item.weight} {item.itemType === 'weight_per_g' ? 'g' : 'kg'}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {formatPrice(item.price)} × {item.quantity}
                              </span>
                            )}
                            <span className="font-semibold text-sm text-primary">
                              {formatPrice(item.totalPrice)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {item.weight && item.itemType ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item.id)}
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          ) : (
                            <>
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
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr className="border-[#E5E2DD]" />

                  <div className="bg-[#FAF9F7] p-3 rounded-md space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">{formatPrice(cartTotal)}</span>
                    </div>
                    {couponDiscount > 0 && appliedCoupon && (
                      <div className="flex justify-between items-center text-sm text-green-600">
                        <span>Cupom ({appliedCoupon.code}):</span>
                        <span>- {formatPrice(couponDiscount)}</span>
                      </div>
                    )}
                    {deliveryFee > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Taxa de entrega:</span>
                        <span className="font-medium">+ {formatPrice(deliveryFee)}</span>
                      </div>
                    )}
                    {orderType === "delivery" && deliveryFee === 0 && selectedNeighborhoodId && isPerNeighborhood && (
                      <div className="flex justify-between items-center text-sm text-green-600">
                        <span>Taxa de entrega:</span>
                        <span className="font-medium">Grátis</span>
                      </div>
                    )}
                    {paymentAdjustment !== 0 && (
                      <div className={`flex justify-between items-center text-sm ${paymentAdjustment < 0 ? "text-green-600" : "text-orange-600"}`}>
                        <span>{paymentAdjustment < 0 ? "Desc." : "Acresc."} {getPaymentMethodLabel(paymentMethod)}:</span>
                        <span>{paymentAdjustment < 0 ? "- " : "+ "}{formatPrice(Math.abs(paymentAdjustment))}</span>
                      </div>
                    )}
                    {isBelowMinOrder && (
                      <div className="flex justify-between items-center text-sm text-red-500">
                        <span>Pedido mínimo:</span>
                        <span className="font-medium">{formatPrice(minimumOrderValue)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-lg text-primary">{formatPrice(orderTotal)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cupom de Desconto */}
          <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E2DD]">
              <h2 className="font-tomato flex items-center gap-2 text-base font-semibold text-gray-900">
                <Tag className="h-5 w-5 text-primary" />
                Cupom de Desconto
              </h2>
            </div>
            <div className="px-5 py-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-white border border-green-400 rounded-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <div>
                      <span className="text-sm font-semibold text-green-700">{appliedCoupon.code}</span>
                      <p className="text-xs text-green-600">
                        {appliedCoupon.discount_type === "percentage"
                          ? `${parseFloat(appliedCoupon.value)}% de desconto`
                          : `${formatPrice(parseFloat(appliedCoupon.value))} de desconto`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCoupon}
                    className="h-7 w-7 p-0 text-green-600 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Código do cupom"
                      value={couponCode}
                      onChange={(e: any) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                      className="uppercase"
                      onKeyDown={(e: any) => { if (e.key === "Enter") handleApplyCoupon(); }}
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      variant="outline"
                      size="sm"
                      className="px-4 shrink-0 border border-gray-300 cursor-pointer"
                    >
                      {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-500">{couponError}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mesa (opcional) */}
          {tables.length > 0 && (
            <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center justify-between">
                <h2 className="font-tomato flex items-center gap-2 text-base font-semibold text-gray-900">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  Mesa
                </h2>
                {isTableOrder && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectTableSession(null)}
                    className="h-7 px-2 text-xs text-muted-foreground cursor-pointer"
                  >
                    Remover mesa
                  </Button>
                )}
              </div>
              <div className="px-5 py-4">
                <div className="grid grid-cols-3 gap-2">
                  {tables
                    .sort((a, b) => a.attributes.number - b.attributes.number)
                    .map((table) => {
                      const session = openSessions.find(
                        (s) => s.attributes.table_number === table.attributes.number
                      );
                      const hasSession = !!session;
                      const isSelected = hasSession && selectedTableSessionId === session.id;
                      const isOpening = openingTableId === table.id;

                      return (
                        <button
                          key={table.id}
                          type="button"
                          disabled={isOpening}
                          onClick={() => {
                            if (hasSession) {
                              handleSelectTableSession(isSelected ? null : session.id);
                            } else {
                              handleOpenSession(table.id);
                            }
                          }}
                          className={`relative flex flex-col items-center justify-center rounded-md border-2 p-3 text-center transition-all cursor-pointer ${
                            isSelected
                              ? "border-emerald-500 bg-white ring-2 ring-emerald-200"
                              : hasSession
                              ? "border-amber-400 bg-white hover:border-amber-500"
                              : "border-dashed border-[#E5E2DD] bg-[#FAF9F7] hover:border-gray-400 hover:bg-[#F0EFEB]"
                          }`}
                        >
                          <span className={`text-sm font-bold ${
                            isSelected ? "text-emerald-700" : hasSession ? "text-amber-700" : "text-gray-500"
                          }`}>
                            {table.attributes.number}
                          </span>
                          <span className={`text-[10px] mt-0.5 ${
                            isSelected ? "text-emerald-600" : hasSession ? "text-amber-600" : "text-gray-400"
                          }`}>
                            {isOpening
                              ? "Abrindo..."
                              : isSelected
                              ? "Selecionada"
                              : hasSession
                              ? session.attributes.customer_name || "Ocupada"
                              : "Abrir"}
                          </span>
                          {hasSession && (
                            <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                              isSelected ? "bg-emerald-500" : "bg-amber-400"
                            }`} />
                          )}
                        </button>
                      );
                    })}
                </div>
                {isTableOrder && (() => {
                  const session = openSessions.find((s) => s.id === selectedTableSessionId);
                  return (
                    <div className="bg-white border border-emerald-400 rounded-md px-3 py-2.5 mt-3 space-y-1">
                      <p className="text-xs text-emerald-700 font-medium">
                        Pedido para Mesa {session?.attributes.table_number}
                        {session?.attributes.customer_name ? ` — ${session.attributes.customer_name}` : ""}
                      </p>
                      <p className="text-xs text-emerald-600">
                        Dados de cliente e entrega não são necessarios
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Tipo de Pedido — esconde quando vinculado a mesa */}
          {!isTableOrder && (
            <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E2DD]">
                <h2 className="font-tomato flex items-center gap-2 text-base font-semibold text-gray-900">
                  <MapPin className="h-5 w-5 text-primary" />
                  Tipo de Pedido
                </h2>
              </div>
              <div className="px-5 py-4">
                <Select
                  value={orderType}
                  onValueChange={(v: "delivery" | "pickup") => { setOrderType(v); setFormErrors({}); }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Entrega</SelectItem>
                    <SelectItem value="pickup">Retirada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Dados do cliente — esconde quando vinculado a mesa */}
          {!isTableOrder && <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E2DD]">
              <h2 className="font-tomato flex items-center gap-2 text-base font-semibold text-gray-900">
                <User className="h-5 w-5 text-primary" />
                {orderType === "delivery" ? "Dados de Entrega" : "Dados do Cliente"}
              </h2>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm">Nome <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e: any) => {
                      setCustomerInfo((p) => ({ ...p, name: e.target.value }));
                      if (formErrors.name) setFormErrors((p) => ({ ...p, name: "" }));
                    }}
                    placeholder="Nome do cliente"
                    className={formErrors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm">Telefone <span className="text-red-500">*</span></Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e: any) => {
                      setCustomerInfo((p) => ({ ...p, phone: formatPhone(e.target.value) }));
                      if (formErrors.phone) setFormErrors((p) => ({ ...p, phone: "" }));
                    }}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    className={formErrors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
                </div>
              </div>

              {orderType === "delivery" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-sm">Endereço <span className="text-red-500">*</span></Label>
                    <Input
                      id="address"
                      value={customerInfo.address}
                      onChange={(e: any) => {
                        setCustomerInfo((p) => ({ ...p, address: e.target.value }));
                        if (formErrors.address) setFormErrors((p) => ({ ...p, address: "" }));
                      }}
                      placeholder="Rua, número"
                      maxLength={70}
                      className={formErrors.address ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {formErrors.address && <p className="text-xs text-red-500">{formErrors.address}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="neighborhood" className="text-sm">Bairro <span className="text-red-500">*</span></Label>
                      {isPerNeighborhood ? (
                        <>
                          <Select
                            value={selectedNeighborhoodId}
                            onValueChange={(v) => {
                              setSelectedNeighborhoodId(v);
                              if (formErrors.neighborhood) setFormErrors((p) => ({ ...p, neighborhood: "" }));
                            }}
                          >
                            <SelectTrigger className={formErrors.neighborhood ? "border-red-500 focus-visible:ring-red-500" : ""}>
                              <SelectValue placeholder="Selecione o bairro" />
                            </SelectTrigger>
                            <SelectContent>
                              {neighborhoods.map((nb) => (
                                <SelectItem key={nb.id} value={nb.id}>
                                  {nb.name} · {formatPrice(nb.amount)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formErrors.neighborhood && <p className="text-xs text-red-500">{formErrors.neighborhood}</p>}
                        </>
                      ) : (
                        <>
                          <Input
                            id="neighborhood"
                            value={customerInfo.neighborhood}
                            onChange={(e: any) => {
                              setCustomerInfo((p) => ({ ...p, neighborhood: e.target.value }));
                              if (formErrors.neighborhood) setFormErrors((p) => ({ ...p, neighborhood: "" }));
                            }}
                            placeholder="Bairro"
                            className={formErrors.neighborhood ? "border-red-500 focus-visible:ring-red-500" : ""}
                          />
                          {formErrors.neighborhood && <p className="text-xs text-red-500">{formErrors.neighborhood}</p>}
                        </>
                      )}
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
            </div>
          </div>}

          {/* Pagamento */}
          <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E2DD]">
              <h2 className="font-tomato flex items-center gap-2 text-base font-semibold text-gray-900">
                <CreditCard className="h-5 w-5 text-primary" />
                Pagamento
              </h2>
            </div>
            <div className="px-5 py-4 space-y-4">
              {availablePaymentMethods.length === 0 ? (
                <div className="bg-white border border-red-400 rounded-md px-4 py-3">
                  <p className="text-sm text-red-600 font-medium">Nenhum método de pagamento configurado</p>
                  <p className="text-xs text-red-500 mt-1">Configure os métodos de pagamento nas configurações da loja.</p>
                </div>
              ) : (
              <div className="space-y-1.5">
                <Label className="text-sm">Método de Pagamento</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(v: "cash" | "credit" | "debit" | "pix") => setPaymentMethod(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePaymentMethods.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}{getAdjustmentLabel(m.value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              )}

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
            </div>
          </div>

          {/* Finalizar */}
          {isTableOrder ? (
            <div className="space-y-2">
              <Button
                onClick={processOrder}
                disabled={cart.length === 0 || isProcessingOrder}
                className="w-full h-12 text-base font-semibold gap-2 border border-gray-300 cursor-pointer"
                size="lg"
              >
                <Plus className="h-5 w-5" />
                {isProcessingOrder
                  ? "Enviando..."
                  : `Enviar Pedido — ${formatPrice(orderTotal)}`}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCloseModal(true)}
                disabled={isProcessingOrder}
                className="w-full h-10 text-sm font-medium gap-2 border border-red-400 text-red-600 hover:bg-[#FAF9F7] hover:text-red-700 cursor-pointer"
              >
                <UtensilsCrossed className="h-4 w-4" />
                Fechar Comanda — Mesa {selectedSession?.attributes.table_number}
              </Button>
            </div>
          ) : (
            <Button
              onClick={processOrder}
              disabled={cart.length === 0 || isProcessingOrder || isBelowMinOrder}
              className="w-full h-12 text-base font-semibold gap-2 border border-gray-300 cursor-pointer"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5" />
              {isProcessingOrder
                ? "Processando..."
                : `Finalizar Pedido — ${formatPrice(orderTotal)}`}
            </Button>
          )}
        </div>
        </div>
      </div>

      {/* Modal de opções do item */}
      <ItemOptionsDialog
        item={optionsItem}
        open={optionsItem !== null}
        onClose={() => setOptionsItem(null)}
        onAddToCart={handleOptionsAddToCart}
      />

      {/* Modal de fechar comanda */}
      <CloseTableModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onSubmit={handleCloseSession}
        table={selectedTable || null}
        session={selectedSession || null}
      />
    </div>
  );
}
