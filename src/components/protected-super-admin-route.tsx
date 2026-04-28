"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSuperAdminToken } from '@/lib/auth';
import { Suspense } from 'react';

const ProtectedSuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getSuperAdminToken();
    setIsAuthenticated(!!token);
    if (!token) {
      router.push('/super-admin/login');
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