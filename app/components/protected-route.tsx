"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/app/lib/auth';
import { Suspense } from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      {children}
    </Suspense>
  );
};

export default ProtectedRoute;