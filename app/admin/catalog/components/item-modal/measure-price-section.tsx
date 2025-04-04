import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { useEffect } from "react";
import { CurrencyInput } from "./currency-input";
import { MeasurePriceSectionProps } from "@/app/types/catalog";

export function MeasurePriceSection({
  measureType,
  setMeasureType,
  hasDiscount,
  setHasDiscount,
  register,
  setValue,
  watch,
  errors
}: MeasurePriceSectionProps) {
  const priceValue = watch('price') || '0.00';
  const discountValue = watch('price_with_discount') || '0.00';
  const itemType = watch('item_type');

  useEffect(() => {
    if (itemType && itemType !== measureType) {
      setMeasureType(itemType as 'unit' | 'weight');
    }
  }, [itemType, measureType, setMeasureType]);

  const handleMeasureTypeChange = (value: 'unit' | 'weight') => {
    setValue('item_type', value, { shouldValidate: true });
    setMeasureType(value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Label className="text-sm sm:text-md font-bold">TIPO DE MEDIDA</Label>
          <Select 
            value={measureType}
            onValueChange={handleMeasureTypeChange}
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
            <Select {...register('unit_of_measurement')}>
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
            <CurrencyInput
              value={priceValue}
              onChange={(value) => setValue('price', value, { shouldValidate: true })}
              placeholder="R$ 0,00"
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message as string}</p>}
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
              {...register('measure_interval')}
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
              {...register('max_weight')}
            />
          </div>

          <div>
            <Label className="text-sm sm:text-md font-bold">PESO MÍNIMO</Label>
            <Input 
              placeholder="Ex: 0.4" 
              className="mt-2 py-6 text-base"
              {...register('min_weight')}
            />
          </div>
        </div>
      )}

      {measureType === 'unit' && (
        <div>
          <Label className="text-sm sm:text-md font-bold">PREÇO</Label>
          <CurrencyInput
            value={priceValue}
            onChange={(value) => setValue('price', value, { shouldValidate: true })}
            placeholder="R$ 0,00"
            className="mt-2 py-6 text-base w-full lg:w-1/2"
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message as string}</p>}
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
            <CurrencyInput
              value={discountValue}
              onChange={(value) => setValue('price_with_discount', value)}
              placeholder="R$ 0,00"
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
          {...register('priority', { required: 'Prioridade é obrigatória' })}
        />
        {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority.message as string}</p>}
      </div>
    </div>
  );
}