"use client";

import Header from "@/components/landing/header";
import Hero from "@/components/landing/hero";
import About from "@/components/landing/about";
import Features from "@/components/landing/features";
import FAQ from "@/components/landing/FAQ";
import CallToAction from "@/components/landing/call-to-action";
import Footer from "@/components/landing/footer";

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