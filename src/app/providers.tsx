'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { CartProvider } from '@/contexts/CartContext';
import AudioUnlocker from '@/components/AudioUnlocker';

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <AudioUnlocker />
          {children}
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
