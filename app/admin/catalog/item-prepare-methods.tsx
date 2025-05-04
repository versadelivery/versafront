import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Trash2 } from "lucide-react"

interface PrepareMethod {
  name: string
}

interface ItemPrepareMethodsProps {
  prepareMethods: PrepareMethod[]
  onPrepareMethodChange: (index: number, field: keyof PrepareMethod, value: string) => void
  onRemovePrepareMethod: (index: number) => void
  onAddPrepareMethod: () => void
}

export function ItemPrepareMethods({ prepareMethods, onPrepareMethodChange, onRemovePrepareMethod, onAddPrepareMethod }: ItemPrepareMethodsProps) {
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
            onClick={() => prepareMethods.length > 1 && onRemovePrepareMethod(index)}
            className="text-red-500 hover:bg-black/10 p-2 rounded"
            disabled={prepareMethods.length <= 1}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}
      <Button type="button" onClick={onAddPrepareMethod} variant="outline" className="w-full">
        Adicionar novo modo de preparo
      </Button>
    </div>
  )
} 