"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Play } from "lucide-react";

const trustItems = [
  "Grátis até R$ 799,99 em vendas mensais",
  "Sem comissão por pedido",
  "Sem cadastro de cartão de crédito",
];

function DemoVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  const play = () => {
    setStarted(true);
    videoRef.current?.play().catch(() => setFailed(true));
  };

  return (
    <div className="relative mx-auto w-full max-w-[250px] sm:max-w-[280px] overflow-hidden rounded-[2.2rem] border-[7px] border-[#1B1B1B] bg-black">
      <video
        ref={videoRef}
        controls={started}
        playsInline
        preload="metadata"
        poster="/img/video-poster.png"
        onError={() => setFailed(true)}
        onEnded={() => setStarted(false)}
        className="block aspect-[877/1600] w-full bg-black object-contain"
      >
        <source src="/video-landing-page.mp4" type="video/mp4" />
      </video>

      {!started && (
        <button
          type="button"
          onClick={play}
          aria-label="Assistir ao vídeo demonstrativo"
          className="absolute inset-0 flex flex-col items-center justify-end gap-3 pb-6 text-white cursor-pointer"
        >
          <span className="grid size-16 place-items-center rounded-full bg-white text-[#1B1B1B]">
            <Play className="ml-1 size-7 fill-current" />
          </span>
          <span className="mx-4 rounded-full bg-[#1B1B1B] px-4 py-2 text-center text-sm font-semibold">
            Veja o pedido por peso na prática
          </span>
        </button>
      )}

      {failed && (
        <p className="absolute inset-x-3 bottom-3 rounded-lg bg-white p-3 text-center text-xs text-[#1B1B1B]">
          Não foi possível reproduzir aqui.{" "}
          <a href="/video-landing-page.mp4" className="font-semibold underline">
            Abrir o vídeo
          </a>
        </p>
      )}
    </div>
  );
}

const Hero = () => {
  return (
    <section
      id="home"
      className="relative overflow-hidden rounded-b-[2rem] pb-16 pt-24 sm:pt-28 md:rounded-b-[4rem] md:pb-24 lg:pt-36"
    >
      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="text-center lg:text-left">

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-tomato mb-6 text-[2rem] font-semibold leading-[1.1] tracking-tight text-[#1B1B1B] sm:text-5xl lg:text-[3.5rem]"
            >
              Seu açougue online.{" "}
              <span className="text-[#009246]">Venda por peso, sem complicação.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-[#463b3f] sm:text-lg lg:mx-0"
            >
              Crie sua loja online, receba pedidos em tempo real e atualize o
              peso e o valor dos produtos após a pesagem. Tudo em um só sistema,
              sem pagar comissão por pedido.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center lg:justify-start"
            >
              <Link href="/register" className="w-full sm:w-auto">
                <button className="w-full cursor-pointer rounded-xl bg-[#1B1B1B] px-8 py-5 text-lg font-semibold text-white transition-colors hover:bg-[#7ED957] hover:text-black sm:px-14 sm:text-xl">
                  Criar minha loja grátis
                </button>
              </Link>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-6 flex flex-col items-center gap-2 text-sm text-[#463b3f] sm:text-base lg:items-start"
            >
              {trustItems.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-[#009246]" />
                  {item}
                </li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8 border-t border-[#E8E4DF] pt-6"
            >
              <p className="font-semibold text-[#1B1B1B]">
                Quer indicar o VersaDelivery e ganhar?
              </p>
              <a
                href="#indicacao"
                className="font-medium text-[#009246] hover:underline"
              >
                Conheça o programa de indicação.
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="rounded-3xl bg-[#7ED957] p-6 sm:p-10">
              <DemoVideo />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
