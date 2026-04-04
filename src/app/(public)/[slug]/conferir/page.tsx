"use client"

import {
  CreditCard, Wallet, QrCode, Truck, ChevronDown, ChevronUp,
  Plus, Minus, X, CheckCircle2, Store, Clock, AlertTriangle,
  ChevronLeft, ShoppingCart, Package, User, Phone, Tag, Loader2, Copy, ExternalLink
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from "sonner"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCart } from '../cart/cart-context'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreateOrderRequest, Order } from '@/types/order'
import { createOrder } from '@/services/order-service'
import { validateCoupon, ValidateCouponData } from '@/services/coupon-validate-service'
import { useShopBySlug } from '../use-slug'
import { formatPrice } from '../format-price'
import { useShopStatusContext } from '@/contexts/ShopStatusContext'
import Image from 'next/image'
import favicon from "@/public/logo/favicon.svg"
import logoInlineBlack from "@/public/logo/logo-inline-black.svg"
import Link from 'next/link'
import PublicLoading from '@/components/public-loading'

type DeliveryOption = 'delivery' | 'pickup'

function OrderSuccessScreen() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 2000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const steps = [
    { icon: Package, text: "Preparando seu pedido..." },
    { icon: CheckCircle2, text: "Pedido confirmado!" },
    { icon: Truck, text: "Acompanhe em tempo real" },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* Ícone principal com animação */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="mb-8"
      >
        <div className="w-24 h-24 rounded-full bg-[#7ED957] flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      {/* Título */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-tomato text-2xl sm:text-3xl font-bold text-[#1B1B1B] text-center mb-2"
      >
        Pedido realizado!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-gray-500 text-center mb-10"
      >
        Tudo certo, estamos cuidando de tudo pra você
      </motion.p>

      {/* Steps progressivos */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        {steps.map((s, i) => {
          const Icon = s.icon
          const isActive = step >= i
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: isActive ? 1 : 0.3,
                x: isActive ? 0 : -20,
              }}
              transition={{ delay: 0.4 + i * 0.3, duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                isActive ? "bg-[#1B1B1B] text-white" : "bg-gray-100 text-gray-400"
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-sm font-medium transition-colors duration-300 ${
                isActive ? "text-[#1B1B1B]" : "text-gray-400"
              }`}>
                {s.text}
              </span>
              {isActive && i < steps.length - 1 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Barra de progresso */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-xs mt-8"
      >
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            className="h-full bg-primary rounded-full"
          />
        </div>
      </motion.div>
    </div>
  )
}
function PixPaymentScreen({ pixCode, expiresAt, orderId, shopSlug }: {
  pixCode: string
  expiresAt: string | null
  orderId: string
  shopSlug: string
}) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const expiresDate = expiresAt ? new Date(expiresAt) : null
  const expiresLabel = expiresDate
    ? expiresDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : null

  const navigateToTracking = () => {
    try { sessionStorage.removeItem('pix_pending') } catch {}
    router.push(`/pedidos/${orderId}`)
  }

  // Polling: redireciona automaticamente quando pagamento for confirmado
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const check = async () => {
      try {
        const res = await fetch(`${baseUrl}/orders/${orderId}`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        })
        if (!res.ok) return
        const json = await res.json()
        const attrs = (json?.data ?? json)?.attributes
        if (attrs?.paid_at) {
          try { sessionStorage.removeItem('pix_pending') } catch {}
          toast.success('Pagamento PIX confirmado! Redirecionando...')
          router.push(`/pedidos/${orderId}`)
        }
      } catch {}
    }
    const interval = setInterval(check, 5000)
    return () => clearInterval(interval)
  }, [orderId, router])

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-xl border border-[#E5E2DD] overflow-hidden shadow-sm">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#E5E2DD] text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-tomato text-xl font-bold text-gray-900">Pague via PIX</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Pedido <span className="font-semibold text-gray-900">#{orderId}</span> criado com sucesso
            </p>
            {expiresLabel && (
              <div className="inline-flex items-center gap-1.5 mt-2 text-xs text-amber-600 border-amber-200 rounded-md px-2.5 py-1">
                <Clock className="w-3 h-3" />
                Expira às {expiresLabel}
              </div>
            )}
          </div>

          {/* QR Code + código copia e cola */}
          <div className="px-6 py-5 space-y-4">
            <div className="flex justify-center p-4 bg-[#FAF9F7] border border-[#E5E2DD] rounded-md">
              <QRCodeSVG value={pixCode} size={180} level="M" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                PIX Copia e Cola
              </p>
              <div className="bg-[#FAF9F7] border border-[#E5E2DD] rounded-md p-3">
                <p className="text-xs font-mono text-gray-700 break-all leading-relaxed select-all">
                  {pixCode}
                </p>
              </div>
            </div>

            <Button
              onClick={handleCopy}
              className="w-full rounded-md gap-2"
              variant={copied ? "outline" : "default"}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar código PIX
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Escaneie o QR Code ou use <strong>PIX Copia e Cola</strong> no app do seu banco.
              Seu pedido será confirmado automaticamente após o pagamento.
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 space-y-2">
            <Button
              onClick={navigateToTracking}
              variant="outline"
              className="w-full rounded-md gap-2 border-[#E5E2DD] cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              Acompanhar pedido
            </Button>
            <Button
              onClick={() => { try { sessionStorage.removeItem('pix_pending') } catch {}; router.push(`/${shopSlug}`) }}
              variant="ghost"
              className="w-full rounded-md text-muted-foreground hover:text-gray-900 cursor-pointer"
            >
              Voltar ao cardápio
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

type PaymentMethod = 'credit' | 'debit' | 'manual_pix' | 'asaas_pix' | 'cash'

interface CartItemWithExtras {
  id: string
  cartId: string
  name: string
  price: number
  priceWithDiscount?: number
  quantity: number
  weight?: number
  itemType?: string
  image?: string
  extras?: Array<{ id: string; name: string; price: number }>
  prepareMethods?: Array<{ id: string; name: string }>
  steps?: Array<{ id: string; name: string; selectedOption?: { id: string; name: string } }>
  complements?: Array<{ groupName: string; options: Array<{ id: string; name: string; price: number }> }>
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
  asaas_pix: { label: 'PIX', icon: <QrCode className="h-4 w-4" /> },
  cash: { label: 'Dinheiro', icon: <Wallet className="h-4 w-4" /> },
}

export default function CheckoutPage() {
  const router = useRouter()
  const params = useParams()
  const storeSlug = params.slug as string
  const { isOpen: isShopOpen, loading: shopStatusLoading, checkStatus } = useShopStatusContext()

  const { data: shopData, isLoading: isLoadingShop } = useShopBySlug(storeSlug)

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
  const [guestName, setGuestName] = useState(() => {
    if (typeof window === 'undefined') return ''
    try {
      const info = JSON.parse(localStorage.getItem('customer_info') || '{}')
      return info.name || ''
    } catch { return '' }
  })
  const [guestPhone, setGuestPhone] = useState(() => {
    if (typeof window === 'undefined') return ''
    try {
      const info = JSON.parse(localStorage.getItem('customer_info') || '{}')
      const phone = info.phone || ''
      if (!phone) return ''
      const d = phone.replace(/\D/g, '')
      if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
      if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
      return phone
    } catch { return '' }
  })
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<ValidateCouponData | null>(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [orderCompleted, setOrderCompleted] = useState(false)
  const [pixData, setPixData] = useState<{ code: string; expiresAt: string | null; orderId: string } | null>(null)

  // Restaurar pixData do sessionStorage em caso de refresh na tela de PIX
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('pix_pending')
      if (saved) setPixData(JSON.parse(saved))
    } catch {
      try { sessionStorage.removeItem('pix_pending') } catch {}
    }
  }, [])

  const phoneValidationRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/

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

  // Recalcular desconto do cupom quando totalPrice mudar
  useEffect(() => {
    if (!appliedCoupon) return
    let discount = 0
    if (appliedCoupon.discount_type === 'fixed_value') {
      discount = Math.min(parseFloat(appliedCoupon.value), totalPrice)
    } else {
      discount = totalPrice * (parseFloat(appliedCoupon.value) / 100)
    }
    setCouponDiscount(discount)
  }, [totalPrice, appliedCoupon])

  // Verificar se há métodos de pagamento disponíveis
  // asaas_pix e manual_pix são mutuamente exclusivos: asaas_pix tem prioridade
  const availablePaymentMethods = shopPaymentConfig
    ? (Object.entries(PAYMENT_LABELS) as [PaymentMethod, any][]).filter(([method]) => {
        if (method === 'asaas_pix') return shopPaymentConfig.asaas_pix
        if (method === 'manual_pix') return !shopPaymentConfig.asaas_pix && shopPaymentConfig.manual_pix
        return shopPaymentConfig[method as keyof typeof shopPaymentConfig]
      })
    : []
  const noPaymentMethods = shopPaymentConfig && availablePaymentMethods.length === 0

  // Auto-selecionar o primeiro método de pagamento disponível
  useEffect(() => {
    if (availablePaymentMethods.length > 0) {
      const currentAvailable = availablePaymentMethods.find(([m]) => m === paymentMethod)
      if (!currentAvailable) {
        setPaymentMethod(availablePaymentMethods[0][0])
      }
    }
  }, [shopPaymentConfig])

  // Pré-preencher endereço do último pedido
  useEffect(() => {
    const phone = (() => {
      try {
        const info = JSON.parse(localStorage.getItem('customer_info') || '{}')
        return info.phone?.replace(/\D/g, '') || ''
      } catch { return '' }
    })()
    if (!phone || phone.length < 10) return

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    fetch(`${baseUrl}/customers/orders/last_order_info?phone=${phone}`, {
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return
        if (data.address) {
          if (data.address.address && !address) setAddress(data.address.address)
          if (data.address.complement && !complement) setComplement(data.address.complement)
          if (data.address.reference && !reference) setReference(data.address.reference)
          if (data.address.shop_delivery_neighborhood_id && !selectedNeighborhood) {
            setSelectedNeighborhood(String(data.address.shop_delivery_neighborhood_id))
          }
        }
      })
      .catch(() => {})
  }, [])

  // Set de IDs realmente disponíveis (ativo + grupo ativo + dia da semana)
  const availableItemIds = useMemo(() => {
    const ids = new Set<string>()
    if (!shopData) return ids
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
    const todayDayKey = `${dayKeys[new Date().getDay()]}_active`
    const groups = shopData.data?.attributes?.catalog_groups
    const groupList = Array.isArray(groups) ? groups : (groups?.data ?? [])
    groupList.forEach((g: any) => {
      if (g.attributes?.active === false) return
      const gItems = Array.isArray(g.attributes?.items) ? g.attributes.items : (g.attributes?.items?.data ?? [])
      gItems.forEach((i: any) => {
        const item = i.data ?? i
        if (!item?.id) return
        const attrs = item.attributes ?? item
        if (attrs.active === false) return
        if (attrs[todayDayKey] === false) return
        ids.add(String(item.id))
      })
    })
    return ids
  }, [shopData])

  useEffect(() => {
    // Filtrar itens sem attributes (excluídos) ou indisponíveis (desativado/dia da semana)
    const validItems: any[] = []
    const removedNames: string[] = []

    items.forEach((item: any) => {
      if (!item.attributes) {
        removedNames.push(item.id)
        removeItem(item.cartId || item.id)
        return
      }
      if (availableItemIds.size > 0 && !availableItemIds.has(String(item.id))) {
        removedNames.push(item.attributes.name)
        removeItem(item.cartId || item.id)
        return
      }
      validItems.push(item)
    })

    if (removedNames.length > 0) {
      toast.error(
        removedNames.length === 1
          ? `O item "${removedNames[0]}" não está disponível no momento e foi removido do carrinho.`
          : `${removedNames.length} itens não estão disponíveis no momento e foram removidos do carrinho.`
      )
    }

    const mappedItems = validItems.map((item: any) => ({
      id: item.id,
      cartId: item.cartId || item.id,
      name: item.attributes.name,
      price: item.attributes.price,
      priceWithDiscount: item.attributes.price_with_discount || undefined,
      quantity: item.quantity,
      weight: item.weight,
      itemType: item.attributes.item_type,
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
      complements: (() => {
        const selectedIds = new Set((item.selectedSharedComplements || []).map(String))
        if (selectedIds.size === 0) return []
        const groups: Array<{ groupName: string; options: Array<{ id: string; name: string; price: number }> }> = []
        item.attributes.shared_complements?.data?.forEach((group: any) => {
          const matched = group.attributes.options
            .filter((o: any) => selectedIds.has(String(o.id)))
            .map((o: any) => ({ id: String(o.id), name: o.name, price: Number(o.price) }))
          if (matched.length > 0) {
            groups.push({ groupName: group.attributes.name, options: matched })
          }
        })
        return groups
      })(),
      selectedExtras: item.selectedExtras || [],
      selectedMethods: item.selectedMethods || [],
      selectedOptions: item.selectedOptions || {},
      selectedSharedComplements: item.selectedSharedComplements || [],
      totalPrice: item.totalPrice,
      observation: item.observation
    }))
    setCartItems(mappedItems)
    setIsLoading(false)
  }, [items, availableItemIds])



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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const response = await validateCoupon(couponCode.trim(), Number(shop?.data.id))
      const couponData = response.data.attributes
      const minOrder = parseFloat(couponData.minimum_order_value) || 0
      if (minOrder > 0 && totalPrice < minOrder) {
        setCouponError(`Valor mínimo do pedido: R$ ${minOrder.toFixed(2).replace('.', ',')}`)
        setCouponLoading(false)
        return
      }
      let discount = 0
      if (couponData.discount_type === 'fixed_value') {
        discount = Math.min(parseFloat(couponData.value), totalPrice)
      } else {
        discount = totalPrice * (parseFloat(couponData.value) / 100)
      }
      setAppliedCoupon(couponData)
      setCouponDiscount(discount)
      toast.success('Cupom aplicado!')
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Cupom inválido'
      setCouponError(msg)
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponDiscount(0)
    setCouponCode('')
    setCouponError('')
  }

  const calculatePaymentAdjustment = (): number => {
    if (!shopPaymentConfig) return 0
    const attrKey = (paymentMethod === 'manual_pix' || paymentMethod === 'asaas_pix') ? paymentMethod : paymentMethod
    const adjType = shopPaymentConfig[`${attrKey}_adjustment_type` as keyof typeof shopPaymentConfig] as string
    if (!adjType || adjType === 'none') return 0
    const adjValue = parseFloat(String(shopPaymentConfig[`${attrKey}_adjustment_value` as keyof typeof shopPaymentConfig] || '0'))
    const valType = shopPaymentConfig[`${attrKey}_value_type` as keyof typeof shopPaymentConfig] as string
    if (adjValue <= 0) return 0
    const amount = valType === 'percentage' ? totalPrice * (adjValue / 100) : adjValue
    return adjType === 'discount' ? -amount : amount
  }

  const paymentAdjustment = calculatePaymentAdjustment()

  const getPaymentAdjustmentBadge = (method: PaymentMethod): { label: string; color: string } | null => {
    if (!shopPaymentConfig) return null
    const attrKey = method
    const adjType = shopPaymentConfig[`${attrKey}_adjustment_type` as keyof typeof shopPaymentConfig] as string
    if (!adjType || adjType === 'none') return null
    const adjValue = parseFloat(String(shopPaymentConfig[`${attrKey}_adjustment_value` as keyof typeof shopPaymentConfig] || '0'))
    const valType = shopPaymentConfig[`${attrKey}_value_type` as keyof typeof shopPaymentConfig] as string
    if (adjValue <= 0) return null
    const sign = adjType === 'discount' ? '-' : '+'
    const suffix = valType === 'percentage' ? '%' : ''
    const display = valType === 'percentage' ? adjValue : adjValue.toFixed(2).replace('.', ',')
    return {
      label: `${sign}${display}${suffix}`,
      color: adjType === 'discount' ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'
    }
  }

  const calculateTotal = () => {
    const total = (totalPrice || 0) + (calculateDeliveryFee() || 0) - (couponDiscount || 0) + (paymentAdjustment || 0)
    return isNaN(total) ? 0 : Math.max(total, 0)
  }

  const handleSubmitOrder = async () => {
    // Re-validar status da loja
    await checkStatus()
    if (!isShopOpen || shopStatusLoading) {
      toast.error('A loja está fechada no momento.')
      return
    }

    if (noPaymentMethods) {
      toast.error('Nenhum método de pagamento disponível.')
      return
    }

    const minOrderValue = Number(shopDeliveryConfig?.minimum_order_value) || 0
    const effectiveOrderValue = (totalPrice || 0) - (couponDiscount || 0) + (paymentAdjustment || 0)
    if (deliveryOption === 'delivery' && effectiveOrderValue < minOrderValue) {
      toast.error(`Valor mínimo para entrega: R$ ${minOrderValue.toFixed(2).replace('.', ',')}`)
      return
    }

    // Validação campo a campo
    const errors: Record<string, string> = {}
    const trimmedName = guestName.trim()
    if (!trimmedName) {
      errors.guestName = 'Nome é obrigatório'
    } else if (trimmedName.length < 3) {
      errors.guestName = 'Nome deve ter pelo menos 3 caracteres'
    }
    const phoneDigits = guestPhone.replace(/\D/g, '')
    if (!phoneDigits) {
      errors.guestPhone = 'Telefone é obrigatório'
    } else if (phoneDigits.length < 10) {
      errors.guestPhone = 'Telefone deve ter DDD + número (min 10 dígitos)'
    } else if (phoneDigits.length > 11) {
      errors.guestPhone = 'Telefone inválido'
    }
    if (deliveryOption === 'delivery') {
      if (!address.trim()) errors.address = 'Endereço é obrigatório'
      if (shopDeliveryConfig?.delivery_fee_kind === 'per_neighborhood' && !selectedNeighborhood) {
        errors.neighborhood = 'Selecione um bairro'
      } else if (!selectedNeighborhood.trim()) {
        errors.neighborhood = 'Bairro é obrigatório'
      }
    }
    if (paymentMethod === 'cash' && changeFor) {
      const changeValue = parseFloat(changeFor)
      if (changeValue < calculateTotal()) {
        errors.changeFor = 'O troco deve ser maior ou igual ao total do pedido'
      }
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      const firstError = Object.values(errors)[0]
      toast.error(firstError)
      return
    }
    setFieldErrors({})

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

    const orderData: CreateOrderRequest = {
      order: {
        shop_id: Number(shop?.data.id),
        withdrawal: deliveryOption === 'pickup',
        payment_method: paymentMethod as any,
        customer_name: guestName.trim(),
        customer_phone: guestPhone.replace(/\D/g, ''),
        ...(appliedCoupon && { coupon_code: appliedCoupon.code }),
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
          ...(item.weight && { weight: item.weight }),
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
      const response = await createOrder(orderData, 'normal')
      const orderId = response.order_id
      setOrder(response)
      clearCart()
      const customerPhone = guestPhone.replace(/\D/g, '')
      localStorage.setItem('customer_info', JSON.stringify({ name: guestName.trim(), phone: customerPhone }))
      localStorage.setItem('guest_phone', customerPhone)

      if (paymentMethod === 'asaas_pix') {
        if (response.pix_code) {
          const newPixData = { code: response.pix_code, expiresAt: response.pix_expires_at ?? null, orderId: String(orderId) }
          setPixData(newPixData)
          try { sessionStorage.setItem('pix_pending', JSON.stringify(newPixData)) } catch {}
          setIsSubmitting(false)
          return
        }
        // PIX gerado sem código — pedido criado mas geração de PIX falhou
        toast.warning('Pedido criado! Houve um problema ao gerar o código PIX. Entre em contato com a loja para combinar o pagamento.')
        setOrderCompleted(true)
        if (orderId) router.push(`/pedidos/${orderId}`)
        return
      }

      toast.success("Pedido realizado com sucesso!")
      setOrderCompleted(true)
      if (orderId) router.push(`/pedidos/${orderId}`)
    } catch (error: any) {
      console.error('Erro ao enviar pedido:', error)
      const raw = error.response?.data?.error || ""
      let message = "Erro ao enviar pedido. Tente novamente."

      const isItemUnavailable =
        raw.includes("Couldn't find CatalogItem") ||
        raw.includes("Item não encontrado") ||
        raw.includes("está desativado") ||
        raw.includes("está desativada") ||
        raw.includes("não está disponível hoje")

      if (isItemUnavailable) {
        // Construir set de IDs realmente disponíveis (ativo + grupo ativo + dia da semana)
        const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
        const todayDayKey = `${dayKeys[new Date().getDay()]}_active`
        const availableItemIds = new Set<string>()
        const groups = shopData?.data?.attributes?.catalog_groups
        const groupList = Array.isArray(groups) ? groups : (groups?.data ?? [])
        groupList.forEach((g: any) => {
          if (g.attributes?.active === false) return
          const items = Array.isArray(g.attributes?.items) ? g.attributes.items : (g.attributes?.items?.data ?? [])
          items.forEach((i: any) => {
            const item = i.data ?? i
            if (!item?.id) return
            const attrs = item.attributes ?? item
            if (attrs.active === false) return
            if (attrs[todayDayKey] === false) return
            availableItemIds.add(String(item.id))
          })
        })
        const removedNames: string[] = []
        cartItems.forEach(ci => {
          if (!availableItemIds.has(String(ci.id))) {
            removedNames.push(ci.name)
            removeItem(ci.cartId)
          }
        })
        setCartItems(prev => prev.filter(ci => availableItemIds.has(String(ci.id))))
        if (removedNames.length > 0) {
          message = removedNames.length === 1
            ? `O item "${removedNames[0]}" não está disponível no momento e foi retirado do seu carrinho.`
            : `Os itens "${removedNames.join('", "')}" não estão disponíveis no momento e foram retirados do seu carrinho.`
        } else {
          message = raw || "Um ou mais itens do carrinho não estão mais disponíveis. Verifique seu carrinho."
        }
      } else if (raw) {
        message = raw
      }
      toast.error(message)
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
  const effectiveValue = (totalPrice || 0) - (couponDiscount || 0) + (paymentAdjustment || 0)
  const isBelowMinOrder = deliveryOption === 'delivery' && minOrderValue > 0 && effectiveValue < minOrderValue

  if (isLoadingShop || isLoading) {
    return <PublicLoading />
  }

  if (orderCompleted) {
    return <OrderSuccessScreen />
  }

  if (pixData) {
    return (
      <PixPaymentScreen
        pixCode={pixData.code}
        expiresAt={pixData.expiresAt}
        orderId={pixData.orderId}
        shopSlug={storeSlug}
      />
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center mx-auto">
            <ShoppingCart className="h-7 w-7 text-gray-400" />
          </div>
          <div>
            <h3 className="font-tomato font-semibold text-gray-900">Carrinho vazio</h3>
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

  const canSubmit = !isSubmitting && isShopOpen && !shopStatusLoading && !isBelowMinOrder && !noPaymentMethods &&
    (deliveryOption === 'pickup' || !!address.trim()) &&
    (guestName.trim().length >= 3 && guestPhone.replace(/\D/g, '').length >= 10)

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mr-auto"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-medium hidden sm:block">Voltar</span>
            </button>
            <Link href={`/${storeSlug}`} className="md:hidden cursor-pointer">
              <Image src={favicon} alt="Versa" width={90} height={90} priority />
            </Link>
            <Link href={`/${storeSlug}`} className="hidden md:block cursor-pointer">
              <Image src={logoInlineBlack} alt="Versa" width={180} height={56} priority />
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left column ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Loja fechada */}
            {!isShopOpen && !shopStatusLoading && (
              <Alert className="border-red-400 bg-white rounded-md">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700 text-sm">
                  Loja fechada no momento. Você não pode finalizar a compra agora.
                </AlertDescription>
              </Alert>
            )}

            {/* Identificação */}
            <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <h2 className="font-tomato text-base font-semibold text-gray-900">Identificação</h2>
              </div>
                <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="guestName" className="text-sm font-medium text-gray-700 mb-1.5 block">Nome <span className="text-red-500">*</span></Label>
                    <Input
                      id="guestName"
                      placeholder="Seu nome"
                      value={guestName}
                      onChange={(e) => { setGuestName(e.target.value); setFieldErrors(prev => ({ ...prev, guestName: '' })) }}
                      className={`border-[#E5E2DD] focus:border-primary/40 text-sm ${fieldErrors.guestName ? 'border-red-400 focus:border-red-400' : ''}`}
                    />
                    {fieldErrors.guestName && <p className="text-sm text-red-500 mt-1">{fieldErrors.guestName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="guestPhone" className="text-sm font-medium text-gray-700 mb-1.5 block">Telefone <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="guestPhone"
                        placeholder="(00) 00000-0000"
                        value={guestPhone}
                        onChange={(e) => { handlePhoneChange(e); setFieldErrors(prev => ({ ...prev, guestPhone: '' })) }}
                        className={`pl-8 border-[#E5E2DD] focus:border-primary/40 text-sm ${fieldErrors.guestPhone ? 'border-red-400 focus:border-red-400' : ''}`}
                      />
                    </div>
                    {fieldErrors.guestPhone && <p className="text-sm text-red-500 mt-1">{fieldErrors.guestPhone}</p>}
                  </div>
                </div>
              </div>

            {/* ── Itens ── */}
            <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between border-b border-[#E5E2DD]">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <h2 className="font-tomato text-base font-semibold text-gray-900">Itens do pedido</h2>
                </div>
                <span className="text-sm text-muted-foreground border border-[#E5E2DD] px-2.5 py-0.5 rounded-md">
                  {cartItems.reduce((s, i) => s + i.quantity, 0)} {cartItems.reduce((s, i) => s + i.quantity, 0) === 1 ? 'item' : 'itens'}
                </span>
              </div>

              <div className="divide-y divide-[#E5E2DD]">
                {cartItems.map((item) => {
                  const hasDetails = (item.extras?.length ?? 0) > 0 ||
                    (item.prepareMethods?.length ?? 0) > 0 ||
                    (item.steps?.length ?? 0) > 0 ||
                    (item.complements?.length ?? 0) > 0 ||
                    !!item.weight

                  return (
                    <div key={item.id} className="px-5 py-4">
                      <div className="flex gap-3">
                        {/* Imagem */}
                        <div className="flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-16 w-16 rounded-md object-cover bg-[#F0EFEB]"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-md border border-[#E5E2DD] flex items-center justify-center">
                              <span className="text-primary/40 text-lg font-bold">
                                {item.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-tomato text-base font-semibold text-gray-900 leading-tight">{item.name}</h3>
                            <button
                              onClick={() => {
                                removeItem(item.cartId)
                                setCartItems(prev => prev.filter(i => i.cartId !== item.cartId))
                              }}
                              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {(() => {
                            const isWeight = item.itemType === 'weight_per_kg' || item.itemType === 'weight_per_g'
                            const weightUnit = item.itemType === 'weight_per_g' ? 'g' : 'kg'

                            if (isWeight && item.weight) {
                              return (
                                <>
                                  <p className="text-sm font-bold text-primary mt-0.5">
                                    {formatPrice(item.totalPrice)}
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-0.5">
                                    {item.weight} {weightUnit} × {item.priceWithDiscount ? (
                                      <>
                                        <span className="line-through">{formatPrice(item.price)}</span>
                                        {' '}<span className="text-green-600 font-medium">{formatPrice(item.priceWithDiscount)}</span>
                                      </>
                                    ) : (
                                      formatPrice(item.price)
                                    )}
                                    /{weightUnit}
                                  </p>
                                </>
                              )
                            }

                            return (
                              <p className="text-sm font-medium text-primary mt-0.5">
                                {item.priceWithDiscount ? (
                                  <>
                                    {formatPrice(item.priceWithDiscount * item.quantity)}
                                    <span className="text-sm text-muted-foreground line-through ml-2">
                                      {formatPrice(item.price * item.quantity)}
                                    </span>
                                  </>
                                ) : (
                                  formatPrice(item.totalPrice)
                                )}
                              </p>
                            )
                          })()}

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1.5 bg-[#FAF9F7] border border-[#E5E2DD] rounded-md px-1">
                              <button
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    updateItemQuantity(item.cartId, item.quantity - 1)
                                    setCartItems(prev => prev.map(i => i.cartId === item.cartId ? { ...i, quantity: i.quantity - 1 } : i))
                                  }
                                }}
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary transition-colors cursor-pointer disabled:opacity-30"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="text-sm font-bold text-gray-900 min-w-[1.5rem] text-center">{item.quantity}</span>
                              <button
                                onClick={() => {
                                  updateItemQuantity(item.cartId, item.quantity + 1)
                                  setCartItems(prev => prev.map(i => i.cartId === item.cartId ? { ...i, quantity: i.quantity + 1 } : i))
                                }}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary transition-colors cursor-pointer"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            {hasDetails && (
                              <button
                                onClick={() => setIsExpanded(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
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
                          className="h-8 text-sm bg-[#FAF9F7] border-[#E5E2DD] focus:border-primary/40 rounded-md"
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
                            <div className="mt-3 bg-[#FAF9F7] rounded-md p-3 space-y-2.5">
                              {item.weight && (
                                <div>
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Peso</span>
                                  <p className="text-sm font-semibold text-gray-700 mt-0.5">{item.weight}{item.itemType === 'weight_per_g' ? 'g' : ' kg'}</p>
                                </div>
                              )}
                              {(item.extras?.length ?? 0) > 0 && (
                                <div>
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Adicionais</span>
                                  <ul className="mt-1 space-y-1">
                                    {item.extras!.map(extra => (
                                      <li key={extra.id} className="flex justify-between text-sm text-gray-600">
                                        <span>{extra.name}</span>
                                        <span className="font-semibold">+ {formatPrice(extra.price)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {item.complements?.map(group => (
                                <div key={group.groupName}>
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{group.groupName}</span>
                                  <ul className="mt-1 space-y-1">
                                    {group.options.map(opt => (
                                      <li key={opt.id} className="flex justify-between text-sm text-gray-600">
                                        <span>{opt.name}</span>
                                        {opt.price > 0 && <span className="font-semibold">+ {formatPrice(opt.price)}</span>}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                              {(item.prepareMethods?.length ?? 0) > 0 && (
                                <div>
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Modo de preparo</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.prepareMethods!.map(m => (
                                      <span key={m.id} className="text-[10px] bg-white border border-[#E5E2DD] rounded px-2 py-0.5 text-gray-600">{m.name}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {(item.steps?.length ?? 0) > 0 && (
                                <div>
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Opções</span>
                                  <div className="mt-1 space-y-1">
                                    {item.steps!.map(step => (
                                      <div key={step.id} className="flex justify-between text-sm text-gray-600">
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
            <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <h2 className="font-tomato text-base font-semibold text-gray-900">Entrega</h2>
              </div>

              <div className="px-5 py-4 space-y-4">
                {/* Toggle delivery/pickup */}
                <div className="flex bg-gray-100 rounded-md p-1 gap-1">
                  <button
                    onClick={() => setDeliveryOption('delivery')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all cursor-pointer ${
                      deliveryOption === 'delivery'
                        ? 'bg-white text-gray-900 border border-[#E5E2DD]'
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
                        ? 'bg-white text-gray-900 border border-[#E5E2DD]'
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
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-1.5 block">Endereço <span className="text-red-500">*</span></Label>
                      <Input
                        id="address"
                        placeholder="Rua, número"
                        value={address}
                        onChange={(e) => { setAddress(e.target.value); setFieldErrors(prev => ({ ...prev, address: '' })) }}
                        maxLength={70}
                        className={`border-[#E5E2DD] focus:border-primary/40 text-sm ${fieldErrors.address ? 'border-red-400 focus:border-red-400' : ''}`}
                      />
                      {fieldErrors.address && <p className="text-sm text-red-500 mt-1">{fieldErrors.address}</p>}
                    </div>

                    <div>
                      <Label htmlFor="neighborhood" className="text-sm font-medium text-gray-700 mb-1.5 block">Bairro <span className="text-red-500">*</span></Label>
                      {shopDeliveryConfig?.delivery_fee_kind === 'per_neighborhood' ? (
                        <>
                          <select
                            id="neighborhood"
                            value={selectedNeighborhood}
                            onChange={(e) => { setSelectedNeighborhood(e.target.value); setFieldErrors(prev => ({ ...prev, neighborhood: '' })) }}
                            className={`w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 ${fieldErrors.neighborhood ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-[#E5E2DD] focus:border-primary/40 focus:ring-primary/20'}`}
                          >
                            <option value="">Selecione o bairro</option>
                            {shopDeliveryConfig?.shop_delivery_neighborhoods.data.map((nb: any) => (
                              <option key={nb.id} value={nb.id}>
                                {nb.attributes.name} · R$ {Number(nb.attributes.amount).toFixed(2).replace('.', ',')}
                              </option>
                            ))}
                          </select>
                          {fieldErrors.neighborhood && <p className="text-sm text-red-500 mt-1">{fieldErrors.neighborhood}</p>}
                        </>
                      ) : (
                        <>
                          <Input
                            id="neighborhood"
                            placeholder="Bairro"
                            value={selectedNeighborhood}
                            onChange={(e) => { setSelectedNeighborhood(e.target.value); setFieldErrors(prev => ({ ...prev, neighborhood: '' })) }}
                            className={`text-sm ${fieldErrors.neighborhood ? 'border-red-400 focus:border-red-400' : 'border-[#E5E2DD] focus:border-primary/40'}`}
                          />
                          {fieldErrors.neighborhood && <p className="text-sm text-red-500 mt-1">{fieldErrors.neighborhood}</p>}
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="complement" className="text-sm font-medium text-gray-700 mb-1.5 block">Complemento</Label>
                        <Input
                          id="complement"
                          placeholder="Apto, bloco..."
                          value={complement}
                          onChange={(e) => setComplement(e.target.value)}
                          className="border-[#E5E2DD] focus:border-primary/40 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reference" className="text-sm font-medium text-gray-700 mb-1.5 block">Referência</Label>
                        <Input
                          id="reference"
                          placeholder="Perto do..."
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                          className="border-[#E5E2DD] focus:border-primary/40 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {deliveryOption === 'pickup' && (
                  <div className="flex items-start gap-2.5 border border-[#E5E2DD] rounded-md px-4 py-3">
                    <Store className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">
                      Você retirará o pedido diretamente no estabelecimento. Sem taxa de entrega.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Pagamento ── */}
            <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <h2 className="font-tomato text-base font-semibold text-gray-900">Pagamento</h2>
              </div>

              <div className="px-5 py-4 space-y-3">
                {noPaymentMethods && (
                  <Alert className="border-red-400 bg-white rounded-md">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-700 text-sm">
                      Nenhum método de pagamento disponível. Entre em contato com o estabelecimento.
                    </AlertDescription>
                  </Alert>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.entries(PAYMENT_LABELS) as [PaymentMethod, { label: string; icon: React.ReactNode }][]).map(([method, cfg]) => {
                    const available = shopPaymentConfig?.[method === 'manual_pix' ? 'manual_pix' : method]
                    if (!available) return null
                    const isSelected = paymentMethod === method
                    const badge = getPaymentAdjustmentBadge(method)
                    return (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-md border-2 text-sm font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary text-primary'
                            : 'border-[#E5E2DD] text-gray-600 hover:border-gray-300 hover:bg-[#FAF9F7]'
                        }`}
                      >
                        {badge && (
                          <span className={`absolute -top-2 -right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badge.color}`}>
                            {badge.label}
                          </span>
                        )}
                        {cfg.icon}
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>

                {paymentMethod === 'cash' && (
                  <div>
                    <Label htmlFor="changeFor" className="text-sm font-medium text-gray-700 mb-1.5 block">Troco para</Label>
                    <Input
                      id="changeFor"
                      type="number"
                      placeholder="R$ 50,00"
                      value={changeFor}
                      onChange={(e) => setChangeFor(e.target.value)}
                      className={`text-sm max-w-[180px] ${changeFor && parseFloat(changeFor) < calculateTotal() ? 'border-red-400 focus:border-red-400' : 'border-[#E5E2DD] focus:border-primary/40'}`}
                      min={calculateTotal()}
                      step="0.01"
                    />
                    {changeFor && parseFloat(changeFor) < calculateTotal() && (
                      <p className="text-sm text-red-500 mt-1">O valor deve ser maior ou igual a {formatPrice(calculateTotal())}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* CTA mobile */}
            <div className="lg:hidden space-y-4">
              {/* Cupom mobile */}
              <CouponSection
                appliedCoupon={appliedCoupon}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                couponError={couponError}
                setCouponError={setCouponError}
                couponLoading={couponLoading}
                handleApplyCoupon={handleApplyCoupon}
                handleRemoveCoupon={handleRemoveCoupon}
              />
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
                canSubmit={canSubmit}
                onSubmit={handleSubmitOrder}
                couponDiscount={couponDiscount}
                appliedCouponCode={appliedCoupon?.code}
                paymentAdjustment={paymentAdjustment}
                paymentMethodLabel={PAYMENT_LABELS[paymentMethod].label}
              />
            </div>
          </div>

          {/* ── Right column (sticky summary) ── */}
          <div className="hidden lg:block w-[380px] flex-shrink-0">
            <div className="sticky top-[73px] space-y-4">
              {/* Cupom desktop */}
              <CouponSection
                appliedCoupon={appliedCoupon}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                couponError={couponError}
                setCouponError={setCouponError}
                couponLoading={couponLoading}
                handleApplyCoupon={handleApplyCoupon}
                handleRemoveCoupon={handleRemoveCoupon}
              />
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
                canSubmit={canSubmit}
                onSubmit={handleSubmitOrder}
                couponDiscount={couponDiscount}
                appliedCouponCode={appliedCoupon?.code}
                paymentAdjustment={paymentAdjustment}
                paymentMethodLabel={PAYMENT_LABELS[paymentMethod].label}
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
  canSubmit: boolean
  onSubmit: () => void
  couponDiscount?: number
  appliedCouponCode?: string
  paymentAdjustment?: number
  paymentMethodLabel?: string
}

function OrderSummary({
  totalPrice, deliveryOption, deliveryFeeDisplay, calculateTotal,
  cartItems, isBelowMinOrder, minOrderValue, isSubmitting, isShopOpen,
  shopStatusLoading, canSubmit, onSubmit, couponDiscount = 0, appliedCouponCode,
  paymentAdjustment = 0, paymentMethodLabel
}: OrderSummaryProps) {
  const totalDiscount = cartItems.reduce((sum, item) => {
    if (item.priceWithDiscount) {
      return sum + (item.price - item.priceWithDiscount) * item.quantity
    }
    return sum
  }, 0)

  const effectiveValue = (totalPrice || 0) - (couponDiscount || 0) + (paymentAdjustment || 0)

  return (
    <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E5E2DD]">
        <h2 className="font-tomato text-base font-semibold text-gray-900">Resumo</h2>
      </div>

      <div className="px-5 py-4 space-y-3">
        <div className="space-y-2 text-base">
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

          {/* {totalDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Desconto itens</span>
              <span>- R$ {totalDiscount.toFixed(2).replace('.', ',')}</span>
            </div>
          )} */}

          {couponDiscount > 0 && appliedCouponCode && (
            <div className="flex justify-between text-green-600">
              <span>Cupom ({appliedCouponCode})</span>
              <span>- R$ {couponDiscount.toFixed(2).replace('.', ',')}</span>
            </div>
          )}

          {paymentAdjustment !== 0 && paymentMethodLabel && (
            <div className={`flex justify-between ${paymentAdjustment < 0 ? 'text-green-600' : 'text-orange-600'}`}>
              <span>{paymentAdjustment < 0 ? 'Desc.' : 'Acresc.'} {paymentMethodLabel}</span>
              <span>
                {paymentAdjustment < 0 ? '- ' : '+ '}
                R$ {Math.abs(paymentAdjustment).toFixed(2).replace('.', ',')}
              </span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between font-semibold text-gray-900 text-lg">
          <span>Total</span>
          <span className="text-primary">R$ {calculateTotal().toFixed(2).replace('.', ',')}</span>
        </div>

        {isBelowMinOrder && (
          <div className="flex items-start gap-2 bg-white border border-amber-400 rounded-md px-3 py-2.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Mínimo para entrega: R$ {minOrderValue.toFixed(2).replace('.', ',')}. Faltam R$ {(minOrderValue - effectiveValue).toFixed(2).replace('.', ',')}.
            </p>
          </div>
        )}

        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`w-full py-3.5 rounded-md text-base font-semibold transition-all flex items-center justify-center gap-2 ${
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

        <p className="text-sm text-center text-muted-foreground leading-relaxed">
          Ao finalizar, você concorda com os Termos de Serviço.
        </p>
      </div>
    </div>
  )
}

// ── Componente de cupom ──
interface CouponSectionProps {
  appliedCoupon: any
  couponCode: string
  setCouponCode: (v: string) => void
  couponError: string
  setCouponError: (v: string) => void
  couponLoading: boolean
  handleApplyCoupon: () => void
  handleRemoveCoupon: () => void
}

function CouponSection({
  appliedCoupon, couponCode, setCouponCode, couponError, setCouponError,
  couponLoading, handleApplyCoupon, handleRemoveCoupon
}: CouponSectionProps) {
  return (
    <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
        <Tag className="h-4 w-4 text-primary" />
        <h2 className="font-tomato text-base font-semibold text-gray-900">Cupom de desconto</h2>
      </div>
      <div className="px-5 py-4 space-y-3">
        {appliedCoupon ? (
          <div className="flex items-center justify-between bg-white border border-green-400 rounded-md px-4 py-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div>
                <span className="text-sm font-semibold text-green-700">{appliedCoupon.code}</span>
                <p className="text-sm text-green-600">
                  {appliedCoupon.discount_type === 'percentage'
                    ? `${parseFloat(appliedCoupon.value)}% de desconto`
                    : `R$ ${parseFloat(appliedCoupon.value).toFixed(2).replace('.', ',')} de desconto`}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-green-600 hover:text-red-500 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <Input
                placeholder="Digite o código do cupom"
                value={couponCode}
                onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                className="border-[#E5E2DD] focus:border-primary/40 text-sm uppercase"
                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon() }}
              />
              <Button
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                variant="outline"
                size="sm"
                className="px-4 shrink-0"
              >
                {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aplicar'}
              </Button>
            </div>
            {couponError && (
              <p className="text-sm text-red-500">{couponError}</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
