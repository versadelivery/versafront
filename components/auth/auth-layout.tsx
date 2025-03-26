"use client";

import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import Image, { StaticImageData } from "next/image";
import logoGreen from "@/public/img/logo_green.svg";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  imageSrc: string | StaticImageData;
  imagePosition?: "left" | "right";
}

export function AuthLayout({
  children,
  title,
  imageSrc,
  imagePosition = "right"
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[#f5f5f5] overflow-x-hidden">
      <Header alwaysOpaque={true} />

      <div className={`max-w-7xl min-h-screen mx-auto px-4 pt-24 pb-48 flex relative ${imagePosition === "right" ? "lg:justify-start justify-center" : "justify-center"}`}>
        {imagePosition === "left" && (
          <div className="hidden lg:block md:w-1/2 absolute lg:-left-60 -left-30 top-1/2 transform -translate-y-1/2">
            <Image
              src={imageSrc}
              width={800}
              alt="Grocery basket"
              className="rounded-lg object-cover"
            />
          </div>
        )}

        <div className={`w-full md:w-1/2 flex flex-col justify-center ${imagePosition === "right" ? "lg:mx-0 mx-8 lg:pl-24 pl-0" : "lg:ml-auto lg:mr-0 mx-8"}`}>
          <div className="mb-12">
            <Image src={logoGreen} width={400} alt="Versa Delivery" className="w-[60vw]" />
            <p className="font-antarctican-mono text-foreground/40 text-lg font-bold md:-mt-4 -mt-2 md:ml-2 ml-0">{title}</p>
          </div>

          {children}
        </div>

        {imagePosition === "right" && (
          <div className="hidden lg:block md:w-1/2 absolute -right-40 top-1/2 transform -translate-y-1/2">
            <Image 
              src={imageSrc}
              width={900}
              alt="Grocery basket"
              className="rounded-lg object-cover"
            />
          </div>
        )}
      </div>

      <Footer/>
    </main>
  );
}