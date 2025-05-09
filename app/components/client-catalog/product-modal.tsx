"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog'
import { Button } from '@/app/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Label } from '@/app/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group'
import { ScrollArea } from '@/app/components/ui/scroll-area'
import { Badge } from '@/app/components/ui/badge'
import { AlertCircle, Package, Scale, Plus, ChefHat, ListChecks, ShoppingCart, Info, Clock } from 'lucide-react'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { useAuth } from '@/app/hooks/useClientAuth'
import { AuthModal } from '@/app/components/client-auth/(auth)/auth-modal'
import { Separator } from '@/app/components/ui/separator'
import { Card, CardContent } from '@/app/components/ui/card'
import Image from 'next/image'

interface ProductModalProps {
  product: any
  isOpen: boolean
  onClose: () => void
  onAddToCart: (options: {
    weight?: number
    extras?: { id: string; name: string; price: number }[]
    prepareMethod?: string
    steps?: Record<string, string>
  }) => void
}

export function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const { isAuthenticated } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedWeight, setSelectedWeight] = useState<number | undefined>(undefined)
  const [selectedExtras, setSelectedExtras] = useState<{id: string; name: string; price: number}[]>([])
  const [selectedPrepareMethod, setSelectedPrepareMethod] = useState<string[]>([])
  const [selectedSteps, setSelectedSteps] = useState<Record<string, string>>({})
  const [validationError, setValidationError] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0)
      setSelectedWeight(undefined)
      setSelectedExtras([])
      setSelectedPrepareMethod([])
      setSelectedSteps({})
      setValidationError(null)
      setShowAuthModal(false)
      setShowProductModal(false)
    }
  }, [isOpen])

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    // Validar se há peso selecionado para produtos por peso
    if (['kg', 'g'].includes(product.attributes.unit_of_measurement) && !selectedWeight) {
      setValidationError('Por favor, selecione o peso desejado')
      return
    }

    // Validar se há método de preparo selecionado
    if (product.attributes.prepare_method?.data?.length > 0 && selectedPrepareMethod.length === 0) {
      setValidationError('Por favor, selecione um método de preparo')
      return
    }

    // Validar se todas as etapas foram preenchidas
    if (product.attributes.steps?.data?.length > 0) {
      const allStepsFilled = product.attributes.steps.data.every((step: any) => 
        selectedSteps[step.id]
      )
      if (!allStepsFilled) {
        setValidationError('Por favor, complete todas as etapas de personalização')
        return
      }
    }

    onAddToCart({
      weight: selectedWeight,
      extras: selectedExtras,
      prepareMethod: selectedPrepareMethod[0],
      steps: selectedSteps
    })
    onClose()
  }

  const renderProductDetails = () => {
    return (
      <div className="space-y-6">
        {product.attributes.image_url && (
          <div className="relative h-64 w-full rounded-lg overflow-hidden">
            <Image
              src={product.attributes.image_url}
              alt={product.attributes.name}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Informações Básicas */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{product.attributes.name}</h3>
            {product.attributes.description && (
              <p className="text-gray-600 mt-2 flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {product.attributes.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Preço</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  R$ {product.attributes.price.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {['kg', 'g'].includes(product.attributes.unit_of_measurement) && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700 flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Peso
                </h4>
                <div className="space-y-1">
                  {product.attributes.min_weight && product.attributes.max_weight && (
                    <p className="text-gray-600">
                      {product.attributes.min_weight} - {product.attributes.max_weight} {product.attributes.unit_of_measurement}
                    </p>
                  )}
                  {product.attributes.measure_interval && (
                    <p className="text-gray-600 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Intervalo: {product.attributes.measure_interval} {product.attributes.unit_of_measurement}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seleção de Peso */}
        {['kg', 'g'].includes(product.attributes.unit_of_measurement) && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Selecione o Peso
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={product.attributes.min_weight}
                max={product.attributes.max_weight}
                step={product.attributes.measure_interval}
                value={selectedWeight || ''}
                onChange={(e) => setSelectedWeight(Number(e.target.value))}
                className="w-32 px-3 py-2 border rounded-md"
              />
              <span className="text-gray-600">{product.attributes.unit_of_measurement}</span>
            </div>
          </div>
        )}

        {/* Adicionais */}
        {product.attributes.extra?.data?.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionais Disponíveis
            </h4>
            <ul className="grid grid-cols-2 gap-2">
              {product.attributes.extra.data.map((extra: any) => (
                <li key={extra.id} className="text-gray-600 bg-gray-50 p-2 rounded-md flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`extra-${extra.id}`}
                      checked={selectedExtras.some(e => e.id === extra.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedExtras([...selectedExtras, {
                            id: extra.id,
                            name: extra.attributes.name,
                            price: extra.attributes.price
                          }])
                        } else {
                          setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id))
                        }
                      }}
                    />
                    <div>
                      <span className="font-medium">{extra.attributes.name}</span>
                      {extra.attributes.description && (
                        <p className="text-sm text-muted-foreground">{extra.attributes.description}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary">+ R$ {extra.attributes.price}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Métodos de Preparo */}
        {product.attributes.prepare_method?.data?.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              Métodos de Preparo
            </h4>
            <RadioGroup
              value={selectedPrepareMethod[0]}
              onValueChange={(value) => setSelectedPrepareMethod([value])}
              className="grid grid-cols-2 gap-2"
            >
              {product.attributes.prepare_method.data.map((method: any) => (
                <div key={method.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={method.id} id={`method-${method.id}`} />
                  <Label htmlFor={`method-${method.id}`} className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{method.attributes.name}</span>
                        {method.attributes.description && (
                          <p className="text-sm text-muted-foreground">{method.attributes.description}</p>
                        )}
                      </div>
                      {method.attributes.price > 0 && (
                        <Badge variant="secondary">+ R$ {method.attributes.price}</Badge>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {/* Etapas de Personalização */}
        {product.attributes.steps?.data?.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Opções de Personalização
            </h4>
            <ol className="space-y-2">
              {product.attributes.steps.data.map((step: any) => (
                <li key={step.id} className="text-gray-600 bg-gray-50 p-2 rounded-md">
                  <div className="font-medium">{step.attributes.name}</div>
                  {step.attributes.description && (
                    <p className="text-sm text-muted-foreground">{step.attributes.description}</p>
                  )}
                  <RadioGroup
                    value={selectedSteps[step.id]}
                    onValueChange={(value) => setSelectedSteps({ ...selectedSteps, [step.id]: value })}
                    className="space-y-2 mt-2"
                  >
                    {step.attributes.options.data.map((option: any) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                        <Label htmlFor={`option-${option.id}`} className="flex-1">
                          <div className="flex justify-between items-center">
                            <span>{option.attributes.name}</span>
                            {option.attributes.price > 0 && (
                              <Badge variant="secondary">+ R$ {option.attributes.price}</Badge>
                            )}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </li>
              ))}
            </ol>
          </div>
        )}

        {validationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        <Separator />

        {/* Botão de Adicionar ao Carrinho */}
        <div className="flex justify-center">
          <Button 
            size="lg" 
            className="w-full max-w-md"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Adicionar ao Carrinho
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="rounded-xs sm:h-auto max-w-[95vw] sm:max-w-[720px] p-4 sm:p-6 md:p-8 bg-white rounded-sm max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#212121] [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar]:px-2">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Detalhes do Produto
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {renderProductDetails()}
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => {
          setShowAuthModal(false)
          if (!isAuthenticated) {
            onClose()
          }
        }} 
      />
    </>
  )
}