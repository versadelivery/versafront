import { isAxiosError } from 'axios';

export const OWNER_EMAIL_TAKEN_MESSAGE = 'Este e-mail já está cadastrado. Entre na conta existente ou use outro e-mail para a nova loja.';

export function getOwnerEmailError(error: unknown): string | null {
  if (!isAxiosError(error)) return null;
  const data = error.response?.data;
  if (data?.code === 'OWNER_EMAIL_TAKEN' ||
      (typeof data?.error === 'string' && data.error.includes('Email has already been taken'))) {
    return OWNER_EMAIL_TAKEN_MESSAGE;
  }
  return null;
}
