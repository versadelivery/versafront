import type { ScanError } from './parse-barcode.ts'

// Textos mostrados ao operador quando a bipada não vira item. Usados no PDV e na edição do pedido.
export function scanErrorMessage(reason: ScanError, code: string): string {
  switch (reason) {
    case 'not_found':
      return `Código ${code} não cadastrado.`
    case 'invalid_check_digit':
      return 'Etiqueta inválida. Bipe de novo.'
    case 'unknown_scale_code':
      return 'Produto da balança não encontrado. Confira o "Código na balança" no cadastro.'
    case 'zero_weight':
      return 'Etiqueta sem peso. Pese de novo.'
    case 'inactive':
      return 'Item inativo.'
    case 'invalid_price':
      return 'Item sem preço. Corrija no catálogo.'
  }
}
