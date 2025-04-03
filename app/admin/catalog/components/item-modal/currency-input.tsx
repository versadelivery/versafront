import React, { forwardRef, useCallback, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface CurrencyInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');

    // Atualiza o valor de exibição quando o value externo muda
    useEffect(() => {
      const numericValue = value.replace('.', ',');
      setDisplayValue(formatDisplay(numericValue));
    }, [value]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value;
        
        // Remove o R$ e espaços
        input = input.replace('R$', '').trim();
        
        // Remove tudo que não é número ou vírgula
        input = input.replace(/[^\d,]/g, '');
        
        // Garante que há no máximo uma vírgula
        const hasComma = input.includes(',');
        input = input.replace(/,/g, '');
        if (hasComma) {
          input = input.replace(/(\d{0,2})$/, ',$1');
        }
        
        // Remove zeros à esquerda
        input = input.replace(/^0+/, '') || '0';
        
        // Se não tem vírgula, assume centavos 00
        if (!input.includes(',')) {
          input = input + ',00';
        }
        
        // Se tem vírgula mas não tem 2 dígitos depois
        const [integer, decimal = ''] = input.split(',');
        const formattedDecimal = decimal.padEnd(2, '0').slice(0, 2);
        const formattedValue = `${integer},${formattedDecimal}`;
        
        // Atualiza o valor de exibição
        setDisplayValue(`R$ ${formattedValue}`);
        
        // Envia o valor formatado (com ponto para decimais)
        onChange(formattedValue.replace(',', '.'));
      },
      [onChange]
    );

    const formatDisplay = (val: string): string => {
      if (!val) return 'R$ 0,00';
      
      // Garante o formato correto
      const [integer, decimal = '00'] = val.split(',');
      return `R$ ${integer || '0'},${decimal.slice(0, 2).padEnd(2, '0')}`;
    };

    const handleBlur = useCallback(() => {
      // Garante o formato padrão ao sair do campo
      const [integer, decimal = '00'] = value.split('.');
      const formattedValue = `R$ ${integer || '0'},${decimal.slice(0, 2).padEnd(2, '0')}`;
      setDisplayValue(formattedValue);
    }, [value]);

    return (
      <Input
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={(e) => {
          // Seleciona todo o texto ao focar para facilitar a edição
          e.target.select();
        }}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';