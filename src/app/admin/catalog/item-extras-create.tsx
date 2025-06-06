import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Loader2 } from "lucide-react"
import { useDestroyItems } from "./useCatalogGroup"
import { useState, useEffect } from "react"

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
  const [extraId, setExtraId] = useState<string | null>(null)
  const { destroyExtra, isDestroyingExtra } = useDestroyItems(extraId || '', itemId || '', '')

  useEffect(() => {
    if (extraId) {
      destroyExtra()
    }
  }, [extraId])

  const handlePriceChange = (index: number, value: string) => {
    const numValue = parseFloat(value.replace(/\D/g, '')) / 100 || 0
    onExtraChange(index, 'price', numValue)
  }

  const formatPrice = (price: number | undefined | null) => {
    if (!price && price !== 0) {
      return '0,00';
    }
    return price.toFixed(2).replace('.', ',');
  }

  return (
    <div className="space-y-3">
      {extras.map((extra, index) => (
        <div key={index} className="flex gap-4 items-center py-2">
          <div className="flex-1 flex gap-4 items-center">
            <Input
              placeholder="Ex: Molho cheddar"
              value={extra.name}
              onChange={(e) => onExtraChange(index, 'name', e.target.value)}
              className="h-12 border border-black/30"
              required
            />
            <div className="relative w-36">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">R$</span>
              <Input
                placeholder="0,00"
                value={formatPrice(extra.price)}
                onChange={(e) => handlePriceChange(index, e.target.value)}
                className="pl-10 h-12 border border-black/30"
                required
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setExtraId(extra.id)
              console.log("item deletado:", extra.id)
              extras.length > 1 && onRemoveExtra(index)
            }}
            className="text-red-500 hover:bg-black/10 p-2 rounded cursor-pointer"
            disabled={extras.length <= 1 || isDestroyingExtra}
          >
            {isDestroyingExtra ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </button>
        </div>
      ))}
      <Button type="button" onClick={onAddExtra} variant="outline" className="w-full">
        Adicionar novo adicional
      </Button>
    </div>
  )
}