"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Menu } from "lucide-react";
import Image from "next/image";
import logoHero from "@/public/img/logo_hero.svg"
import logoHeader from "@/public/img/logo.svg"
import meat from "@/public/img/meat_img.png"
import bannerImg from "@/public/img/banner_image.jpg"

export default function Home() {

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="fixed w-full z-50 bg-black/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex justify-start">
            <Image src={logoHeader} alt="Versa" width={120} />
          </div>

          <div className="font-antarctican-mono hidden md:flex justify-center gap-8">
            <a href="#" className="text-white hover:text-gray-300">HOME</a>
            <a href="#" className="text-white hover:text-gray-300">SOBRE</a>
          </div>

          <div className="flex justify-end items-center gap-4">
            <div className="hidden md:block">
              <Button variant="outline" className="rounded-none font-antarctican-mono bg-transparent border-white text-white hover:bg-white hover:text-black">
                ASSINE AGORA
              </Button>
            </div>
            
            <Drawer direction="right">
              <DrawerTrigger asChild>
                <button className="md:hidden text-white mr-8">
                  <Menu />
                </button>
              </DrawerTrigger>
              <DrawerContent className="h-full top-0 right-0 left-auto mt-0 w-[300px] rounded-none bg-black/95 border-l border-gray-800">
                <div className="flex flex-col h-full p-6">
                  <DrawerHeader className="px-0 pt-0">
                    <DrawerTitle className="text-white text-2xl">Menu</DrawerTitle>
                  </DrawerHeader>
                  
                  <div className="flex-1 flex flex-col gap-6 mt-8">
                    <DrawerClose asChild>
                      <a 
                        href="#" 
                        className="text-white hover:text-gray-300 text-lg font-medium transition-colors py-2"
                      >
                        HOME
                      </a>
                    </DrawerClose>
                    
                    <DrawerClose asChild>
                      <a 
                        href="#" 
                        className="text-white hover:text-gray-300 text-lg font-medium transition-colors py-2"
                      >
                        SOBRE
                      </a>
                    </DrawerClose>
                  </div>
                  
                  <DrawerFooter className="px-0 pb-0">
                    <DrawerClose asChild>
                      <Button 
                        variant="outline" 
                        className="rounded-none bg-transparent border-white text-white hover:bg-white hover:text-black w-full py-6 text-lg mt-4"
                      >
                        ASSINE AGORA
                      </Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </nav>

      <section className="relative min-h-[90vh] flex items-center">
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
              className="w-[70vw] md:w-[40vw] "
              width={500}
              height={200}
            />
            </div>
            
            <p className="mt-0 md:mt-12 text-end font-antarctican-mono font-semibold text-primary text-lg w-full md:w-2/6">
              TUDO NO SEU CONTROLE
            </p>
          </div>

          <div className="mt-8">
            <Button className="rounded-none cursor-pointer bg-transparent font-antarctican-mono border-2 border-white text-white hover:bg-white hover:text-black text-lg px-8 py-6">
              ASSINE AGORA
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-white text-black py-20">
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
            <Button className="rounded-none bg-emerald-600 text-white hover:bg-emerald-700 text-lg p-4 py-8">
              TESTE GRATUITAMENTE
            </Button>
          </div>
        </div>
      </section>

      <footer className="font-antarctican-mono bg-foreground text-white py-8 text-center text-sm">
        <p>VERSA DELIVERY 2025 - TODOS OS DIREITOS RESERVADOS</p>
      </footer>
    </main>
  );
}