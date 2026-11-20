"use client";

import { Header } from "@/components/admin/header";
import Footer from "@/components/landing/footer";
import { SaveBarProvider } from "@/components/admin/save-bar";
import ProtectedRoute from "@/components/protected-route";

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-1">
          <SaveBarProvider>{children}</SaveBarProvider>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}