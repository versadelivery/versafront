"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import logoHero from "@/public/img/logo_hero.svg"
import meat from "@/public/img/meat_img.png"
import bannerImg from "@/public/img/banner_image.jpg"
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/footer";

export default function Home() {

  return (
    <main className="min-h-screen bg-black text-white">
      <Header/>

      <section id="home" className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <Image
            src={bannerImg}
            alt="Background"
            className="w-full h-full object-cover opacity-30 rounded-t-[120px]"
          />
        </div>
        
        <div className="flex flex-col items-center relative max-w-7xl mx-auto px-4 py-20 text-center md:text-left">
          <div className="flex md:flex-row flex-col items-center justify-center gap-4">
            <p className="mt-0 md:mt-12 text-start font-antarctican-mono font-semibold text-primary text-lg w-full md:w-2/6">
              FLEXÍVEL COMO<br />
              SEU NEGÓCIO PEDE
            </p>

            <div className="my-8">
            <Image 
              src={logoHero} 
              alt="Versa Delivery" 
              className="w-[70vw] md:w-[40vw]"
              width={500}
              height={200}
            />
            </div>
            
            <p className="mt-0 md:mt-12 text-end font-antarctican-mono font-semibold text-primary text-lg w-full md:w-2/6">
              TUDO NO SEU CONTROLE
            </p>
          </div>

          <div className="mt-8">
            <Link href="/login">
              <Button className="rounded-none cursor-pointer bg-transparent font-antarctican-mono border-2 border-white text-white hover:bg-white hover:text-black text-lg px-8 py-6">
                ASSINE AGORA
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="sobre" className="bg-white text-black py-20">
        <div className="max-w-10/12 mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <div className="inline-block">
                <div className="flex flex-col items-start">
                  <p className="bg-transparent font-bold text-xl md:text-3xl">O QUE É O</p>
                  <h2 className="bg-emerald-600 font-black text-2xl md:text-5xl text-background">
                    VERSA DELIVERY?
                  </h2>
                </div>
              </div>

              <div className="inline-block">
                <div className="font-antarctican-mono flex flex-col items-start mt-8">
                  <p className="bg-transparent text-black font-bold text-lg md:text-3xl text-justify">A PLATAFORMA QUE SE ADAPTA AO</p>
                  <h3 className="text-lg md:text-3xl font-bold bg-black text-white inline-block ">
                    SEU JEITO DE VENDER.
                  </h3>
                </div>
              </div>

              <p className="font-regular mt-8 text-lg">
                O <b>VERSA DELIVERY</b> É A PLATAFORMA FLEXÍVEL
                QUE PERMITE AO SEU CLIENTE ESCOLHER EXATAMENTE
                COMO QUER RECEBER O PEDIDO — <b>DESDE O PESO IDEAL
                DO PRODUTO ATÉ A FORMA DE ENTREGA.</b>
              </p>

              <p className="mt-12 font-bold text-lg">
                SIMPLES, DIRETO E COM TOTAL CONTROLE NAS SUAS MÃOS.
              </p>
              <p className="text-lg">
                VOCÊ VENDE COMO QUISER, E SEU CLIENTE COMPRA COMO PRECISA.
              </p>
            </div>

            <div className="relative flex justify-end">
              <Image
                src={meat}
                alt="Meat cuts"
                className="rounded-lg w-full max-w-[300px] md:max-w-[400px] lg:max-w-[500px]"
                width={500}
                height={300}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20 px-4">
            {[
              "Personalize cada aspecto da plataforma  para atender às necessidades específicas do seu negócio.",
              "Interface intuitiva que torna o gerenciamento de pedidos e entregas mais fácil do que nunca.",
              "Acompanhe suas vendas em tempo real e tome decisões baseadas em dados concretos."
            ].map((text, index) => (
              <div key={index} className="flex flex-col items-center uppercase">
                <div className="w-16 h-16 bg-emerald-600 rounded-lg mb-4"></div>
                <p className="w-2/3 text-sm font-medium text-center px-4">
                  {text}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link href="/login">
              <Button className="cursor-pointer rounded-none bg-emerald-600 text-white hover:bg-emerald-700 text-lg p-4 py-8">
                TESTE GRATUITAMENTE
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer/>
    </main>
  );
}