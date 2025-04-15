"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedWeight, setSelectedWeight] = useState<number | null>(null)
  const [selectedExtras, setSelectedExtras] = useState<{id: string; name: string; price: number}[]>([])
  const [selectedPrepareMethod, setSelectedPrepareMethod] = useState<string | null>(null)
  const [selectedSteps, setSelectedSteps] = useState<Record<string, string>>({})
  const [validationError, setValidationError] = useState<string | null>(null)

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0)
      setSelectedWeight(null)
      setSelectedExtras([])
      setSelectedPrepareMethod(null)
      setSelectedSteps({})
      setValidationError(null)
    }
  }, [isOpen])

  const weightOptions = () => {
    if (!['kg', 'g'].includes(product.attributes.unit_of_measurement) || 
        !product.attributes.measure_interval) return []
    
    const interval = parseFloat(product.attributes.measure_interval)
    const min = parseFloat(product.attributes.min_weight || '0')
    const max = parseFloat(product.attributes.max_weight || '0')
    
    const options = []
    for (let weight = min; weight <= max; weight += interval) {
      options.push(weight)
    }
    return options
  }

  const calculateTotalPrice = () => {
    let total = product.attributes.price_with_discount 
      ? parseFloat(product.attributes.price_with_discount)
      : parseFloat(product.attributes.price);
    
    if (selectedWeight && ['kg', 'g'].includes(product.attributes.unit_of_measurement)) {
      total = total * selectedWeight
    }
    
    selectedExtras.forEach(extra => {
      total += extra.price
    })
    
    return total.toFixed(2)
  }

  const validateCurrentStep = () => {
    setValidationError(null)
    
    const stepType = getCurrentStepType(currentStep)
    
    if (typeof stepType === 'object' && stepType.type === 'step') {
      if (!selectedSteps[stepType.data.id]) {
        setValidationError('Por favor, selecione uma opção')
        return false
      }
    } else {
      switch(stepType) {
        case 'weight':
          if (!selectedWeight) {
            setValidationError('Por favor, selecione um peso')
            return false
          }
          break
        case 'prepare_method':
          if (!selectedPrepareMethod) {
            setValidationError('Por favor, selecione um método de preparo')
            return false
          }
          break
      }
    }
    
    return true
  }

  const handleNext = () => {
    if (!validateCurrentStep()) return

    if (currentStep < totalSteps() - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onAddToCart({
        weight: selectedWeight || undefined,
        extras: selectedExtras.length > 0 ? selectedExtras : undefined,
        prepareMethod: selectedPrepareMethod || undefined,
        steps: Object.keys(selectedSteps).length > 0 ? selectedSteps : undefined
      })
      onClose()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      onClose()
    }
  }

  const hasWeightSelection = ['kg', 'g'].includes(product.attributes.unit_of_measurement) && 
                           product.attributes.measure_interval
  const hasExtras = product.attributes.extra?.data?.length
  const hasPrepareMethod = product.attributes.prepare_method?.data?.length
  const hasSteps = product.attributes.steps?.data?.length

  const totalSteps = () => {
    let steps = 0
    if (hasWeightSelection) steps++
    if (hasExtras) steps++
    if (hasPrepareMethod) steps++
    if (hasSteps) steps += product.attributes.steps.data.length
    return Math.max(steps, 1)
  }

  const getCurrentStepType = (stepIndex: number) => {
    let stepsProcessed = 0

    if (hasWeightSelection) {
      if (stepIndex === stepsProcessed) return 'weight'
      stepsProcessed++
    }

    if (hasExtras) {
      if (stepIndex === stepsProcessed) return 'extras'
      stepsProcessed++
    }

    if (hasPrepareMethod) {
      if (stepIndex === stepsProcessed) return 'prepare_method'
      stepsProcessed++
    }

    if (hasSteps) {
      const stepData = product.attributes.steps.data[stepIndex - stepsProcessed]
      if (stepData) return { type: 'step', data: stepData }
    }

    return 'confirmation'
  }

  const renderStep = () => {
    const stepType = getCurrentStepType(currentStep)

    if (typeof stepType === 'object' && stepType.type === 'step') {
      const stepData = stepType.data
      return (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">{stepData.attributes.name}</h3>
          <p className="text-sm text-gray-500 mb-4">{stepData.attributes.description}</p>
          <RadioGroup
            value={selectedSteps[stepData.id] || ''}
            onValueChange={(value) => {
              setSelectedSteps({
                ...selectedSteps,
                [stepData.id]: value
              })
            }}
            className="space-y-3"
          >
            {stepData.attributes.options.data.map((option: any) => (
              <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <span>{option.attributes.name}</span>
                    {option.attributes.price > 0 && (
                      <Badge variant="secondary">+ R$ {option.attributes.price}</Badge>
                    )}
                  </div>
                  {option.attributes.description && (
                    <p className="text-sm text-gray-500 mt-1">{option.attributes.description}</p>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )
    }

    switch(stepType) {
      case 'weight':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Selecione a quantidade</h3>
            <p className="text-sm text-gray-500 mb-4">
              Escolha o peso desejado para o produto
            </p>
            <Select 
              value={selectedWeight?.toString() || ''}
              onValueChange={(value) => setSelectedWeight(parseFloat(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`Selecione o peso (${product.attributes.unit_of_measurement})`} />
              </SelectTrigger>
              <SelectContent>
                {weightOptions().map((weight) => (
                  <SelectItem key={weight} value={weight.toString()}>
                    {weight} {product.attributes.unit_of_measurement} - R$ {(parseFloat(product.attributes.price) * weight).toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      
      case 'extras':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Adicionais</h3>
            <p className="text-sm text-gray-500 mb-4">
              Selecione os adicionais que deseja incluir no seu pedido
            </p>
            <div className="space-y-3">
              {product.attributes.extra.data.map((extra: any) => (
                <div key={extra.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox
                    id={`extra-${extra.id}`}
                    checked={selectedExtras.some(e => e.id === extra.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedExtras([...selectedExtras, {
                          id: extra.id,
                          name: extra.attributes.name,
                          price: parseFloat(extra.attributes.price)
                        }])
                      } else {
                        setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id))
                      }
                    }}
                  />
                  <Label htmlFor={`extra-${extra.id}`} className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <span>{extra.attributes.name}</span>
                      <Badge variant="secondary">+ R$ {extra.attributes.price}</Badge>
                    </div>
                    {extra.attributes.description && (
                      <p className="text-sm text-gray-500 mt-1">{extra.attributes.description}</p>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'prepare_method':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Modo de preparo</h3>
            <p className="text-sm text-gray-500 mb-4">
              Escolha como deseja que seu produto seja preparado
            </p>
            <RadioGroup
              value={selectedPrepareMethod || ''}
              onValueChange={setSelectedPrepareMethod}
              className="space-y-3"
            >
              {product.attributes.prepare_method.data.map((method: any) => (
                <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value={method.id} id={`method-${method.id}`} />
                  <Label htmlFor={`method-${method.id}`} className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <span>{method.attributes.name}</span>
                      {method.attributes.price > 0 && (
                        <Badge variant="secondary">+ R$ {method.attributes.price}</Badge>
                      )}
                    </div>
                    {method.attributes.description && (
                      <p className="text-sm text-gray-500 mt-1">{method.attributes.description}</p>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )
      
      case 'confirmation':
      default:
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Resumo do pedido</h3>
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Produto:</span>
                <span>{product.attributes.name}</span>
              </div>
              
              {selectedWeight && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Quantidade:</span>
                  <span>
                    {selectedWeight} {product.attributes.unit_of_measurement}
                  </span>
                </div>
              )}
              
              {selectedExtras.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Adicionais:</p>
                  <ul className="space-y-2">
                    {selectedExtras.map(extra => (
                      <li key={extra.id} className="flex justify-between items-center">
                        <span>+ {extra.name}</span>
                        <Badge variant="secondary">+ R$ {extra.price.toFixed(2)}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedPrepareMethod && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Preparo:</span>
                  <span>
                    {product.attributes.prepare_method.data.find((m: any) => m.id === selectedPrepareMethod)?.attributes.name}
                  </span>
                </div>
              )}
              
              {Object.keys(selectedSteps).length > 0 && (
                <div>
                  <p className="font-medium mb-2">Opções escolhidas:</p>
                  <ul className="space-y-2">
                    {product.attributes.steps.data.map((step: any) => {
                      const selectedOption = step.attributes.options.data.find(
                        (opt: any) => opt.id === selectedSteps[step.id]
                      )
                      return selectedOption ? (
                        <li key={step.id} className="flex justify-between items-center">
                          <span>{step.attributes.name}:</span>
                          <span>{selectedOption.attributes.name}</span>
                        </li>
                      ) : null
                    })}
                  </ul>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span>R$ {calculateTotalPrice()}</span>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Personalize seu pedido</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] px-4">
          <div className="py-4">
            {validationError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}
            {renderStep()}
          </div>
        </ScrollArea>
        
        <div className="flex flex-col gap-4 px-4">
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalSteps() }).map((_, i) => (
              <div 
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === currentStep ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          
          <div className="flex justify-between gap-3">
            <Button 
              variant="outline" 
              onClick={handleBack}
              className={currentStep === 0 ? "invisible" : ""}
            >
              Voltar
            </Button>
            
            <Button 
              onClick={handleNext}
              className="flex-1"
            >
              {currentStep < totalSteps() - 1 ? 'Próximo' : 'Adicionar ao carrinho'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}