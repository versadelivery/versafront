"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart, Plus, Minus, Trash2,
  CreditCard, MapPin, User,
  Tag, X, CheckCircle2, Loader2, UtensilsCrossed, ArrowLeft, AlertCircle,
  Bike, Store, Receipt, Pencil, ChevronRight, UserCheck,
} from "lucide-react";
import { useCatalogGroup } from "@/hooks/useCatalogGroup";
import { useCatalogCategories } from "@/hooks/useCatalogCategories";
import Image from "next/image";
import { toast } from "sonner";
import { formatPrice } from "@/utils/format-price";
import { createPDVOrder } from "@/services/order-service";
import { validateCoupon, ValidateCouponData } from "@/services/coupon-validate-service";
import { useAdminActionCable } from "@/lib/admin-cable";
import { useShop } from "@/hooks/use-shop";
import { usePayment } from "@/app/admin/settings/payment/usePayment";
import { useDelivery } from "@/hooks/use-delivery";
import { KmDeliveryAddress, KmDeliveryState, emptyKmDeliveryState } from "@/components/map/km-delivery-address";
import { ItemOptionsDialog } from "./item-options-dialog";
import { CustomerSearchInput } from "./customer-search-input";
import { AddressNumberField } from "@/components/address-number-field";
import { normalizeAddressNumber, splitStreetNumber } from "@/utils/address-number";
import { customerService } from "@/app/admin/clientes/services/customerService";
import type { Customer, CustomerLastAddress } from "@/app/admin/clientes/services/customerService";
import { collectCustomerErrors as collectRules, PDV_PHONE_REGEX, phoneDigits } from "@/lib/pdv-customer-rules";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { toScanItem } from "@/lib/barcode/to-scan-item";
import { scanErrorMessage } from "@/lib/barcode/scan-messages";
import { needsOptions } from "@/lib/barcode/needs-options";
import { formatWeight } from "@/utils/order-item-quantity";
import { parseBarcode } from "@/lib/barcode/parse-barcode";
import type { ScanResult } from "@/lib/barcode/parse-barcode";
import { hasPermission } from "@/lib/permissions";
import { useAuthContext } from "@/contexts/auth-context";
import { CatalogPanel } from "./catalog-panel";
import { QuickCreateItemModal } from "@/components/admin/pdv/quick-create-item-modal";
import type { QuickCreateRequest } from "@/components/admin/pdv/quick-create-item-modal";
import type { CatalogItemLike } from "@/lib/barcode/to-scan-item";
import { tableService, Table, TableSession, CloseTableSessionPayload } from "@/app/admin/mesas/services/table-service";
import CloseTableModal from "@/app/admin/mesas/components/close-table-modal";

interface CartItem {
  id: string;
  catalogItemId?: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  selectedExtras?: { id: string; name: string; price: number }[];
  selectedMethods?: { id: string; name: string }[];
  selectedStepOptions?: Record<string, { optionId: string; optionName: string }>;
  selectedSharedComplements?: { id: string; name: string; price: number }[];
  totalPrice: number;
  weight?: number;
  // Preço do kg (ou do g) do catálogo; `price` já é o total da linha
  weightUnitPrice?: number;
  itemType?: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  number: string;
  neighborhood: string;
  complement?: string;
  reference?: string;
}

// "table" só existe quando a Mesas abre o PDV com ?table_session=ID; a escolha inicial é só Delivery/Retirada/Balcão
type OrderType = "delivery" | "pickup" | "counter" | "table";

const ORDER_TYPES: { value: Exclude<OrderType, "table">; label: string; hint: string; Icon: typeof Bike }[] = [
  { value: "delivery", label: "Delivery", hint: "Cliente com endereço de entrega", Icon: Bike },
  { value: "pickup", label: "Retirada", hint: "Telefone do cliente", Icon: Store },
  { value: "counter", label: "Balcão", hint: "Venda rápida, sem cadastro", Icon: Receipt },
];

const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  delivery: "Delivery",
  pickup: "Retirada",
  counter: "Balcão",
  table: "Mesa",
};

