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
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}