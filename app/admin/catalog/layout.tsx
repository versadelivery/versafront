"use client";

import { Header } from "@/components/admin/header";
import { Footer } from "@/components/footer";
import ProtectedRoute from "@/components/protected-route";

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-full mx-auto p-6 pt-48">
          {children}
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}