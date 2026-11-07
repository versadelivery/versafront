// Número do endereço guardado em campo próprio. "S/N" marca casa sem número, para a rua
// não carregar número no nome (exportação de clientes, conflito com nome de rua).
export const NO_NUMBER = 'S/N'

export const isNoNumber = (value: string | null | undefined): boolean =>
  /^s\.?\s*\/?\s*n\.?$/i.test((value ?? '').trim())

// Variações digitadas à mão ("sn", "s/n", "S.N.") viram sempre "S/N"
export const normalizeAddressNumber = (value: string | null | undefined): string => {
  const trimmed = (value ?? '').trim()
  return isNoNumber(trimmed) ? NO_NUMBER : trimmed
}

export const hasAddressNumber = (value: string | null | undefined): boolean =>
  normalizeAddressNumber(value) !== ''

// Endereços antigos guardavam "Rua X, 123" inteiro na rua. Separa o número final quando o campo
// próprio está vazio; sem número reconhecível, a rua fica como está.
export const splitStreetNumber = (
  street: string | null | undefined,
  number: string | null | undefined,
): { street: string; number: string } => {
  const baseStreet = (street ?? '').trim()
  if (hasAddressNumber(number)) return { street: baseStreet, number: normalizeAddressNumber(number) }

  const match = baseStreet.match(/^(.*\S)\s*,\s*(\d{1,6}[A-Za-z]?|s\.?\s*\/?\s*n\.?)$/i)
  if (!match) return { street: baseStreet, number: '' }
  return { street: match[1].trim(), number: normalizeAddressNumber(match[2]) }
}
