"use client"

import {
  CreditCard, Wallet, QrCode, Truck, ChevronDown, ChevronUp,
  Plus, Minus, X, CheckCircle2, Store, Clock, AlertTriangle,
  ChevronLeft, ShoppingCart, Package, User, Phone
} from 'lucide-react'
import { toast } from "sonner"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
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
import Image from 'next/image'
import favicon from "@/public/logo/favicon.svg"
import logoInlineBlack from "@/public/logo/logo-inline-black.svg"
import Link from 'next/link'

type DeliveryOption = 'delivery' | 'pickup'
type PaymentMethod = 'credit' | 'debit' | 'manual_pix' | 'cash'

interface CartItemWithExtras {
  id: string
  name: string
  price: number
  priceWithDiscount?: number
  quantity: number
  weight?: number
  image?: string
  extras?: Array<{ id: string; name: string; price: number }>
  prepareMethods?: Array<{ id: string; name: string }>
  steps?: Array<{ id: string; name: string; selectedOption?: { id: string; name: string } }>
  complements?: Array<{ id: string; name: string; price: number }>
  selectedExtras?: string[]
  selectedMethods?: string[]
  selectedOptions?: Record<string, string>
  selectedSharedComplements?: string[]
  totalPrice: number
  observation?: string
}

const PAYMENT_LABELS: Record<PaymentMethod, { label: string; icon: React.ReactNode }> = {
  credit: { label: 'Crédito', icon: <CreditCard className="h-4 w-4" /> },
  debit: { label: 'Débito', icon: <CreditCard className="h-4 w-4" /> },
  manual_pix: { label: 'PIX', icon: <QrCode className="h-4 w-4" /> },
  cash: { label: 'Dinheiro', icon: <Wallet className="h-4 w-4" /> },
}

