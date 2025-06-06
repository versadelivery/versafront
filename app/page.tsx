"use client";

import Header from "@/app/components/landing/header";
import Hero from "@/app/components/landing/hero";
import Features from "@/app/components/landing/features";
import About from "@/app/components/landing/about";
import FAQ from "@/app/components/landing/FAQ";
import CallToAction from "@/app/components/landing/call-to-action";
import Footer from "@/app/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-b from-black to-zinc-900 text-white">
      <Header />
      <Hero />
      <About />
      <Features />
      <FAQ />
      <CallToAction />
      <Footer />
    </main>
  );
}