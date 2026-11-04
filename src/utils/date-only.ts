// Colunas `date` da API chegam como "YYYY-MM-DD". new Date("YYYY-MM-DD") é UTC e, no Brasil (UTC-3),
// toLocaleDateString mostra o dia anterior. Aqui a data é montada no fuso local.
export function formatDateOnly(value: string): string {
  const m = /^(d{4})-(d{2})-(d{2})/.exec(value);
  const date = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
  return date.toLocaleDateString('pt-BR');
}
