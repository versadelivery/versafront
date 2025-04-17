"use client";

import { Header } from "@/app/components/admin/header";
import { Footer } from "@/app/components/footer";
import ProtectedRoute from "@/app/components/protected-route";

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-full mx-auto p-6">
          {children}
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}