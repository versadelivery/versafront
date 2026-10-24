"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Scale,
  ShoppingBag,
  Zap,
  MonitorSmartphone,
  Printer,
  SlidersHorizontal,
} from "lucide-react";

const features = [
  {
    icon: <Scale className="w-6 h-6" />,
    title: "Venda por peso ou unidade",
    description:
      "Atenda produtos com peso variável e produtos vendidos por unidade, conforme as configurações do catálogo.",
  },
  {
    icon: <ShoppingBag className="w-6 h-6" />,
    title: "Catálogo online",
    description:
      "Organize categorias, grupos, produtos, imagens e adicionais para facilitar a escolha do cliente.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Pedidos ao vivo",
    description:
      "Acompanhe novos pedidos e mudanças de status em tempo real pelo painel.",
  },
  {
    icon: <MonitorSmartphone className="w-6 h-6" />,
    title: "Painel em diferentes dispositivos",
    description: "Acompanhe os pedidos pelo celular, tablet ou computador.",
  },
  {
    icon: <Printer className="w-6 h-6" />,
    title: "Impressão opcional",
    description:
      "Se desejar, utilize uma impressora compatível para imprimir os pedidos e auxiliar na separação e conferência.",
  },
  {
    icon: <SlidersHorizontal className="w-6 h-6" />,
    title: "Personalização do catálogo",
    description:
      "Configure produtos, adicionais, instruções de preparo e opções de acordo com a realidade do seu negócio.",
  },
];

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section id="recursos" ref={ref} className="py-20 md:py-28 bg-[#FFFDF6]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="font-tomato inline-block text-[#009246] text-sm font-semibold tracking-wide uppercase mb-3">
            Recursos
          </span>
          <h2 className="font-tomato text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1B1B1B] tracking-tight mb-4">
            Recursos do VersaDelivery
          </h2>
          <p className="text-lg text-[#474747] max-w-2xl mx-auto">
            Tudo para organizar seus pedidos de delivery em um só lugar.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              className="bg-white rounded-2xl border-2 border-black p-6 hover:bg-[#7ED957] hover:border-[#7ED957] transition-colors duration-200 cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F9FFF6] flex items-center justify-center mb-3 text-[#009246]">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-[#1B1B1B] mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-[#474747] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
