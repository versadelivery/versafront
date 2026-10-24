"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative pt-36 pb-24 md:pt-44 md:pb-32 rounded-b-[2.5rem] md:rounded-b-[4rem] overflow-hidden"
    >
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-tomato text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold text-[#1B1B1B] leading-[1.12] tracking-tight mb-6"
        >
          Seu açougue online.
          <br />
          <span className="text-[#009246]">Venda por peso, sem complicação.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-[#463b3f] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Crie sua loja online, receba pedidos em tempo real e atualize o peso e
          o valor dos produtos após a pesagem. Tudo em um só sistema, sem pagar
          comissão por pedido.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-[720px] mx-auto mb-10"
        >
          <video
            controls
            playsInline
            preload="metadata"
            poster="/img/picanha.jpg"
            className="w-full aspect-video rounded-3xl bg-black object-cover shadow-[0_8px_30px_rgba(27,27,27,.18)]"
          >
            <source src="/video-landing-page.mp4" type="video/mp4" />
          </video>
          <p className="mt-4 text-sm text-[#463b3f]">
            Veja como o cliente escolhe a picanha, define o peso, personaliza o
            preparo e finaliza o pedido.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center"
        >
          <Link href="/register">
            <button className="bg-[#1B1B1B] hover:bg-[#7ED957] text-white hover:text-black text-xl font-semibold px-12 sm:px-16 py-6 rounded-2xl transition-colors cursor-pointer">
              Criar minha loja grátis
            </button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 space-y-1 text-base text-[#463b3f]"
        >
          <p>
            Grátis até R$ 799,99 em vendas mensais · Sem comissão por pedido ·
            Sem cadastro de cartão de crédito.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 pt-8 border-t border-[#E8E4DF]"
        >
          <p className="font-semibold text-[#1B1B1B] mb-1">
            Quer indicar o VersaDelivery e ganhar?
          </p>
          <a
            href="#indicacao"
            className="text-[#009246] hover:underline font-medium"
          >
            Conheça o programa de indicação.
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
