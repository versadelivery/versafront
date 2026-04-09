import { useState } from 'react';

export function usePhoneMask() {
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);

    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      // Fixo: (XX) XXXX-XXXX
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      // Celular: (XX) XXXXX-XXXX
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
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
