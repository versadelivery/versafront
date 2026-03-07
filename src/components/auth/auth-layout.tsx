"use client";

import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <main className="min-h-screen flex flex-col bg-[#FFFDF6]">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 pt-28 pb-20">
        <div className="w-full max-w-[440px]">
          <div className="text-center mb-10">
            {/* <Image
              src="/logo/logo-inline-primary.svg"
              alt="Versa Delivery"
              width={180}
              height={48}
              className="mx-auto mb-8"
            /> */}
            <h1 className="font-tomato text-2xl sm:text-3xl font-semibold text-[#1B1B1B] tracking-tight">
              {title}
            </h1>
          </div>

          {children}
        </div>
      </div>

      <Footer />
    </main>
  );
}
