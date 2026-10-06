/** Máscara de digitação em reais: "1234" vira "12,34". */
export const formatCurrencyInput = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const number = parseInt(digits, 10) / 100;
  return number.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Máscara de digitação que aceita zero e deixa apagar o campo (vazio = null).
 * `previousDisplay` é o texto que o campo mostrava antes desta digitação e `inputType` o
 * (nativeEvent as InputEvent).inputType: "deleteContentBackward" etc. é apagar; "insertText"/"insertFromPaste"
 * (digitar ou colar por cima de uma seleção, ex. "0") nunca apaga. Sem inputType, cai na comparação de tamanho.
 */
export const parseOptionalCurrencyInput = (raw: string, previousDisplay: string, inputType?: string): number | null => {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  const deleting = inputType ? inputType.startsWith('delete') : raw.length < previousDisplay.length;
  if (deleting && /^0+$/.test(digits)) return null;
  return parseInt(digits, 10) / 100;
};

export const formatCurrencyValue = (value: number): string =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const parseCurrencyInput = (value: string): number => {
  if (!value) return 0;
  return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
};

export const formatPrice = (price: number | null) => {
  if (price === null) return 'Preço não disponível';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
};
