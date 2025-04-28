"use client"

import { MapPin, Clock, CreditCard, Wallet, QrCode, Truck, ChevronDown, ChevronUp, Plus, Minus, X, ArrowLeft, CheckCircle2, Package, Store, Timer } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group'
import { Label } from '@/app/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/app/components/ui/card'
import { Separator } from '@/app/components/ui/separator'
import { Badge } from '@/app/components/ui/badge'
import { useCart } from '../../../hooks/useCart'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useClientAuth'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Skeleton } from '@/app/components/ui/skeleton'
import Image from 'next/image'
import { useDelivery } from '@/app/hooks/use-delivery'

type DeliveryOption = 'delivery' | 'pickup'

interface CartItemWithExtras {
  id: string;
  name: string;
  price: number;
  priceWithDiscount?: number;
  quantity: number;
  image?: string;
  extras?: Array<{
    name: string;
    price: number;
  }>;
}

export default function CheckoutPage() {
  const router = useRouter()
  const params = useParams()
  const storeSlug = params.slug as string
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { items, removeFromCart: removeItem, updateItemQuantity: updateQuantity, clearCart } = useCart()
  const { deliveryConfig, neighborhoods, isLoading: isLoadingDelivery } = useDelivery()
  
  const [paymentMethod, setPaymentMethod] = useState('credit')
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('delivery')
  const [address, setAddress] = useState('')
  const [complement, setComplement] = useState('')
  const [reference, setReference] = useState('')
  const [changeFor, setChangeFor] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cartItems, setCartItems] = useState<CartItemWithExtras[]>([])
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({})
  const [estimatedTime, setEstimatedTime] = useState<number>(45) // Tempo estimado em minutos
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('')
  const [deliveryFee, setDeliveryFee] = useState<number>(0)

  useEffect(() => {
    if (isAuthLoading) return;
    
    if (!isAuthenticated) {
      router.push(`/${storeSlug}`)
      return
    }

    const storeItems = items.filter(item => item.storeSlug === storeSlug)
    const mappedItems = storeItems.map((item: CartItemWithExtras) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      extras: [] 
    }))
    setCartItems(mappedItems)
    setIsLoading(false)

    const expandedState = mappedItems.reduce((acc: Record<string, boolean>, item: CartItemWithExtras) => {
      if (item.extras && item.extras.length > 0) {
        acc[item.id] = false
      }
      return acc
    }, {})
    setIsExpanded(expandedState)

    const mockDeliveryTime = Math.floor(Math.random() * 30) + 30
    setEstimatedTime(mockDeliveryTime)
  }, [isAuthenticated, isAuthLoading, storeSlug, items, router])

  const toggleItemExpansion = (itemId: string) => {
    setIsExpanded(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.priceWithDiscount || item.price
      return sum + (price * item.quantity)
    }, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const deliveryFee = deliveryOption === 'delivery' && selectedNeighborhood 
      ? neighborhoods.find(n => n.id === selectedNeighborhood)?.amount || 0
      : 0
    return subtotal + deliveryFee
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(itemId, newQuantity)
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
    setIsSubmitting(true)
    
    const orderData = {
      items: cartItems,
      deliveryOption,
      address: deliveryOption === 'delivery' ? {
        street: address,
        complement,
        reference,
        neighborhood: selectedNeighborhood
      } : null,
      paymentMethod,
      changeFor: paymentMethod === 'cash' ? changeFor : null,
      total: calculateTotal(),
      subtotal: calculateSubtotal(),
      deliveryFee: deliveryOption === 'delivery' ? neighborhoods.find(n => n.id === selectedNeighborhood)?.amount || 0 : 0,
      estimatedTime: deliveryOption === 'delivery' ? estimatedTime : 20
    }

    console.log('Dados do pedido:', orderData)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      clearCart()
      router.push(`/${storeSlug}/checkout/order-confirmation`)
    } catch (error) {
      console.error('Erro ao enviar pedido:', error)
      setIsSubmitting(false)
    }
  }

  if (isLoading || isAuthLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-6">
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-24 w-24 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/3 space-y-6">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <Truck className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Seu carrinho está vazio</h2>
          <p className="text-gray-500 mb-6">
            Parece que você ainda não adicionou nenhum item ao seu carrinho. 
            Volte ao cardápio para começar seu pedido.
          </p>
          <Button 
            onClick={() => router.push(`/${storeSlug}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao cardápio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Order Details */}
        <div className="lg:w-2/3 space-y-6">
          {/* Delivery Options */}
          <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="py-4 bg-gradient-to-r from-primary/10 to-primary/5">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Truck className="h-5 w-5" />
                <span>Opções de entrega</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <RadioGroup 
                value={deliveryOption} 
                onValueChange={(value: string) => setDeliveryOption(value as DeliveryOption)}
                className="grid grid-cols-2 gap-4"
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
                      {deliveryConfig?.delivery_fee_kind === 'fixed' 
                        ? `Taxa: R$ ${deliveryConfig.amount.toFixed(2).replace('.', ',')}`
                        : deliveryConfig?.delivery_fee_kind === 'per_neighborhood'
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

          {/* Delivery Address */}
          {deliveryOption !== 'pickup' && (
            <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="py-4 bg-gradient-to-r from-primary/10 to-primary/5">
                <CardTitle className="flex items-center gap-2 text-primary">
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
                      {deliveryConfig?.delivery_fee_kind === 'per_neighborhood' ? (
                        <select
                          id="neighborhood"
                          value={selectedNeighborhood}
                          onChange={(e) => setSelectedNeighborhood(e.target.value)}
                          className="w-full rounded-md border border-gray-200 px-3 py-2 focus:border-primary focus:ring-primary/20"
                          disabled={deliveryOption !== 'delivery'}
                        >
                          <option value="">Selecione um bairro</option>
                          {neighborhoods.map((neighborhood) => (
                            <option key={neighborhood.id} value={neighborhood.id}>
                              {neighborhood.name} - R$ {neighborhood.amount.toFixed(2).replace('.', ',')}
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

          <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="py-4 bg-gradient-to-r from-primary/10 to-primary/5">
              <CardTitle className="flex items-center gap-2 text-primary">
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
                <div>
                  <RadioGroupItem value="credit" id="credit" className="peer sr-only" />
                  <Label
                    htmlFor="credit"
                    className="flex items-center gap-3 rounded-md border-2 border-muted bg-white cursor-pointer p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all duration-200"
                  >
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span>Cartão de crédito</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="debit" id="debit" className="peer sr-only" />
                  <Label
                    htmlFor="debit"
                    className="flex items-center gap-3 rounded-md border-2 border-muted bg-white cursor-pointer p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all duration-200"
                  >
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span>Cartão de débito</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="pix" id="pix" className="peer sr-only" />
                  <Label
                    htmlFor="pix"
                    className="flex items-center gap-3 rounded-md border-2 border-muted bg-white cursor-pointer p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all duration-200"
                  >
                    <QrCode className="h-5 w-5 text-primary" />
                    <span>PIX</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                  <Label
                    htmlFor="cash"
                    className="flex items-center gap-3 rounded-md border-2 border-muted bg-white cursor-pointer p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all duration-200"
                  >
                    <Wallet className="h-5 w-5 text-primary" />
                    <span>Dinheiro</span>
                  </Label>
                </div>
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

          {/* Order Items */}
          <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="py-4 bg-gradient-to-r from-primary/10 to-primary/5">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Package className="h-5 w-5" />
                <span>Seu pedido</span>
                <Badge variant="secondary" className="px-2 py-1 ml-2 bg-primary/10 text-primary">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)} itens
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="space-y-4">
                  <div className="flex gap-4">
                    <div className="relative">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="h-24 w-24 rounded-lg object-cover shadow-sm"
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm">
                          <span className="text-primary/50 text-2xl font-bold">
                            {item.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
                        {item.quantity}x
                      </Badge>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.name}</h3>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
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
                          <span className="font-medium">R$ {item.price.toFixed(2).replace('.', ',')}</span>
                        )}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 border-gray-200 hover:border-primary hover:text-primary"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 border-gray-200 hover:border-primary hover:text-primary"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {item.extras && item.extras.length > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1 text-muted-foreground hover:text-primary"
                            onClick={() => toggleItemExpansion(item.id)}
                          >
                            {isExpanded[item.id] ? (
                              <>
                                <ChevronUp className="h-4 w-4" />
                                Ocultar extras
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4" />
                                Ver extras ({item.extras.length})
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {item.extras && item.extras.length > 0 && isExpanded[item.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-28 space-y-3 bg-gray-50 p-4 rounded-lg"
                      >
                        <Separator />
                        <h4 className="text-sm font-medium">Extras adicionados:</h4>
                        <ul className="space-y-2">
                          {item.extras.map((extra, index) => (
                            <li key={index} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">+ {extra.name}</span>
                              <span className="font-medium">R$ {extra.price.toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <Separator className="my-4" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:w-1/3 space-y-6">
          <Card className="sticky top-6 overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="py-4 bg-gradient-to-r from-primary/10 to-primary/5">
              <CardTitle className="text-primary">Resumo do pedido</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">R$ {calculateSubtotal().toFixed(2).replace('.', ',')}</span>
                </div>
                {deliveryOption === 'delivery' && selectedNeighborhood && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa de entrega</span>
                    <span className="font-medium">
                      R$ {neighborhoods.find(n => n.id === selectedNeighborhood)?.amount.toFixed(2).replace('.', ',')}
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
              
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span className="text-primary">R$ {calculateTotal().toFixed(2).replace('.', ',')}</span>
              </div>
              
              {/* <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>
                    {deliveryOption === 'delivery' ? 'Entrega' : 'Retirada'} estimada para{' '}
                    <span className="font-medium">
                      {format(new Date(Date.now() + (deliveryOption === 'delivery' ? estimatedTime : 20) * 60 * 1000), 'HH:mm', { locale: ptBR })}
                    </span>
                  </span>
                </div>
              </div> */}
            </CardContent>
            <CardFooter className="pt-4">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300" 
                size="lg"
                onClick={handleSubmitOrder}
                disabled={isSubmitting || (deliveryOption === 'delivery' && !address.trim())}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                    Finalizando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Finalizar pedido
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="py-4 bg-gradient-to-r from-primary/10 to-primary/5">
              <CardTitle className="text-lg text-primary">Informações adicionais</CardTitle>
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