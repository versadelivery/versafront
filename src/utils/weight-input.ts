// Peso digitado à mão ("1,359" ou "1.359"): até 3 casas decimais, nunca arredondado para menos.
// Devolve null enquanto o texto não é um peso válido (vazio, "1,", letras, zero ou negativo).
export const parseWeightInput = (raw: string): number | null => {
  const text = raw.trim().replace(',', '.')
  if (!/^\d+(\.\d*)?$/.test(text)) return null

  const weight = Math.round(parseFloat(text) * 1000) / 1000
  return Number.isFinite(weight) && weight > 0 ? weight : null
}