export default function CheckoutPage() {
  const router = useRouter()
  const params = useParams()
  const storeSlug = params.slug as string
  const { client } = useClient()
  const { isOpen: isShopOpen, loading: shopStatusLoading } = useShopStatusContext()

  const { data: shopData, isLoading: isLoadingShop } = useShopBySlug(storeSlug, {
    staleTime: 1000 * 60 * 5
  })

  const { items, totalPrice, removeItem, updateItemQuantity, clearCart } = useCart()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit')
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
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let numericValue = event.target.value.replace(/\D/g, '');

    numericValue = numericValue.slice(0, 11);

    let formattedValue = numericValue;

    if (numericValue.length <= 10) {
      formattedValue = numericValue.replace(/(\d{2})(\d{0,4})(\d{0,4})/, (_, d1, d2, d3) => {
        return d2 ? `(${d1}) ${d2}${d3 ? `-${d3}` : ''}` : `(${d1}`;
      });
    } else {
      formattedValue = numericValue.replace(/(\d{2})(\d{5})(\d{0,4})/, (_, d1, d2, d3) => {
        return `(${d1}) ${d2}${d3 ? `-${d3}` : ''}`;
      });
    }

    setGuestPhone(formattedValue);
  };

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
        return extra ? { id: extra.id, name: extra.attributes.name, price: parseFloat(extra.attributes.price) } : null
      }).filter(Boolean) || [],
      prepareMethods: item.selectedMethods?.map((methodId: string) => {
        const method = item.attributes.prepare_method.data.find((m: any) => m.id === methodId)
        return method ? { id: method.id, name: method.attributes.name } : null
      }).filter(Boolean) || [],
      steps: item.attributes.steps.data.map((step: any) => {
        const selectedOptionId = item.selectedOptions?.[step.id]
        const selectedOption = selectedOptionId ? step.attributes.options.data.find((o: any) => o.id === selectedOptionId) : null
        return {
          id: step.id,
          name: step.attributes.name,
          selectedOption: selectedOption ? { id: selectedOption.id, name: selectedOption.attributes.name } : undefined
        }
      }),
      complements: item.selectedSharedComplements?.map((optionId: string) => {
        let found: any = null
        item.attributes.shared_complements?.data.forEach((group: any) => {
          const opt = group.attributes.options.find((o: any) => o.id.toString() === optionId.toString())
          if (opt) found = opt
        })
        return found ? { id: found.id, name: found.name, price: Number(found.price) } : null
      }).filter(Boolean) || [],
      selectedExtras: item.selectedExtras || [],
      selectedMethods: item.selectedMethods || [],
      selectedOptions: item.selectedOptions || {},
      selectedSharedComplements: item.selectedSharedComplements || [],
      totalPrice: item.totalPrice,
      observation: item.observation
    }))
    setCartItems(mappedItems)
    setIsLoading(false)
  }, [items])



  const calculateDeliveryFee = () => {
    if (deliveryOption !== 'delivery' || !selectedNeighborhood) return 0
    if (shopDeliveryConfig?.delivery_fee_kind === 'fixed') {
      const minFree = Number(shopDeliveryConfig.min_value_free_delivery) || 0
      if (minFree > 0 && totalPrice >= minFree) return 0
      return shopDeliveryConfig.amount
    }
    if (shopDeliveryConfig?.delivery_fee_kind === 'per_neighborhood') {
      const nb = shopDeliveryConfig.shop_delivery_neighborhoods.data.find((n: any) => n.id === selectedNeighborhood)
      if (!nb) return 0
      const minFree = Number(nb.attributes.min_value_free_delivery) || 0
      if (minFree > 0 && totalPrice >= minFree) return 0
      return nb.attributes.amount || 0
    }
    return 0
  }

  const calculateTotal = () => totalPrice + calculateDeliveryFee()

  const handleSubmitOrder = async () => {
    if (!isShopOpen || shopStatusLoading) return

    const minOrderValue = Number(shopDeliveryConfig?.minimum_order_value) || 0
    if (totalPrice < minOrderValue) {
      toast.error(`Valor mínimo: R$ ${minOrderValue.toFixed(2).replace('.', ',')}`)
      return
    }

    if (!client && (!guestName.trim() || !guestPhone.trim())) {
      toast.error('Preencha seu nome e telefone para continuar')
      return
    }

    setIsSubmitting(true)

    let neighborhoodName = selectedNeighborhood
    let neighborhoodId = null

    if (shopDeliveryConfig?.delivery_fee_kind === 'per_neighborhood' && selectedNeighborhood) {
      const nb = shopDeliveryConfig.shop_delivery_neighborhoods.data.find((n: any) => n.id === selectedNeighborhood)
      if (nb) {
        neighborhoodName = nb.attributes.name
        neighborhoodId = nb.id
      }
    }

    const isGuest = !client

    const orderData: CreateOrderRequest = {
      order: {
        shop_id: Number(shop?.data.id),
        withdrawal: deliveryOption === 'pickup',
        payment_method: paymentMethod as any,
        ...(isGuest && { customer_name: guestName.trim(), customer_phone: guestPhone.replace(/\D/g, '') }),
        address: {
          address,
          neighborhood: neighborhoodName,
          complement,
          reference,
          ...(neighborhoodId && { shop_delivery_neighborhood_id: Number(neighborhoodId) })
        },
        items: cartItems.map(item => ({
          catalog_item_id: Number(item.id),
          quantity: item.quantity,
          observation: item.observation || '',
          extras_ids: item.selectedExtras || [],
          prepare_methods_ids: item.selectedMethods || [],
          steps: Object.entries(item.selectedOptions || {}).map(([stepId, optionId]) => ({
            catalog_item_step_id: stepId,
            catalog_item_step_option_id: optionId
          })),
          selected_shared_complements_ids: item.selectedSharedComplements || []
        }))
      }
    }

    try {
      const response = await createOrder(orderData, isGuest ? 'normal' : 'client')
      const orderId = response.order_id
      setOrder(response)
      toast.success("Pedido realizado com sucesso!")
      clearCart()
      if (isGuest && guestPhone) {
        localStorage.setItem('guest_phone', guestPhone.replace(/\D/g, ''))
      }
      if (orderId) router.push(`/pedidos/${orderId}`)
    } catch (error) {
      console.error('Erro ao enviar pedido:', error)
      toast.error("Erro ao enviar pedido. Tente novamente.")
      setIsSubmitting(false)
    }
  }

  const deliveryFeeDisplay = () => {
    if (deliveryOption !== 'delivery') return null
    const fee = calculateDeliveryFee()
    if (shopDeliveryConfig?.delivery_fee_kind === 'to_be_agreed') return 'A combinar'
    if (fee === 0 && selectedNeighborhood) return 'Grátis'
    if (fee > 0) return `R$ ${fee.toFixed(2).replace('.', ',')}`
    return null
  }

  const minOrderValue = Number(shopDeliveryConfig?.minimum_order_value) || 0
  const isBelowMinOrder = minOrderValue > 0 && totalPrice < minOrderValue

  if (isLoadingShop || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Carregando pedido...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <ShoppingCart className="h-7 w-7 text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Carrinho vazio</h3>
            <p className="text-sm text-muted-foreground mt-1">Adicione itens para continuar</p>
          </div>
          <Button onClick={() => router.push(`/${storeSlug}`)} variant="outline" size="sm" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Voltar ao cardápio
          </Button>
        </div>
      </div>
    )
  }

  const canSubmit = !isSubmitting && isShopOpen && !shopStatusLoading && !isBelowMinOrder &&
    (deliveryOption === 'pickup' || !!address.trim()) &&
    (!!client || (!!guestName.trim() && !!guestPhone.trim()))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/${storeSlug}`)}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors text-gray-600 cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <Link href={`/${storeSlug}`} className="md:hidden">
                <Image src={favicon} alt="Versa" width={100} height={100} priority />
              </Link>
              <Link href={`/${storeSlug}`} className="hidden md:block">
                <Image src={logoInlineBlack} alt="Versa" width={190} height={60} priority />
              </Link>
            </div>
            <span className="text-sm font-medium text-muted-foreground">Finalizar pedido</span>
            <div className="w-8" />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left column ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Loja fechada */}
            {!isShopOpen && !shopStatusLoading && (
              <Alert className="border-red-200 bg-red-50 rounded-xl">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700 text-sm">
                  Loja fechada no momento. Você não pode finalizar a compra agora.
                </AlertDescription>
              </Alert>
            )}

            {/* Identificação do guest */}
            {!client && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-gray-900">Identificação</h2>
                  <span className="ml-auto text-xs text-muted-foreground">
                    Ou{' '}
                    <button
                      onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`)}
                      className="font-semibold text-primary underline underline-offset-2 cursor-pointer"
                    >
                      faça login
                    </button>
                  </span>
                </div>
                <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="guestName" className="text-xs font-medium text-gray-700 mb-1.5 block">Nome</Label>
                    <Input
                      id="guestName"
                      placeholder="Seu nome"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="border-gray-200 focus:border-primary/40 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="guestPhone" className="text-xs font-medium text-gray-700 mb-1.5 block">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="guestPhone"
                        placeholder="(00) 00000-0000"
                        value={guestPhone}
                        onChange={handlePhoneChange}
                        className="pl-8 border-gray-200 focus:border-primary/40 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Itens ── */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-gray-900">Itens do pedido</h2>
                </div>
                <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                  {cartItems.reduce((s, i) => s + i.quantity, 0)} {cartItems.reduce((s, i) => s + i.quantity, 0) === 1 ? 'item' : 'itens'}
                </span>
              </div>

              <div className="divide-y divide-gray-50">
                {cartItems.map((item) => {
                  const hasDetails = (item.extras?.length ?? 0) > 0 ||
                    (item.prepareMethods?.length ?? 0) > 0 ||
                    (item.steps?.length ?? 0) > 0

                  return (
                    <div key={item.id} className="px-5 py-4">
                      <div className="flex gap-3">
                        {/* Imagem */}
                        <div className="flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-16 w-16 rounded-lg object-cover bg-gray-100"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-lg border border-primary/10 flex items-center justify-center">
                              <span className="text-primary/40 text-lg font-bold">
                                {item.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-semibold text-gray-900 leading-tight">{item.name}</h3>
                            <button
                              onClick={() => {
                                removeItem(item.id)
                                setCartItems(prev => prev.filter(i => i.id !== item.id))
                              }}
                              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <p className="text-sm font-medium text-primary mt-0.5">
                            {item.priceWithDiscount ? (
                              <>
                                R$ {(item.priceWithDiscount * item.quantity).toFixed(2).replace('.', ',')}
                                <span className="text-xs text-muted-foreground line-through ml-2">
                                  R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                                </span>
                              </>
                            ) : (
                              <>R$ {item.totalPrice.toFixed(2).replace('.', ',')}</>
                            )}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            {/* Contador */}
                            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg">
                              <button
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    updateItemQuantity(item.id, item.quantity - 1)
                                    setCartItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i))
                                  }
                                }}
                                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-primary transition-colors cursor-pointer"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-xs font-bold text-gray-900 min-w-[1.25rem] text-center">{item.quantity}</span>
                              <button
                                onClick={() => {
                                  updateItemQuantity(item.id, item.quantity + 1)
                                  setCartItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
                                }}
                                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-primary transition-colors cursor-pointer"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            {hasDetails && (
                              <button
                                onClick={() => setIsExpanded(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                              >
                                {isExpanded[item.id] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                {isExpanded[item.id] ? 'Menos' : 'Detalhes'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Observação */}
                      <div className="mt-3">
                        <Input
                          placeholder="Observação (ex: sem cebola)"
                          value={itemObservations[item.id] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setItemObservations(prev => ({ ...prev, [item.id]: val }));
                            setCartItems(prev => prev.map(ci => ci.id === item.id ? { ...ci, observation: val } : ci));
                          }}
                          className="h-8 text-xs bg-gray-50 border-gray-200 focus:border-primary/40 rounded-lg"
                        />
                      </div>

                      {/* Detalhes expandidos */}
                      <AnimatePresence>
                        {isExpanded[item.id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.18, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 bg-gray-50 rounded-lg p-3 space-y-2.5">
                              {item.weight && (
                                <div>
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Peso</span>
                                  <p className="text-xs font-semibold text-gray-700 mt-0.5">{item.weight}kg</p>
                                </div>
                              )}
                              {(item.extras?.length ?? 0) > 0 && (
                                <div>
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Extras</span>
                                  <ul className="mt-1 space-y-1">
                                    {item.extras!.map(extra => (
                                      <li key={extra.id} className="flex justify-between text-xs text-gray-600">
                                        <span>{extra.name}</span>
                                        <span className="font-semibold">+ R$ {extra.price.toFixed(2).replace('.', ',')}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {(item.prepareMethods?.length ?? 0) > 0 && (
                                <div>
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Preparo</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.prepareMethods!.map(m => (
                                      <span key={m.id} className="text-[10px] bg-white border border-gray-200 rounded px-2 py-0.5 text-gray-600">{m.name}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {(item.steps?.length ?? 0) > 0 && (
                                <div>
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Opções</span>
                                  <div className="mt-1 space-y-1">
                                    {item.steps!.map(step => (
                                      <div key={step.id} className="flex justify-between text-xs text-gray-600">
                                        <span>{step.name}</span>
                                        <span className="font-semibold">{step.selectedOption?.name}</span>
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
                  )
                })}
              </div>
            </div>

            {/* ── Entrega ── */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-gray-900">Entrega</h2>
              </div>

              <div className="px-5 py-4 space-y-4">
                {/* Toggle delivery/pickup */}
                <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                  <button
                    onClick={() => setDeliveryOption('delivery')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all cursor-pointer ${
                      deliveryOption === 'delivery'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-muted-foreground hover:text-gray-700'
                    }`}
                  >
                    <Truck className="h-4 w-4" />
                    Entrega
                  </button>
                  <button
                    onClick={() => setDeliveryOption('pickup')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all cursor-pointer ${
                      deliveryOption === 'pickup'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-muted-foreground hover:text-gray-700'
                    }`}
                  >
                    <Store className="h-4 w-4" />
                    Retirada
                  </button>
                </div>

                {deliveryOption === 'delivery' && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="address" className="text-xs font-medium text-gray-700 mb-1.5 block">Endereço</Label>
                      <Input
                        id="address"
                        placeholder="Rua, número"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="border-gray-200 focus:border-primary/40 text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="neighborhood" className="text-xs font-medium text-gray-700 mb-1.5 block">Bairro</Label>
                      {shopDeliveryConfig?.delivery_fee_kind === 'per_neighborhood' ? (
                        <select
                          id="neighborhood"
                          value={selectedNeighborhood}
                          onChange={(e) => setSelectedNeighborhood(e.target.value)}
                          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                        >
                          <option value="">Selecione o bairro</option>
                          {shopDeliveryConfig?.shop_delivery_neighborhoods.data.map((nb: any) => (
                            <option key={nb.id} value={nb.id}>
                              {nb.attributes.name} · R$ {nb.attributes.amount.toFixed(2).replace('.', ',')}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          id="neighborhood"
                          placeholder="Bairro"
                          value={selectedNeighborhood}
                          onChange={(e) => setSelectedNeighborhood(e.target.value)}
                          className="border-gray-200 focus:border-primary/40 text-sm"
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="complement" className="text-xs font-medium text-gray-700 mb-1.5 block">Complemento</Label>
                        <Input
                          id="complement"
                          placeholder="Apto, bloco..."
                          value={complement}
                          onChange={(e) => setComplement(e.target.value)}
                          className="border-gray-200 focus:border-primary/40 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reference" className="text-xs font-medium text-gray-700 mb-1.5 block">Referência</Label>
                        <Input
                          id="reference"
                          placeholder="Perto do..."
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                          className="border-gray-200 focus:border-primary/40 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {deliveryOption === 'pickup' && (
                  <div className="flex items-start gap-2.5 border border-primary/10 rounded-lg px-4 py-3">
                    <Store className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">
                      Você retirará o pedido diretamente no estabelecimento. Sem taxa de entrega.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Pagamento ── */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-gray-900">Pagamento</h2>
              </div>

              <div className="px-5 py-4 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.entries(PAYMENT_LABELS) as [PaymentMethod, { label: string; icon: React.ReactNode }][]).map(([method, cfg]) => {
                    const available = shopPaymentConfig?.[method === 'manual_pix' ? 'manual_pix' : method]
                    if (!available) return null
                    const isSelected = paymentMethod === method
                    return (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary text-primary'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>

                {paymentMethod === 'cash' && (
                  <div>
                    <Label htmlFor="changeFor" className="text-xs font-medium text-gray-700 mb-1.5 block">Troco para</Label>
                    <Input
                      id="changeFor"
                      placeholder="R$ 50,00"
                      value={changeFor}
                      onChange={(e) => setChangeFor(e.target.value)}
                      className="border-gray-200 focus:border-primary/40 text-sm max-w-[180px]"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* CTA mobile */}
            <div className="lg:hidden">
              <OrderSummary
                totalPrice={totalPrice}
                deliveryOption={deliveryOption}
                deliveryFeeDisplay={deliveryFeeDisplay()}
                calculateTotal={calculateTotal}
                cartItems={cartItems}
                isBelowMinOrder={isBelowMinOrder}
                minOrderValue={minOrderValue}
                isSubmitting={isSubmitting}
                isShopOpen={isShopOpen}
                shopStatusLoading={shopStatusLoading}
                client={client}
                canSubmit={canSubmit}
                onSubmit={handleSubmitOrder}
              />
            </div>
          </div>

          {/* ── Right column (sticky summary) ── */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-[73px]">
              <OrderSummary
                totalPrice={totalPrice}
                deliveryOption={deliveryOption}
                deliveryFeeDisplay={deliveryFeeDisplay()}
                calculateTotal={calculateTotal}
                cartItems={cartItems}
                isBelowMinOrder={isBelowMinOrder}
                minOrderValue={minOrderValue}
                isSubmitting={isSubmitting}
                isShopOpen={isShopOpen}
                shopStatusLoading={shopStatusLoading}
                client={client}
                canSubmit={canSubmit}
                onSubmit={handleSubmitOrder}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Componente de resumo do pedido ──
interface OrderSummaryProps {
  totalPrice: number
  deliveryOption: DeliveryOption
  deliveryFeeDisplay: string | null
  calculateTotal: () => number
  cartItems: CartItemWithExtras[]
  isBelowMinOrder: boolean
  minOrderValue: number
  isSubmitting: boolean
  isShopOpen: boolean
  shopStatusLoading: boolean
  client: any
  canSubmit: boolean
  onSubmit: () => void
}

function OrderSummary({
  totalPrice, deliveryOption, deliveryFeeDisplay, calculateTotal,
  cartItems, isBelowMinOrder, minOrderValue, isSubmitting, isShopOpen,
  shopStatusLoading, client, canSubmit, onSubmit
}: OrderSummaryProps) {
  const totalDiscount = cartItems.reduce((sum, item) => {
    if (item.priceWithDiscount) {
      return sum + (item.price - item.priceWithDiscount) * item.quantity
    }
    return sum
  }, 0)

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Resumo</h2>
      </div>

      <div className="px-5 py-4 space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
          </div>

          {deliveryOption === 'delivery' && deliveryFeeDisplay && (
            <div className="flex justify-between text-gray-600">
              <span>Entrega</span>
              <span className={deliveryFeeDisplay === 'Grátis' ? 'text-green-600 font-medium' : ''}>
                {deliveryFeeDisplay}
              </span>
            </div>
          )}

          {totalDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Desconto</span>
              <span>- R$ {totalDiscount.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between font-semibold text-gray-900">
          <span>Total</span>
          <span className="text-primary">R$ {calculateTotal().toFixed(2).replace('.', ',')}</span>
        </div>

        {isBelowMinOrder && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Mínimo R$ {minOrderValue.toFixed(2).replace('.', ',')}. Faltam R$ {(minOrderValue - totalPrice).toFixed(2).replace('.', ',')}.
            </p>
          </div>
        )}

        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            canSubmit
              ? 'bg-primary text-white hover:bg-primary/90 active:scale-[0.98] cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Finalizando...
            </>
          ) : !isShopOpen && !shopStatusLoading ? (
            <>
              <Clock className="h-4 w-4" />
              Loja fechada
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Finalizar pedido
            </>
          )}
        </button>

        <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
          Ao finalizar, você concorda com os Termos de Serviço.
        </p>
      </div>
    </div>
  )
}
