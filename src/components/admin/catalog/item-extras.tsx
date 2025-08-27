import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Loader2, Check, Edit } from "lucide-react"
import { useDestroyItems, useEditStep } from "../../../hooks/useCatalogGroup"
import { useState, useEffect, useCallback, useMemo } from "react"

export interface Extra {
  name: string
  price: number
  id?: any
}

interface ItemExtrasProps {
  extras: Extra[]
  onExtraChange: (index: number, field: keyof Extra, value: string | number) => void
  onRemoveExtra: (index: number) => void
  onAddExtra: () => void
  itemId?: string
}

export function ItemExtras({ extras, onExtraChange, onRemoveExtra, onAddExtra, itemId }: ItemExtrasProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [extraId, setExtraId] = useState<string | null>(null)
  const [extraName, setExtraName] = useState<string | null>(null)
  const [extraPrice, setExtraPrice] = useState<number | null>(null)
  const [changed, setChanged] = useState(false)
  const { destroyExtra, isDestroyingExtra } = useDestroyItems(extraId || '', itemId || '', '')
  const { updateExtra, isUpdatingExtra } = useEditStep({ 
    id: itemId || '', 
    stepId: extraId || '', 
    name: extraName || '',
    price: extraPrice || 0
  })

  const handleEdit = useCallback((index: number) => {
    setEditingIndex(index)
    setExtraName(extras[index].name)
    setExtraPrice(extras[index].price)
    setChanged(false)
  }, [extras])

  const handlePriceChange = useCallback((index: number, value: string) => {
    const numValue = parseFloat(value.replace(/\D/g, '')) / 100 || 0
    if (editingIndex === index) {
      setExtraPrice(numValue)
      setChanged(true)
    }
    onExtraChange(index, 'price', numValue)
  }, [editingIndex, onExtraChange])

  const formatPrice = useCallback((price: number | undefined | null) => {
    if (!price && price !== 0) {
      return '0,00';
    }
    return price.toFixed(2).replace('.', ',');
  }, [])

  const handleUpdateExtra = useCallback((index: number) => {
    if (!changed) return
    updateExtra()
    onExtraChange(index, 'name', extraName || '')
    onExtraChange(index, 'price', extraPrice || 0)
    setEditingIndex(null)
    setChanged(false)
  }, [changed, extraName, extraPrice, onExtraChange, updateExtra])

  const handleRemoveExtra = useCallback((index: number, extraId: string) => {
    setExtraId(extraId)
    destroyExtra()
    extras.length > 1 && onRemoveExtra(index)
  }, [destroyExtra, extras.length, onRemoveExtra])

  const renderExtra = useCallback((extra: Extra, index: number) => (
    <div key={index} className="flex gap-4 items-center py-2">
      <div className="flex-1 flex gap-4 items-center">
        <Input
          placeholder="Ex: Molho cheddar"
          value={editingIndex === index ? (extraName as string) : extra.name}
          onChange={(e) => {
            e.preventDefault()
            setChanged(true)
            setExtraId(extra.id || '')
            setExtraName(e.target.value)
          }}
          disabled={editingIndex !== index}
          className="h-12 border border-black/30"
          required
        />
        <div className="relative w-36">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">R$</span>
          <Input
            placeholder="0,00"
            value={formatPrice(editingIndex === index ? (extraPrice as number) : extra.price)}
            onChange={(e) => {
              e.preventDefault()
              handlePriceChange(index, e.target.value)
              setExtraPrice(parseFloat(e.target.value.replace(/\D/g, '')) / 100 || 0)
              setExtraId(extra.id || '')
              setChanged(true)
            }}
            disabled={editingIndex !== index}
            className="pl-10 h-12 border border-black/30"
            required
          />
        </div>
      </div>
      {editingIndex === index ? (
        <Button
          type="button"
          variant="ghost"
          onClick={(e) => {
            e.preventDefault()
            handleUpdateExtra(index)
          }}
          disabled={isUpdatingExtra || !changed}
        >
          {isUpdatingExtra ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Check className="w-5 h-5" />
          )}
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          onClick={(e) => {
            e.preventDefault()
            handleEdit(index)
          }}
        >
          <Edit className="w-5 h-5" />
        </Button>
      )}
      <Button
        type="button"
        className="cursor-pointer bg-transparent text-red-500 hover:text-red-700 hover:bg-black/10 rounded-md p-2"
        onClick={() => handleRemoveExtra(index, extra.id || '')}
      >
        {isDestroyingExtra ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Trash2 className="w-5 h-5" />
        )}
      </Button>
    </div>
  ), [editingIndex, extraName, extraPrice, formatPrice, handleEdit, handlePriceChange, handleRemoveExtra, handleUpdateExtra, isDestroyingExtra, isUpdatingExtra])

  const extrasList = useMemo(() => (
    <div className="space-y-3">
      {extras.map((extra, index) => renderExtra(extra, index))}
      <Button type="button" onClick={onAddExtra} variant="outline" className="w-full">
        Adicionar novo adicional
      </Button>
    </div>
  ), [extras, renderExtra, onAddExtra])

  return extrasList
}