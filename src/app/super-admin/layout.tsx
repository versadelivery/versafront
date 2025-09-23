"use client";

import { SuperAdminHeader } from "@/components/super-admin/header";
import { Footer } from "@/components/footer";
import ProtectedSuperAdminRoute from "@/components/protected-super-admin-route";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedSuperAdminRoute>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <SuperAdminHeader />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </ProtectedSuperAdminRoute>
  );
}