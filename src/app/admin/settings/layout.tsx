"use client";

import { Header } from "@/components/admin/header";
import { Footer } from "@/components/footer";
import ProtectedRoute from "@/components/protected-route";

export default function SettingsLayout({
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