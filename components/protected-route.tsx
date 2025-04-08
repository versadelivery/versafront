"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/app/lib/auth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const token = getToken();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  if (!token) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;