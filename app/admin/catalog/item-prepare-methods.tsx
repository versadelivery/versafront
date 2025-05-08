import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Trash2, Loader2, Check, Edit } from "lucide-react"
import { useDestroyItems, useEditStep } from "./useCatalogGroup"
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
  itemId: string
}

export function ItemPrepareMethods({ itemId, prepareMethods, onPrepareMethodChange, onRemovePrepareMethod, onAddPrepareMethod }: ItemPrepareMethodsProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [prepareMethodId, setPrepareMethodId] = useState<string | null>(null)
  const [prepareMethodName, setPrepareMethodName] = useState<string | null>(null)
  const [changed, setChanged] = useState(false)
  const { destroyPrepareMethod, isDestroyingPrepareMethod } = useDestroyItems(prepareMethodId || '', itemId || '', '')
  const { updatePrepareMethod, isUpdatingPrepareMethod } = useEditStep({ id: itemId || '', stepId: prepareMethodId || '', name: prepareMethodName || '' })

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setPrepareMethodName(prepareMethods[index].name)
    setChanged(false)
  }

  return (
    <div className="space-y-3">
      {prepareMethods.map((prepareMethod, index) => (
        <div key={index} className="flex gap-4 items-center py-2">
          <div className="flex-1">
            <Input
              placeholder="Ex: Ponto da carne"
              value={editingIndex === index ? (prepareMethodName as string) : prepareMethod.name}
              onChange={(e) => {
                e.preventDefault()
                setChanged(true)
                setPrepareMethodId(prepareMethod.id || '')
                setPrepareMethodName(e.target.value)
              }}
              disabled={editingIndex !== index}
              className="h-12 border border-black/30"
              required
            />
          </div>
          {editingIndex === index ? (
            <Button
              type="button"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault()
                if (!changed) return
                updatePrepareMethod()
                console.log({ id: itemId || '', stepId: prepareMethodId || '', name: prepareMethodName || '' })
                onPrepareMethodChange(index, 'name', prepareMethodName || '')
                setEditingIndex(null)
                setChanged(false)
              }}
              disabled={isUpdatingPrepareMethod || !changed}
            >
              {isUpdatingPrepareMethod ? (
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
            onClick={(e) => {
              e.preventDefault()
              setPrepareMethodId(prepareMethod.id || '')
              destroyPrepareMethod()
              console.log("item deletado:", prepareMethod.id)
              prepareMethods.length > 1 && onRemovePrepareMethod(index)
            }}
          >
            {isDestroyingPrepareMethod ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </Button>
        </div>
      ))}
      <Button type="button" onClick={onAddPrepareMethod} variant="outline" className="w-full">
        Adicionar novo modo de preparo
      </Button>
    </div>
  )
} 