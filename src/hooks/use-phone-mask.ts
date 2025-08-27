import { useState } from 'react';

export function usePhoneMask() {
  const formatPhone = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara baseada na quantidade de dígitos
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    } else {
      // Limita a 11 dígitos
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (value: string, onChange: (value: string) => void) => {
    const formattedValue = formatPhone(value);
    onChange(formattedValue);
  };

  const getUnmaskedValue = (maskedValue: string) => {
    return maskedValue.replace(/\D/g, '');
  };

  return {
    formatPhone,
    handlePhoneChange,
    getUnmaskedValue,
  };
}
