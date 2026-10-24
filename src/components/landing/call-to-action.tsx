"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/5585991520090";

const CallToAction = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <section ref={ref} className="py-20 md:py-28 bg-[#7ED957]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2rem] px-4 py-12 md:px-16 md:py-16 text-center"
        >
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-tomato text-3xl sm:text-4xl lg:text-5xl font-semibold text-black tracking-tight leading-tight mb-5">
              Seu açougue pronto para vender online?
            </h2>
            <p className="text-lg text-[#1B1B1B] mb-10 max-w-lg mx-auto leading-relaxed">
              Organize seu cardápio, receba pedidos em tempo real e facilite a
              venda de produtos por peso.
            </p>

            <Link href="/register" className="block sm:inline-block">
              <button className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-[#1B1B1B] hover:bg-white text-white hover:text-black text-lg sm:text-xl font-semibold px-6 sm:px-16 py-5 sm:py-6 rounded-xl transition-colors cursor-pointer">
                Criar minha loja grátis
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>

            <p className="mt-5 text-[#1B1B1B]">
              Precisa esclarecer alguma dúvida?{" "}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline"
              >
                Fale com nossa equipe pelo WhatsApp.
              </a>
            </p>

            <div className="mt-10 pt-8 border-t border-[#5DAE3A]">
              <h3 className="text-lg font-semibold text-black mb-2">
                Quer ganhar indicando o VersaDelivery?
              </h3>
              <p className="text-[#1B1B1B] mb-5">
                Apresente a plataforma a donos de açougues e conheça as
                condições do programa de indicação.
              </p>
              <Link href="/register" className="block sm:inline-block">
                <button className="bg-white hover:bg-[#1B1B1B] text-black hover:text-white text-lg font-semibold px-10 py-4 rounded-xl transition-colors cursor-pointer">
                  Quero indicar e ganhar
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;
