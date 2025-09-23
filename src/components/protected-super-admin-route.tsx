"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import { Suspense } from 'react';

const ProtectedSuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getToken();
    // TODO: Aqui você pode adicionar lógica para verificar se o usuário é super admin
    // Por enquanto, apenas verifica se tem token (pode usar role do usuário)
    setIsAuthenticated(!!token);
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Carregando...</div>
      </div>
    }>
      {children}
    </Suspense>
  );
};

export default ProtectedSuperAdminRoute;