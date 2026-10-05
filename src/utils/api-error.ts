import axios from 'axios';

// Mensagem de erro da API (campo `error`/`message`) para mostrar ao usuário em vez de um texto genérico.
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;
  if (!error.response) return 'Sem conexão com o servidor. Verifique sua internet e tente novamente.';

  const data = error.response.data as { error?: unknown; message?: unknown; errors?: unknown } | undefined;
  const raw = data?.error ?? data?.message ?? data?.errors;
  if (typeof raw === 'string' && raw.trim()) return raw;
  if (Array.isArray(raw) && raw.length > 0) return raw.join('; ');
  if (error.response.status >= 500) return `${fallback} (erro interno do servidor)`;
  return fallback;
}

// Erros por campo ({ promotion_tag: ["..."] }) quando a API informa quais campos falharam.
export function getApiFieldErrors(error: unknown): Record<string, string[]> {
  if (!axios.isAxiosError(error)) return {};
  const fields = (error.response?.data as { fields?: unknown } | undefined)?.fields;
  if (!fields || typeof fields !== 'object') return {};
  return fields as Record<string, string[]>;
}
