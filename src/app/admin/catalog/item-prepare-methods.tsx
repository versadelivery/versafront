import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Loader2, Check, Edit } from "lucide-react"
import { useDestroyItems, useEditStep } from "./useCatalogGroup"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"

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

  const handleEdit = useCallback((index: number) => {
    setEditingIndex(index)
    setPrepareMethodName(prepareMethods[index].name)
    setChanged(false)
  }, [prepareMethods])

  const handleUpdatePrepareMethod = useCallback((index: number) => {
    if (!changed) return
    updatePrepareMethod()
    onPrepareMethodChange(index, 'name', prepareMethodName || '')
    setEditingIndex(null)
    setChanged(false)
  }, [changed, onPrepareMethodChange, prepareMethodName, updatePrepareMethod])

  const handleRemovePrepareMethod = useCallback((index: number, methodId: string) => {
    setPrepareMethodId(methodId)
    destroyPrepareMethod()
    prepareMethods.length > 1 && onRemovePrepareMethod(index)
  }, [destroyPrepareMethod, onRemovePrepareMethod, prepareMethods.length])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, methodId: string) => {
    e.preventDefault()
    setChanged(true)
    setPrepareMethodId(methodId)
    setPrepareMethodName(e.target.value)
  }, [])

  const renderPrepareMethod = useCallback((prepareMethod: PrepareMethod, index: number) => (
    <div key={index} className="flex gap-4 items-center py-2">
      <div className="flex-1">
        <Input
          placeholder="Ex: Ponto da carne"
          value={editingIndex === index ? (prepareMethodName as string) : prepareMethod.name}
          onChange={(e) => handleInputChange(e, prepareMethod.id || '')}
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
            handleUpdatePrepareMethod(index)
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
          handleRemovePrepareMethod(index, prepareMethod.id || '')
        }}
      >
        {isDestroyingPrepareMethod ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Trash2 className="w-5 h-5" />
        )}
      </Button>
    </div>
  ), [editingIndex, handleEdit, handleInputChange, handleRemovePrepareMethod, handleUpdatePrepareMethod, isDestroyingPrepareMethod, isUpdatingPrepareMethod, prepareMethodName])

  const prepareMethodsList = useMemo(() => (
    <div className="space-y-3">
      {prepareMethods.map((prepareMethod, index) => renderPrepareMethod(prepareMethod, index))}
      <Button type="button" onClick={onAddPrepareMethod} variant="outline" className="w-full">
        Adicionar novo modo de preparo
      </Button>
    </div>
  ), [onAddPrepareMethod, prepareMethods, renderPrepareMethod])

  return prepareMethodsList
} 