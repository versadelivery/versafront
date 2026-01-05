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
import { ShoppingCart, Plus, Minus, Trash2, Search, CreditCard, MapPin, User, Phone, Package } from "lucide-react";
import { useCatalogGroup } from "@/hooks/useCatalogGroup";
import Image from "next/image";
import { toast } from "sonner";
import { formatPrice } from "@/utils/format-price";
import { createPDVOrder } from "@/services/order-service";
import { useAdminActionCable } from "@/lib/admin-cable";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  selectedExtras?: { id: string; name: string; price: number }[];
  selectedPrepareMethod?: string;
  selectedStepOptions?: { stepId: string; optionId: string; optionName: string }[];
  totalPrice: number;
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
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    address: "",
    neighborhood: "",
    city: "",
    zipCode: "",
    complement: "",
    reference: ""
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

  // Conectar ao canal admin para receber atualizações via AnyCable (sem UI por enquanto)
  useEffect(() => {
    const unsubscribe = subscribeToAdminOrders(() => {
      // No momento não usamos os dados nesta tela; mantemos a conexão ativa
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribeToAdminOrders]);

  // Filtrar produtos baseado na busca e grupo selecionado
  const filteredCatalog = catalog?.data?.map((group: any) => ({
    ...group,
    attributes: {
      ...group.attributes,
      items: group.attributes.items?.filter((item: any) =>
        item.data.attributes.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.data.attributes.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) || []
    }
  })).filter((group: any) => {
    // Filtrar por grupo selecionado se houver
    if (selectedGroupId && group.id !== selectedGroupId) {
      return false;
    }
    // Só mostrar grupos que têm itens após a filtragem de busca
    return group.attributes.items.length > 0;
  }) || [];

  // Obter todos os grupos para o filtro
  const allGroups = catalog?.data || [];

  // Função para aplicar máscara de telefone
  const formatPhone = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara baseada no tamanho
    if (numbers.length <= 10) {
      // Telefone fixo: (11) 1234-5678
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    } else {
      // Celular: (11) 91234-5678
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    }
  };

  // Handler para mudança do telefone com máscara
  const handlePhoneChange = (e: any) => {
    const formatted = formatPhone(e.target.value);
    setCustomerInfo(prev => ({ ...prev, phone: formatted }));
  };

  // Função para aplicar máscara de CEP
  const formatCEP = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara: 12345-678
    return numbers.replace(/(\d{5})(\d{0,3})/, '$1-$2').replace(/-$/, '');
  };

  // Handler para mudança do CEP com máscara
  const handleCEPChange = (e: any) => {
    const formatted = formatCEP(e.target.value);
    setCustomerInfo(prev => ({ ...prev, zipCode: formatted }));
  };

  // Calcular total do carrinho
  const cartTotal = cart.reduce((total: number, item: CartItem) => total + item.totalPrice, 0);

  // Adicionar item ao carrinho
  const addToCart = (item: any) => {
    const basePrice = parseFloat(item.attributes.price);
    const cartItem: CartItem = {
      id: `${item.id}-${cartIdCounter}`,
      name: item.attributes.name,
      price: basePrice,
      quantity: 1,
      image_url: item.attributes.image_url,
      totalPrice: basePrice
    };

    setCartIdCounter((prev: number) => prev + 1);
    setCart((prev: CartItem[]) => [...prev, cartItem]);
    toast.success(`${item.attributes.name} adicionado ao carrinho`);
  };

  // Atualizar quantidade
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart((prev: CartItem[]) => prev.map((item: CartItem) => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity, totalPrice: item.price * newQuantity }
        : item
    ));
  };

  // Remover do carrinho
  const removeFromCart = (itemId: string) => {
    setCart((prev: CartItem[]) => prev.filter((item: CartItem) => item.id !== itemId));
  };

  // Limpar carrinho
  const clearCart = () => {
    setCart([]);
  };

  // Processar pedido
  const processOrder = async () => {
    if (cart.length === 0) {
      toast.error("Adicione itens ao carrinho");
      return;
    }

    if (orderType === "delivery" && (!customerInfo.name || !customerInfo.phone || !customerInfo.address)) {
      toast.error("Preencha as informações de entrega");
      return;
    }

    if (orderType === "pickup" && (!customerInfo.name || !customerInfo.phone)) {
      toast.error("Preencha o nome e telefone do cliente");
      return;
    }

    setIsProcessingOrder(true);

    try {
      const orderData = {
        order: {
          shop_id: Number(shopId) || 0,
          withdrawal: orderType === "pickup",
          payment_method: paymentMethod === "cash" ? "cash" as const : paymentMethod === "card" ? "credit" as const : "manual_pix" as const,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone.replace(/\D/g, ''), // Remove formatação do telefone
          address: {
            address: customerInfo.address,
            neighborhood: customerInfo.neighborhood,
            complement: customerInfo.complement,
            reference: customerInfo.reference,
          },
          items: cart.map((item: CartItem) => ({
            catalog_item_id: parseInt(item.id.split('-')[0]),
            quantity: item.quantity,
            observation: notes
          }))
        }
      };

      console.log('🔍 PDV Order Data:', JSON.stringify(orderData, null, 2));
      const result = await createPDVOrder(orderData);
      
      if (result) {
        toast.success("Pedido criado com sucesso!");
        clearCart();
        setCustomerInfo({
          name: "",
          phone: "",
          address: "",
          neighborhood: "",
          city: "",
          zipCode: "",
          complement: "",
          reference: ""
        });
        setNotes("");
        setChangeAmount("");
      }
    } catch (error: any) {
      console.error("Erro ao processar pedido:", error);
      const errorMessage = error.response?.data?.error || "Erro ao processar pedido";
      toast.error(errorMessage);
    } finally {
      setIsProcessingOrder(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">PDV - Ponto de Venda</h1>
        <p className="text-muted-foreground">Gerencie vendas e crie pedidos para seus clientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catálogo de Produtos */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Catálogo de Produtos
              </CardTitle>
              
              {/* Barra de Busca e Filtros */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  )}
                </div>
                
                {/* Filtro de Categorias */}
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
                          {allGroups.reduce((total: number, group: any) => total + (group.attributes.items?.length || 0), 0)}
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
                            {group.attributes.items?.length || 0}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Indicadores de filtros ativos */}
                {(searchTerm || selectedGroupId) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Filtros ativos:</span>
                    {searchTerm && (
                      <Badge variant="outline" className="gap-1">
                        Busca: "{searchTerm}"
                        <button
                          onClick={() => setSearchTerm("")}
                          className="ml-1 hover:text-foreground"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {selectedGroupId && (
                      <Badge variant="outline" className="gap-1">
                        Categoria: {allGroups.find((g: any) => g.id === selectedGroupId)?.attributes?.name}
                        <button
                          onClick={() => setSelectedGroupId(null)}
                          className="ml-1 hover:text-foreground"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
                      {/* Cabeçalho do Grupo */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-semibold text-primary">
                            {group.attributes.name}
                          </h3>
                          <Badge variant="outline">
                            {group.attributes.items.length} {group.attributes.items.length === 1 ? 'produto' : 'produtos'}
                          </Badge>
                        </div>
                        {group.attributes.description && (
                          <p className="text-sm text-muted-foreground max-w-md">
                            {group.attributes.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Grid de Produtos */}
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {group.attributes.items.map((item: any) => (
                          <Card key={item.data.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 group">
                            <div className="aspect-video relative bg-gray-100">
                              {item.data.attributes.image_url ? (
                                <Image
                                  src={item.data.attributes.image_url}
                                  alt={item.data.attributes.name}
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                              
                              {/* Badge de preço promocional se houver */}
                              {item.data.attributes.price_with_discount && (
                                <div className="absolute top-2 right-2">
                                  <Badge variant="destructive">PROMOÇÃO</Badge>
                                </div>
                              )}
                            </div>
                            
                            <div className="p-4 space-y-3">
                              <div>
                                <h4 className="font-semibold text-lg mb-1 line-clamp-2">
                                  {item.data.attributes.name}
                                </h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {item.data.attributes.description}
                                </p>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                  {item.data.attributes.price_with_discount ? (
                                    <>
                                      <span className="text-sm text-muted-foreground line-through">
                                        {formatPrice(parseFloat(item.data.attributes.price))}
                                      </span>
                                      <span className="font-bold text-lg text-green-600">
                                        {formatPrice(parseFloat(item.data.attributes.price_with_discount))}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="font-bold text-lg text-primary">
                                      {formatPrice(parseFloat(item.data.attributes.price))}
                                    </span>
                                  )}
                                </div>
                                
                                <Button
                                  onClick={() => addToCart(item.data)}
                                  className="h-9 px-4"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Adicionar
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Carrinho e Informações do Pedido */}
        <div className="space-y-6">
          {/* Carrinho */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrinho
                </div>
                {cart.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{cart.length}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCart}
                      className="h-8 px-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
                <div className="space-y-2">
                  <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                    {cart.map((item: CartItem) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        {item.image_url && (
                          <div className="w-12 h-12 relative flex-shrink-0">
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              sizes="48px"
                              className="object-cover rounded"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.name}</h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground">
                              {formatPrice(item.price)} x {item.quantity}
                            </span>
                            <span className="font-semibold text-sm text-primary">
                              {formatPrice(item.totalPrice)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-7 w-7 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-6 text-center">
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
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-lg text-primary">
                        {formatPrice(cartTotal)}
                      </span>
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
              <Select value={orderType} onValueChange={(value: "delivery" | "pickup") => setOrderType(value)}>
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

          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {orderType === "delivery" ? "Dados de Entrega" : "Dados do Cliente"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="name" className="text-sm">Nome</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e: any) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome do cliente"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm">Telefone</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={handlePhoneChange}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                </div>
              </div>

              {orderType === "delivery" && (
                <>
                  <div>
                    <Label htmlFor="address" className="text-sm">Endereço</Label>
                    <Input
                      id="address"
                      value={customerInfo.address}
                      onChange={(e: any) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Rua, número"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="neighborhood" className="text-sm">Bairro</Label>
                      <Input
                        id="neighborhood"
                        value={customerInfo.neighborhood}
                        onChange={(e: any) => setCustomerInfo(prev => ({ ...prev, neighborhood: e.target.value }))}
                        placeholder="Bairro"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-sm">Cidade</Label>
                      <Input
                        id="city"
                        value={customerInfo.city}
                        onChange={(e: any) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Cidade"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="zipCode" className="text-sm">CEP</Label>
                      <Input
                        id="zipCode"
                        value={customerInfo.zipCode}
                        onChange={handleCEPChange}
                        placeholder="00000-000"
                        maxLength={9}
                      />
                    </div>
                    <div>
                      <Label htmlFor="complement" className="text-sm">Complemento</Label>
                      <Input
                        id="complement"
                        value={customerInfo.complement}
                        onChange={(e: any) => setCustomerInfo(prev => ({ ...prev, complement: e.target.value }))}
                        placeholder="Apt, bloco"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reference" className="text-sm">Referência</Label>
                    <Input
                      id="reference"
                      value={customerInfo.reference}
                      onChange={(e: any) => setCustomerInfo(prev => ({ ...prev, reference: e.target.value }))}
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
              <div>
                <Label className="text-sm">Método de Pagamento</Label>
                <Select value={paymentMethod} onValueChange={(value: "cash" | "card" | "pix") => setPaymentMethod(value)}>
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

              {paymentMethod === "cash" && (
                <div>
                  <Label htmlFor="change" className="text-sm">Troco para</Label>
                  <Input
                    id="change"
                    type="number"
                    step="0.01"
                    value={changeAmount}
                    onChange={(e: any) => setChangeAmount(e.target.value)}
                    placeholder="0.00"
                  />
                  {changeAmount && cartTotal > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Troco: {formatPrice(parseFloat(changeAmount) - cartTotal)}
                    </p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="notes" className="text-sm">Observações</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e: any) => setNotes(e.target.value)}
                  placeholder="Observações do pedido..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Finalizar Pedido */}
          <Button
            onClick={processOrder}
            disabled={cart.length === 0 || isProcessingOrder}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            {isProcessingOrder ? "Processando..." : `Finalizar Pedido - ${formatPrice(cartTotal)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

