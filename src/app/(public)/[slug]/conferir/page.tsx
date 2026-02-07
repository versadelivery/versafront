"use client"

import { MapPin, CreditCard, Wallet, QrCode, Truck, ChevronDown, ChevronUp, Plus, Minus, X, CheckCircle2, Package, Store, Timer, User, LogIn, Clock, AlertTriangle, ChevronLeft, ShoppingCart } from 'lucide-react'
import { toast } from "sonner"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCart } from '../cart/cart-context'
import { useParams, useRouter } from 'next/navigation'
import { useClient } from '../client-context'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreateOrderRequest, Order } from '@/types/order'
import { createOrder } from '@/services/order-service'
import { useShopBySlug } from '../use-slug'
import { useShopStatusContext } from '@/contexts/ShopStatusContext'

type DeliveryOption = 'delivery' | 'pickup'

interface CartItemWithExtras {
  id: string;
  name: string;
  price: number;
  priceWithDiscount?: number;
  quantity: number;
  weight?: number;
  image?: string;
  extras?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  prepareMethods?: Array<{
    id: string;
    name: string;
  }>;
  steps?: Array<{
    id: string;
    name: string;
    selectedOption?: {
      id: string;
      name: string;
    };
  }>;
  selectedExtras?: string[];
  selectedMethods?: string[];
  selectedOptions?: Record<string, string>;
  totalPrice: number;
  observation?: string;
}

