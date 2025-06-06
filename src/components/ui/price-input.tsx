import { Input } from "./input"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form"

interface PriceInputProps {
  control: any
  name: string
  label: string
  placeholder?: string
  disabled?: boolean
}

export function PriceInput({ control, name, label, placeholder = "0,00", disabled = false }: PriceInputProps) {
  const handlePriceChange = (value: string) => {
    const numValue = parseFloat(value.replace(/\D/g, '')) / 100 || 0
    return numValue
  }

  const formatPrice = (price: number) => {
    return price.toFixed(2).replace('.', ',')
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-bold text-foreground">
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">R$</span>
              <Input
                placeholder={placeholder}
                value={formatPrice(field.value)}
                onChange={(e) => field.onChange(handlePriceChange(e.target.value))}
                className="pl-10 h-12 border border-black/30"
                disabled={disabled}
                required
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
} 