export default function PDVPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartIdCounter, setCartIdCounter] = useState(0);
  const [optionsItem, setOptionsItem] = useState<any>(null);
  // Peso lido da etiqueta quando o item ainda precisa passar pelo modal de opções
  const [scaleWeight, setScaleWeight] = useState<number | undefined>(undefined);
  const [quickCreate, setQuickCreate] = useState<QuickCreateRequest | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    address: "",
    number: "",
    neighborhood: "",
    complement: "",
    reference: "",
  });
  // Sem tipo escolhido o PDV não avança: o atendente decide Delivery, Retirada ou Balcão primeiro
  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [step, setStep] = useState<"customer" | "items">("customer");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [savedAddressId, setSavedAddressId] = useState("");
  const [setDefaultAddress, setSetDefaultAddress] = useState(false);
  const [registeringCustomer, setRegisteringCustomer] = useState(false);
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
  const [kmDelivery, setKmDelivery] = useState<KmDeliveryState>(emptyKmDeliveryState);
  const { shop, isLoading: isShopLoading } = useShop();
  const shopId = shop?.id;
  const { paymentMethodsData } = usePayment();
  const { deliveryConfig } = useDelivery();

  const { catalog, isLoading } = useCatalogGroup();
  const { categories, isLoading: categoriesLoading } = useCatalogCategories();
  const { subscribeToAdminOrders } = useAdminActionCable();

  useEffect(() => {
    const unsubscribe = subscribeToAdminOrders(() => {}, undefined, { initialData: false });
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

        // Vindo de Mesas ("Lançar pedido"): pula a escolha de tipo e já lança na comanda
        const tableSessionId = new URLSearchParams(window.location.search).get("table_session");
        const session = tableSessionId ? sessionsRes.data.find((s) => s.id === tableSessionId) : null;
        if (session) {
          setOrderType("table");
          setSelectedTableSessionId(session.id);
          setStep("items");
        } else if (tableSessionId) {
          toast.error("Comanda não encontrada ou já fechada");
        }
      } catch {
        // silently fail, tables are optional
      }
    };
    fetchTablesAndSessions();
  }, []);

  // Itens do catálogo no formato do leitor (o payload de admin traz barcode, scale_code e os inativos)
  const scanItems = useMemo(
    () =>
      (catalog?.data ?? []).flatMap((group) => {
        // O tipo do catálogo descreve `items` como objeto, mas a API devolve uma lista.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items: any[] = (group.attributes as { items?: unknown }).items as any[] ?? [];
        return items.map((item) => toScanItem(item, group.attributes.active !== false));
      }),
    [catalog]
  );

  const handleScanResult = (result: ScanResult<(typeof scanItems)[number]>, code: string) => {
    if (result.kind === "error") {
      // Cadastro rápido: só se a loja escolheu essa ação e quem bipou pode mexer no catálogo
      const canQuickCreate = shop?.barcode_not_found_action === "quick_create" && hasPermission(user, "catalog.manage");
      if (canQuickCreate && result.reason === "not_found") {
        setQuickCreate({ code, kind: "barcode" });
        return;
      }
      if (canQuickCreate && result.reason === "unknown_scale_code") {
        setQuickCreate({ code, kind: "scale", scaleCode: Number(code.slice(1, 7)) });
        return;
      }
      toast.error(scanErrorMessage(result.reason, code));
      return;
    }

    const item = result.item.raw;

    if (result.kind === "needs_weight") {
      setOptionsItem(item);
      return;
    }

    if (result.kind === "scale") {
      // Cada etiqueta é uma linha própria: dá para tirar uma bandeja sem mexer nas outras.
      if (needsOptions(item.attributes)) {
        setScaleWeight(result.weight);
        setOptionsItem(item);
      } else {
        addToCart(item, { weight: result.weight });
      }
      return;
    }

    if (needsOptions(item.attributes)) {
      setOptionsItem(item);
      return;
    }

    // Só soma na linha simples; uma linha montada com extras ou modos de preparo não deve ganhar unidades por bipada
    const existingLine = cart.find(
      (line) =>
        line.catalogItemId === String(item.id) &&
        !line.weight &&
        !line.selectedExtras?.length &&
        !line.selectedMethods?.length &&
        !line.selectedSharedComplements?.length &&
        !Object.keys(line.selectedStepOptions ?? {}).length
    );
    if (existingLine) {
      updateQuantity(existingLine.id, existingLine.quantity + 1);
      toast.success(`${item.attributes.name} adicionado ao carrinho`);
    } else {
      addToCart(item);
    }
  };

  const scaleMode = shop?.scale_label_mode ?? "weight";

  // Depois do cadastro, repete a bipada com o item novo: unidade entra no carrinho, etiqueta entra com o peso lido
  const handleQuickCreated = (created: CatalogItemLike, request: QuickCreateRequest) => {
    setQuickCreate(null);
    queryClient.invalidateQueries({ queryKey: ["catalog"] });
    toast.success("Produto cadastrado");
    handleScanResult(parseBarcode(request.code, scaleMode, [toScanItem(created)]), request.code);
    scanner.focusInput();
  };

  const scanner = useBarcodeScanner({
    items: scanItems,
    mode: scaleMode,
    onResult: handleScanResult,
    clearSearch: () => setSearchTerm(""),
    // Sem a loja carregada o modo da etiqueta cairia em "peso" e o cadastro rápido não abriria
    ready: !isLoading && !isShopLoading,
    onNotReady: () => toast.error("Catálogo carregando. Bipe de novo em instantes."),
    shortcut: true,
  });

  // A busca abre em foco, pronta para o primeiro bip
  useEffect(() => {
    if (!isLoading) scanner.focusInput();
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const cartCount = cart.reduce((t, i) => t + i.quantity, 0);

  // Mobile: catálogo e carrinho são "páginas" separadas (no desktop ficam lado a lado)
  const [mobileView, setMobileView] = useState<"catalog" | "cart">("catalog");
  const goMobileView = (v: "catalog" | "cart") => {
    setMobileView(v);
    window.scrollTo({ top: 0 });
  };

  const isPerNeighborhood = deliveryConfig?.delivery_fee_kind === "per_neighborhood";
  const isPerKm = deliveryConfig?.delivery_fee_kind === "per_km";
  const neighborhoods = deliveryConfig?.neighborhoods ?? [];

  const calculateDeliveryFee = (): number => {
    if (orderType !== "delivery") return 0;
    // Valor apenas informativo: o backend recalcula a taxa ao criar o pedido.
    if (isPerKm) return kmDelivery.quote?.amount ?? 0;
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

  // Clique no item, abre modal se tiver opções ou for peso, senão adiciona direto
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

  // Adicionar ao carrinho, aceita opções de personalização
  const addToCart = (
    item: any,
    options?: {
      extrasPrice?: number;
      complementsPrice?: number;
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
    // A API grava o total da linha com 2 casas; o carrinho arredonda igual para o total bater
    const finalTotal = Math.round(unitPrice * 100) / 100;

    const cartItem: CartItem = {
      id: `${item.id}-${cartIdCounter}`,
      catalogItemId: String(item.id),
      name: attrs.name,
      price: unitPrice,
      quantity: 1,
      image_url: attrs.image_url,
      totalPrice: finalTotal,
      selectedExtras: options?.selectedExtras,
      selectedMethods: options?.selectedMethods,
      selectedStepOptions: options?.selectedOptions,
      selectedSharedComplements: options?.selectedSharedComplements,
      ...(isWeightBased && itemWeight && { weight: itemWeight, itemType: attrs.item_type, weightUnitPrice: basePrice }),
    };

    setCartIdCounter((prev) => prev + 1);
    setCart((prev) => [...prev, cartItem]);
    const weightLabel = isWeightBased && itemWeight
      ? ` (${itemWeight.toLocaleString("pt-BR", { maximumFractionDigits: 3 })} ${attrs.item_type === "weight_per_g" ? "g" : "kg"})`
      : "";
    toast.success(`${attrs.name}${weightLabel} adicionado ao carrinho`);
    // Texto antigo na busca grudaria nos dígitos do próximo bip e a leitura deixaria de valer
    setSearchTerm("");
    scanner.focusInput();
  };

  const handleOptionsAddToCart = (options: {
    extrasPrice: number;
    complementsPrice: number;
    selectedExtras: { id: string; name: string; price: number }[];
    selectedMethods: { id: string; name: string }[];
    selectedOptions: Record<string, { optionId: string; optionName: string }>;
    selectedSharedComplements: { id: string; name: string; price: number }[];
    weight?: number;
  }) => {
    if (optionsItem) addToCart(optionsItem, options);
    closeOptions();
  };

  const closeOptions = () => {
    setOptionsItem(null);
    setScaleWeight(undefined);
    scanner.focusInput();
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

  const [showCloseModal, setShowCloseModal] = useState(false);

  const handleCloseSession = async (id: string, data: CloseTableSessionPayload) => {
    await tableService.closeTableSession(id, data);
    toast.success("Comanda fechada com sucesso!");
    // Comanda fechada: volta ao início do PDV (e tira ?table_session da URL)
    window.location.href = "/admin/pdv";
  };

  const isTableOrder = orderType === "table" && !!selectedTableSessionId;
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
    const minOrder = parseFloat(appliedCoupon.minimum_order_value) || 0;
    if (minOrder > 0 && cartTotal < minOrder) {
      setCouponDiscount(0);
      return;
    }
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

  const phoneValidationOk = (phone: string) => PDV_PHONE_REGEX.test(phone);

  // Regras do cliente por tipo: Delivery exige nome, telefone e endereço; Retirada só telefone; Balcão nada
  const collectCustomerErrors = () =>
    collectRules({
      orderType,
      customer: customerInfo,
      isPerKm,
      isPerNeighborhood,
      selectedNeighborhoodId,
      km: { ...kmDelivery, hasQuote: !!kmDelivery.quote },
    });

  const chooseOrderType = (type: Exclude<OrderType, "table">) => {
    setOrderType(type);
    setFormErrors({});
    // Balcão não tem telefone nem endereço: não carrega dados que sobraram de outro tipo
    if (type === "counter") {
      setSelectedCustomer(null);
      setCustomerInfo((p) => ({ ...p, phone: "", address: "", number: "", neighborhood: "", complement: "", reference: "" }));
      setSelectedNeighborhoodId("");
      setKmDelivery(emptyKmDeliveryState);
    } else if (type === "pickup") {
      setCustomerInfo((p) => ({ ...p, address: "", number: "", neighborhood: "", complement: "", reference: "" }));
      setSelectedNeighborhoodId("");
      setKmDelivery(emptyKmDeliveryState);
    }
  };

  const goToItems = () => {
    const errors = collectCustomerErrors();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    setCustomerInfo((p) => ({ ...p, name: p.name.trim() }));
    setFormErrors({});
    setStep("items");
    window.scrollTo({ top: 0 });
    scanner.focusInput();
  };

  const handlePhoneInput = (raw: string) => {
    const phone = formatPhone(raw);
    setCustomerInfo((p) => ({ ...p, phone }));
    if (selectedCustomer && selectedCustomer.attributes.cellphone !== phone.replace(/\D/g, "")) {
      setSelectedCustomer(null);
    }
    if (formErrors.phone) setFormErrors((p) => ({ ...p, phone: "" }));
  };

  const handleNameInput = (name: string) => {
    setCustomerInfo((p) => ({ ...p, name }));
    if (formErrors.name) setFormErrors((p) => ({ ...p, name: "" }));
  };

  // Aplica um endereço salvo ao formulário de entrega (por km, por bairro ou livre)
  const applyAddress = (last: CustomerLastAddress) => {
    if (isPerKm) {
      setKmDelivery({
        ...emptyKmDeliveryState,
        address: splitStreetNumber(last.address, last.number).street,
        number: splitStreetNumber(last.address, last.number).number,
        neighborhood: last.neighborhood ?? "",
        complement: last.complement ?? "",
        reference: last.reference ?? "",
        latitude: last.latitude,
        longitude: last.longitude,
      });
      return;
    }

    const { street, number } = splitStreetNumber(last.address, last.number);
    setCustomerInfo((p) => ({
      ...p,
      address: street,
      number,
      neighborhood: last.neighborhood ?? "",
      complement: last.complement ?? "",
      reference: last.reference ?? "",
    }));
    if (isPerNeighborhood) {
      const match =
        neighborhoods.find((n) => String(n.id) === String(last.shop_delivery_neighborhood_id)) ??
        neighborhoods.find((n) => n.name.trim().toLowerCase() === (last.neighborhood ?? "").trim().toLowerCase());
      setSelectedNeighborhoodId(match ? String(match.id) : "");
    }
  };

  // Cliente escolhido na busca: preenche nome/telefone e, no Delivery, o endereço padrão (ou o do último pedido)
  const handleSelectCustomer = (customer: Customer) => {
    const attrs = customer.attributes;
    setSelectedCustomer(customer);
    setSavedAddressId("");
    setSetDefaultAddress(false);
    setFormErrors({});
    setCustomerInfo((p) => ({ ...p, name: attrs.name, phone: formatPhone(attrs.cellphone.replace(/D/g, "")) }));

    if (orderType !== "delivery") return;
    const saved = attrs.addresses ?? [];
    const first = saved[0] ?? attrs.last_address;
    if (saved[0]) setSavedAddressId(String(saved[0].id));
    if (first) applyAddress(first);
  };

  // A config de entrega pode chegar depois da escolha do cliente: reaplica o endereço salvo no formato certo
  useEffect(() => {
    if (orderType !== "delivery" || !savedAddressId) return;
    const saved = selectedCustomer?.attributes.addresses?.find((a) => String(a.id) === savedAddressId);
    if (saved) applyAddress(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPerKm, isPerNeighborhood]);

  const handlePickSavedAddress = (id: string) => {
    setSavedAddressId(id);
    const address = selectedCustomer?.attributes.addresses?.find((a) => String(a.id) === id);
    if (address) applyAddress(address);
  };

  // Cadastro explícito: só nome e telefone (a API reaproveita a conta se o telefone já existir)
  const handleRegisterCustomer = async () => {
    const errors: Record<string, string> = {};
    if (!customerInfo.name.trim()) errors.name = "Informe o nome para cadastrar";
    if (!phoneValidationOk(customerInfo.phone)) errors.phone = "Informe um telefone válido para cadastrar";
    if (Object.keys(errors).length > 0) {
      setFormErrors((p) => ({ ...p, ...errors }));
      return;
    }
    setRegisteringCustomer(true);
    try {
      const response = await customerService.createCustomer({
        customer: { name: customerInfo.name.trim(), cellphone: phoneDigits(customerInfo.phone) },
      });
      setSelectedCustomer(response.data);
      toast.success("Cliente cadastrado");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao cadastrar cliente");
    } finally {
      setRegisteringCustomer(false);
    }
  };

  const processOrder = async () => {
    if (cart.length === 0) { toast.error("Adicione itens ao carrinho"); return; }

    if (availablePaymentMethods.length === 0) {
      toast.error("Configure pelo menos um método de pagamento nas configurações");
      return;
    }

    if (!isTableOrder) {
      const errors = collectCustomerErrors();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setStep("customer");
        window.scrollTo({ top: 0 });
        toast.error("Preencha os campos obrigatórios do cliente");
        return;
      }

      setCustomerInfo((p) => ({ ...p, name: p.name.trim() }));
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
          withdrawal: isTableOrder ? true : orderType !== "delivery",
          payment_method:
            paymentMethod === "pix" ? ("manual_pix" as const) : (paymentMethod as "cash" | "credit" | "debit"),
          customer_name: isTableOrder
            ? (selectedSession?.attributes.customer_name || `Mesa ${selectedSession?.attributes.table_number}`)
            // Balcão sem nome sai como "Balcão" para a cozinha e o caixa saberem a origem
            : customerInfo.name.trim() || (orderType === "counter" ? "Balcão" : undefined),
          customer_phone:
            isTableOrder || orderType === "counter" ? undefined : customerInfo.phone.replace(/\D/g, "") || undefined,
          ...(appliedCoupon && { coupon_code: appliedCoupon.code }),
          ...(notes.trim() && { observation: notes.trim() }),
          ...(orderType === "delivery" && setDefaultAddress && { set_default_address: true }),
          ...(selectedTableSessionId && { table_session_id: Number(selectedTableSessionId) }),
          address: isPerKm && orderType === "delivery"
            ? {
                address: kmDelivery.address,
                number: normalizeAddressNumber(kmDelivery.number),
                neighborhood: kmDelivery.neighborhood,
                complement: kmDelivery.complement,
                reference: kmDelivery.reference,
                latitude: kmDelivery.latitude ?? undefined,
                longitude: kmDelivery.longitude ?? undefined,
              }
            : {
                address: orderType === "delivery" ? customerInfo.address.trim() : "",
                number: orderType === "delivery" ? normalizeAddressNumber(customerInfo.number) : undefined,
                neighborhood: orderType !== "delivery" ? "" : (isPerNeighborhood
                  ? (neighborhoods.find((n) => n.id === selectedNeighborhoodId)?.name ?? "")
                  : customerInfo.neighborhood),
                complement: orderType === "delivery" ? customerInfo.complement : "",
                reference: orderType === "delivery" ? customerInfo.reference : "",
                ...(isPerNeighborhood && selectedNeighborhoodId && orderType === "delivery" && {
                  shop_delivery_neighborhood_id: Number(selectedNeighborhoodId),
                }),
              },
          items: cart.map((item) => ({
            catalog_item_id: parseInt(item.id.split("-")[0]),
            quantity: item.quantity,
            ...(item.weight && { weight: item.weight }),
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
        goMobileView("catalog");
        setNotes("");
        setChangeAmount("");
        handleRemoveCoupon();
        setFormErrors({});
        if (!isTableOrder) {
          setCustomerInfo({ name: "", phone: "", address: "", number: "", neighborhood: "", complement: "", reference: "" });
          setSelectedNeighborhoodId("");
          setKmDelivery(emptyKmDeliveryState);
          setSelectedCustomer(null);
          setSavedAddressId("");
          setSetDefaultAddress(false);
          // Pedido concluído: o próximo atendimento começa de novo na escolha do tipo
          setOrderType(null);
          setStep("customer");
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
    <div className="min-h-screen bg-[#FAF9F7] pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <div className="bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16">
            <div className="flex items-center gap-4">
              <a
                href="/admin/pedidos"
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
        {step === "customer" && (
          <div className="mx-auto max-w-2xl space-y-4" data-testid="pdv-customer-step">
            {/* Escolha obrigatória do tipo de pedido */}
            <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E2DD]">
                <h2 className="font-tomato flex items-center gap-2 text-base font-semibold text-gray-900">
                  <MapPin className="h-5 w-5 text-primary" />
                  Tipo de pedido <span className="text-red-500">*</span>
                </h2>
              </div>
              <div className="px-5 py-4">
                <div role="radiogroup" aria-label="Tipo de pedido" className="grid grid-cols-3 gap-2 sm:gap-3">
                  {ORDER_TYPES.map(({ value, label, hint, Icon }) => {
                    const active = orderType === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        data-testid={`order-type-${value}`}
                        onClick={() => chooseOrderType(value)}
                        className={`flex flex-col items-center justify-center gap-1.5 rounded-md border-2 px-2 py-4 text-center transition-all cursor-pointer ${
                          active
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : formErrors.orderType
                            ? "border-red-400 bg-white hover:border-red-500"
                            : "border-[#E5E2DD] bg-white hover:border-gray-400"
                        }`}
                      >
                        <Icon className={`h-6 w-6 ${active ? "text-primary" : "text-gray-500"}`} />
                        <span className={`text-sm font-semibold ${active ? "text-primary" : "text-gray-800"}`}>{label}</span>
                        <span className="hidden text-[11px] leading-tight text-muted-foreground sm:block">{hint}</span>
                      </button>
                    );
                  })}
                </div>
                {formErrors.orderType && <p className="mt-2 text-sm text-red-500">{formErrors.orderType}</p>}
              </div>
            </div>

            {/* Cliente: campos variam por tipo */}
            {orderType && orderType !== "table" && (
              <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center justify-between gap-2">
                  <h2 className="font-tomato flex items-center gap-2 text-base font-semibold text-gray-900">
                    <User className="h-5 w-5 text-primary" />
                    {orderType === "delivery" ? "Cliente e entrega" : orderType === "pickup" ? "Cliente" : "Cliente (opcional)"}
                  </h2>
                  {selectedCustomer && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700" data-testid="customer-registered">
                      <UserCheck className="h-4 w-4" />
                      Cliente cadastrado
                    </span>
                  )}
                </div>
                <div className="px-5 py-4 space-y-4">
                  {orderType !== "counter" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-sm">Telefone com DDD <span className="text-red-500">*</span></Label>
                      <CustomerSearchInput
                        id="phone"
                        mode="phone"
                        value={customerInfo.phone}
                        onChange={handlePhoneInput}
                        onSelect={handleSelectCustomer}
                        placeholder="(11) 99999-9999"
                        inputMode="tel"
                        maxLength={15}
                        autoSelectExact
                        hasError={!!formErrors.phone}
                      />
                      {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm">
                      Nome {orderType === "delivery" ? <span className="text-red-500">*</span> : <span className="text-muted-foreground">(opcional)</span>}
                    </Label>
                    {orderType === "counter" ? (
                      <Input
                        id="name"
                        value={customerInfo.name}
                        onChange={(e) => handleNameInput(e.target.value)}
                        placeholder="Nome do cliente"
                        className="h-11"
                      />
                    ) : (
                      <CustomerSearchInput
                        id="name"
                        mode="name"
                        value={customerInfo.name}
                        onChange={handleNameInput}
                        onSelect={handleSelectCustomer}
                        placeholder="Nome do cliente"
                        hasError={!!formErrors.name}
                      />
                    )}
                    {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
                  </div>

                  {orderType !== "counter" && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      {selectedCustomer ? (
                        <a
                          href={`/admin/clientes/${selectedCustomer.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-primary hover:underline"
                          data-testid="customer-orders-link"
                        >
                          Ver pedidos do cliente
                        </a>
                      ) : (
                        phoneValidationOk(customerInfo.phone) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={registeringCustomer}
                            onClick={handleRegisterCustomer}
                            data-testid="register-customer"
                            className="cursor-pointer gap-1.5 border-[#E5E2DD]"
                          >
                            {registeringCustomer ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
                            Cadastrar cliente
                          </Button>
                        )
                      )}
                    </div>
                  )}

                  {orderType === "delivery" && (selectedCustomer?.attributes.addresses?.length ?? 0) > 0 && (
                    <div className="space-y-1.5" data-testid="saved-addresses">
                      <Label htmlFor="saved-address" className="text-sm">Endereços do cliente</Label>
                      <Select value={savedAddressId} onValueChange={handlePickSavedAddress}>
                        <SelectTrigger id="saved-address" className="h-11">
                          <SelectValue placeholder="Escolha um endereço salvo" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedCustomer?.attributes.addresses?.map((a) => (
                            <SelectItem key={a.id} value={String(a.id)}>
                              {[a.address, a.number].filter(Boolean).join(", ")}
                              {a.neighborhood ? ` · ${a.neighborhood}` : ""}
                              {a.is_default ? " (padrão)" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {orderType === "delivery" && isPerKm && shopId && (
                    <KmDeliveryAddress
                      shopId={shopId}
                      storeLatitude={deliveryConfig?.latitude ?? null}
                      storeLongitude={deliveryConfig?.longitude ?? null}
                      itemsTotal={cartTotal}
                      value={kmDelivery}
                      onChange={setKmDelivery}
                      fieldErrors={formErrors}
                    />
                  )}

                  {orderType === "delivery" && !isPerKm && (
                    <>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="address" className="text-sm">Rua <span className="text-red-500">*</span></Label>
                          <Input
                            id="address"
                            value={customerInfo.address}
                            onChange={(e) => {
                              setCustomerInfo((p) => ({ ...p, address: e.target.value }));
                              if (formErrors.address) setFormErrors((p) => ({ ...p, address: "" }));
                            }}
                            placeholder="Nome da rua"
                            maxLength={70}
                            className={`h-11 ${formErrors.address ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          />
                          {formErrors.address && <p className="text-xs text-red-500">{formErrors.address}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="number" className="text-sm">Número <span className="text-red-500">*</span></Label>
                          <AddressNumberField
                            id="number"
                            value={customerInfo.number}
                            onChange={(number) => {
                              setCustomerInfo((p) => ({ ...p, number }));
                              if (formErrors.number) setFormErrors((p) => ({ ...p, number: "" }));
                            }}
                            hasError={!!formErrors.number}
                          />
                          {formErrors.number && <p className="text-xs text-red-500">{formErrors.number}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="neighborhood" className="text-sm">Bairro/Condomínio <span className="text-red-500">*</span></Label>
                          {isPerNeighborhood ? (
                            <>
                              <Select
                                value={selectedNeighborhoodId}
                                onValueChange={(v) => {
                                  setSelectedNeighborhoodId(v);
                                  if (formErrors.neighborhood) setFormErrors((p) => ({ ...p, neighborhood: "" }));
                                }}
                              >
                                <SelectTrigger id="neighborhood" className={`h-11 ${formErrors.neighborhood ? "border-red-500 focus-visible:ring-red-500" : ""}`}>
                                  <SelectValue placeholder="Selecione o bairro" />
                                </SelectTrigger>
                                <SelectContent>
                                  {neighborhoods.map((nb) => (
                                    <SelectItem key={nb.id} value={String(nb.id)}>
                                      {nb.name} · {nb.amount > 0 ? formatPrice(nb.amount) : "Grátis"}
                                      {nb.amount > 0 && (nb.min_value_free_delivery ?? 0) > 0 && ` · Grátis a partir de ${formatPrice(nb.min_value_free_delivery)}`}
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
                                onChange={(e) => {
                                  setCustomerInfo((p) => ({ ...p, neighborhood: e.target.value }));
                                  if (formErrors.neighborhood) setFormErrors((p) => ({ ...p, neighborhood: "" }));
                                }}
                                placeholder="Bairro"
                                className={`h-11 ${formErrors.neighborhood ? "border-red-500 focus-visible:ring-red-500" : ""}`}
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
                            onChange={(e) => setCustomerInfo((p) => ({ ...p, complement: e.target.value }))}
                            placeholder="Apt, bloco"
                            className="h-11"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="reference" className="text-sm">Referência</Label>
                        <Input
                          id="reference"
                          value={customerInfo.reference}
                          onChange={(e) => setCustomerInfo((p) => ({ ...p, reference: e.target.value }))}
                          placeholder="Ponto de referência"
                          className="h-11"
                        />
                      </div>
                    </>
                  )}

                  {orderType === "delivery" && (
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={setDefaultAddress}
                        onChange={(e) => setSetDefaultAddress(e.target.checked)}
                        data-testid="set-default-address"
                        className="h-4 w-4 accent-[var(--color-primary,#009444)]"
                      />
                      Definir como endereço padrão do cliente
                    </label>
                  )}

                  {orderType !== "counter" && !selectedCustomer && customerInfo.phone && (
                    <p className="text-xs text-muted-foreground">
                      Cliente novo: é cadastrado automaticamente ao finalizar o pedido{orderType === "pickup" && !customerInfo.name.trim() ? " (informe o nome para cadastrar)" : ""}.
                    </p>
                  )}
                </div>
              </div>
            )}

            <Button
              type="button"
              onClick={goToItems}
              data-testid="pdv-add-items"
              className="w-full h-12 text-base font-semibold gap-2 cursor-pointer"
              size="lg"
            >
              Adicionar itens
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {step === "items" && (
        <>
        {/* Resumo do atendimento: tipo + cliente, com atalho para corrigir */}
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-[#E5E2DD] bg-white px-4 py-3" data-testid="pdv-summary">
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-gray-900">
              {orderType ? ORDER_TYPE_LABEL[orderType] : ""}
              {isTableOrder && selectedSession ? ` ${selectedSession.attributes.table_number}` : ""}
              {(isTableOrder ? selectedSession?.attributes.customer_name : customerInfo.name.trim()) &&
                ` · ${isTableOrder ? selectedSession?.attributes.customer_name : customerInfo.name.trim()}`}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {orderType === "delivery"
                ? [customerInfo.phone, isPerKm ? [kmDelivery.address, normalizeAddressNumber(kmDelivery.number)].filter(Boolean).join(", ") : [customerInfo.address, normalizeAddressNumber(customerInfo.number)].filter(Boolean).join(", ")].filter(Boolean).join(" · ")
                : orderType === "pickup"
                ? customerInfo.phone
                : orderType === "counter"
                ? "Sem cadastro"
                : "Dados de cliente e entrega não são necessários"}
            </p>
          </div>
          {!isTableOrder && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => { setStep("customer"); window.scrollTo({ top: 0 }); }}
              className="shrink-0 gap-1.5 border-[#E5E2DD] cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
          )}
        </div>

        {/* O cálculo de frete por km precisa continuar vivo com o total do carrinho */}
        {orderType === "delivery" && isPerKm && shopId && (
          <div className="hidden">
            <KmDeliveryAddress
              shopId={shopId}
              storeLatitude={deliveryConfig?.latitude ?? null}
              storeLongitude={deliveryConfig?.longitude ?? null}
              itemsTotal={cartTotal}
              value={kmDelivery}
              onChange={setKmDelivery}
              fieldErrors={formErrors}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Catálogo ─────────────────────────────────── */}
        <div className={`lg:col-span-2 space-y-4 ${mobileView === "cart" ? "hidden lg:block" : ""}`}>
          <CatalogPanel
            groups={catalog?.data ?? []}
            categories={categories}
            isLoading={isLoading || categoriesLoading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            scanner={scanner}
            onItemClick={handleItemClick}
          />
        </div>

        {/* ── Carrinho e Pedido ────────────────────────── */}
        <div className={`space-y-6 ${mobileView === "catalog" ? "hidden lg:block" : ""}`}>
          <button
            type="button"
            onClick={() => goMobileView("catalog")}
            className="lg:hidden flex items-center gap-1.5 text-sm font-medium text-primary cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao catálogo
          </button>
          {/* Carrinho */}
          <div id="pdv-cart" className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
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

                          {/* Peso (itens por kg/g) */}
                          {item.weight && item.itemType && (
                            <p className="text-[11px] text-muted-foreground mt-1">
                              {formatWeight(item.weight)} {item.itemType === 'weight_per_g' ? 'g' : 'kg'} × {formatPrice(item.weightUnitPrice ?? item.price)}/{item.itemType === 'weight_per_g' ? 'g' : 'kg'}
                            </p>
                          )}

                          <span className="text-xs text-muted-foreground mt-1">
                            {item.weight && item.itemType
                              ? `${formatWeight(item.weight)} ${item.itemType === 'weight_per_g' ? 'g' : 'kg'}`
                              : `${formatPrice(item.price)} × ${item.quantity}`}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <div className="flex items-center gap-1">
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
                          <span className="font-semibold text-sm text-primary">
                            {formatPrice(item.totalPrice)}
                          </span>
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
                    {orderType === "delivery" && isPerKm && deliveryFee === 0 && kmDelivery.quote && (
                      <div className="flex justify-between items-center text-sm text-green-600">
                        <span>Taxa de entrega:</span>
                        <span className="font-medium">Grátis</span>
                      </div>
                    )}
                    {orderType === "delivery" && isPerKm && kmDelivery.isCalculating && (
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Taxa de entrega:</span>
                        <span className="font-medium">Calculando...</span>
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
                <div className="space-y-2">
                  {(() => {
                    const minOrder = parseFloat(appliedCoupon.minimum_order_value) || 0;
                    const belowMin = minOrder > 0 && cartTotal < minOrder;
                    return (
                      <>
                        <div className={`flex items-center justify-between bg-white border rounded-md px-4 py-3 ${belowMin ? "border-amber-400" : "border-green-400"}`}>
                          <div className="flex items-center gap-2">
                            {belowMin
                              ? <AlertCircle className="h-4 w-4 text-amber-500" />
                              : <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            <div>
                              <span className={`text-sm font-semibold ${belowMin ? "text-amber-700" : "text-green-700"}`}>{appliedCoupon.code}</span>
                              <p className={`text-xs ${belowMin ? "text-amber-600" : "text-green-600"}`}>
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
                            className={`h-7 w-7 p-0 hover:text-red-500 ${belowMin ? "text-amber-500" : "text-green-600"}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {belowMin && (
                          <p className="text-xs text-amber-600">
                            Pedido mínimo de {formatPrice(minOrder)} para usar este cupom (faltam {formatPrice(minOrder - cartTotal)})
                          </p>
                        )}
                      </>
                    );
                  })()}
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
                <Label htmlFor="notes" className="text-sm">Observações do pedido</Label>
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
                  : `Enviar Pedido - ${formatPrice(orderTotal)}`}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCloseModal(true)}
                disabled={isProcessingOrder}
                className="w-full h-10 text-sm font-medium gap-2 border border-red-400 text-red-600 hover:bg-[#FAF9F7] hover:text-red-700 cursor-pointer"
              >
                <UtensilsCrossed className="h-4 w-4" />
                Fechar Comanda - Mesa {selectedSession?.attributes.table_number}
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
                : `Finalizar Pedido - ${formatPrice(orderTotal)}`}
            </Button>
          )}
        </div>
        </div>
        </>
        )}
      </div>

      {/* Barra do carrinho (mobile): sempre visível acima da navegação do celular */}
      {step === "items" && cart.length > 0 && mobileView === "catalog" && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-[#FAF9F7] via-[#FAF9F7]/95 to-transparent">
          <button
            type="button"
            onClick={() => goMobileView("cart")}
            className="w-full flex items-center justify-between gap-3 rounded-xl bg-primary text-primary-foreground px-4 py-3 shadow-lg cursor-pointer"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <ShoppingCart className="h-5 w-5" />
              {cartCount} {cartCount === 1 ? "item" : "itens"} · {formatPrice(cartTotal)}
            </span>
            <span className="text-sm font-bold">Ver carrinho ›</span>
          </button>
        </div>
      )}

      {/* Cadastro rápido de produto bipado que não existe */}
      <QuickCreateItemModal
        request={quickCreate}
        groups={allGroups.map((group) => ({ id: String(group.id), name: group.attributes.name }))}
        onClose={() => setQuickCreate(null)}
        onCloseAutoFocus={scanner.focusInput}
        onCreated={handleQuickCreated}
      />

      {/* Modal de opções do item */}
      <ItemOptionsDialog
        item={optionsItem}
        open={optionsItem !== null}
        initialWeight={scaleWeight}
        onCloseAutoFocus={scanner.focusInput}
        onClose={closeOptions}
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