export default function CheckoutPage() {
  const router = useRouter()
  const params = useParams()
  const storeSlug = params.slug as string
  const { client } = useClient()
  const { isOpen: isShopOpen, loading: shopStatusLoading } = useShopStatusContext()

  // Buscar dados da loja em tempo real usando o slug
  const { data: shopData, isLoading: isLoadingShop } = useShopBySlug(storeSlug, { 
    staleTime: 1000 * 60 * 5 // 5 minutos para sempre ter dados atualizados
  })

  const { 
    items, 
    totalPrice, 
    removeItem, 
    updateItemQuantity,
    clearCart
  } = useCart()
  
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('delivery')
  const [address, setAddress] = useState('')
  const [complement, setComplement] = useState('')
  const [reference, setReference] = useState('')
  const [changeFor, setChangeFor] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cartItems, setCartItems] = useState<CartItemWithExtras[]>([])
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({})
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('')
  const [order, setOrder] = useState<Order | null>(null)
  const [itemObservations, setItemObservations] = useState<Record<string, string>>({})
  const [shouldAutoSubmitAfterLogin, setShouldAutoSubmitAfterLogin] = useState(false)
  
  // Extrair configurações da loja dos dados buscados em tempo real
  const shopDeliveryConfig = shopData?.data?.attributes?.shop_delivery_config?.data?.attributes || null
  const shopPaymentConfig = shopData?.data?.attributes?.shop_payment_config?.data?.attributes || null
  const shop = shopData
  
  useEffect(() => {
    
    const mappedItems = items.map((item: any) => ({
      id: item.id,
      name: item.attributes.name,
      price: item.attributes.price,
      priceWithDiscount: item.attributes.price_with_discount || undefined,
      quantity: item.quantity,
      weight: item.weight,
      image: item.attributes.image_url || '',
      extras: item.selectedExtras?.map((extraId: string) => {
        const extra = item.attributes.extra.data.find((e: any) => e.id === extraId)
        return extra ? {
          id: extra.id,
          name: extra.attributes.name,
          price: parseFloat(extra.attributes.price)
        } : null
      }).filter((extra: any): extra is { id: string; name: string; price: number } => extra !== null) || [],
      prepareMethods: item.selectedMethods?.map((methodId: string) => {
        const method = item.attributes.prepare_method.data.find((m: any) => m.id === methodId)
        return method ? {
          id: method.id,
          name: method.attributes.name
        } : null
      }).filter((method: any): method is { id: string; name: string } => method !== null) || [],
      steps: item.attributes.steps.data.map((step: any) => {
        const selectedOptionId = item.selectedOptions?.[step.id]
        const selectedOption = selectedOptionId ? step.attributes.options.data.find((o: any) => o.id === selectedOptionId) : null
        
        return {
          id: step.id,
          name: step.attributes.name,
          selectedOption: selectedOption ? {
            id: selectedOption.id,
            name: selectedOption.attributes.name
          } : undefined
        }
      }),
      selectedExtras: item.selectedExtras || [],
      selectedMethods: item.selectedMethods || [],
      selectedOptions: item.selectedOptions || {},
      totalPrice: item.totalPrice,
      observation: item.observation
    }))
    setCartItems(mappedItems)
    setIsLoading(false)
    const expandedState = mappedItems.reduce((acc: Record<string, boolean>, item) => {
      if ((item.extras && item.extras.length > 0) || 
          (item.prepareMethods && item.prepareMethods.length > 0) || 
          (item.steps && item.steps.length > 0)) {
        acc[item.id] = false
      }
      return acc
    }, {})
    setIsExpanded(expandedState)
  }, [items])

  // UseEffect para auto-submit após login
  useEffect(() => {
    if (client && shouldAutoSubmitAfterLogin) {
      setShouldAutoSubmitAfterLogin(false)
      // Pequeno delay para garantir que o estado foi atualizado
      setTimeout(() => {
        handleSubmitOrder()
      }, 100)
    }
  }, [client, shouldAutoSubmitAfterLogin])

  // Removido o useEffect que redirecionava usuários não autenticados

  const toggleItemExpansion = (itemId: string) => {
    setIsExpanded(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const calculateDeliveryFee = () => {
    if (deliveryOption !== 'delivery' || !selectedNeighborhood) {
      return 0
    }
    
    if (shopDeliveryConfig?.delivery_fee_kind === 'fixed') {
      const minFree = Number(shopDeliveryConfig.min_value_free_delivery) || 0
      if (minFree > 0 && totalPrice >= minFree) {
        return 0
      }
      return shopDeliveryConfig.amount
    }
    
    if (shopDeliveryConfig?.delivery_fee_kind === 'per_neighborhood') {
      const selectedNeighborhoodData = shopDeliveryConfig.shop_delivery_neighborhoods.data.find(
        n => n.id === selectedNeighborhood
      )
      if (!selectedNeighborhoodData) return 0

      const minFree = Number(selectedNeighborhoodData.attributes.min_value_free_delivery) || 0
      if (minFree > 0 && totalPrice >= minFree) {
        return 0
      }
      return selectedNeighborhoodData.attributes.amount || 0
    }
    
    return 0
  }

  const calculateTotal = () => {
    return totalPrice + calculateDeliveryFee()
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateItemQuantity(itemId, newQuantity)
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    )
  }

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId)
    setCartItems(prev => prev.filter(item => item.id !== itemId))
  }

  const handleSubmitOrder = async () => {
    // Verificar se a loja está aberta
    if (!isShopOpen || shopStatusLoading) {
      console.log('Tentativa de finalizar pedido com loja fechada')
      return
    }

    // Verificar valor mínimo do pedido
    const minOrderValue = Number(shopDeliveryConfig?.minimum_order_value) || 0
    if (totalPrice < minOrderValue) {
      toast.error(`O valor mínimo para pedidos nesta loja é R$ ${minOrderValue.toFixed(2).replace('.', ',')}`)
      return
    }

    // Verificar autenticação apenas no momento de finalizar a compra
    if (!client) {
      // Definir flag para auto-submit após login
      setShouldAutoSubmitAfterLogin(true)
      // Redirecionar para login, preservando a intenção de finalizar compra
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return
    }

    setIsSubmitting(true)
    
    // Determinar o nome do bairro e o ID quando necessário
    let neighborhoodName = selectedNeighborhood
    let neighborhoodId = null
    
    if (shopDeliveryConfig?.delivery_fee_kind === 'per_neighborhood' && selectedNeighborhood) {
      const selectedNeighborhoodData = shopDeliveryConfig.shop_delivery_neighborhoods.data.find(
        n => n.id === selectedNeighborhood
      )
      if (selectedNeighborhoodData) {
        neighborhoodName = selectedNeighborhoodData.attributes.name
        neighborhoodId = selectedNeighborhoodData.id
      }
    }
    
    const orderData: CreateOrderRequest = {
        "order": {
            "shop_id": Number(shop?.data.id),
            "withdrawal": deliveryOption === 'pickup' ? true : false,
            "payment_method": paymentMethod as 'manual_pix' | 'credit' | 'debit' | 'cash',
            "address": {
                "address": address,
                "neighborhood": neighborhoodName,
                "complement": complement,
                "reference": reference,
                ...(neighborhoodId && { shop_delivery_neighborhood_id: Number(neighborhoodId) })
            },
            "items": cartItems.map(item => ({
              catalog_item_id: Number(item.id),
              quantity: item.quantity,
              observation: item.observation || ''
            }))
        }
    }

    try {
      const response = await createOrder(orderData)
      const orderId = response.order_id
      setOrder(response)
      toast.success("Pedido realizado com sucesso!")
      if (orderId) {
        router.push(`/pedidos/${orderId}`)
      } else {
        console.error('ID do pedido não encontrado')
      }
      clearCart()
    } catch (error) {
      console.error('Erro ao enviar pedido:', error)
      toast.error("Erro ao enviar pedido. Tente novamente.")
      setIsSubmitting(false)
    }
  }

  if (isLoadingShop || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando informações do pedido...</p>
        </div>
      </div>
    )
  }

  if (cartItems?.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Seu carrinho está vazio</h3>
          <p className="text-slate-600 mb-6">Adicione itens ao carrinho para continuar</p>
          <Button 
            onClick={() => router.push(`/${storeSlug}`)}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Continuar Comprando
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 lg:p-12 bg-gray-200 min-h-screen">
      {/* Cabeçalho com botão voltar */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push(`/${storeSlug}`)}
            className="flex items-center gap-2 hover:bg-white/50 -ml-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar ao Catálogo
          </Button>
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">Conferir Pedido</h1>
        <p className="text-gray-600 mt-1 text-sm md:text-base">Revise seu pedido e finalize a compra</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-6">
          {/* Alerta de Loja Fechada */}
          {!isShopOpen && !shopStatusLoading && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Loja fechada no momento.</strong> Você pode revisar seu carrinho, mas não pode finalizar a compra enquanto a loja estiver fechada.
              </AlertDescription>
            </Alert>
          )}

          {/* Card de Status de Autenticação */}
          {!client && (
            <Card className="rounded-xs overflow-hidden border hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className={`py-4 ${client ? 'bg-green-500' : 'bg-yellow-500'}`}>
                <CardTitle className="flex items-center gap-2 text-white">
                  {client ? <CheckCircle2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  <span>{client ? 'Usuário Autenticado' : 'Login Necessário'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Você pode navegar e adicionar itens ao carrinho sem fazer login, mas será necessário se autenticar para finalizar a compra.
                    </p>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => {
                          setShouldAutoSubmitAfterLogin(true)
                          const currentPath = window.location.pathname;
                          router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
                        }}
                      >
                        <LogIn className="h-4 w-4" />
                        Fazer Login
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="flex items-center gap-2"
                        onClick={() => {
                          const currentPath = window.location.pathname;
                          router.push(`/auth/register?redirect=${encodeURIComponent(currentPath)}`);
                        }}
                      >
                        <User className="h-4 w-4" />
                        Criar Conta
                      </Button>
                    </div>
                  </div>
                
              </CardContent>
            </Card>
          )}
          <Card className="rounded-xs overflow-hidden border hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="py-4 bg-primary">
              <CardTitle className="flex items-center gap-2 text-white">
                <Truck className="h-5 w-5" />
                <span>Opções de entrega</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <RadioGroup 
                value={deliveryOption} 
                onValueChange={(value: string) => setDeliveryOption(value as DeliveryOption)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="delivery" id="delivery" className="peer sr-only" />
                  <Label
                    htmlFor="delivery"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white cursor-pointer p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all duration-200"
                  >
                    <Truck className="h-6 w-6 mb-2 text-primary" />
                    <span>Entrega</span>
                    <span className="text-sm text-muted-foreground">
                      {shopDeliveryConfig?.delivery_fee_kind === 'fixed' 
                        ? `Taxa: R$ ${shopDeliveryConfig.amount.toFixed(2).replace('.', ',')}`
                        : shopDeliveryConfig?.delivery_fee_kind === 'per_neighborhood'
                          ? 'Taxa por bairro'
                          : 'Taxa a combinar'
                      }
                    </span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="pickup" id="pickup" className="peer sr-only" />
                  <Label
                    htmlFor="pickup"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white cursor-pointer p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all duration-200"
                  >
                    <Store className="h-6 w-6 mb-2 text-primary" />
                    <span>Retirada</span>
                    <span className="text-sm text-muted-foreground">Sem taxa</span>
                  </Label>
                </div>
              </RadioGroup>

            </CardContent>
          </Card>

          {deliveryOption !== 'pickup' && (
            <Card className="rounded-xs overflow-hidden border hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="py-4 bg-primary">
                <CardTitle className="flex items-center gap-2 text-white">
                  <MapPin className="h-5 w-5" />
                  <span>Endereço de entrega</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address" className="mb-2 block font-medium">
                      Endereço completo
                    </Label>
                    <Input
                      id="address"
                      placeholder="Rua, número, bairro"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="border-gray-200 focus:border-primary focus:ring-primary/20"
                    />
                  </div>

                    <div>
                      <Label htmlFor="neighborhood" className="mb-2 block font-medium">
                        Bairro
                      </Label>
                      {shopDeliveryConfig?.delivery_fee_kind === 'per_neighborhood' ? (
                        <select
                          id="neighborhood"
                          value={selectedNeighborhood}
                          onChange={(e) => setSelectedNeighborhood(e.target.value)}
                          className="w-full rounded-md border border-gray-200 px-3 py-2 focus:border-primary focus:ring-primary/20"
                          disabled={deliveryOption !== 'delivery'}
                        >
                          <option value="">Selecione um bairro</option>
                          {shopDeliveryConfig?.shop_delivery_neighborhoods.data.map((neighborhood) => (
                            <option key={neighborhood.id} value={neighborhood.id}>
                              {neighborhood.attributes.name} - R$ {neighborhood.attributes.amount.toFixed(2).replace('.', ',')}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          id="neighborhood"
                          placeholder="Digite o bairro"
                          value={selectedNeighborhood}
                          onChange={(e) => setSelectedNeighborhood(e.target.value)}
                          className="w-full rounded-md border border-gray-200 px-3 py-2 focus:border-primary focus:ring-primary/20"
                          disabled={deliveryOption !== 'delivery'}
                        />
                      )}
                    </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="complement" className="mb-2 block font-medium">
                        Complemento
                      </Label>
                      <Input
                        id="complement"
                        placeholder="Apartamento, bloco, etc."
                        value={complement}
                        onChange={(e) => setComplement(e.target.value)}
                        className="border-gray-200 focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reference" className="mb-2 block font-medium">
                        Ponto de referência
                      </Label>
                      <Input
                        id="reference"
                        placeholder="Ex: Próximo ao mercado"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        className="border-gray-200 focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-xs overflow-hidden border hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="py-4 bg-primary">
              <CardTitle className="flex items-center gap-2 text-white">
                <CreditCard className="h-5 w-5" />
                <span>Forma de pagamento</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={setPaymentMethod}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {shopPaymentConfig?.credit && <div>
                  <RadioGroupItem value="credit" id="credit" className="peer sr-only" />
                  <Label
                    htmlFor="credit"
                    className="flex items-center gap-3 rounded-md border-2 border-muted bg-white cursor-pointer p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all duration-200"
                  >
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span>Cartão de crédito</span>
                  </Label>
                </div>}
                {shopPaymentConfig?.debit && <div>
                  <RadioGroupItem value="debit" id="debit" className="peer sr-only" />
                  <Label
                    htmlFor="debit"
                    className="flex items-center gap-3 rounded-md border-2 border-muted bg-white cursor-pointer p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all duration-200"
                  >
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span>Cartão de débito</span>
                  </Label>
                </div>}
                {shopPaymentConfig?.manual_pix &&
                <div>
                  <RadioGroupItem value="manual_pix" id="pix" className="peer sr-only" />
                  <Label
                    htmlFor="pix"
                    className="flex items-center gap-3 rounded-md border-2 border-muted bg-white cursor-pointer p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all duration-200"
                  >
                    <QrCode className="h-5 w-5 text-primary" />
                    <span>PIX</span>
                  </Label>
                </div>
                }
                {shopPaymentConfig?.cash && <div>
                  <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                  <Label
                    htmlFor="cash"
                    className="flex items-center gap-3 rounded-md border-2 border-muted bg-white cursor-pointer p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all duration-200"
                  >
                    <Wallet className="h-5 w-5 text-primary" />
                    <span>Dinheiro</span>
                  </Label>
                </div>}
              </RadioGroup>

              {paymentMethod === 'cash' && (
                <div className="mt-4">
                  <Label htmlFor="changeFor" className="mb-2 block font-medium">
                    Troco para
                  </Label>
                  <Input
                    id="changeFor"
                    placeholder="Ex: R$ 50,00"
                    value={changeFor}
                    onChange={(e) => setChangeFor(e.target.value)}
                    className="border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xs overflow-hidden border hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="py-4 bg-primary">
              <CardTitle className="flex items-center gap-2 text-white">
                <Package className="h-5 w-5" />
                <span>Seu pedido</span>
                <Badge variant="secondary" className="px-2 py-1 ml-2 bg-primary/10 text-primary">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)} itens
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {cartItems.map((item, index) => {
                const hasDetails = (item.extras?.length ?? 0) > 0 || 
                                  (item.prepareMethods?.length ?? 0) > 0 || 
                                  (item.steps?.length ?? 0) > 0;

                return (
                  <div key={item.id} className={`p-4 md:p-6 ${index !== cartItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div className="flex gap-4">
                      <div className="relative flex-shrink-0">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="h-20 w-20 md:h-24 md:w-24 rounded-lg object-cover shadow-sm bg-white"
                          />
                        ) : (
                          <div className="h-20 w-20 md:h-24 md:w-24 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-sm border border-primary/10">
                            <span className="text-primary/40 text-xl font-bold">
                              {item.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground h-6 min-w-[1.5rem] flex items-center justify-center border-2 border-white text-[10px] font-bold">
                          {item.quantity}x
                        </Badge>
                      </div>
                      
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight truncate">{item.name}</h3>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-1 transition-colors flex-shrink-0"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {item.priceWithDiscount ? (
                            <>
                              <span className="text-primary font-medium">R$ {item.priceWithDiscount.toFixed(2).replace('.', ',')}</span>
                              <span className="line-through text-xs ml-2">R$ {item.price.toFixed(2).replace('.', ',')}</span>
                            </>
                          ) : (
                            <span className="font-medium">R$ {item.totalPrice.toFixed(2).replace('.', ',')}</span>
                          )}
                        </p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 bg-white shadow-sm hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="min-w-[1.2rem] text-center font-bold text-xs">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 bg-white shadow-sm hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {hasDetails && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-[10px] md:text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-colors flex items-center gap-1"
                              onClick={() => toggleItemExpansion(item.id)}
                            >
                              {isExpanded[item.id] ? (
                                <><ChevronUp className="h-3.5 w-3.5" /> Menos</>
                              ) : (
                                <><ChevronDown className="h-3.5 w-3.5" /> Detalhes</>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 md:ml-[112px]">
                      <div className="relative group">
                        <Input
                          placeholder="Adicionar observação (ex: sem cebola)"
                          value={itemObservations[item.id] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setItemObservations(prev => ({ ...prev, [item.id]: val }));
                            setCartItems(prev => prev.map(cartItem => 
                              cartItem.id === item.id ? { ...cartItem, observation: val } : cartItem
                            ));
                          }}
                          className="w-full text-[11px] md:text-xs h-9 bg-gray-50/50 border-gray-100 hover:border-gray-200 focus:border-primary/30 focus:bg-white transition-all rounded-lg pl-3"
                        />
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {isExpanded[item.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="md:ml-[112px] mt-4 overflow-hidden"
                        >
                          <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100/50 space-y-4">
                            {item.weight && (
                              <div>
                                <h4 className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">Peso Selecionado</h4>
                                <p className="text-sm text-gray-700 font-bold">{item.weight}kg</p>
                              </div>
                            )}

                            {item.extras && item.extras.length > 0 && (
                              <div>
                                <h4 className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">Extras Adicionados</h4>
                                <ul className="space-y-2">
                                  {item.extras.map((extra) => (
                                    <li key={extra.id} className="flex justify-between items-center text-xs text-gray-600">
                                      <div className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-primary" />
                                        <span className="font-medium">{extra.name}</span>
                                      </div>
                                      <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded-full border border-gray-100 shadow-sm">
                                        + R$ {extra.price.toFixed(2).replace('.', ',')}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {item.prepareMethods && item.prepareMethods.length > 0 && (
                              <div>
                                <h4 className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">Modo de Preparo</h4>
                                <div className="flex flex-wrap gap-2">
                                  {item.prepareMethods.map((method) => (
                                    <Badge key={method.id} variant="secondary" className="bg-white text-gray-600 border-gray-100 font-bold text-[10px]">
                                      {method.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {item.steps && item.steps.length > 0 && (
                              <div>
                                <h4 className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">Opções</h4>
                                <div className="space-y-2">
                                  {item.steps.map((step) => (
                                    <div key={step.id} className="flex flex-col gap-1">
                                      <span className="text-[10px] font-bold text-gray-500">{step.name}</span>
                                      <span className="text-xs font-black text-gray-900 ml-1">{step.selectedOption?.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="lg:w-1/3 space-y-6">
          <Card className="rounded-xs lg:sticky lg:top-6 overflow-hidden border hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="py-4 bg-primary">
              <CardTitle className="text-white">Resumo do pedido</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">R$ {totalPrice.toFixed(2).replace('.', ',') || 0}</span>
                </div>
                {deliveryOption === 'delivery' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa de entrega</span>
                    <span className="font-medium">
                      {calculateDeliveryFee() === 0 
                        ? (shopDeliveryConfig?.delivery_fee_kind === 'to_be_agreed' ? 'Taxa a combinar' : <span className="text-green-500">Grátis</span>)
                        : `R$ ${calculateDeliveryFee().toFixed(2).replace('.', ',')}`
                      }
                    </span>
                  </div>
                )}
                {cartItems.some(item => item.priceWithDiscount) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Descontos</span>
                    <span className="text-green-500 font-medium">
                      - R$ {cartItems.reduce((sum, item) => {
                        if (item.priceWithDiscount) {
                          return sum + ((item.price - item.priceWithDiscount) * item.quantity);
                        }
                        return sum;
                      }, 0).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}
              </div>
              
              <Separator className="my-4" />
              
              {shopDeliveryConfig && (Number(shopDeliveryConfig.minimum_order_value) || 0) > 0 && totalPrice < (Number(shopDeliveryConfig.minimum_order_value) || 0) && (
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700 py-3 rounded-xs mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-medium">
                    O valor mínimo do pedido é R$ {(Number(shopDeliveryConfig.minimum_order_value) || 0).toFixed(2).replace('.', ',')}. 
                    Faltam R$ {((Number(shopDeliveryConfig.minimum_order_value) || 0) - totalPrice).toFixed(2).replace('.', ',')} em produtos.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span className="text-primary">R$ {calculateTotal().toFixed(2).replace('.', ',')}</span>
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300 rounded-xs" 
                size="lg"
                onClick={handleSubmitOrder}
                disabled={isSubmitting || (deliveryOption === 'delivery' && !address.trim()) || !isShopOpen || shopStatusLoading}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                    Finalizando...
                  </span>
                ) : !isShopOpen && !shopStatusLoading ? (
                  <span className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Loja Fechada
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {client ? (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        Finalizar pedido
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5" />
                        Fazer login e finalizar
                      </>
                    )}
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="rounded-xs overflow-hidden border hover:shadow-lg transition-shadow duration-300 bg-white">
            <CardHeader className="py-4 bg-primary">
              <CardTitle className="text-lg text-white">Informações adicionais</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 text-sm text-muted-foreground space-y-2">
              <p>
                Ao finalizar o pedido, você concorda com nossos Termos de Serviço e Política de Privacidade.
              </p>
              <p>
                Em caso de dúvidas, entre em contato com o estabelecimento.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}