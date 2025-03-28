import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface MeasurePriceSectionProps {
  measureType: 'unit' | 'weight';
  setMeasureType: (type: 'unit' | 'weight') => void;
  hasDiscount: boolean;
  setHasDiscount: (value: boolean) => void;
  discountValue: string;
  setDiscountValue: (value: string) => void;
}

export function MeasurePriceSection({
  measureType,
  setMeasureType,
  hasDiscount,
  setHasDiscount,
  discountValue,
  setDiscountValue
}: MeasurePriceSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Label className="text-sm sm:text-md font-bold">TIPO DE MEDIDA</Label>
          <Select 
            value={measureType}
            onValueChange={(value: 'unit' | 'weight') => setMeasureType(value)}
          >
            <SelectTrigger className="mt-2 py-6 text-base bg-white">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unit">Unidade</SelectItem>
              <SelectItem value="weight">Peso</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {measureType === 'weight' && (
          <div>
            <Label className="text-sm sm:text-md font-bold">UNIDADE</Label>
            <Select>
              <SelectTrigger className="mt-2 py-6 text-base">
                <SelectValue placeholder="Kg" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Kg</SelectItem>
                <SelectItem value="g">Gramas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {measureType === 'weight' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-1">
              <Label className="text-sm sm:text-md font-bold">PREÇO</Label>
              <span className="text-xs sm:text-sm text-gray-500">POR KG</span>
            </div>
            <Input 
              placeholder="R$ 0,00" 
              className="mt-2 py-6 text-base"
            />
          </div>

          <div>
            <div className="flex items-center gap-1">
              <Label className="text-sm sm:text-md font-bold">INTERVALO DE MEDIDA</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Intervalo entre medidas disponíveis para venda</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input 
              placeholder="Ex: 10" 
              className="mt-2 py-6 text-base"
            />
          </div>
        </div>
      )}

      {measureType === 'weight' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm sm:text-md font-bold">PESO MÁXIMO</Label>
            <Input 
              placeholder="Ex: 1.2" 
              className="mt-2 py-6 text-base"
            />
          </div>

          <div>
            <Label className="text-sm sm:text-md font-bold">PESO MÍNIMO</Label>
            <Input 
              placeholder="Ex: 0.4" 
              className="mt-2 py-6 text-base"
            />
          </div>
        </div>
      )}

      {measureType === 'unit' && (
        <div>
          <Label className="text-sm sm:text-md font-bold">PREÇO</Label>
          <Input 
            placeholder="R$ 0,00" 
            className="mt-2 py-6 text-base w-full lg:w-1/2"
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap py-12">
        <div className="flex items-center gap-3">
          <Label className="text-sm sm:text-md font-bold">PRODUTO COM DESCONTO?</Label>
          <Switch 
            checked={hasDiscount}
            onCheckedChange={setHasDiscount}
            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-200"
          />
        </div>
        {hasDiscount && (
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Label className="text-sm sm:text-md font-bold whitespace-nowrap">VALOR DO DESCONTO</Label>
            <Input 
              placeholder="R$ 0,00" 
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="py-6 text-base"
            />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-1">
          <Label className="text-sm sm:text-md font-bold">PRIORIDADE DENTRO DO GRUPO</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Define a ordem de exibição do item dentro do grupo</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Input 
          placeholder="2" 
          className="mt-2 py-6 text-base w-full lg:w-1/2"
        />
      </div>
    </div>
  );
}