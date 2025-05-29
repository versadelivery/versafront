// "use client";

// import { Button } from "@/app/components/ui/button";
// import Image from "next/image";
// import Link from "next/link";
// import logoHero from "@/public/img/logo_hero.svg"
// import meat from "@/public/img/meat_img.png"
// import bannerImg from "@/public/img/banner_image.jpg"
// import { Header } from "@/app/components/landing/header";
// import { Footer } from "@/app/components/footer";
// import { CheckCircle, Clock, LayoutGrid } from "lucide-react";



// export default function Home() {

//   const homeFeatures = [
//     {name: "Personalize cada aspecto da plataforma  para atender às necessidades específicas do seu negócio.", icon: <CheckCircle className="w-12 h-12" />},
//     {name: "Interface intuitiva que torna o gerenciamento de pedidos e entregas mais fácil do que nunca.", icon: <LayoutGrid className="w-12 h-12" />},
//     {name: "Acompanhe suas vendas em tempo real e tome decisões baseadas em dados concretos.", icon: <Clock className="w-12 h-12" />},
//   ];

//   return (
//     <main className="min-h-screen bg-black text-white">
//       <Header/>

//       <section id="home" className="relative min-h-[90vh] flex items-center">
//         <div className="absolute inset-0">
//           <Image
//             src={bannerImg}
//             alt="Background"
//             className="w-full h-full object-cover opacity-30 rounded-t-[120px]"
//           />
//         </div>
        
//         <div className="flex flex-col items-center relative max-w-7xl mx-auto px-4 py-20 text-center md:text-left">
//           <div className="flex md:flex-row flex-col items-center justify-center gap-4">
//             <p className="mt-0 md:mt-12 text-start  font-semibold text-primary text-lg w-full md:w-2/6">
//               FLEXÍVEL COMO<br />
//               SEU NEGÓCIO PEDE
//             </p>

//             <div className="my-8">
//             <Image 
//               src={logoHero} 
//               alt="Versa Delivery" 
//               className="w-[70vw] md:w-[40vw]"
//               width={500}
//               height={200}
//             />
//             </div>
            
//             <p className="mt-0 md:mt-12 text-end  font-semibold text-primary text-lg w-full md:w-2/6">
//               TUDO NO SEU CONTROLE
//             </p>
//           </div>

//           <div className="mt-8">
//             <Link href="/login">
//               <Button className="rounded-none cursor-pointer bg-transparent  border-2 border-white text-white hover:bg-white hover:text-black text-lg px-8 py-6">
//                 ASSINE AGORA
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </section>

//       <section id="sobre" className="bg-white text-black py-20">
//         <div className="max-w-10/12 mx-auto px-4">
//           <div className="grid md:grid-cols-2 gap-12 items-start">
//             <div>
//               <div className="inline-block">
//                 <div className="flex flex-col items-start">
//                   <p className="bg-transparent font-bold text-xl md:text-3xl">O QUE É O</p>
//                   <h2 className="bg-emerald-600 font-black text-2xl md:text-5xl text-background">
//                     VERSA DELIVERY?
//                   </h2>
//                 </div>
//               </div>

//               <div className="inline-block">
//                 <div className=" flex flex-col items-start mt-8">
//                   <p className="bg-transparent text-black font-bold text-lg md:text-3xl text-justify">A PLATAFORMA QUE SE ADAPTA AO</p>
//                   <h3 className="text-lg md:text-3xl font-bold bg-black text-white inline-block ">
//                     SEU JEITO DE VENDER.
//                   </h3>
//                 </div>
//               </div>

//               <p className="font-regular mt-8 text-lg">
//                 O <b>VERSA DELIVERY</b> É A PLATAFORMA FLEXÍVEL
//                 QUE PERMITE AO SEU CLIENTE ESCOLHER EXATAMENTE
//                 COMO QUER RECEBER O PEDIDO — <b>DESDE O PESO IDEAL
//                 DO PRODUTO ATÉ A FORMA DE ENTREGA.</b>
//               </p>

//               <p className="mt-12 font-bold text-lg">
//                 SIMPLES, DIRETO E COM TOTAL CONTROLE NAS SUAS MÃOS.
//               </p>
//               <p className="text-lg">
//                 VOCÊ VENDE COMO QUISER, E SEU CLIENTE COMPRA COMO PRECISA.
//               </p>
//             </div>

//             <div className="relative flex justify-end">
//               <Image
//                 src={meat}
//                 alt="Meat cuts"
//                 className="rounded-lg w-full max-w-[300px] md:max-w-[400px] lg:max-w-[500px]"
//                 width={500}
//                 height={300}
//               />
//             </div>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8 mt-20 px-4">
//             {homeFeatures.map((text, index) => (
//               <div key={index} className="flex flex-col items-center uppercase text-center">
//                 <div className="w-12 h-12 p-2 bg-primary rounded-full mb-4 flex items-center justify-center text-white text-2xl">
//                   {text.icon}
//                 </div>
//                 <p className="w-2/3 text-sm font-semibold text-center px-4 text-black text-lg">
//                   {text.name}
//                 </p>
//               </div>
//             ))}
//           </div>

//           <div className="text-center mt-16">
//             <Link href="/login">
//               <Button className="cursor-pointer rounded-none bg-primary text-white hover:bg-primary/80 text-lg p-4 py-8">
//                 TESTE GRATUITAMENTE
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </section>

//       <Footer/>
//     </main>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import Header from "@/app/landing/header";
import Hero from "@/app/landing/hero";
import Features from "@/app/landing/features";
import About from "@/app/landing/about";
import FAQ from "@/app/landing/FAQ";
import CallToAction from "@/app/landing/call-to-action";
import Footer from "@/app/landing/footer";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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