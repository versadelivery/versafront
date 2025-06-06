"use client";

import Header from "@/app/landing/header";
import Hero from "@/app/landing/hero";
import Features from "@/app/landing/features";
import About from "@/app/landing/about";
import FAQ from "@/app/landing/FAQ";
import CallToAction from "@/app/landing/call-to-action";
import Footer from "@/app/landing/footer";

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