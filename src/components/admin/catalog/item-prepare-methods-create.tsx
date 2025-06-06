import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Loader2 } from "lucide-react"
import { useDestroyItems } from "../../../app/admin/catalog/useCatalogGroup"
import { useState, useEffect } from "react"

export interface PrepareMethod {
  name: string
  id?: string
}

interface ItemPrepareMethodsProps {
  prepareMethods: PrepareMethod[]
  onPrepareMethodChange: (index: number, field: keyof PrepareMethod, value: string) => void
  onRemovePrepareMethod: (index: number) => void
  onAddPrepareMethod: () => void
  itemId?: string
}

export function ItemPrepareMethods({ prepareMethods, onPrepareMethodChange, onRemovePrepareMethod, onAddPrepareMethod, itemId }: ItemPrepareMethodsProps) {
  const [prepareMethodId, setPrepareMethodId] = useState<string | null>(null)
  const { destroyPrepareMethod, isDestroyingPrepareMethod } = useDestroyItems(prepareMethodId || '', itemId || '', '')

  useEffect(() => {
    if (prepareMethodId) {
      destroyPrepareMethod()
    }
  }, [prepareMethodId])

  return (
    <div className="space-y-3">
      {prepareMethods.map((prepareMethod, index) => (
        <div key={index} className="flex gap-4 items-center py-2">
          <div className="flex-1">
            <Input
              placeholder="Ex: Ponto da carne"
              value={prepareMethod.name}
              onChange={(e) => onPrepareMethodChange(index, 'name', e.target.value)}
              className="h-12 border border-black/30"
              required
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setPrepareMethodId(prepareMethod.id || '')
              console.log("item deletado:", prepareMethod.id)
              prepareMethods.length > 1 && onRemovePrepareMethod(index)
            }}
            className="text-red-500 hover:bg-black/10 p-2 rounded cursor-pointer"
            disabled={prepareMethods.length <= 1 || isDestroyingPrepareMethod}
          >
            {isDestroyingPrepareMethod ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </button>
        </div>
      ))}
      <Button type="button" onClick={onAddPrepareMethod} variant="outline" className="w-full">
        Adicionar novo modo de preparo
      </Button>
    </div>
  )
} 