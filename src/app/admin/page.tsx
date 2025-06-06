"use client";

import ProtectedRoute from "@/components/protected-route";
import { Header } from "@/components/admin/header";
import { AdminBanner } from "@/components/admin/admin-banner";
import { UrlCard } from "@/components/admin/url-card";
import { Footer } from "@/components/footer";
import { AdminDashboardCard } from "@/components/admin/card";
import { dashboardCards } from "./utils";
import bannerImg from "../../../public/img/hero-admin.jpg";
import { useShop } from "@/hooks/use-shop";
export default function AdminDashboard() {
  const { shop, isLoading } = useShop();

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#f5f5f5]">
        <Header />
        <AdminBanner bannerImg={bannerImg}/>
        <div className="max-w-2xl mx-auto px-4 -mt-10 z-20 relative border-none">
          <UrlCard url={`https://versadelivery.com.br/${shop?.slug}`} isLoading={isLoading} />
        </div>
        <div className="max-w-full mx-auto p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardCards.map((card, index) => (
              <div key={index}>
                <AdminDashboardCard {...card} />
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </main>
    </ProtectedRoute>
  );
}