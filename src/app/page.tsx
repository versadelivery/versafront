import Header from "@/components/landing/header";
import Hero from "@/components/landing/hero";
import About from "@/components/landing/about";
import HowItWorks from "@/components/landing/how-it-works";
import Features from "@/components/landing/features";
import Identity from "@/components/landing/identity";
import Pricing from "@/components/landing/pricing";
import SuccessCases from "@/components/landing/success-cases";
import Referral from "@/components/landing/referral";
import FAQ from "@/components/landing/FAQ";
import CallToAction from "@/components/landing/call-to-action";
import Footer from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFFDF6]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "VersaDelivery",
          url: "https://www.versadelivery.com.br/",
        }) }}
      />
      <Header />
      <Hero />
      <About />
      <HowItWorks />
      <Features />
      <Identity />
      <Pricing />
      <SuccessCases />
      <Referral />
      <FAQ />
      <CallToAction />
      <Footer />
    </main>
  );
}
